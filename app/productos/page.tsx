'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, X, Pencil, Trash2, Download, ExternalLink, Image as ImageIcon, Upload } from 'lucide-react'
import { exportarExcel } from '@/lib/exportExcel'
import Link from 'next/link'

interface Producto {
  id: string
  producto: string
  costo: number
  precio_venta: number
  margen_pct: number
  imagen_url?: string
  categoria?: string
  linea?: string
}

const CATEGORIAS = ['General', 'Dormitorio', 'Living', 'Comedor', 'Cocina', 'Oficina', 'Baño', 'Exterior']
const emptyForm  = { producto: '', costo: '', precio_venta: '', margen_pct: '', imagen_url: '', categoria: 'General', linea: 'madera' }

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [q, setQ]                 = useState('')
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [form, setForm]           = useState(emptyForm)
  const [subiendo, setSubiendo]   = useState(false)

  const subirFoto = async (file: File) => {
    setSubiendo(true)
    const ext  = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { data } = await supabase.storage.from('Productos').upload(path, file, { upsert: false })
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('Productos').getPublicUrl(data.path)
      setForm(f => ({ ...f, imagen_url: publicUrl }))
    }
    setSubiendo(false)
  }

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

  const onCostoChange  = (val: string) => setForm(f => ({ ...f, costo:        val, margen_pct: calcularMargen(val, f.precio_venta) }))
  const onPrecioChange = (val: string) => setForm(f => ({ ...f, precio_venta: val, margen_pct: calcularMargen(f.costo, val) }))

  const cerrarModal = () => { setModal(false); setForm(emptyForm); setEditId(null); setDeleting(false); setSaving(false) }

  const abrirNuevo = () => { setEditId(null); setForm(emptyForm); setModal(true) }

  const abrirEditar = (p: Producto) => {
    setEditId(p.id)
    setForm({
      producto:    p.producto,
      costo:       p.costo.toString(),
      precio_venta: p.precio_venta.toString(),
      margen_pct:  p.margen_pct.toString(),
      imagen_url:  p.imagen_url || '',
      categoria:   p.categoria  || 'General',
      linea:       p.linea      || 'madera',
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
      margen_pct:  parseFloat(form.margen_pct) || null,
      imagen_url:  form.imagen_url.trim() || null,
      categoria:   form.categoria || 'General',
      linea:       form.linea || 'madera',
    }
    if (editId) {
      await supabase.from('productos').update(datos).eq('id', editId)
    } else {
      await supabase.from('productos').insert(datos)
    }
    setSaving(false); cerrarModal()
    cargar()
  }

  const eliminarProducto = async (id = editId, nombre = form.producto) => {
    if (!id || deleting) return

    const confirmado = window.confirm(`Eliminar "${nombre}" del catálogo? Esta acción no se puede deshacer.`)
    if (!confirmado) return

    setDeleting(true)
    await supabase.from('productos').delete().eq('id', id)
    cerrarModal()
    cargar()
  }

  const filtered  = productos.filter(p => p.producto.toLowerCase().includes(q.toLowerCase()))
  const margenProm = filtered.length
    ? (filtered.reduce((s, p) => s + p.margen_pct, 0) / filtered.length * 100).toFixed(1)
    : '0'
  const conImagen = filtered.filter(p => p.imagen_url).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-mono text-xl font-bold text-muted">Catálogo de Productos</h2>
          <p className="label mt-0.5">
            {filtered.length} productos · Margen promedio <span className="text-lime font-mono">{margenProm}%</span>
            {conImagen > 0 && <span className="ml-2 text-cyan">· {conImagen} con foto</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/catalogo" target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-dim text-sm hover:text-cyan hover:border-cyan/30 transition-colors cursor-pointer">
            <ExternalLink size={14} /> Ver catálogo
          </Link>
          <button onClick={() => exportarExcel([{
            nombre: 'Productos',
            datos: productos.map(p => ({
              Producto: p.producto,
              Categoría: p.categoria || 'General',
              Costo: p.costo,
              'Precio Venta': p.precio_venta,
              'Margen %': p.margen_pct ? (p.margen_pct * 100).toFixed(1) + '%' : '',
            }))
          }], 'Productos_Debuenamadera')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-dim text-sm hover:text-lime hover:border-lime/30 transition-colors cursor-pointer">
            <Download size={15} /> Exportar
          </button>
          <button onClick={abrirNuevo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime/10 border border-lime/30 text-lime text-sm hover:bg-lime/20 transition-colors cursor-pointer">
            <Plus size={15} /> Nuevo producto
          </button>
        </div>
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
                {['','Producto','Categoría','Costo','Precio de Venta','Margen %',''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 label font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const margen      = p.margen_pct * 100
                const margenColor = margen >= 65 ? 'text-lime' : margen >= 55 ? 'text-cyan' : 'text-violet'
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-card-2/50 transition-colors group">
                    {/* Thumbnail */}
                    <td className="pl-4 pr-2 py-2 w-10">
                      {p.imagen_url ? (
                        <img src={p.imagen_url} alt={p.producto}
                          className="w-9 h-9 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-card-2 border border-border flex items-center justify-center">
                          <ImageIcon size={13} className="text-border" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{p.producto}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${p.linea === 'melamina' ? 'bg-violet/10 text-violet' : 'bg-lime/10 text-lime'}`}>
                          {p.linea === 'melamina' ? 'Blanco & Madera' : 'Madera'}
                        </span>
                        <span className="text-xs text-dim bg-card-2 px-2 py-0.5 rounded-full w-fit">{p.categoria || 'General'}</span>
                      </div>
                    </td>
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
                      <div className="flex items-center gap-1">
                        <button onClick={() => abrirEditar(p)} title="Editar producto"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-card-2 border border-border text-dim hover:text-cyan hover:border-cyan/30 cursor-pointer">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => eliminarProducto(p.id, p.producto)} title="Eliminar producto"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-card-2 border border-border text-dim hover:text-red-400 hover:border-red-400/30 cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </div>
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
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg font-bold text-lime">
                {editId ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={cerrarModal} className="text-dim hover:text-muted cursor-pointer"><X size={18}/></button>
            </div>

            <div>
              <label className="label text-xs mb-1 block">Nombre del producto</label>
              <input value={form.producto} onChange={e => setForm(f => ({ ...f, producto: e.target.value }))}
                placeholder="Ej: Ropero 1.60"
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-lime/50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Línea</label>
                <select value={form.linea} onChange={e => setForm(f => ({ ...f, linea: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-lime/50 cursor-pointer">
                  <option value="madera">Madera Maciza</option>
                  <option value="melamina">Blanco & Madera</option>
                </select>
              </div>
              <div>
                <label className="label text-xs mb-1 block">Categoría</label>
                <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-lime/50 cursor-pointer">
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
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

            <div>
              <label className="label text-xs mb-1 block">Imagen del producto</label>
              {/* Botón subir foto */}
              <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-dashed cursor-pointer transition-colors
                ${subiendo ? 'border-lime/30 text-lime/50' : 'border-border text-dim hover:border-lime/40 hover:text-lime'}`}>
                <Upload size={14} />
                <span className="text-sm">{subiendo ? 'Subiendo...' : 'Subir foto desde PC o celular'}</span>
                <input type="file" accept="image/*" className="hidden"
                  disabled={subiendo}
                  onChange={e => { if (e.target.files?.[0]) subirFoto(e.target.files[0]) }} />
              </label>
              {/* Preview o URL manual */}
              {form.imagen_url ? (
                <div className="mt-2 relative rounded-lg overflow-hidden border border-border/50 h-36">
                  <img src={form.imagen_url} alt="preview" className="w-full h-full object-cover"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                  <button onClick={() => setForm(f => ({ ...f, imagen_url: '' }))}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 cursor-pointer">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <input value={form.imagen_url} onChange={e => setForm(f => ({ ...f, imagen_url: e.target.value }))}
                  placeholder="O pegá una URL de imagen..."
                  className="mt-2 w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-xs text-dim focus:outline-none focus:border-lime/50" />
              )}
            </div>

            <div className="space-y-2">
              <button onClick={guardar} disabled={saving || deleting || !form.producto || !form.costo || !form.precio_venta}
                className="w-full py-2.5 rounded-lg bg-lime/10 border border-lime/30 text-lime font-mono font-semibold hover:bg-lime/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {saving ? 'Guardando...' : editId ? 'Actualizar producto' : 'Guardar producto'}
              </button>

              {editId && (
                <button onClick={() => eliminarProducto()} disabled={saving || deleting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 font-mono font-semibold hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  <Trash2 size={14} />
                  {deleting ? 'Eliminando...' : 'Eliminar producto'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
