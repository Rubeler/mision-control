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
    .select('*, negocios(nombre)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

function slugify(nombre: string) {
  return nombre
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // saca acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Busca un negocio existente por slug, o lo crea si no existe.
async function obtenerONegocio(nombre: string): Promise<{ id: string } | { error: string }> {
  const slug = slugify(nombre)
  const { data: existente } = await supabaseAdmin
    .from('negocios')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (existente) return existente

  const { data: creado, error } = await supabaseAdmin
    .from('negocios')
    .insert({ nombre, slug })
    .select('id')
    .single()
  if (error) return { error: error.message }
  return creado
}

// POST — crear usuario nuevo
export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { email, password, plan, negocio } = await req.json()
  if (!email || !password || !plan || !negocio) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const negocioResult = await obtenerONegocio(negocio)
  if ('error' in negocioResult) {
    return NextResponse.json({ error: 'No se pudo crear/vincular el negocio: ' + negocioResult.error }, { status: 500 })
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
    id:         user!.id,
    email,
    role:       'user',
    plan,
    negocio_id: negocioResult.id,
    activo:     true,
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
