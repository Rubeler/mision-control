'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, X, Download, Trash2, ShoppingBag, TrendingDown } from 'lucide-react'
import { exportarExcel } from '@/lib/exportExcel'

const MESES = ['Ene','Feb','Mar','Abr','Mayo','Junio','Jul','Ago','Sep','Oct','Nov','Dic']
const PROVEEDORES = ['DBM', 'Galería Orgánica', 'Otro']

interface Compra {
  id: string
  fecha: string
  proveedor: string
  producto: string
  cantidad: number
  precio_unitario: number
  total: number
  notas?: string | null
}

const emptyForm = {
  fecha: new Date().toISOString().split('T')[0],
  proveedor: 'DBM',
  producto: '',
  cantidad: '1',
  precio_unitario: '',
  notas: '',
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR')
const fmtFecha = (f: string) => {
  if (!f?.includes('-')) return f || ''
  const [y, m, d] = f.split('-')
  return `${d}/${m}/${y}`
}

const PROVEEDOR_COLOR: Record<string, string> = {
  'DBM':             'text-cyan bg-cyan/10 border-cyan/30',
  'Galería Orgánica': 'text-lime bg-lime/10 border-lime/30',
  'Otro':            'text-dim  bg-card    border-border',
}

export default function ComprasPage() {
  const [compras, setCompras]   = useState<Compra[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)
  const [form, setForm]         = useState(emptyForm)

  // Filtros
  const hoy = new Date()
  const mesActual = MESES[hoy.getMonth()]
  const [filtroMes, setFiltroMes]             = useState<string>('Todos')
  const [filtroProveedor, setFiltroProveedor] = useState<string>('Todos')

  const cargar = () => {
    supabase.from('compras').select('*').order('fecha', { ascending: false })
      .then(({ data }) => {
        setCompras(data || [])
        setLoading(false)
      })
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    setEditId(null)
    setForm(emptyForm)
    setModal(true)
  }

  const abrirEditar = (c: Compra) => {
    setEditId(c.id)
    setForm({
      fecha: c.fecha,
      proveedor: c.proveedor,
      producto: c.producto,
      cantidad: c.cantidad.toString(),
      precio_unitario: c.precio_unitario.toString(),
      notas: c.notas || '',
    })
    setModal(true)
  }

  const cerrarModal = () => {
    setModal(false)
    setForm(emptyForm)
    setEditId(null)
    setSaving(false)
    setDeleting(false)
  }

  const guardar = async () => {
    if (!form.producto || !form.precio_unitario || !form.cantidad) return
    setSaving(true)
    const datos = {
      fecha: form.fecha,
      proveedor: form.proveedor,
      producto: form.producto,
      cantidad: parseInt(form.cantidad) || 1,
      precio_unitario: parseFloat(form.precio_unitario),
      notas: form.notas.trim() || null,
    }
    let error
    if (editId) {
      const res = await supabase.from('compras').update(datos).eq('id', editId)
      error = res.error
    } else {
      const res = await supabase.from('compras').insert(datos)
      error = res.error
    }
    setSaving(false)
    if (error) {
      alert('Error al guardar: ' + error.message + '\n\n¿Corriste el SQL en Supabase para crear la tabla compras?')
      return
    }
    cerrarModal()
    cargar()
  }

  const eliminar = async () => {
    if (!editId || deleting) return
    const ok = window.confirm(`¿Eliminar la compra de "${form.producto}"? Esta acción no se puede deshacer.`)
    if (!ok) return
    setDeleting(true)
    await supabase.from('compras').delete().eq('id', editId)
    cerrarModal()
    cargar()
  }

  // Filtrado
  const filtered = compras.filter(c => {
    const mes = MESES[new Date(c.fecha + 'T00:00:00').getMonth()]
    const matchesMes       = filtroMes === 'Todos' || mes === filtroMes
    const matchesProveedor = filtroProveedor === 'Todos' || c.proveedor === filtroProveedor
    return matchesMes && matchesProveedor
  })

  // KPIs
  const totalInvertido    = filtered.reduce((s, c) => s + (c.total ?? c.cantidad * c.precio_unitario), 0)
  const totalUnidades     = filtered.reduce((s, c) => s + c.cantidad, 0)
  const totalTransacc     = filtered.length
  const comprasMesActual  = compras.filter(c => {
    const mes = MESES[new Date(c.fecha + 'T00:00:00').getMonth()]
    return mes === mesActual
  })
  const invertidoMes = comprasMesActual.reduce((s, c) => s + (c.total ?? c.cantidad * c.precio_unitario), 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-mono text-xl font-bold text-muted">Compras de Mercadería</h2>
          <p className="label mt-0.5">
            Historial de compras a proveedores ·{' '}
            <span className="text-cyan font-mono">{totalTransacc} registros</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportarExcel([{
            nombre: 'Compras',
            datos: filtered.map(c => ({
              Fecha: fmtFecha(c.fecha),
              Proveedor: c.proveedor,
              Producto: c.producto,
              Cantidad: c.cantidad,
              'Precio unitario': c.precio_unitario,
              Total: c.total ?? c.cantidad * c.precio_unitario,
              Notas: c.notas ?? '',
            }))
          }], 'Compras_Debuenamadera')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-dim text-sm hover:text-lime hover:border-lime/30 transition-colors cursor-pointer">
            <Download size={15} /> Exportar
          </button>
          <button onClick={abrirNuevo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan text-sm hover:bg-cyan/20 transition-colors cursor-pointer">
            <Plus size={15} /> Nueva Compra
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card border-cyan/30 glow-cyan">
          <p className="label text-xs">Total invertido</p>
          <p className="kpi-value text-cyan mt-1 text-2xl">{fmt(totalInvertido)}</p>
          <p className="text-xs text-dim mt-1">en la selección actual</p>
        </div>
        <div className="card">
          <p className="label text-xs">Unidades compradas</p>
          <p className="kpi-value text-muted mt-1 text-2xl">{totalUnidades}</p>
          <p className="text-xs text-dim mt-1">artículos totales</p>
        </div>
        <div className="card">
          <p className="label text-xs">Este mes ({mesActual})</p>
          <p className="kpi-value text-violet mt-1 text-2xl">{fmt(invertidoMes)}</p>
          <p className="text-xs text-dim mt-1">{comprasMesActual.length} compras</p>
        </div>
        <div className="card">
          <p className="label text-xs">Órdenes</p>
          <p className="kpi-value text-muted mt-1 text-2xl">{totalTransacc}</p>
          <p className="text-xs text-dim mt-1">registros filtrados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-3 bg-card p-4 rounded-xl border border-border">
        <div>
          <label className="label text-xs mb-1 block">Filtrar por mes</label>
          <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none cursor-pointer">
            <option value="Todos">Todos los meses</option>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label text-xs mb-1 block">Filtrar por proveedor</label>
          <select value={filtroProveedor} onChange={e => setFiltroProveedor(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none cursor-pointer">
            <option value="Todos">Todos los proveedores</option>
            {PROVEEDORES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla de compras */}
      <div className="card p-0 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-dim font-mono animate-pulse">Cargando compras...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <ShoppingBag size={28} className="text-dim mb-3" />
            <p className="text-muted text-sm font-semibold">Sin compras registradas</p>
            <p className="text-dim text-xs mt-1">
              {compras.length === 0
                ? 'Registrá tu primera compra de mercadería.'
                : 'Probá cambiando los filtros.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Fecha','Proveedor','Producto','Cant.','P. Unitario','Total','Notas',''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 label font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const totalReal = c.total ?? (c.cantidad * c.precio_unitario)
                return (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-card-2/50 transition-colors group">
                    <td className="px-4 py-3 font-mono text-dim text-xs">{fmtFecha(c.fecha)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${PROVEEDOR_COLOR[c.proveedor] || PROVEEDOR_COLOR['Otro']}`}>
                        {c.proveedor}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted font-medium">{c.producto}</td>
                    <td className="px-4 py-3 font-mono text-muted text-center">{c.cantidad}</td>
                    <td className="px-4 py-3 font-mono text-dim">{fmt(c.precio_unitario)}</td>
                    <td className="px-4 py-3 font-mono text-cyan font-semibold">{fmt(totalReal)}</td>
                    <td className="px-4 py-3 text-dim text-xs max-w-[120px] truncate">{c.notas || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => abrirEditar(c)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-card-2 border border-border text-dim hover:text-cyan hover:border-cyan/30 cursor-pointer">
                        ✏️
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-card-2/30">
                <td colSpan={5} className="px-4 py-3 text-xs text-dim font-mono">
                  TOTAL ({filtered.length} compras · {totalUnidades} unidades)
                </td>
                <td className="px-4 py-3 font-mono text-cyan font-bold">{fmt(totalInvertido)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Modal nueva / editar compra */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg font-bold text-cyan flex items-center gap-2">
                <ShoppingBag size={18} />
                {editId ? 'Editar Compra' : 'Nueva Compra'}
              </h3>
              <button onClick={cerrarModal} className="text-dim hover:text-muted cursor-pointer"><X size={18}/></button>
            </div>

            {/* Fecha + Proveedor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Fecha de compra</label>
                <input type="date" value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
              <div>
                <label className="label text-xs mb-1 block">Proveedor</label>
                <select value={form.proveedor} onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50 cursor-pointer">
                  {PROVEEDORES.map(p => <option key={p} value={p}>{p}</option>)}
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Producto */}
            <div>
              <label className="label text-xs mb-1 block">Artículo / Producto</label>
              <input value={form.producto}
                onChange={e => setForm(f => ({ ...f, producto: e.target.value }))}
                placeholder="Ej: Cama 1 Plaza, Ropero 1.20m..."
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
            </div>

            {/* Cantidad + Precio */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Cantidad</label>
                <input type="number" min="1" value={form.cantidad}
                  onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))}
                  placeholder="1"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
              <div>
                <label className="label text-xs mb-1 block">Precio unitario de costo</label>
                <input type="number" value={form.precio_unitario}
                  onChange={e => setForm(f => ({ ...f, precio_unitario: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
            </div>

            {/* Total calculado */}
            {form.cantidad && form.precio_unitario && (
              <div className="bg-card-2 rounded-lg px-4 py-2 flex justify-between items-center border border-cyan/20">
                <span className="text-dim text-xs">Total de la compra</span>
                <span className="font-mono text-base font-bold text-cyan">
                  {fmt((parseInt(form.cantidad) || 0) * (parseFloat(form.precio_unitario) || 0))}
                </span>
              </div>
            )}

            {/* Notas */}
            <div>
              <label className="label text-xs mb-1 block">Notas (opcional)</label>
              <input value={form.notas}
                onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                placeholder="Nro. remito, condiciones, etc."
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
            </div>

            {/* Aviso sobre stock */}
            <div className="bg-violet/5 border border-violet/20 rounded-lg px-3 py-2">
              <p className="text-xs text-dim">
                💡 <span className="text-violet font-semibold">Recordá:</span> después de registrar la compra, actualizá el stock del producto en <span className="text-cyan">Control de Stock</span>.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button onClick={guardar} disabled={saving || !form.producto || !form.precio_unitario || !form.cantidad}
                className="w-full py-2.5 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan font-mono font-semibold hover:bg-cyan/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {saving ? 'Guardando...' : editId ? 'Actualizar compra' : 'Registrar compra'}
              </button>
              {editId && (
                <button onClick={eliminar} disabled={saving || deleting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 font-mono font-semibold hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-40">
                  <Trash2 size={14} />
                  {deleting ? 'Eliminando...' : 'Eliminar compra'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
