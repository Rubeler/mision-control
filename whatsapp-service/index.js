import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '../.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const AUTH_FOLDER = path.join(__dirname, 'auth_info_baileys')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://igfnkqurkcbgrdigzruh.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 4000

let sock = null
let currentQR = null
let connectionStatus = 'DISCONNECTED' // 'DISCONNECTED' | 'SCAN_QR' | 'CONNECTED'
let connectedUser = null

// Store de mensajes enviados para responder a pedidos de reintento de WhatsApp
// (sin esto, los mensajes salientes quedan colgados en "Esperando mensaje")
const sentMessages = new Map()

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER)

  sock = makeWASocket({
    auth: state,
    getMessage: async (key) => sentMessages.get(key.id),
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      currentQR = await QRCode.toDataURL(qr)
      connectionStatus = 'SCAN_QR'
      console.log('📱 [WhatsApp] Nuevo código QR generado. Listo para escaneo.')
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      console.log(`⚠️ [WhatsApp] Conexión cerrada. Razón código: ${statusCode}. Reconectando: ${shouldReconnect}`)
      connectionStatus = 'DISCONNECTED'
      currentQR = null
      connectedUser = null

      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 3000)
      } else {
        // Borrar carpeta de sesión si se cerró sesión explícitamente
        if (fs.existsSync(AUTH_FOLDER)) {
          fs.rmSync(AUTH_FOLDER, { recursive: true, force: true })
        }
      }
    } else if (connection === 'open') {
      connectionStatus = 'CONNECTED'
      currentQR = null
      connectedUser = sock.user
      console.log('✅ [WhatsApp] Conexión establecida con éxito como:', sock.user?.id)
    }
  })

  // Escuchar mensajes entrantes
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return
    for (const msg of m.messages) {
      if (msg.key.fromMe) continue // ignorar mensajes propios salientes

      const remoteJid = msg.key.remoteJid
      if (!remoteJid) continue
      if (remoteJid === 'status@broadcast') continue  // ignorar estados de WhatsApp
      if (remoteJid.endsWith('@g.us')) continue // ignorar grupos por ahora

      const texto = msg.message?.conversation ||
                    msg.message?.extendedTextMessage?.text ||
                    msg.message?.imageMessage?.caption || ''

      // Ignorar mensajes sin texto real (media sin caption, etc)
      if (!texto.trim()) continue

      const pushName = msg.pushName || 'Cliente WhatsApp'
      // WhatsApp oculta el número real detrás de un LID en algunos contactos;
      // Baileys expone el número real en senderPn cuando esto pasa
      const realJid = remoteJid.endsWith('@lid') && msg.key.senderPn ? msg.key.senderPn : remoteJid
      const rawNumber = realJid.split('@')[0]
      const telefonoFormateado = rawNumber.startsWith('549')
        ? `+54 9 ${rawNumber.slice(3)}`
        : `+${rawNumber}`

      console.log(`📩 [Mensaje recibido] ${pushName} (${telefonoFormateado}): "${texto}"`)

      // Auto-crear o actualizar lead en Supabase
      try {
        const { data: existing } = await supabase.from('leads').select('*').eq('telefono', telefonoFormateado).maybeSingle()

        if (!existing) {
          await supabase.from('leads').insert({
            nombre: pushName,
            telefono: telefonoFormateado,
            producto: texto.slice(0, 200),
            canal: 'WhatsApp QR',
            estado: 'Nuevo',
            fecha: new Date().toISOString().split('T')[0],
            notas: `Mensaje inicial: ${texto}`
          })
          console.log(`✨ [CRM] Lead creado automáticamente para ${pushName}`)
        }
      } catch (err) {
        console.error('Error al guardar lead en Supabase:', err.message)
      }
    }
  })
}

// REST Endpoints
app.get('/status', (req, res) => {
  res.json({
    status: connectionStatus,
    qr: currentQR,
    user: connectedUser ? { id: connectedUser.id, name: connectedUser.name || 'WhatsApp Business' } : null
  })
})

app.post('/send', async (req, res) => {
  const { phone, message } = req.body
  if (!sock || connectionStatus !== 'CONNECTED') {
    return res.status(400).json({ error: 'WhatsApp no está conectado' })
  }
  if (!phone || !message) {
    return res.status(400).json({ error: 'Faltan parámetros: phone o message' })
  }

  try {
    let cleanPhone = phone.replace(/[^0-9]/g, '')
    if (!cleanPhone.endsWith('@s.whatsapp.net')) {
      cleanPhone = `${cleanPhone}@s.whatsapp.net`
    }

    const sent = await sock.sendMessage(cleanPhone, { text: message })
    if (sent?.key?.id && sent.message) {
      sentMessages.set(sent.key.id, sent.message)
    }
    console.log(`📤 [Mensaje enviado] a ${phone}: "${message}"`)
    res.json({ success: true })
  } catch (err) {
    console.error('Error enviando mensaje WhatsApp:', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/logout', async (req, res) => {
  try {
    if (sock) {
      await sock.logout()
    }
    if (fs.existsSync(AUTH_FOLDER)) {
      fs.rmSync(AUTH_FOLDER, { recursive: true, force: true })
    }
    connectionStatus = 'DISCONNECTED'
    currentQR = null
    connectedUser = null
    setTimeout(connectToWhatsApp, 1000)
    res.json({ success: true, message: 'Sesión cerrada correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 [WhatsApp Service] Escuchando en http://localhost:${PORT}`)
  connectToWhatsApp()
})
