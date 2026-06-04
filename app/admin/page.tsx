'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Plus, Trash2, Power, PowerOff, Copy, Check, RefreshCw } from 'lucide-react'

interface Profile {
  id: string; email: string; role: string; plan: string
  activo: boolean; negocio: string | null; vence_en: string | null; created_at: string
}

const PLAN_COLORS: Record<string, string> = {
  basic:   'text-dim bg-card-2 border-border',
  pro:     'text-cyan bg-cyan/10 border-cyan/30',
  premium: 'text-violet bg-violet/10 border-violet/30',
}

function generarPassword() {
  const chars  = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const special = '#$@!'
  let pwd = ''
  for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
  pwd += special[Math.floor(Math.random() * special.length)]
  pwd += Math.floor(Math.random() * 90 + 10)
  return pwd
}

export default function AdminPage() {
  const [profiles, setProfiles]   = useState<Profile[]>([])
  const [loading, setLoading]     = useState(true)
  const [adminEmail, setAdminEmail] = useState('')
  const [modal, setModal]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [creado, setCreado]       = useState<{ email: string; password: string } | null>(null)
  const [copiado, setCopiado]     = useState(false)
  const [form, setForm]           = useState({ email: '', plan: 'basic', negocio: '', password: generarPassword() })
  const supabase = createClient()

  const headers = useCallback((email: string) => ({
    'Content-Type': 'application/json',
    'x-admin-email': email,
  }), [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setAdminEmail(user.email)
        fetch('/api/admin/users', { headers: { 'x-admin-email': user.email } })
          .then(r => r.json())
          .then(data => { setProfiles(Array.isArray(data) ? data : []); setLoading(false) })
      }
    })
  }, [])

  const recargar = () => {
    setLoading(true)
    fetch('/api/admin/users', { headers: headers(adminEmail) })
      .then(r => r.json())
      .then(data => { setProfiles(Array.isArray(data) ? data : []); setLoading(false) })
  }

  const crearUsuario = async () => {
    if (!form.email || !form.plan) return
    setSaving(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: headers(adminEmail),
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (data.error) { alert('Error: ' + data.error); return }
    setCreado({ email: form.email, password: form.password })
    setForm({ email: '', plan: 'basic', negocio: '', password: generarPassword() })
    recargar()
  }

  const toggleActivo = async (p: Profile) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: headers(adminEmail),
      body: JSON.stringify({ id: p.id, activo: !p.activo }),
    })
    recargar()
  }

  const cambiarPlan = async (p: Profile, plan: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: headers(adminEmail),
      body: JSON.stringify({ id: p.id, plan }),
    })
    recargar()
  }

  const eliminar = async (p: Profile) => {
    if (!confirm(`¿Eliminar a ${p.email}? Esta acción no se puede deshacer.`)) return
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: headers(adminEmail),
      body: JSON.stringify({ id: p.id }),
    })
    recargar()
  }

  const copiarCredenciales = () => {
    if (!creado) return
    const texto = `🔐 Acceso a Misión Control\n\n📧 Email: ${creado.email}\n🔑 Contraseña: ${creado.password}\n\n🌐 URL: https://mision-control-omega.vercel.app\n\nPodés cambiar tu contraseña desde la app.`
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-xl font-bold text-muted">Panel de Admin</h2>
          <p className="label mt-0.5">{profiles.filter(p => p.activo).length} usuarios activos · {profiles.length} total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={recargar} className="p-2 rounded-lg bg-card border border-border text-dim hover:text-cyan cursor-pointer transition-colors">
            <RefreshCw size={15} />
          </button>
          <button onClick={() => { setModal(true); setCreado(null) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime/10 border border-lime/30 text-lime text-sm hover:bg-lime/20 transition-colors cursor-pointer">
            <Plus size={15} /> Nuevo usuario
          </button>
        </div>
      </div>

      {/* Tabla usuarios */}
      <div className="card p-0 overflow-x-auto">
        {loading ? <p className="text-dim text-sm p-6">Cargando...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Estado','Email','Negocio','Plan','Alta','Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 label font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-dim">Sin usuarios todavía</td></tr>
              ) : profiles.map(p => (
                <tr key={p.id} className={`border-b border-border/50 transition-colors ${p.activo ? 'hover:bg-card-2/50' : 'opacity-50'}`}>
                  <td className="px-4 py-3">
                    <span className={`w-2 h-2 rounded-full inline-block ${p.activo ? 'bg-lime' : 'bg-red-400'}`} />
                  </td>
                  <td className="px-4 py-3 text-muted font-mono text-xs">{p.email}</td>
                  <td className="px-4 py-3 text-dim text-xs">{p.negocio || '—'}</td>
                  <td className="px-4 py-3">
                    <select value={p.plan} onChange={e => cambiarPlan(p, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border font-semibold bg-transparent cursor-pointer ${PLAN_COLORS[p.plan]}`}>
                      <option value="basic">Básico</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-dim font-mono text-xs">
                    {new Date(p.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => toggleActivo(p)} title={p.activo ? 'Suspender' : 'Habilitar'}
                        className={`p-1.5 rounded cursor-pointer transition-colors ${p.activo ? 'text-dim hover:text-red-400 hover:bg-red-400/10' : 'text-dim hover:text-lime hover:bg-lime/10'}`}>
                        {p.activo ? <PowerOff size={13} /> : <Power size={13} />}
                      </button>
                      <button onClick={() => eliminar(p)} title="Eliminar"
                        className="p-1.5 rounded text-dim hover:text-red-400 hover:bg-red-400/10 cursor-pointer transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear usuario */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-mono text-lg font-bold text-lime">Nuevo Usuario</h3>

            {!creado ? (
              <>
                <div>
                  <label className="label text-xs block mb-1">Email del cliente</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="cliente@gmail.com" type="email"
                    className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-lime/50" />
                </div>

                <div>
                  <label className="label text-xs block mb-1">Nombre del negocio</label>
                  <input value={form.negocio} onChange={e => setForm(f => ({ ...f, negocio: e.target.value }))}
                    placeholder="Mueblería El Pino"
                    className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-lime/50" />
                </div>

                <div>
                  <label className="label text-xs block mb-1">Plan</label>
                  <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-lime/50 cursor-pointer">
                    <option value="basic">Básico</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="label text-xs block mb-1">Contraseña generada</label>
                  <div className="flex gap-2">
                    <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg bg-card-2 border border-border text-sm font-mono text-cyan focus:outline-none focus:border-lime/50" />
                    <button onClick={() => setForm(f => ({ ...f, password: generarPassword() }))}
                      className="px-3 py-2 rounded-lg bg-card-2 border border-border text-dim hover:text-lime cursor-pointer text-xs">
                      Nueva
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setModal(false)}
                    className="flex-1 py-2.5 rounded-lg border border-border text-dim text-sm hover:text-muted cursor-pointer transition-colors">
                    Cancelar
                  </button>
                  <button onClick={crearUsuario} disabled={saving || !form.email}
                    className="flex-1 py-2.5 rounded-lg bg-lime/10 border border-lime/30 text-lime font-mono font-semibold hover:bg-lime/20 transition-colors cursor-pointer disabled:opacity-40">
                    {saving ? 'Creando...' : 'Crear usuario'}
                  </button>
                </div>
              </>
            ) : (
              /* Credenciales listas para copiar */
              <div className="space-y-4">
                <div className="bg-card-2 rounded-xl p-4 border border-lime/30 space-y-2">
                  <p className="text-xs text-dim font-mono">✅ Usuario creado</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-dim">Email:</span>
                    <span className="text-muted font-mono">{creado.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dim">Contraseña:</span>
                    <span className="text-cyan font-mono font-bold">{creado.password}</span>
                  </div>
                </div>

                <button onClick={copiarCredenciales}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border font-semibold text-sm transition-colors cursor-pointer ${copiado ? 'bg-lime/10 border-lime/30 text-lime' : 'bg-card-2 border-border text-dim hover:text-cyan hover:border-cyan/30'}`}>
                  {copiado ? <><Check size={14} /> ¡Copiado para WhatsApp!</> : <><Copy size={14} /> Copiar credenciales</>}
                </button>

                <p className="text-xs text-dim text-center">
                  Pegá el mensaje copiado en WhatsApp al cliente.
                </p>

                <button onClick={() => { setModal(false); setCreado(null) }}
                  className="w-full py-2 text-dim text-sm hover:text-muted cursor-pointer transition-colors">
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
