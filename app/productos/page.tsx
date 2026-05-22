'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, X, Pencil } from 'lucide-react'

interface Producto { id: string; producto: string; costo: number; precio_venta: number; margen_pct: number }

const emptyForm = { producto: '', costo: '', precio_venta: '', margen_pct: '' }

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [q, setQ]                 = useState('')
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [form, setForm]           = useState(emptyForm)

  const cargar = () => {
    supabase.from('productos').select('*').order('producto')
      .then(({ data }) => { setProductos(data || []); setLoading(false) })
  }

  useEffect(() => { cargar() }, [])

  const calcularMargen = (costo: string, precio: string) => {
    const c = parseFloat(costo) || 0
    const p = parseFloat(precio) || 0
    if (c > 0 && p > 0) return ((p - c) / p).toFixed(4)
    return ''
  }

  const onCostoChange = (val: string) => {
    const margen = calcularMargen(val, form.precio_venta)
    setForm(f => ({ ...f, costo: val, margen_pct: margen }))
  }

  const onPrecioChange = (val: string) => {
    const margen = calcularMargen(form.costo, val)
    setForm(f => ({ ...f, precio_venta: val, margen_pct: margen }))
  }

  const abrirNuevo = () => {
    setEditId(null)
    setForm(emptyForm)
    setModal(true)
  }

  const abrirEditar = (p: Producto) => {
    setEditId(p.id)
    setForm({
      producto:    p.producto,
      costo:       p.costo.toString(),
      precio_venta: p.precio_venta.toString(),
      margen_pct:  p.margen_pct.toString()
    })
    setModal(true)
  }

  const guardar = async () => {
    if (!form.producto || !form.costo || !form.precio_venta) return
    setSaving(true)
    const datos = {
      producto:    form.producto,
      costo:       parseFloat(form.costo),
      precio_venta: parseFloat(form.precio_venta),
      margen_pct:  parseFloat(form.margen_pct) || null
    }
    if (editId) {
      await supabase.from('productos').update(datos).eq('id', editId)
    } else {
      await supabase.from('productos').insert(datos)
    }
    setSaving(false)
    setModal(false)
    setForm(emptyForm)
    setEditId(null)
    cargar()
  }

  const filtered = productos.filter(p => p.producto.toLowerCase().includes(q.toLowerCase()))
  const margenProm = filtered.length
    ? (filtered.reduce((s, p) => s + p.margen_pct, 0) / filtered.length * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-xl font-bold text-muted">Catálogo de Productos</h2>
          <p className="label mt-0.5">{filtered.length} productos · Margen promedio <span className="text-lime font-mono">{margenProm}%</span></p>
        </div>
        <button onClick={abrirNuevo}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime/10 border border-lime/30 text-lime text-sm hover:bg-lime/20 transition-colors cursor-pointer">
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar producto..."
          className="w-full max-w-sm pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm text-muted placeholder:text-dim focus:outline-none focus:border-cyan/50 transition-colors" />
      </div>

      <div className="card p-0 overflow-x-auto">
        {loading ? <p className="text-dim text-sm p-6">Cargando...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Producto','Costo','Precio de Venta','Margen %',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 label font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const margen = p.margen_pct * 100
                const margenColor = margen >= 65 ? 'text-lime' : margen >= 55 ? 'text-cyan' : 'text-violet'
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-card-2/50 transition-colors group">
                    <td className="px-4 py-3 text-muted">{p.producto}</td>
                    <td className="px-4 py-3 font-mono text-dim">${p.costo?.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 font-mono text-cyan">${p.precio_venta?.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-semibold ${margenColor}`}>{margen.toFixed(1)}%</span>
                        <div className="flex-1 h-1.5 bg-card-2 rounded-full overflow-hidden max-w-[80px]">
                          <div className={`h-full rounded-full ${margenColor.replace('text-','bg-')}`} style={{ width: `${Math.min(margen,100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => abrirEditar(p)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-card-2 border border-border text-dim hover:text-cyan hover:border-cyan/30 cursor-pointer">
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg font-bold text-lime">
                {editId ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setModal(false)} className="text-dim hover:text-muted cursor-pointer"><X size={18}/></button>
            </div>

            <div>
              <label className="label text-xs mb-1 block">Nombre del producto</label>
              <input value={form.producto} onChange={e => setForm(f => ({ ...f, producto: e.target.value }))}
                placeholder="Ej: Ropero 1.60"
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-lime/50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Costo directo</label>
                <input type="number" value={form.costo} onChange={e => onCostoChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-lime/50" />
              </div>
              <div>
                <label className="label text-xs mb-1 block">Precio de venta</label>
                <input type="number" value={form.precio_venta} onChange={e => onPrecioChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-lime/50" />
              </div>
            </div>

            {form.margen_pct && (
              <div className="bg-card-2 rounded-lg px-4 py-3 flex justify-between items-center">
                <span className="text-dim text-sm">Margen bruto calculado</span>
                <span className="font-mono text-xl font-bold text-lime">
                  {(parseFloat(form.margen_pct) * 100).toFixed(1)}%
                </span>
              </div>
            )}

            <button onClick={guardar} disabled={saving || !form.producto || !form.costo || !form.precio_venta}
              className="w-full py-2.5 rounded-lg bg-lime/10 border border-lime/30 text-lime font-mono font-semibold hover:bg-lime/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : editId ? 'Actualizar producto' : 'Guardar producto'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
