'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, X, Pencil, Download, Trash2, CheckCircle2 } from 'lucide-react'
import { exportarExcel } from '@/lib/exportExcel'

const canalColor: Record<string, string> = {
  'Presencial': 'text-cyan   bg-cyan/10   border-cyan/30',
  'WhatsApp':   'text-lime   bg-lime/10   border-lime/30',
  'IG':         'text-violet bg-violet/10 border-violet/30',
  '':           'text-dim    bg-card-2    border-border',
}

interface Venta {
  id: string; fecha: string; mes: string; producto: string
  precio_venta: number; margen_pct: number; utilidad_bruta: number; canal: string
  entregada?: boolean | null
}
interface Producto { id: string; producto: string; costo: number; precio_venta: number; margen_pct: number; stock?: number }

type EditForm = {
  id: string; fecha: string; mes: string; producto: string
  precio_venta: string; costo: string; margen_pct: string; utilidad_bruta: string; canal: string
}

const MESES  = ['Ene','Feb','Mar','Abr','Mayo','Junio','Jul','Ago','Sep','Oct','Nov','Dic']
const CANALES = ['Presencial','WhatsApp','IG']

const calcMargen = (precio: string, costo: string) => {
  const p = parseFloat(precio) || 0
  const c = parseFloat(costo) || 0
  if (p > 0 && c > 0) return { margen_pct: ((p - c) / p).toFixed(4), utilidad_bruta: (p - c).toFixed(0) }
  return null
}

