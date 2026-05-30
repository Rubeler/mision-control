'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, X, GripVertical, Pencil, Trash2, Phone, Send, Search, MessageCircle } from 'lucide-react'

type Lead = {
  id: number
  fecha: string
  nombre: string | null
  producto: string
  canal: string
  estado: string
  motivo: string | null
  telefono: string | null
  notas: string | null
}

type ProductoEnvio = {
  id: string
  producto: string
  precio_venta: number
  linea?: string
  categoria?: string
}

const ESTADOS = ['Nuevo', 'Seguimiento', 'Ganado', 'Perdido'] as const

const estadoStyle: Record<string, string> = {
  'Nuevo':       'text-cyan   bg-cyan/10   border-cyan/30',
  'Seguimiento': 'text-violet bg-violet/10 border-violet/30',
  'Ganado':      'text-lime   bg-lime/10   border-lime/30',
  'Perdido':     'text-red-400 bg-red-400/10 border-red-400/30',
}

const canalStyle: Record<string, string> = {
  'Presencial': 'bg-cyan/10   border-cyan/30   text-cyan',
  'WhatsApp':   'bg-lime/10   border-lime/30   text-lime',
  'IG':         'bg-violet/10 border-violet/30 text-violet',
}

const canalText: Record<string, string> = {
  'Presencial': 'text-cyan',
  'WhatsApp':   'text-lime',
  'IG':         'text-violet',
}

const hoy = new Date().toISOString().split('T')[0]
const FORM_VACIO = { nombre: '', producto: '', canal: 'WhatsApp', fecha: hoy, estado: 'Nuevo', motivo: '', telefono: '', notas: '' }

function formatFecha(f: string) {
  if (!f) return ''
  if (f.includes('-')) {
    const [y, m, d] = f.split('-')
    return `${d}/${m}/${y}`
  }
  return f
}

function formatTelefono(t: string | null) {
  if (!t) return null
  const n = t.replace(/\D/g, '')
  if (n.startsWith('549') && n.length === 13) return `+54 9 ${n.slice(3, 5)} ${n.slice(5, 9)}-${n.slice(9)}`
  if (n.startsWith('54') && n.length === 12)  return `+54 ${n.slice(2, 4)} ${n.slice(4, 8)}-${n.slice(8)}`
  return t
}

function toWANumber(telefono: string) {
  const n = telefono.replace(/\D/g, '')
  if (n.startsWith('549') && n.length >= 12) return n
  if (n.startsWith('54'))  return '549' + n.slice(2)
  if (n.length === 10)     return '549' + n
  if (n.length === 11)     return '54'  + n
  return n
}

