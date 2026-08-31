import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('agent_settings')
    .select('live_send_enabled, updated_at')
    .eq('id', 1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    liveSendEnabled: Boolean(data?.live_send_enabled),
    updatedAt: data?.updated_at ?? null
  })
}

export async function POST(req: NextRequest) {
  const { liveSendEnabled } = await req.json()

  if (typeof liveSendEnabled !== 'boolean') {
    return NextResponse.json({ error: 'Falta el parámetro liveSendEnabled (boolean)' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('agent_settings')
    .update({ live_send_enabled: liveSendEnabled, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, liveSendEnabled })
}
