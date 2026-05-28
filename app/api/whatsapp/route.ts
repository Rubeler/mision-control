import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { enviarMensaje } from '@/lib/whatsapp'

// Cliente server-side (no expuesto al browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type WaContact = { wa_id: string; profile: { name: string } }

// ─── GET: Meta verifica el webhook una sola vez ───────────────────────────────
export async function GET(req: NextRequest) {
  const sp        = new URL(req.url).searchParams
  const mode      = sp.get('hub.mode')
  const token     = sp.get('hub.verify_token')
  const challenge = sp.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// ─── POST: mensajes entrantes de clientes ─────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json()

  if (body.object !== 'whatsapp_business_account') {
    return NextResponse.json({ ok: false })
  }

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue

      const value:    Record<string, unknown> = change.value
      const mensajes: Record<string, unknown>[] = (value?.messages as Record<string, unknown>[]) ?? []
      const contacts: WaContact[]               = (value?.contacts as WaContact[]) ?? []

      for (const msg of mensajes) {
        if (msg.type !== 'text') continue

        const waIdRaw = msg.from as string
        // Storage: formato 549... (E.164 Argentina)
        const waId = waIdRaw.startsWith('54') && !waIdRaw.startsWith('549')
          ? '549' + waIdRaw.slice(2)
          : waIdRaw
        // Envío: Meta test mode usa formato local "15" (ej. 54111536449059)
        const waIdEnvio = waId.startsWith('549')
          ? '54' + waId.slice(3, 5) + '15' + waId.slice(5)
          : waId
        const texto  = (msg.text as { body: string })?.body ?? ''
        const nombre = contacts.find(c => c.wa_id === waIdRaw)?.profile?.name ?? 'Cliente'
        const fecha  = new Date().toISOString().split('T')[0]

        // Evitar leads duplicados: mismo número en los últimos 7 días
        const hace7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { data: existente } = await supabase
          .from('leads')
          .select('id')
          .eq('telefono', waId)
          .gte('created_at', hace7d)
          .limit(1)

        const esNuevo = !existente?.length

        if (esNuevo) {
          // Guardar lead nuevo en el kanban
          await supabase.from('leads').insert({
            nombre,
            producto: texto.slice(0, 200),
            canal:    'WhatsApp',
            estado:   'Nuevo',
            fecha,
            telefono: waId,
          })

          // Respuesta automática al cliente
          await enviarMensaje(
            waIdEnvio,
            `¡Hola, ${nombre}! 👋 Gracias por escribirnos a *Debuenamadera*.\n\n` +
            `Recibimos tu consulta y ya la tenemos anotada.\n\n` +
            `Un asesor te responde a la brevedad. ✅`
          )
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}
