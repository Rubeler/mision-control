const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || ''
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || ''

function headers() {
  return {
    'apikey': EVOLUTION_API_KEY,
    'Content-Type': 'application/json',
  }
}

export type EvolutionState = 'open' | 'connecting' | 'close'

export async function getConnectionState(): Promise<EvolutionState> {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Evolution API status ${res.status}`)
  const data = await res.json()
  return data?.instance?.state ?? 'close'
}

export async function getQr(): Promise<string | null> {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE}`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Evolution API connect ${res.status}`)
  const data = await res.json()
  return data?.base64 ?? null
}

export async function getConnectedUser(): Promise<{ id: string; name: string } | null> {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances?instanceName=${EVOLUTION_INSTANCE}`, {
      headers: headers(),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    const info = Array.isArray(data) ? data[0] : data
    const owner = info?.owner || info?.instance?.owner
    const name = info?.profileName || info?.instance?.profileName
    if (!owner) return null
    return { id: owner, name: name || 'WhatsApp Business' }
  } catch {
    return null
  }
}

export async function sendText(phone: string, message: string): Promise<void> {
  const number = phone.replace(/[^0-9]/g, '')
  const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ number, text: message }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Evolution API sendText ${res.status}: ${err}`)
  }
}

export async function logout(): Promise<void> {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/logout/${EVOLUTION_INSTANCE}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Evolution API logout ${res.status}: ${err}`)
  }
}

export async function setWebhook(url: string): Promise<void> {
  const res = await fetch(`${EVOLUTION_API_URL}/webhook/set/${EVOLUTION_INSTANCE}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      enabled: true,
      url,
      webhookByEvents: false,
      webhookBase64: false,
      events: ['MESSAGES_UPSERT'],
    }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Evolution API setWebhook ${res.status}: ${err}`)
  }
}
