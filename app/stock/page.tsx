'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, X, Pencil, Minus, Database, Check, AlertCircle, Bell, BellOff } from 'lucide-react'

interface Producto {
  id: string
  producto: string
  costo: number
  precio_venta: number
  margen_pct: number
  imagen_url?: string
  categoria?: string
  linea?: string
  stock: number
  alerta_critica?: boolean
}

const CATEGORIAS = ['General', 'Dormitorio', 'Living', 'Comedor', 'Cocina', 'Oficina', 'Baño', 'Exterior']
const LINEAS = ['madera', 'melamina']

const emptyForm = { producto: '', costo: '', precio_venta: '', margen_pct: '', imagen_url: '', categoria: 'Dormitorio', linea: 'madera', stock: '0', alerta_critica: false }

// Lista predefinida basada en los 3 proveedores y catálogo habitual del local para el botón "Carga Inicial"
const PRODUCTOS_PRECARGA = [
  // Camas
  { producto: 'Cama 1 Plaza (0.80m) Línea Simple', costo: 15000, precio_venta: 30000, categoria: 'Dormitorio', linea: 'madera', stock: 2 },
  { producto: 'Cama 1 Plaza y Media (1.00m) Línea Simple', costo: 18000, precio_venta: 35000, categoria: 'Dormitorio', linea: 'madera', stock: 1 },
  { producto: 'Cama 2 Plazas (1.40m) Línea Simple', costo: 25000, precio_venta: 50000, categoria: 'Dormitorio', linea: 'madera', stock: 2 },
  { producto: 'Cama Súper / Sommier 1.40m base', costo: 30000, precio_venta: 60000, categoria: 'Dormitorio', linea: 'madera', stock: 1 },
  
  // Roperos
  { producto: 'Ropero Macizo 0.80m (Abrir)', costo: 36000, precio_venta: 72000, categoria: 'Dormitorio', linea: 'madera', stock: 1 },
  { producto: 'Ropero Macizo 1.20m (Abrir)', costo: 45000, precio_venta: 89000, categoria: 'Dormitorio', linea: 'madera', stock: 1 },
  { producto: 'Ropero Macizo 1.20m (Corredizo)', costo: 55000, precio_venta: 118000, categoria: 'Dormitorio', linea: 'madera', stock: 1 },
  { producto: 'Ropero Macizo 1.60m (Corredizo)', costo: 75000, precio_venta: 147000, categoria: 'Dormitorio', linea: 'madera', stock: 2 },
  
  // Chifoniers y Cómodas
  { producto: 'Chifonier 4 Cajones', costo: 20000, precio_venta: 41000, categoria: 'Dormitorio', linea: 'madera', stock: 3 },
  { producto: 'Chifonier 5 Cajones', costo: 22000, precio_venta: 45000, categoria: 'Dormitorio', linea: 'madera', stock: 2 },
  { producto: 'Chifonier 6 Cajones', costo: 24000, precio_venta: 48500, categoria: 'Dormitorio', linea: 'madera', stock: 2 },
  { producto: 'Chifonier 7 Cajones', costo: 25000, precio_venta: 49500, categoria: 'Dormitorio', linea: 'madera', stock: 1 },
  { producto: 'Cómoda 1.00m x 1.00m', costo: 30000, precio_venta: 60000, categoria: 'Dormitorio', linea: 'madera', stock: 1 },
  
  // Mesas de luz
  { producto: 'Mesa de Luz Económica', costo: 9000, precio_venta: 18000, categoria: 'Dormitorio', linea: 'madera', stock: 4 },
  { producto: 'Mesa de Luz c/Cajón y Puerta', costo: 12500, precio_venta: 25000, categoria: 'Dormitorio', linea: 'madera', stock: 4 },
  { producto: 'Mesa de Luz para Sommier', costo: 14000, precio_venta: 28500, categoria: 'Dormitorio', linea: 'madera', stock: 2 },

  // Comedor
  { producto: 'Mesa Desmontable Maciza 1.20x0.80', costo: 21000, precio_venta: 42000, categoria: 'Comedor', linea: 'madera', stock: 1 },
  { producto: 'Mesa Desmontable Maciza 1.60x0.80', costo: 25500, precio_venta: 51000, categoria: 'Comedor', linea: 'madera', stock: 1 },
  { producto: 'Mesa Desmontable Maciza 2.00x0.80', costo: 33500, precio_venta: 67000, categoria: 'Comedor', linea: 'madera', stock: 1 },
  
  // Sillas
  { producto: 'Silla Hindú', costo: 8500, precio_venta: 17500, categoria: 'Comedor', linea: 'madera', stock: 6 },
  { producto: 'Silla Sol', costo: 8500, precio_venta: 17500, categoria: 'Comedor', linea: 'madera', stock: 4 },
  { producto: 'Silla Francesca', costo: 8500, precio_venta: 17500, categoria: 'Comedor', linea: 'madera', stock: 6 },
  { producto: 'Silla Eco', costo: 6000, precio_venta: 12000, categoria: 'Comedor', linea: 'madera', stock: 8 },
  { producto: 'Silla Sofia', costo: 7750, precio_venta: 15500, categoria: 'Comedor', linea: 'madera', stock: 4 },
  
  // Living / Rack TV
  { producto: 'Rack TV 1.20m', costo: 50000, precio_venta: 100000, categoria: 'Living', linea: 'madera', stock: 2 },
  { producto: 'Rack TV 1.60m', costo: 65000, precio_venta: 130000, categoria: 'Living', linea: 'madera', stock: 1 },
  
  // Cocina
  { producto: 'Bajo Mesada 1.20m (Madera)', costo: 32000, precio_venta: 67000, categoria: 'Cocina', linea: 'madera', stock: 1 },
  { producto: 'Bajo Mesada 1.60m (Madera)', costo: 40000, precio_venta: 80000, categoria: 'Cocina', linea: 'madera', stock: 1 },
  { producto: 'Alacena 1.20m (Madera)', costo: 21500, precio_venta: 43000, categoria: 'Cocina', linea: 'madera', stock: 1 },
  { producto: 'Alacena 1.60m (Madera)', costo: 29500, precio_venta: 59000, categoria: 'Cocina', linea: 'madera', stock: 1 },
]

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [q, setQ]                 = useState('')
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [form, setForm]           = useState(emptyForm)
  const [seeding, setSeeding]     = useState(false)
  
  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos')
  const [filtroLinea, setFiltroLinea]         = useState<string>('Todos')
  const [filtroStock, setFiltroStock]         = useState<'Todos' | 'En Stock' | 'Sin Stock'>('Todos')

  const cargar = () => {
    supabase.from('productos').select('*').order('producto')
      .then(({ data }) => { 
        setProductos(data || [])
        setLoading(false) 
      })
  }

  useEffect(() => { cargar() }, [])

  const toggleAlerta = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal
    setProductos(prev => prev.map(p => p.id === id ? { ...p, alerta_critica: newVal } : p))
    const { error } = await supabase.from('productos').update({ alerta_critica: newVal }).eq('id', id)
    if (error) {
      console.error('Error actualizando alerta:', error.message)
      setProductos(prev => prev.map(p => p.id === id ? { ...p, alerta_critica: currentVal } : p))
    }
  }

  // Modificar stock rápido (+ / -)
  const cambiarStock = async (id: string, delta: number, currentStock: number) => {
    const nuevoStock = Math.max(0, currentStock + delta)
    // Optimistic UI Update
    setProductos(prev => prev.map(p => p.id === id ? { ...p, stock: nuevoStock } : p))
    
    const { error } = await supabase.from('productos').update({ stock: nuevoStock }).eq('id', id)
    if (error) {
      console.error('Error actualizando stock:', error.message)
      // Rollback en caso de error
      setProductos(prev => prev.map(p => p.id === id ? { ...p, stock: currentStock } : p))
    }
  }

  const calcularMargen = (costo: string, precio: string) => {
    const c = parseFloat(costo) || 0
    const p = parseFloat(precio) || 0
    if (c > 0 && p > 0) return ((p - c) / p).toFixed(4)
    return ''
  }

  const onCostoChange  = (val: string) => setForm(f => ({ ...f, costo: val, margen_pct: calcularMargen(val, f.precio_venta) }))
  const onPrecioChange = (val: string) => setForm(f => ({ ...f, precio_venta: val, margen_pct: calcularMargen(f.costo, val) }))

  const abrirNuevo = () => { 
    setEditId(null)
    setForm(emptyForm)
    setModal(true) 
  }

  const abrirEditar = (p: Producto) => {
    setEditId(p.id)
    setForm({
      producto:     p.producto,
      costo:        p.costo.toString(),
      precio_venta: p.precio_venta.toString(),
      margen_pct:   p.margen_pct.toString(),
      imagen_url:   p.imagen_url || '',
      categoria:    p.categoria || 'Dormitorio',
      linea:        p.linea || 'madera',
      stock:        (p.stock ?? 0).toString(),
      alerta_critica: p.alerta_critica || false
    })
    setModal(true)
  }

  const guardar = async () => {
    if (!form.producto || !form.costo || !form.precio_venta) return
    setSaving(true)
    const datos = {
      producto:     form.producto,
      costo:        parseFloat(form.costo),
      precio_venta: parseFloat(form.precio_venta),
      margen_pct:   parseFloat(form.margen_pct) || null,
      imagen_url:   form.imagen_url.trim() || null,
      categoria:    form.categoria || 'General',
      linea:        form.linea || 'madera',
      stock:        parseInt(form.stock) || 0,
      alerta_critica: !!form.alerta_critica
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

  // Lógica de carga masiva de stock sugerida
  const ejecutarPrecarga = async () => {
    if (!confirm('¿Deseas cargar la lista sugerida de productos base para control de stock? Los productos existentes no se borrarán.')) return
    setSeeding(true)
    
    const { error } = await supabase.from('productos').insert(PRODUCTOS_PRECARGA)
    if (error) {
      alert('Error al precargar productos: ' + error.message)
    } else {
      alert('¡Productos de proveedores cargados con éxito!')
    }
    setSeeding(false)
    cargar()
  }

  // Filtrado de productos en Frontend
  const filtered = productos.filter(p => {
    const matchesQuery = p.producto.toLowerCase().includes(q.toLowerCase())
    const matchesCat   = filtroCategoria === 'Todos' || p.categoria === filtroCategoria
    const matchesLinea = filtroLinea === 'Todos' || p.linea === filtroLinea
    const matchesStock = filtroStock === 'Todos' 
      ? true 
      : filtroStock === 'En Stock' 
        ? (p.stock ?? 0) > 0 
        : (p.stock ?? 0) === 0

    return matchesQuery && matchesCat && matchesLinea && matchesStock
  })

  // Estadísticas rápidas
  const totalArticulos = filtered.reduce((s, p) => s + (p.stock ?? 0), 0)
  const itemsSinStock  = filtered.filter(p => (p.stock ?? 0) === 0).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-mono text-xl font-bold text-muted">Control de Stock y Mercadería</h2>
          <p className="label mt-0.5">
            {filtered.length} artículos en lista · <span className="text-lime font-mono">{totalArticulos} unidades físicas</span> en local
            {itemsSinStock > 0 && <span className="ml-2 text-red-400 font-mono">· {itemsSinStock} sin stock</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={ejecutarPrecarga} disabled={seeding}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet/10 border border-violet/30 text-violet text-sm hover:bg-violet/20 transition-colors cursor-pointer disabled:opacity-40">
            <Database size={15} /> {seeding ? 'Cargando...' : 'Cargar Muebles Base'}
          </button>
          <button onClick={abrirNuevo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan text-sm hover:bg-cyan/20 transition-colors cursor-pointer">
            <Plus size={15} /> Agregar Artículo
          </button>
        </div>
      </div>

      {/* Buscador + Filtros rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-card p-4 rounded-xl border border-border">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar cama, ropero, mesa, medida..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
        </div>

        {/* Categoría */}
        <div>
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none cursor-pointer">
            <option value="Todos">Todas las Categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Línea */}
        <div>
          <select value={filtroLinea} onChange={e => setFiltroLinea(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none cursor-pointer">
            <option value="Todos">Todas las Líneas</option>
            <option value="madera">Madera Maciza</option>
            <option value="melamina">Blanco & Madera</option>
          </select>
        </div>

        {/* Disponibilidad */}
        <div>
          <select value={filtroStock} onChange={e => setFiltroStock(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none cursor-pointer">
            <option value="Todos">Todos los estados</option>
            <option value="En Stock">En Stock</option>
            <option value="Sin Stock">Sin Stock (Agotado)</option>
          </select>
        </div>
      </div>

      {/* Tabla de Stock */}
      <div className="card p-0 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-dim font-mono animate-pulse">Cargando mercadería...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <AlertCircle size={24} className="text-dim mb-2" />
            <p className="text-muted text-sm font-semibold">No se encontraron artículos</p>
            <p className="text-dim text-xs mt-1">Probá cambiando los filtros o cargá los muebles base.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Artículo','Categoría','Línea','Precio Venta','Stock en Local','Alerta Crítica','Acciones'].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 label font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const stock = p.stock ?? 0
                const isCritico = p.alerta_critica && stock === 0
                return (
                  <tr key={p.id} className={`border-b border-border/50 hover:bg-card-2/50 transition-colors group ${isCritico ? 'bg-red-500/10 border-red-500/30' : ''}`}>
                    <td className={`px-4 py-3 font-semibold ${isCritico ? 'text-red-400 font-mono animate-pulse' : 'text-muted'}`}>
                      {isCritico ? '⚠️ ' : ''}{p.producto}
                    </td>
                    <td className="px-4 py-3 text-dim text-xs">{p.categoria || 'General'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.linea === 'melamina' ? 'bg-violet/10 text-violet' : 'bg-lime/10 text-lime'}`}>
                        {p.linea === 'melamina' ? 'Blanco & Madera' : 'Madera'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan">${p.precio_venta?.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => cambiarStock(p.id, -1, stock)}
                          disabled={stock === 0}
                          className="w-7 h-7 rounded-lg bg-card border border-border text-dim hover:text-red-400 hover:border-red-400/40 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                          <Minus size={12} />
                        </button>
                        <span className={`font-mono text-base font-bold w-6 text-center ${stock > 0 ? 'text-lime' : 'text-red-400 animate-pulse'}`}>
                          {stock}
                        </span>
                        <button onClick={() => cambiarStock(p.id, 1, stock)}
                          className="w-7 h-7 rounded-lg bg-card border border-border text-dim hover:text-lime hover:border-lime/40 flex items-center justify-center cursor-pointer transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleAlerta(p.id, !!p.alerta_critica)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          p.alerta_critica 
                            ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20' 
                            : 'bg-card border-border text-dim hover:text-muted hover:border-border/80'
                        }`}
                        title={p.alerta_critica ? 'Alerta crítica activada (Click para desactivar)' : 'Activar alerta crítica para este mueble'}>
                        {p.alerta_critica ? <Bell size={14} className="fill-yellow-400 animate-bounce" /> : <BellOff size={14} />}
                      </button>
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

      {/* Modal de edición */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg font-bold text-cyan">
                {editId ? 'Editar Mercadería' : 'Nuevo Artículo'}
              </h3>
              <button onClick={() => setModal(false)} className="text-dim hover:text-muted cursor-pointer"><X size={18}/></button>
            </div>

            <div>
              <label className="label text-xs mb-1 block">Nombre / Medida del Artículo</label>
              <input value={form.producto} onChange={e => setForm(f => ({ ...f, producto: e.target.value }))}
                placeholder="Ej: Cama 1 Plaza (0.80m)"
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Línea</label>
                <select value={form.linea} onChange={e => setForm(f => ({ ...f, linea: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50 cursor-pointer">
                  <option value="madera">Madera Maciza</option>
                  <option value="melamina">Blanco & Madera</option>
                </select>
              </div>
              <div>
                <label className="label text-xs mb-1 block">Categoría</label>
                <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50 cursor-pointer">
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Costo Directo</label>
                <input type="number" value={form.costo} onChange={e => onCostoChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
              <div>
                <label className="label text-xs mb-1 block">Precio Venta</label>
                <input type="number" value={form.precio_venta} onChange={e => onPrecioChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
              <div>
                <label className="label text-xs mb-1 block">Stock Actual</label>
                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
            </div>

            {form.margen_pct && (
              <div className="bg-card-2 rounded-lg px-4 py-2 flex justify-between items-center border border-border">
                <span className="text-dim text-xs">Margen bruto calculado</span>
                <span className="font-mono text-base font-bold text-lime">
                  {(parseFloat(form.margen_pct) * 100).toFixed(1)}%
                </span>
              </div>
            )}

             <div>
              <label className="label text-xs mb-1 block">URL de Imagen (Opcional)</label>
              <input value={form.imagen_url} onChange={e => setForm(f => ({ ...f, imagen_url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-xs text-dim focus:outline-none focus:border-cyan/50" />
            </div>

            <div className="flex items-center gap-2 bg-card-2 p-3 rounded-lg border border-border">
              <input type="checkbox" id="alerta_critica" 
                checked={!!form.alerta_critica}
                onChange={e => setForm(f => ({ ...f, alerta_critica: e.target.checked }))}
                className="w-4 h-4 cursor-pointer accent-cyan" />
              <label htmlFor="alerta_critica" className="text-xs text-muted cursor-pointer font-semibold select-none flex items-center gap-1.5">
                <Bell size={13} className="text-yellow-400 fill-yellow-400/20" /> Activar Alerta Crítica (Avisar en Director OS si queda en 0)
              </label>
            </div>

            <button onClick={guardar} disabled={saving || !form.producto || !form.costo || !form.precio_venta}
              className="w-full py-2.5 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan font-mono font-semibold hover:bg-cyan/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : editId ? 'Actualizar Artículo' : 'Guardar Artículo'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
