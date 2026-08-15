import { NextResponse } from 'next/server'
import { logout } from '@/lib/evolution'

export async function POST() {
  try {
    await logout()
    return NextResponse.json({ success: true, message: 'Sesión cerrada correctamente' })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'No se pudo cerrar la sesión'
    return NextResponse.json({ error }, { status: 500 })
  }
}
