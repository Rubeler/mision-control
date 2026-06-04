'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { LogOut, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  const [now, setNow]       = useState('')
  const [email, setEmail]   = useState('')
  const [nombre, setNombre] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const actualizar = () =>
      setNow(new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }))
    actualizar()
    const t = setInterval(actualizar, 60_000)
    return () => clearInterval(t)
  }, [])

  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email)
        setNombre(user.email.split('@')[0])
        // Obtener rol desde la tabla profiles
        supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
          if (data?.role === 'admin') {
            setIsAdmin(true)
          }
        })
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header data-admin className="hidden md:flex fixed top-0 left-56 right-0 h-14 bg-[#0D0D1A]/90 border-b border-border backdrop-blur-sm items-center justify-between px-6 z-30">
      <p className="text-sm text-dim font-sans capitalize">{now}</p>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <a href="/admin"
            className="flex items-center gap-1.5 text-xs text-violet hover:text-violet/80 font-mono border border-violet/30 px-2.5 py-1 rounded-lg hover:bg-violet/10 transition-colors cursor-pointer">
            <ShieldCheck size={12} /> Admin
          </a>
        )}
        <span className="text-sm text-muted font-sans">
          Bienvenido, <span className="text-cyan font-mono font-semibold capitalize">{nombre || 'Usuario'}</span>
        </span>
        <div className="w-8 h-8 rounded-full bg-card-2 border border-cyan/40 flex items-center justify-center text-cyan font-mono text-sm font-bold uppercase">
          {nombre ? nombre[0] : 'U'}
        </div>
        <button onClick={handleLogout} title="Cerrar sesión"
          className="p-1.5 rounded-lg text-dim hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer">
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