export default function VentasPage() {
  const [ventas, setVentas]       = useState<Venta[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [q, setQ]                 = useState('')
  const [loading, setLoading]     = useState(true)
  const [orden, setOrden]         = useState<'asc'|'desc'>('asc')
  const [modal, setModal]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [editForm, setEditForm]   = useState<EditForm | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const hoy       = new Date()
  const mesActual = MESES[hoy.getMonth()]
  const fechaHoy  = hoy.toISOString().split('T')[0]

  const [form, setForm] = useState({
    fecha: fechaHoy, mes: mesActual, producto: '',
    precio_venta: '', costo: '', margen_pct: '', utilidad_bruta: '', canal: 'Presencial'
  })

  const cargarVentas = () => {
    supabase.from('ventas').select('*')
      .order('fecha', { ascending: orden === 'asc' })
      .then(({ data }) => { setVentas(data || []); setLoading(false) })
  }

  useEffect(() => { cargarVentas() }, [orden])
  useEffect(() => {
    supabase.from('productos').select('*').order('producto')
      .then(({ data }) => setProductos(data || []))
  }, [])

  const onProductoChange = (nombre: string) => {
    const prod = productos.find(p => p.producto === nombre)
    if (prod) {
      setForm(f => {
        const precio = parseFloat(f.precio_venta) || prod.precio_venta
        const r = calcMargen(precio.toString(), prod.costo.toString())
        return { ...f, producto: nombre, costo: prod.costo.toString(), ...(r || {}) }
      })
    } else {
      setForm(f => ({ ...f, producto: nombre }))
    }
  }

  const onPrecioChange = (precio: string) => {
    setForm(f => {
      const r = calcMargen(precio, f.costo)
      return { ...f, precio_venta: precio, ...(r || {}) }
    })
  }

  const onCostoChange = (costo: string) => {
    setForm(f => {
      const r = calcMargen(f.precio_venta, costo)
      return { ...f, costo, ...(r || {}) }
    })
  }

  const guardar = async () => {
    if (!form.producto || !form.precio_venta) return
    setSaving(true)

    // Descontar stock automáticamente si el producto coincide en catálogo
    const matched = productos.find(p => p.producto.trim().toLowerCase() === form.producto.trim().toLowerCase())
    if (matched) {
      const currentStock = matched.stock ?? 0
      const newStock = Math.max(0, currentStock - 1)
      await supabase.from('productos').update({ stock: newStock }).eq('id', matched.id)
      setProductos(prev => prev.map(p => p.id === matched.id ? { ...p, stock: newStock } : p))
    }

    await supabase.from('ventas').insert({
      fecha: form.fecha, mes: form.mes, producto: form.producto,
      precio_venta: parseFloat(form.precio_venta),
      margen_pct: parseFloat(form.margen_pct) || null,
      utilidad_bruta: parseFloat(form.utilidad_bruta) || null,
      canal: form.canal
    })
    setSaving(false)
    setModal(false)
    setForm({ fecha: fechaHoy, mes: mesActual, producto: '', precio_venta: '',
      costo: '', margen_pct: '', utilidad_bruta: '', canal: 'Presencial' })
    cargarVentas()
  }

  const abrirEdit = (v: Venta) => {
    const costo = v.margen_pct ? Math.round(v.precio_venta * (1 - v.margen_pct)).toString() : ''
    setEditForm({
      id: v.id, fecha: v.fecha, mes: v.mes, producto: v.producto,
      precio_venta: v.precio_venta.toString(), costo,
      margen_pct: v.margen_pct?.toString() || '',
      utilidad_bruta: v.utilidad_bruta?.toString() || '',
      canal: v.canal || 'Presencial'
    })
    setConfirmDelete(false)
  }

  const onEditPrecioChange = (precio: string) => {
    setEditForm(f => {
      if (!f) return f
      const r = calcMargen(precio, f.costo)
      return { ...f, precio_venta: precio, ...(r || {}) }
    })
  }

  const onEditCostoChange = (costo: string) => {
    setEditForm(f => {
      if (!f) return f
      const r = calcMargen(f.precio_venta, costo)
      return { ...f, costo, ...(r || {}) }
    })
  }

  const guardarEdit = async () => {
    if (!editForm) return
    setSaving(true)
    await supabase.from('ventas').update({
      fecha: editForm.fecha, mes: editForm.mes, producto: editForm.producto,
      precio_venta: parseFloat(editForm.precio_venta),
      margen_pct: parseFloat(editForm.margen_pct) || null,
      utilidad_bruta: parseFloat(editForm.utilidad_bruta) || null,
      canal: editForm.canal
    }).eq('id', editForm.id)
    setSaving(false)
    setEditForm(null)
    cargarVentas()
  }

  const eliminar = async () => {
    if (!editForm) return
    setSaving(true)
    await supabase.from('ventas').delete().eq('id', editForm.id)
    setSaving(false)
    setEditForm(null)
    setConfirmDelete(false)
    cargarVentas()
  }

  const toggleEntregada = async (venta: Venta) => {
    const nuevoEstado = !venta.entregada
    setVentas(prev => prev.map(v => v.id === venta.id ? { ...v, entregada: nuevoEstado } : v))
    const { error } = await supabase.from('ventas').update({ entregada: nuevoEstado }).eq('id', venta.id)
    if (error) {
      setVentas(prev => prev.map(v => v.id === venta.id ? { ...v, entregada: !nuevoEstado } : v))
      alert('Error al actualizar el estado: ' + error.message + '\n\n¿Agregaste la columna "entregada" (boolean) en Supabase?')
    }
  }

  const filtered = ventas.filter(v =>
    v.producto.toLowerCase().includes(q.toLowerCase()) ||
    (v.canal || '').toLowerCase().includes(q.toLowerCase())
  )
  const total = filtered.reduce((s, v) => s + v.precio_venta, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-xl font-bold text-muted">Ventas</h2>
          <p className="label mt-0.5">{filtered.length} registros · Total <span className="text-cyan font-mono">${total.toLocaleString('es-AR')}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOrden(o => o === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 rounded-lg bg-card border border-border text-dim text-sm hover:text-muted hover:border-cyan/30 transition-colors cursor-pointer font-mono">
            {orden === 'asc' ? '↑ Más antiguo' : '↓ Más reciente'}
          </button>
          <button onClick={() => exportarExcel([{
            nombre: 'Ventas',
            datos: ventas.map(v => ({
              Fecha: v.fecha, Mes: v.mes, Producto: v.producto,
              'Precio Venta': v.precio_venta,
              'Margen %': v.margen_pct ? (v.margen_pct * 100).toFixed(1) + '%' : '',
              'Utilidad Bruta': v.utilidad_bruta,
              Canal: v.canal || 'Sin canal',
              Entrega: v.entregada ? 'Entregada' : 'Pendiente',
            }))
          }], 'Ventas_Debuenamadera')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-dim text-sm hover:text-lime hover:border-lime/30 transition-colors cursor-pointer">
            <Download size={15} /> Exportar
          </button>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan text-sm hover:bg-cyan/20 transition-colors cursor-pointer">
            <Plus size={15} /> Nueva venta
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar producto o canal..."
          className="w-full max-w-sm pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm text-muted placeholder:text-dim focus:outline-none focus:border-cyan/50 transition-colors" />
      </div>

      <div className="card p-0 overflow-x-auto">
        {loading ? <p className="text-dim text-sm p-6">Cargando...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Fecha','Mes','Producto','Precio','Margen','Canal','Entrega',''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 label font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-border/50 hover:bg-card-2/50 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-dim">{v.fecha}</td>
                  <td className="px-4 py-3 text-dim">{v.mes}</td>
                  <td className="px-4 py-3 text-muted">{v.producto}</td>
                  <td className="px-4 py-3 font-mono text-cyan">${v.precio_venta?.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 font-mono text-lime">{v.margen_pct ? (v.margen_pct * 100).toFixed(1) : '—'}%</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${canalColor[v.canal || ''] || canalColor['']}`}>
                      {v.canal || 'Sin canal'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleEntregada(v)}
                      title={v.entregada ? 'Desmarcar entrega' : 'Marcar como entregada'}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        v.entregada
                          ? 'bg-lime/10 border-lime/30 text-lime hover:bg-lime/20'
                          : 'bg-card-2 border-border text-dim hover:text-muted hover:border-dim/30'
                      }`}>
                      <CheckCircle2 size={13} className={v.entregada ? 'text-lime' : 'text-dim opacity-50'} />
                      {v.entregada ? 'Entregada' : 'Pendiente'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => abrirEdit(v)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-card-2 border border-border text-dim hover:text-cyan hover:border-cyan/30 cursor-pointer">
                      <Pencil size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL NUEVA VENTA */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg font-bold text-cyan">Nueva Venta</h3>
              <button onClick={() => setModal(false)} className="text-dim hover:text-muted cursor-pointer"><X size={18}/></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Fecha</label>
                <input type="date" value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
              <div>
                <label className="label text-xs mb-1 block">Mes</label>
                <select value={form.mes} onChange={e => setForm(f => ({ ...f, mes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50">
                  {MESES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label text-xs block">Producto</label>
                {form.producto && (() => {
                  const matched = productos.find(p => p.producto.trim().toLowerCase() === form.producto.trim().toLowerCase())
                  if (matched) {
                    const stock = matched.stock ?? 0
                    return stock > 0 ? (
                      <span className="text-xs text-lime font-semibold">Stock disponible: {stock} u.</span>
                    ) : (
                      <span className="text-xs text-red-400 font-semibold font-mono animate-pulse">⚠️ ¡Sin Stock en local!</span>
                    )
                  }
                  return <span className="text-xs text-dim">Venta manual (no catálogo)</span>
                })()}
              </div>
              <input list="lista-productos" value={form.producto}
                onChange={e => onProductoChange(e.target.value)}
                placeholder="Escribí o seleccioná del catálogo..."
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              <datalist id="lista-productos">
                {productos.map(p => <option key={p.id} value={p.producto} />)}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Precio de venta</label>
                <input type="number" value={form.precio_venta} onChange={e => onPrecioChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
              <div>
                <label className="label text-xs mb-1 block">Costo</label>
                <input type="number" value={form.costo} onChange={e => onCostoChange(e.target.value)}
                  placeholder="auto del catálogo"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
            </div>
            {form.margen_pct && (
              <div className="bg-card-2 rounded-lg px-3 py-2 flex justify-between text-sm">
                <span className="text-dim">Margen calculado</span>
                <span className="font-mono text-lime font-bold">{(parseFloat(form.margen_pct)*100).toFixed(1)}%</span>
              </div>
            )}
            <div>
              <label className="label text-xs mb-1 block">Canal</label>
              <div className="flex gap-2">
                {CANALES.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, canal: c }))}
                    className={`flex-1 py-2 rounded-lg text-sm border transition-colors cursor-pointer
                      ${form.canal === c ? canalColor[c] : 'bg-card-2 border-border text-dim hover:text-muted'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={guardar} disabled={saving || !form.producto || !form.precio_venta}
              className="w-full py-2.5 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan font-mono font-semibold hover:bg-cyan/20 transition-colors cursor-pointer disabled:opacity-40">
              {saving ? 'Guardando...' : 'Guardar venta'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL EDITAR VENTA */}
      {editForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg font-bold text-cyan">Editar venta</h3>
              <button onClick={() => setEditForm(null)} className="text-dim hover:text-muted cursor-pointer"><X size={18}/></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Fecha</label>
                <input type="date" value={editForm.fecha}
                  onChange={e => setEditForm(f => f ? { ...f, fecha: e.target.value } : f)}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
              <div>
                <label className="label text-xs mb-1 block">Mes</label>
                <select value={editForm.mes} onChange={e => setEditForm(f => f ? { ...f, mes: e.target.value } : f)}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50">
                  {MESES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label text-xs mb-1 block">Producto</label>
              <input value={editForm.producto}
                onChange={e => setEditForm(f => f ? { ...f, producto: e.target.value } : f)}
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Precio de venta</label>
                <input type="number" value={editForm.precio_venta} onChange={e => onEditPrecioChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
              <div>
                <label className="label text-xs mb-1 block">Costo</label>
                <input type="number" value={editForm.costo} onChange={e => onEditCostoChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
            </div>
            {editForm.margen_pct && (
              <div className="bg-card-2 rounded-lg px-3 py-2 flex justify-between text-sm">
                <span className="text-dim">Margen calculado</span>
                <span className="font-mono text-lime font-bold">{(parseFloat(editForm.margen_pct)*100).toFixed(1)}%</span>
              </div>
            )}
            <div>
              <label className="label text-xs mb-1 block">Canal</label>
              <div className="flex gap-2">
                {CANALES.map(c => (
                  <button key={c} onClick={() => setEditForm(f => f ? { ...f, canal: c } : f)}
                    className={`flex-1 py-2 rounded-lg text-sm border transition-colors cursor-pointer
                      ${editForm.canal === c ? canalColor[c] : 'bg-card-2 border-border text-dim hover:text-muted'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {confirmDelete ? (
              <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-3 space-y-3">
                <p className="text-sm text-red-400">¿Confirmás que querés eliminar esta venta?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 rounded-lg border border-border text-dim text-sm hover:text-muted cursor-pointer">
                    Cancelar
                  </button>
                  <button onClick={eliminar} disabled={saving}
                    className="flex-1 py-2 rounded-lg bg-red-400/20 border border-red-400/40 text-red-400 text-sm font-semibold cursor-pointer disabled:opacity-40">
                    {saving ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <button onClick={() => setConfirmDelete(true)}
                  className="p-2.5 rounded-lg border border-border text-dim hover:text-red-400 hover:border-red-400/30 transition-colors cursor-pointer">
                  <Trash2 size={16} />
                </button>
                <button onClick={guardarEdit} disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan font-mono font-semibold hover:bg-cyan/20 transition-colors cursor-pointer disabled:opacity-40">
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
