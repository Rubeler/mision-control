const GRAPH_URL = 'https://graph.facebook.com/v19.0'

export async function enviarMensaje(para: string, texto: string): Promise<boolean> {
  const phoneId = process.env.WHATSAPP_PHONE_ID
  const token   = process.env.WHATSAPP_TOKEN
  if (!phoneId || !token) return false

  const res = await fetch(`${GRAPH_URL}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to:   para,
      type: 'text',
      text: { body: texto },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[WhatsApp] Error enviando mensaje:', JSON.stringify(err))
  } else {
    console.log('[WhatsApp] Mensaje enviado a', para)
  }

  return res.ok
}
