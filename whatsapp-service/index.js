import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { isMessageFresh, isGlobalAgentEnabled, isLeadPaused, isLiveSendEnabled, isLiveSendEnvEnabled, isLiveSendDbEnabled } from './lib/agentGate.js'
import { fetchConversationHistory, toGeminiHistory } from './lib/zernioHistory.js'
import { generateAgentReply } from './lib/geminiAgent.js'
import { createCatalogTool } from './lib/catalogTool.js'
import { detectAndStripHandover } from './lib/handover.js'
import { recordShadowReply } from './lib/shadowLog.js'

dotenv.config({ path: '../.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://igfnkqurkcbgrdigzruh.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
// Este servicio corre con la service-role key (sin sesión de usuario), así que
// el DEFAULT de negocio_id basado en auth.uid() no aplica acá — hay que pasarlo
// a mano en cada insert. Hoy solo existe este negocio; cuando se sume un
// segundo cliente con agente propio, este servicio va a necesitar levantar un
// proceso/config por negocio.
const NEGOCIO_ID_DBM = process.env.NEGOCIO_ID_DBM || '1bb1dfbe-f746-466e-8f6f-4a96bb420758'
const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY || ''
const ZERNIO_WEBHOOK_SECRET = process.env.ZERNIO_WEBHOOK_SECRET || ''
const ZERNIO_BASE_URL = 'https://zernio.com/api'
const AI_AGENT_MAX_MESSAGE_AGE_MS = Number(process.env.AI_AGENT_MAX_MESSAGE_AGE_MS) || 300000

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const { consultarModelos } = createCatalogTool(supabase)

const app = express()
app.use(cors())

const PORT = 4000

// Dedup en memoria de eventos de webhook ya procesados (alcanza para la prueba local;
// si el servicio se reinicia se pierde, pero un reintento de Zernio como mucho re-crea
// el mismo lead, que ya está deduplicado por teléfono más abajo).
const processedEventIds = new Set()

function verifyZernioSignature(rawBody, signatureHeader) {
  if (!ZERNIO_WEBHOOK_SECRET) return false // fail-closed: sin secreto configurado, rechazar todo
  if (!signatureHeader) return false
  const expected = crypto.createHmac('sha256', ZERNIO_WEBHOOK_SECRET).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected, 'utf8')
  const receivedBuf = Buffer.from(signatureHeader, 'utf8')
  if (expectedBuf.length !== receivedBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, receivedBuf)
}

// El body crudo hace falta para validar la firma HMAC — por eso esta ruta usa
// express.raw() en vez del express.json() global (que se registra más abajo,
// después de esta ruta, y por eso no la afecta).
app.post('/webhook/zernio', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.get('X-Zernio-Signature')
  const rawBody = req.body

  if (!verifyZernioSignature(rawBody, signature)) {
    console.warn('⚠️ [Zernio Webhook] Firma inválida o secreto no configurado, rechazado.')
    return res.status(401).json({ error: 'invalid signature' })
  }

  let payload
  try {
    payload = JSON.parse(rawBody.toString('utf8'))
  } catch (err) {
    return res.status(400).json({ error: 'invalid json' })
  }

  // Confirmar recepción ya, antes de procesar — evita que Zernio reintente por timeout.
  res.status(200).json({ received: true })

  if (processedEventIds.has(payload.id)) return // reintento de un evento ya procesado
  processedEventIds.add(payload.id)

  if (payload.event !== 'message.received') return
  const msg = payload.message
  if (!msg || msg.platform !== 'whatsapp' || msg.direction !== 'incoming') return

  const texto = (msg.text || '').trim()
  if (!texto) return // ignorar mensajes sin texto real (media sin caption, etc)

  const sender = msg.sender || {}
  const telefonoFormateado = sender.phoneNumber || (sender.id ? `+${sender.id}` : 'desconocido')
  const nombre = sender.name || 'Cliente WhatsApp'
  const conversationId = payload.conversation?.id
  const accountId = payload.account?.id

  console.log(`📩 [Zernio] ${nombre} (${telefonoFormateado}): "${texto}"`)

  let lead = null
  try {
    const { data: existing } = await supabase.from('leads').select('*').eq('telefono', telefonoFormateado).maybeSingle()
    lead = existing

    if (!existing) {
      const { data: inserted, error: insertErr } = await supabase.from('leads').insert({
        nombre,
        telefono: telefonoFormateado,
        producto: texto.slice(0, 200),
        canal: 'WhatsApp Zernio',
        estado: 'Nuevo',
        fecha: new Date().toISOString().split('T')[0],
        notas: `Mensaje inicial: ${texto} (conversationId: ${conversationId}, accountId: ${accountId})`,
        negocio_id: NEGOCIO_ID_DBM
      }).select('*').single()
      if (insertErr) throw insertErr
      lead = inserted
      console.log(`✨ [CRM] Lead creado automáticamente para ${nombre}`)
    }
  } catch (err) {
    console.error('Error al guardar lead en Supabase:', err.message)
  }

  if (lead) {
    handleAgentTurn(lead, msg, conversationId, accountId).catch((err) => {
      console.error('Error en el agente de IA (no afecta la captura del lead):', err.message)
    })
  }
})

