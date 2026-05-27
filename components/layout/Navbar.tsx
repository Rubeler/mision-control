'use client'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [now, setNow] = useState('')

  useEffect(() => {
    const actualizar = () =>
      setNow(new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }))
    actualizar()
    const t = setInterval(actualizar, 60_000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="hidden md:flex fixed top-0 left-56 right-0 h-14 bg-[#0D0D1A]/90 border-b border-border backdrop-blur-sm items-center justify-between px-6 z-30">
      <p className="text-sm text-dim font-sans capitalize">{now}</p>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted font-sans">Bienvenido, <span className="text-cyan font-mono font-semibold">Rubén</span></span>
        <div className="w-8 h-8 rounded-full bg-card-2 border border-cyan/40 flex items-center justify-center text-cyan font-mono text-sm font-bold">R</div>
      </div>
    </header>
  )
}