export default function LeadsPage() {
  const [leads, setLeads]           = useState<Lead[]>([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editLead, setEditLead]     = useState<Lead | null>(null)
  const [form, setForm]             = useState(FORM_VACIO)
  const [saving, setSaving]         = useState(false)
  const [confirmarId, setConfirmarId] = useState<number | null>(null)
  const [dragId, setDragId]         = useState<number | null>(null)
  const [dragOver, setDragOver]     = useState<string | null>(null)

  // Estado para envío de muebles
  const [enviarLead, setEnviarLead]             = useState<Lead | null>(null)
  const [productosEnvio, setProductosEnvio]     = useState<ProductoEnvio[]>([])
  const [seleccionados, setSeleccionados]       = useState<Set<string>>(new Set())
  const [tabLinea, setTabLinea]                 = useState<'todos' | 'madera' | 'melamina'>('todos')
  const [busquedaEnvio, setBusquedaEnvio]       = useState('')
  const [loadingProductos, setLoadingProductos] = useState(false)

  const cargarLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('id', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => { cargarLeads() }, [])

  const abrirEnvio = async (l: Lead) => {
    setEnviarLead(l)
    setSeleccionados(new Set())
    setBusquedaEnvio('')
    setTabLinea('todos')
    setLoadingProductos(true)
    const { data } = await supabase
      .from('productos')
      .select('id, producto, precio_venta, linea, categoria')
      .order('linea, producto')
    setProductosEnvio(data || [])
    setLoadingProductos(false)
  }

  const toggleSeleccion = (id: string) => {
    setSeleccionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const enviarPorWA = () => {
    if (!enviarLead || seleccionados.size === 0) return
    const ids = Array.from(seleccionados).join(',')
    const base = window.location.origin
    const link = `${base}/catalogo/seleccion?ids=${ids}`
    const nombre = enviarLead.nombre || ''
    const saludo = nombre ? `Hola ${nombre}! ` : 'Hola! '
    const texto  = encodeURIComponent(`${saludo}Te mando los muebles que te comenté:\n${link}`)
    if (enviarLead.telefono) {
      const num = toWANumber(enviarLead.telefono)
      window.open(`https://wa.me/${num}?text=${texto}`, '_blank')
    } else {
      navigator.clipboard.writeText(decodeURIComponent(texto)).catch(() => {})
      window.open(`https://wa.me/?text=${texto}`, '_blank')
    }
    setEnviarLead(null)
  }

  const productosFiltrados = productosEnvio.filter(p => {
    const lineaOk = tabLinea === 'todos' || (p.linea || 'madera') === tabLinea
    const busqOk  = p.producto.toLowerCase().includes(busquedaEnvio.toLowerCase())
    return lineaOk && busqOk
  })

  const handleDrop = async (estado: string) => {
    if (dragId === null) return
    setDragOver(null)
    const { error } = await supabase.from('leads').update({ estado }).eq('id', dragId)
    if (!error) setLeads(prev => prev.map(l => l.id === dragId ? { ...l, estado } : l))
    setDragId(null)
  }

  const abrirNuevo = () => { setEditLead(null); setForm(FORM_VACIO); setShowModal(true) }

  const abrirEditar = (l: Lead) => {
    setEditLead(l)
    setForm({
      nombre:   l.nombre || '',
      producto: l.producto,
      canal:    l.canal,
      fecha:    l.fecha,
      estado:   l.estado,
      motivo:   l.motivo || '',
      telefono: l.telefono || '',
      notas:    l.notas || '',
    })
    setShowModal(true)
  }

  const guardar = async () => {
    if (!form.producto) return
    setSaving(true)
    const payload = {
      nombre:   form.nombre || null,
      producto: form.producto,
      canal:    form.canal,
      fecha:    form.fecha,
      estado:   form.estado,
      motivo:   form.estado === 'Perdido' ? (form.motivo || null) : null,
      telefono: form.telefono || null,
      notas:    form.notas || null,
    }
    const { error } = editLead
      ? await supabase.from('leads').update(payload).eq('id', editLead.id)
      : await supabase.from('leads').insert(payload)
    setSaving(false)
    if (!error) { setShowModal(false); setEditLead(null); setForm(FORM_VACIO); cargarLeads() }
  }

  const eliminar = async (id: number) => {
    await supabase.from('leads').delete().eq('id', id)
    setConfirmarId(null)
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  const total   = leads.length
  const ganados = leads.filter(l => l.estado === 'Ganado').length
  const perdidos = leads.filter(l => l.estado === 'Perdido').length
  const tasa    = total ? ((ganados / total) * 100).toFixed(0) : '0'

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-xl font-bold text-muted">Leads CRM</h2>
          {loading
            ? <p className="label mt-0.5">Cargando...</p>
            : <p className="label mt-0.5">
                {total} leads · <span className="text-lime">{ganados} ganados</span>
                {perdidos > 0 && <> · <span className="text-red-400">{perdidos} perdidos</span></>}
                {' · '}Conversión <span className="text-cyan font-mono">{tasa}%</span>
              </p>
          }
        </div>
        <button onClick={abrirNuevo}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime/10 border border-lime/30 text-lime text-sm hover:bg-lime/20 transition-colors cursor-pointer">
          <Plus size={15} /> Nuevo lead
        </button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ESTADOS.map(estado => {
          const items = leads.filter(l => l.estado === estado)
          const isOver = dragOver === estado
          return (
            <div key={estado}
              className={`card space-y-3 transition-all duration-150 min-h-[120px] ${isOver ? 'ring-1 ring-cyan/40 bg-cyan/5' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(estado) }}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null) }}
              onDrop={() => handleDrop(estado)}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${estadoStyle[estado]}`}>
                  {estado}
                </span>
                <span className="text-dim text-xs font-mono">{items.length}</span>
              </div>

              {items.length === 0 && (
                <div className={`rounded-lg border-2 border-dashed py-5 flex items-center justify-center transition-colors ${isOver ? 'border-cyan/50' : 'border-border'}`}>
                  <p className="text-dim text-xs">{isOver ? 'Soltar aquí ↓' : 'Sin leads'}</p>
                </div>
              )}

              {items.map(l => (
                <div key={l.id}
                  draggable
                  onDragStart={() => setDragId(l.id)}
                  onDragEnd={() => { setDragId(null); setDragOver(null) }}
                  className={`bg-card-2 border border-border rounded-lg p-3 space-y-2 transition-all select-none cursor-grab active:cursor-grabbing hover:border-cyan/30 ${dragId === l.id ? 'opacity-40 scale-95' : ''}`}
                >
                  {/* Nombre + acciones */}
                  <div className="flex items-start gap-1.5">
                    <GripVertical size={12} className="text-dim mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      {l.nombre && <p className="text-xs font-mono text-cyan truncate">{l.nombre}</p>}
                      <p className="text-sm text-muted leading-snug">{l.producto}</p>
                    </div>
                    <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => abrirEditar(l)}
                        className="p-1 rounded text-dim hover:text-cyan hover:bg-cyan/10 transition-colors cursor-pointer">
                        <Pencil size={11} />
                      </button>
                      <button onClick={() => setConfirmarId(confirmarId === l.id ? null : l.id)}
                        className="p-1 rounded text-dim hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {l.telefono && (
                    <div className="flex items-center gap-1">
                      <Phone size={10} className="text-lime shrink-0" />
                      <span className="text-xs font-mono text-lime/80">{formatTelefono(l.telefono)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${canalText[l.canal] || 'text-dim'}`}>{l.canal}</span>
                    <span className="text-xs text-dim font-mono">{formatFecha(l.fecha)}</span>
                  </div>

                  {l.motivo && <p className="text-xs text-red-400">↳ {l.motivo}</p>}
                  {l.notas && (
                    <p className="text-xs text-dim/80 italic border-t border-border/50 pt-1.5">
                      📝 {l.notas}
                    </p>
                  )}

                  {/* Botones de envío */}
                  <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => abrirEnvio(l)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-lime/10 border border-lime/30 text-lime text-xs font-semibold hover:bg-lime/20 transition-colors cursor-pointer">
                      <Send size={11} /> Muebles
                    </button>
                    <button onClick={() => {
                      const base = 'https://mision-control-omega.vercel.app/galeria'
                      const nombre = l.nombre || ''
                      const saludo = nombre ? `Hola ${nombre}! ` : 'Hola! '
                      const texto = encodeURIComponent(`${saludo}Te mando nuestro catálogo completo:\n${base}`)
                      if (l.telefono) {
                        window.open(`https://wa.me/${toWANumber(l.telefono)}?text=${texto}`, '_blank')
                      } else {
                        window.open(`https://wa.me/?text=${texto}`, '_blank')
                      }
                    }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-violet/10 border border-violet/30 text-violet text-xs font-semibold hover:bg-violet/20 transition-colors cursor-pointer">
                      <MessageCircle size={11} /> Catálogo
                    </button>
                  </div>

                  {confirmarId === l.id && (
                    <div className="flex gap-2 pt-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setConfirmarId(null)}
                        className="flex-1 py-1 rounded text-xs border border-border text-dim hover:text-muted transition-colors cursor-pointer">
                        Cancelar
                      </button>
                      <button onClick={() => eliminar(l.id)}
                        className="flex-1 py-1 rounded text-xs bg-red-400/10 border border-red-400/30 text-red-400 hover:bg-red-400/20 transition-colors cursor-pointer">
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* ── MODAL: Enviar muebles ── */}
      {enviarLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75" onClick={() => setEnviarLead(null)} />
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl flex flex-col max-h-[85vh]">

            {/* Header modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <h3 className="font-mono text-base font-bold text-lime">Enviar muebles</h3>
                <p className="text-xs text-dim mt-0.5">
                  {enviarLead.nombre && <span className="text-cyan">{enviarLead.nombre} · </span>}
                  {enviarLead.telefono ? formatTelefono(enviarLead.telefono) : 'Sin teléfono'}
                </p>
              </div>
              <button onClick={() => setEnviarLead(null)} className="text-dim hover:text-muted cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Tabs + search */}
            <div className="px-5 pt-3 pb-2 border-b border-border shrink-0 space-y-2">
              <div className="flex gap-2">
                {(['todos', 'madera', 'melamina'] as const).map(t => (
                  <button key={t} onClick={() => setTabLinea(t)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                      tabLinea === t
                        ? t === 'madera'   ? 'bg-lime/10 border-lime/30 text-lime'
                        : t === 'melamina' ? 'bg-violet/10 border-violet/30 text-violet'
                        : 'bg-cyan/10 border-cyan/30 text-cyan'
                        : 'bg-transparent border-border text-dim'
                    }`}>
                    {t === 'todos' ? 'Todos' : t === 'madera' ? 'Madera Maciza' : 'Blanco & Madera'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                <input value={busquedaEnvio} onChange={e => setBusquedaEnvio(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full pl-8 pr-4 py-1.5 rounded-lg bg-card-2 border border-border text-xs text-muted placeholder:text-dim focus:outline-none focus:border-cyan/50" />
              </div>
            </div>

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {loadingProductos ? (
                <p className="text-dim text-sm text-center py-8">Cargando productos...</p>
              ) : productosFiltrados.length === 0 ? (
                <p className="text-dim text-sm text-center py-8">No hay productos</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {productosFiltrados.map(p => {
                    const selected = seleccionados.has(p.id)
                    return (
                      <button key={p.id} onClick={() => toggleSeleccion(p.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selected
                            ? 'bg-lime/10 border-lime/40 ring-1 ring-lime/20'
                            : 'bg-card-2 border-border hover:border-cyan/30'
                        }`}>
                        {/* Checkbox visual */}
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                          selected ? 'bg-lime border-lime' : 'border-dim'
                        }`}>
                          {selected && <div className="w-2 h-2 rounded-full bg-bg" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-snug ${selected ? 'text-lime' : 'text-muted'}`}>
                            {p.producto}
                          </p>
                          <p className="text-xs text-dim font-mono">
                            ${p.precio_venta?.toLocaleString('es-AR')}
                            {p.linea === 'melamina'
                              ? <span className="ml-2 text-violet/70">Blanco & Madera</span>
                              : <span className="ml-2 text-lime/50">Madera</span>
                            }
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div className="px-5 py-4 border-t border-border shrink-0 flex items-center justify-between gap-3">
              <p className="text-sm text-dim">
                {seleccionados.size === 0
                  ? 'Seleccioná los muebles a enviar'
                  : <span><span className="text-lime font-mono font-bold">{seleccionados.size}</span> mueble{seleccionados.size > 1 ? 's' : ''} seleccionado{seleccionados.size > 1 ? 's' : ''}</span>
                }
              </p>
              <div className="flex gap-2">
                <button onClick={() => setEnviarLead(null)}
                  className="px-4 py-2 rounded-lg border border-border text-dim text-sm hover:text-muted transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button onClick={enviarPorWA} disabled={seleccionados.size === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/40 text-[#25D366] text-sm font-semibold hover:bg-[#25D366]/20 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                  <MessageCircle size={14} />
                  Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nuevo / editar lead */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => { setShowModal(false); setEditLead(null) }} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg font-bold text-cyan">
                {editLead ? 'Editar lead' : 'Nuevo lead'}
              </h3>
              <button onClick={() => { setShowModal(false); setEditLead(null) }} className="text-dim hover:text-muted cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="label text-xs block mb-1">Nombre del cliente</label>
              <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej: María González"
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
            </div>

            <div>
              <label className="label text-xs block mb-1">Producto / Interés</label>
              <input value={form.producto} onChange={e => setForm(f => ({ ...f, producto: e.target.value }))}
                placeholder="Ej: Ropero 1.60, Cocina a medida..."
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
            </div>

            <div>
              <label className="label text-xs block mb-1">Teléfono (opcional)</label>
              <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                placeholder="Ej: 1130216559"
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
            </div>

            <div>
              <label className="label text-xs block mb-1">Observación</label>
              <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                placeholder="Ej: Lo llamaron, mercadería lista, entrega el 5/6..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-xs block mb-1">Canal</label>
                <div className="flex flex-col gap-1.5">
                  {['Presencial', 'WhatsApp', 'IG'].map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, canal: c }))}
                      className={`py-1.5 rounded-lg text-xs border transition-colors cursor-pointer
                        ${form.canal === c ? canalStyle[c] : 'bg-card-2 border-border text-dim hover:text-muted'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="label text-xs block mb-1">Estado</label>
                  <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50">
                    {ESTADOS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs block mb-1">Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
                </div>
              </div>
            </div>

            {form.estado === 'Perdido' && (
              <div>
                <label className="label text-xs block mb-1">Motivo de pérdida</label>
                <input value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                  placeholder="Precio, distancia, tiempo de entrega..."
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={() => { setShowModal(false); setEditLead(null) }}
                className="flex-1 py-2.5 rounded-lg border border-border text-dim text-sm hover:text-muted transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={guardar} disabled={!form.producto || saving}
                className="flex-1 py-2.5 rounded-lg bg-lime/10 border border-lime/30 text-lime font-mono font-semibold text-sm hover:bg-lime/20 transition-colors cursor-pointer disabled:opacity-40">
                {saving ? 'Guardando...' : editLead ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
