import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type EvolutionKey = {
  remoteJid?: string
  fromMe?: boolean
  senderPn?: string
  remoteJidAlt?: string
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Evolution API incluye la apikey de la instancia en el payload del webhook;
  // rechazamos si no coincide para que nadie pueda inyectar leads falsos
  if (body?.apikey && body.apikey !== process.env.EVOLUTION_API_KEY) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  if (body?.event !== 'MESSAGES_UPSERT') {
    return NextResponse.json({ ok: true })
  }

  const data = body.data
  const key: EvolutionKey = data?.key ?? {}

  if (key.fromMe) return NextResponse.json({ ok: true })

  const remoteJid = key.remoteJid
  if (!remoteJid) return NextResponse.json({ ok: true })
  if (remoteJid === 'status@broadcast') return NextResponse.json({ ok: true })
  if (remoteJid.endsWith('@g.us')) return NextResponse.json({ ok: true })

  const texto: string =
    data?.message?.conversation ||
    data?.message?.extendedTextMessage?.text ||
    data?.message?.imageMessage?.caption || ''

  if (!texto.trim()) return NextResponse.json({ ok: true })

  // WhatsApp oculta el número real detrás de un LID en algunos contactos;
  // Evolution API expone el número real en senderPn / remoteJidAlt cuando esto pasa
  let realJid = remoteJid
  if (remoteJid.endsWith('@lid')) {
    realJid = key.senderPn || key.remoteJidAlt || ''
    if (!realJid) {
      console.warn('[Evolution webhook] No se pudo resolver el número real detrás de un LID, se descarta el lead')
      return NextResponse.json({ ok: true })
    }
  }

  const rawNumber = realJid.split('@')[0].replace(/[^0-9]/g, '')
  const telefono = rawNumber.startsWith('54') && !rawNumber.startsWith('549')
    ? '549' + rawNumber.slice(2)
    : rawNumber

  const pushName = data?.pushName || 'Cliente WhatsApp'
  const fecha = new Date().toISOString().split('T')[0]

  const hace7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: existente } = await supabase
    .from('leads')
    .select('id')
    .eq('telefono', telefono)
    .gte('created_at', hace7d)
    .limit(1)

  if (!existente?.length) {
    const { error } = await supabase.from('leads').insert({
      nombre: pushName,
      telefono,
      producto: texto.slice(0, 200),
      canal: 'WhatsApp QR',
      estado: 'Nuevo',
      fecha,
      notas: `Mensaje inicial: ${texto}`,
    })
    if (error) {
      console.error('[Evolution webhook] Error al guardar lead en Supabase:', error.message)
    }
  }

  return NextResponse.json({ ok: true })
}
