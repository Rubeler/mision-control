'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, X, GripVertical } from 'lucide-react'

type Lead = {
  id: number
  fecha: string
  nombre: string | null
  producto: string
  canal: string
  estado: string
  motivo: string | null
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
const FORM_VACIO = { nombre: '', producto: '', canal: 'WhatsApp', fecha: hoy, estado: 'Nuevo', motivo: '' }

function formatFecha(f: string) {
  if (!f) return ''
  if (f.includes('-')) {
    const [y, m, d] = f.split('-')
    return `${d}/${m}/${y}`
  }
  return f
}

export default function LeadsPage() {
  const [leads, setLeads]       = useState<Lead[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(FORM_VACIO)
  const [saving, setSaving]     = useState(false)
  const [dragId, setDragId]     = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const cargarLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('id', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => { cargarLeads() }, [])

  const handleDrop = async (estado: string) => {
    if (dragId === null) return
    setDragOver(null)
    const { error } = await supabase.from('leads').update({ estado }).eq('id', dragId)
    if (!error) setLeads(prev => prev.map(l => l.id === dragId ? { ...l, estado } : l))
    setDragId(null)
  }

  const guardar = async () => {
    if (!form.producto) return
    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      nombre:   form.nombre || null,
      producto: form.producto,
      canal:    form.canal,
      fecha:    form.fecha,
      estado:   form.estado,
      motivo:   form.estado === 'Perdido' ? (form.motivo || null) : null,
    })
    setSaving(false)
    if (!error) {
      setShowModal(false)
      setForm(FORM_VACIO)
      cargarLeads()
    }
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
        <button onClick={() => setShowModal(true)}
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
                  <div className="flex items-start gap-1.5">
                    <GripVertical size={12} className="text-dim mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      {l.nombre && <p className="text-xs font-mono text-cyan truncate">{l.nombre}</p>}
                      <p className="text-sm text-muted leading-snug">{l.producto}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${canalText[l.canal] || 'text-dim'}`}>{l.canal}</span>
                    <span className="text-xs text-dim font-mono">{formatFecha(l.fecha)}</span>
                  </div>
                  {l.motivo && <p className="text-xs text-red-400">↳ {l.motivo}</p>}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Modal nuevo lead */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg font-bold text-cyan">Nuevo lead</h3>
              <button onClick={() => setShowModal(false)} className="text-dim hover:text-muted cursor-pointer"><X size={18} /></button>
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
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-dim text-sm hover:text-muted transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={guardar} disabled={!form.producto || saving}
                className="flex-1 py-2.5 rounded-lg bg-lime/10 border border-lime/30 text-lime font-mono font-semibold text-sm hover:bg-lime/20 transition-colors cursor-pointer disabled:opacity-40">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
