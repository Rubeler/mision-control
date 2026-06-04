'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs text-dim uppercase tracking-widest">Debuenamadera</p>
          <h1 className="font-mono text-2xl font-bold text-cyan mt-1"
            style={{ textShadow: '0 0 12px rgba(0,255,255,0.5)' }}>
            Misión Control
          </h1>
          <p className="text-dim text-sm mt-2">Ingresá con tu cuenta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="card space-y-4">
          <div>
            <label className="label text-xs block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-3 py-2.5 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50 transition-colors"
            />
          </div>

          <div>
            <label className="label text-xs block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan font-mono font-semibold hover:bg-cyan/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-dim mt-4">
          v1.0 · Business OS
        </p>
      </div>
    </div>
  )
}
