'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, X, Pencil, Download } from 'lucide-react'
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
}
interface Producto { id: string; producto: string; costo: number; precio_venta: number; margen_pct: number }

const MESES = ['Ene','Feb','Mar','Abr','Mayo','Junio','Jul','Ago','Sep','Oct','Nov','Dic']
const CANALES = ['Presencial','WhatsApp','IG']

export default function VentasPage() {
  const [ventas, setVentas]       = useState<Venta[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [q, setQ]                 = useState('')
  const [loading, setLoading]     = useState(true)
  const [orden, setOrden]         = useState<'asc'|'desc'>('asc')
  const [modal, setModal]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [editVenta, setEditVenta] = useState<Venta | null>(null)

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
      const precio = parseFloat(form.precio_venta) || prod.precio_venta
      const margen = (precio - prod.costo) / precio
      setForm(f => ({ ...f, producto: nombre, costo: prod.costo.toString(),
        margen_pct: margen.toFixed(4), utilidad_bruta: (precio * margen).toFixed(0) }))
    } else {
      setForm(f => ({ ...f, producto: nombre }))
    }
  }

  const onPrecioChange = (precio: string) => {
    const p = parseFloat(precio) || 0
    const c = parseFloat(form.costo) || 0
    if (p > 0 && c > 0) {
      const margen = (p - c) / p
      setForm(f => ({ ...f, precio_venta: precio,
        margen_pct: margen.toFixed(4), utilidad_bruta: (p * margen).toFixed(0) }))
    } else {
      setForm(f => ({ ...f, precio_venta: precio }))
    }
  }

  const guardar = async () => {
    if (!form.producto || !form.precio_venta) return
    setSaving(true)
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

  const guardarEdit = async () => {
    if (!editVenta) return
    setSaving(true)
    await supabase.from('ventas').update({ canal: editVenta.canal }).eq('id', editVenta.id)
    setSaving(false)
    setEditVenta(null)
    cargarVentas()
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
                {['Fecha','Mes','Producto','Precio','Margen','Canal',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 label font-medium">{h}</th>
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
                    <button onClick={() => setEditVenta({ ...v })}
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
              <label className="label text-xs mb-1 block">Producto</label>
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
                <input type="number" value={form.costo}
                  onChange={e => { setForm(f => ({ ...f, costo: e.target.value })); onPrecioChange(form.precio_venta) }}
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

      {/* MODAL EDITAR CANAL */}
      {editVenta && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg font-bold text-cyan">Editar Canal</h3>
              <button onClick={() => setEditVenta(null)} className="text-dim hover:text-muted cursor-pointer"><X size={18}/></button>
            </div>
            <p className="text-sm text-muted">{editVenta.producto}</p>
            <p className="text-xs text-dim">{editVenta.fecha} · ${editVenta.precio_venta?.toLocaleString('es-AR')}</p>
            <div className="flex gap-2">
              {CANALES.map(c => (
                <button key={c} onClick={() => setEditVenta(ev => ev ? { ...ev, canal: c } : ev)}
                  className={`flex-1 py-2.5 rounded-lg text-sm border transition-colors cursor-pointer
                    ${editVenta.canal === c ? canalColor[c] : 'bg-card-2 border-border text-dim hover:text-muted'}`}>
                  {c}
                </button>
              ))}
            </div>
            <button onClick={guardarEdit} disabled={saving}
              className="w-full py-2.5 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan font-mono font-semibold hover:bg-cyan/20 transition-colors cursor-pointer disabled:opacity-40">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