// Genera (en modo sombra, sin enviar nada) la respuesta del agente para un
// mensaje entrante. Corre después de que el lead ya existe y de haber
// respondido 200 a Zernio, así una falla acá nunca rompe la captura del lead.
async function handleAgentTurn(lead, msg, conversationId, accountId) {
  if (!isMessageFresh(msg.sentAt, AI_AGENT_MAX_MESSAGE_AGE_MS)) {
    console.log(`⏭️ [IA] Mensaje viejo de ${lead.telefono}, no se genera respuesta`)
    return
  }
  if (!isGlobalAgentEnabled()) {
    console.log('⏭️ [IA] Agente desactivado globalmente (AI_AGENT_ENABLED)')
    return
  }
  if (await isLeadPaused(supabase, lead.id)) {
    console.log(`⏭️ [IA] IA pausada para lead ${lead.id} / ${lead.telefono}`)
    return
  }

  const rawHistory = await fetchConversationHistory(ZERNIO_BASE_URL, ZERNIO_API_KEY, conversationId, accountId)
  const history = toGeminiHistory(rawHistory, msg.id)

  const replyText = await generateAgentReply({ history, userText: msg.text, consultarModelos })
  const { cleanText, handoverRequested } = detectAndStripHandover(replyText)

  let sent = false
  if (await isLiveSendEnabled(supabase)) {
    try {
      await sendZernioMessage(conversationId, accountId, cleanText)
      sent = true
    } catch (err) {
      console.error(`Error enviando respuesta en vivo a ${lead.telefono}:`, err.message)
      // Si falla el envío, no lo marcamos como enviado — queda igual en modo
      // sombra para esa respuesta puntual, no se pierde el registro.
    }
  }

  await recordShadowReply(supabase, {
    leadId: lead.id,
    telefono: lead.telefono,
    conversationId,
    incomingMessage: msg.text,
    generatedReply: cleanText,
    handoverRequested,
    sentAtSource: msg.sentAt,
    sent,
    negocioId: NEGOCIO_ID_DBM,
  })

  if (handoverRequested) {
    const { error } = await supabase.from('leads').update({ ai_paused: true }).eq('id', lead.id)
    if (error) console.error('Error pausando IA para el lead tras handover:', error.message)
  }
}

// A partir de acá, las rutas usan JSON parseado normal.
app.use(express.json())

app.get('/status', async (req, res) => {
  const liveSendDbEnabled = await isLiveSendDbEnabled(supabase)
  res.json({
    provider: 'zernio',
    apiKeyConfigured: Boolean(ZERNIO_API_KEY),
    webhookSecretConfigured: Boolean(ZERNIO_WEBHOOK_SECRET),
    aiAgentEnabled: isGlobalAgentEnabled(),
    liveSendEnvEnabled: isLiveSendEnvEnabled(),
    liveSendDbEnabled,
    liveSendEnabled: isLiveSendEnvEnabled() && liveSendDbEnabled,
    geminiApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY)
  })
})

async function findConversationByPhone(phone) {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const url = `${ZERNIO_BASE_URL}/v1/inbox/conversations?platform=whatsapp&limit=100`
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${ZERNIO_API_KEY}` } })
  const data = await resp.json()
  if (!resp.ok) throw new Error(data.error || `Zernio respondió ${resp.status}`)
  return (data.data || []).find((c) => c.participantId?.replace(/[^0-9]/g, '') === cleanPhone) || null
}

// Único camino de salida real hacia Zernio — lo usan tanto /send (manual)
// como el agente (cuando AI_LIVE_SEND_ENABLED está prendido).
async function sendZernioMessage(conversationId, accountId, message) {
  const sendResp = await fetch(`${ZERNIO_BASE_URL}/v1/inbox/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ZERNIO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ accountId, message })
  })
  const sendData = await sendResp.json()
  if (!sendResp.ok || !sendData.success) {
    throw new Error(sendData.error || `Zernio respondió ${sendResp.status}`)
  }
  return sendData
}

app.post('/send', async (req, res) => {
  const { phone, message } = req.body
  if (!ZERNIO_API_KEY) {
    return res.status(400).json({ error: 'Zernio no está configurado (falta ZERNIO_API_KEY)' })
  }
  if (!phone || !message) {
    return res.status(400).json({ error: 'Faltan parámetros: phone o message' })
  }

  try {
    const conversation = await findConversationByPhone(phone)
    if (!conversation) {
      return res.status(404).json({ error: 'No hay una conversación previa con ese número — el cliente tiene que escribir primero' })
    }

    const sendData = await sendZernioMessage(conversation.id, conversation.accountId, message)
    console.log(`📤 [Mensaje enviado] a ${phone}: "${message}"`)
    res.json({ success: true, messageId: sendData.data?.messageId })
  } catch (err) {
    console.error('Error enviando mensaje WhatsApp (Zernio):', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 [WhatsApp Service] Escuchando en http://localhost:${PORT} (proveedor: Zernio)`)
})
