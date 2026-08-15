import { NextRequest, NextResponse } from 'next/server'
import { sendText } from '@/lib/evolution'

export async function POST(req: NextRequest) {
  const { phone, message } = await req.json()

  if (!phone || !message) {
    return NextResponse.json({ error: 'Faltan parámetros: phone o message' }, { status: 400 })
  }

  try {
    await sendText(phone, message)
    return NextResponse.json({ success: true })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'No se pudo enviar el mensaje'
    return NextResponse.json({ error }, { status: 500 })
  }
}
