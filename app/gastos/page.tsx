'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, X, Download, Pencil, Trash2 } from 'lucide-react'
import { exportarExcel } from '@/lib/exportExcel'

const tipoColor: Record<string, string> = {
  'Fijo':     'text-violet bg-violet/10 border-violet/30',
  'Variable': 'text-cyan   bg-cyan/10   border-cyan/30',
}

const MESES = ['Ene','Feb','Mar','Abr','Mayo','Junio','Jul','Ago','Sep','Oct','Nov','Dic']
const CATEGORIAS = ['Agua','Monotributo','Seguro negocio','Impuestos','Seg e higiene','Contador','Edenor','Sueldo','Movistar celu','Claro internet','Flete','Cadetes','Mecánico','Otra']

interface Gasto {
  id: string
  mes: string
  tipo: string
  categoria: string
  monto: number
  dia_vencimiento?: number | null
}

export default function GastosPage() {
  const [gastos, setGastos]   = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [orden, setOrden]     = useState<'asc' | 'desc'>('asc')
  const [modal, setModal]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editId, setEditId]   = useState<string | null>(null)

  const mesOrden: Record<string, number> = {
    'Ene':1,'Feb':2,'Mar':3,'Abr':4,'Mayo':5,'Junio':6,
    'Jul':7,'Ago':8,'Sep':9,'Oct':10,'Nov':11,'Dic':12
  }

  const hoy = new Date()
  const mesActual = MESES[hoy.getMonth()]

  const emptyForm = { mes: mesActual, tipo: 'Fijo', categoria: '', monto: '', dia_vencimiento: '' }
  const [form, setForm] = useState(emptyForm)

  const cargarGastos = () => {
    supabase.from('gastos').select('*').then(({ data }) => {
      const sorted = (data || []).sort((a, b) => {
        const diff = (mesOrden[a.mes] || 0) - (mesOrden[b.mes] || 0)
        return orden === 'asc' ? diff : -diff
      })
      setGastos(sorted)
      setLoading(false)
    })
  }

  useEffect(() => { cargarGastos() }, [orden])

  const abrirNuevo = () => {
    setEditId(null)
    setForm(emptyForm)
    setModal(true)
  }

  const abrirEditar = (g: Gasto) => {
    setEditId(g.id)
    setForm({
      mes: g.mes,
      tipo: g.tipo,
      categoria: g.categoria,
      monto: g.monto.toString(),
      dia_vencimiento: g.dia_vencimiento?.toString() ?? '',
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
    if (!form.categoria || !form.monto) return
    setSaving(true)
    const datos = {
      mes: form.mes,
      tipo: form.tipo,
      categoria: form.categoria,
      monto: parseFloat(form.monto),
      dia_vencimiento: (form.tipo === 'Fijo' && form.dia_vencimiento)
        ? parseInt(form.dia_vencimiento)
        : null,
    }
    let error
    if (editId) {
      const res = await supabase.from('gastos').update(datos).eq('id', editId)
      error = res.error
    } else {
      const res = await supabase.from('gastos').insert(datos)
      error = res.error
    }
    setSaving(false)
    if (error) {
      alert('Error al guardar: ' + error.message + '\n\n¿Corriste el SQL en Supabase para agregar la columna dia_vencimiento?')
      return
    }
    cerrarModal()
    cargarGastos()
  }

  const eliminar = async () => {
    if (!editId || deleting) return
    const ok = window.confirm(`¿Eliminar el gasto "${form.categoria}"? Esta acción no se puede deshacer.`)
    if (!ok) return
    setDeleting(true)
    await supabase.from('gastos').delete().eq('id', editId)
    cerrarModal()
    cargarGastos()
  }

  const total = gastos.reduce((s, g) => s + g.monto, 0)
  const fijos = gastos.filter(g => g.tipo === 'Fijo').reduce((s, g) => s + g.monto, 0)
  const vars  = gastos.filter(g => g.tipo === 'Variable').reduce((s, g) => s + g.monto, 0)

  // Calcular alertas del mes actual para banner informativo en /gastos
  const diaHoy = hoy.getDate()
  const alertasProximas = gastos.filter(g =>
    g.tipo === 'Fijo' &&
    g.mes === mesActual &&
    g.dia_vencimiento != null
  ).map(g => {
    const diasRestantes = (g.dia_vencimiento as number) - diaHoy
    return { ...g, diasRestantes }
  }).filter(g => g.diasRestantes >= 0 && g.diasRestantes <= 3)
    .sort((a, b) => a.diasRestantes - b.diasRestantes)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-xl font-bold text-muted">Gastos</h2>
          <p className="label mt-0.5">Total registrado · <span className="text-violet font-mono">${total.toLocaleString('es-AR')}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOrden(o => o === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 rounded-lg bg-card border border-border text-dim text-sm hover:text-muted hover:border-violet/30 transition-colors cursor-pointer font-mono">
            {orden === 'asc' ? '↑ Más antiguo' : '↓ Más reciente'}
          </button>
          <button onClick={() => exportarExcel([{
            nombre: 'Gastos',
            datos: gastos.map(g => ({
              Mes: g.mes, Tipo: g.tipo, Categoría: g.categoria, Monto: g.monto,
              'Día vence': g.dia_vencimiento ?? '—'
            }))
          }], 'Gastos_Debuenamadera')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-dim text-sm hover:text-lime hover:border-lime/30 transition-colors cursor-pointer">
            <Download size={15} /> Exportar
          </button>
          <button onClick={abrirNuevo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet/10 border border-violet/30 text-violet text-sm hover:bg-violet/20 transition-colors cursor-pointer">
            <Plus size={15} /> Nuevo gasto
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card border-violet/30 glow-violet">
          <p className="label">Total gastos</p>
          <p className="kpi-value text-violet mt-1">${total.toLocaleString('es-AR')}</p>
        </div>
        <div className="card">
          <p className="label">Fijos</p>
          <p className="kpi-value text-muted mt-1">${fijos.toLocaleString('es-AR')}</p>
        </div>
        <div className="card">
          <p className="label">Variables</p>
          <p className="kpi-value text-muted mt-1">${vars.toLocaleString('es-AR')}</p>
        </div>
      </div>

      {/* Banner de alertas próximas a vencer */}
      {alertasProximas.length > 0 && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl space-y-2">
          <p className="text-xs font-mono font-bold text-orange-400 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-400" />
            </span>
            GASTOS FIJOS PRÓXIMOS A VENCER EN {mesActual.toUpperCase()}:
          </p>
          <div className="flex flex-wrap gap-2">
            {alertasProximas.map(g => (
              <span key={g.id} className={`text-xs px-3 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${
                g.diasRestantes <= 1
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
              }`}>
                {g.diasRestantes === 0 ? '🔴 ¡HOY!' : g.diasRestantes === 1 ? '🔴 Mañana' : '🟡'}{' '}
                {g.categoria} · día {g.dia_vencimiento} · ${g.monto.toLocaleString('es-AR')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de gastos */}
      <div className="card p-0 overflow-x-auto">
        {loading ? <p className="text-dim text-sm p-6">Cargando...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Mes','Tipo','Categoría','Vence','Monto',''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 label font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gastos.map((g) => {
                const diasRestantes = g.dia_vencimiento != null && g.mes === mesActual
                  ? g.dia_vencimiento - diaHoy
                  : null
                const esProximo = diasRestantes != null && diasRestantes >= 0 && diasRestantes <= 3
                return (
                  <tr key={g.id} className={`border-b border-border/50 hover:bg-card-2/50 transition-colors group ${esProximo ? 'bg-orange-500/5' : ''}`}>
                    <td className="px-4 py-3 font-mono text-dim">{g.mes}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${tipoColor[g.tipo]}`}>{g.tipo}</span>
                    </td>
                    <td className="px-4 py-3 text-muted">{g.categoria}</td>
                    <td className="px-4 py-3">
                      {g.tipo === 'Fijo' && g.dia_vencimiento != null ? (
                        <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-lg ${
                          esProximo && diasRestantes! <= 1
                            ? 'bg-red-500/20 text-red-400'
                            : esProximo
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'text-dim'
                        }`}>
                          día {g.dia_vencimiento}
                          {esProximo && diasRestantes === 0 ? ' (hoy)' : ''}
                          {esProximo && diasRestantes === 1 ? ' (mañana)' : ''}
                          {esProximo && diasRestantes !== null && diasRestantes > 1 ? ` (${diasRestantes}d)` : ''}
                        </span>
                      ) : (
                        <span className="text-dim text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-violet">${g.monto.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => abrirEditar(g)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-card-2 border border-border text-dim hover:text-violet hover:border-violet/30 cursor-pointer">
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

      {/* Modal nuevo/editar gasto */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg font-bold text-violet">
                {editId ? 'Editar Gasto' : 'Nuevo Gasto'}
              </h3>
              <button onClick={cerrarModal} className="text-dim hover:text-muted cursor-pointer"><X size={18}/></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Mes</label>
                <select value={form.mes} onChange={e => setForm(f => ({ ...f, mes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-violet/50">
                  {MESES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs mb-1 block">Tipo</label>
                <div className="flex gap-2 h-[38px]">
                  {['Fijo','Variable'].map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t }))}
                      className={`flex-1 rounded-lg text-sm border transition-colors cursor-pointer
                        ${form.tipo === t ? tipoColor[t] + ' border-current' : 'bg-card-2 border-border text-dim'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="label text-xs mb-1 block">Categoría</label>
              <input list="lista-categorias" value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                placeholder="Seleccioná o escribí..."
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-violet/50" />
              <datalist id="lista-categorias">
                {CATEGORIAS.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div className={`grid gap-3 ${form.tipo === 'Fijo' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label className="label text-xs mb-1 block">Monto</label>
                <input type="number" value={form.monto}
                  onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-violet/50" />
              </div>
              {form.tipo === 'Fijo' && (
                <div>
                  <label className="label text-xs mb-1 block">¿Qué día del mes vence?</label>
                  <input type="number" min="1" max="31" value={form.dia_vencimiento}
                    onChange={e => setForm(f => ({ ...f, dia_vencimiento: e.target.value }))}
                    placeholder="Ej: 15"
                    className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-violet/50" />
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <button onClick={guardar} disabled={saving || !form.categoria || !form.monto}
                className="w-full py-2.5 rounded-lg bg-violet/10 border border-violet/30 text-violet font-mono font-semibold hover:bg-violet/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {saving ? 'Guardando...' : editId ? 'Actualizar gasto' : 'Guardar gasto'}
              </button>
              {editId && (
                <button onClick={eliminar} disabled={saving || deleting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 font-mono font-semibold hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-40">
                  <Trash2 size={14} />
                  {deleting ? 'Eliminando...' : 'Eliminar gasto'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
