import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Verificar que el request viene del admin
async function isAdmin(req: NextRequest) {
  const email = req.headers.get('x-admin-email')
  return email === process.env.ADMIN_EMAIL
}

// GET — listar todos los usuarios
export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — crear usuario nuevo
export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { email, password, plan, negocio } = await req.json()
  if (!email || !password || !plan) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  // Crear en Supabase Auth
  const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Crear perfil
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id:      user!.id,
    email,
    role:    'user',
    plan,
    negocio: negocio || null,
    activo:  true,
  })
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ success: true, userId: user!.id })
}

// PATCH — actualizar usuario (suspender, cambiar plan, etc.)
export async function PATCH(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id, activo, plan, vence_en } = await req.json()
  if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (activo !== undefined) updates.activo = activo
  if (plan !== undefined)   updates.plan   = plan
  if (vence_en !== undefined) updates.vence_en = vence_en

  const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// DELETE — eliminar usuario
export async function DELETE(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 })

  // Eliminar de Auth (también borra el perfil por cascade)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
