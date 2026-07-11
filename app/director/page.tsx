'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Zap, TrendingUp, TrendingDown, Bell } from 'lucide-react'

const MESES_NAMES = ['Ene','Feb','Mar','Abr','Mayo','Junio','Jul','Ago','Sep','Oct','Nov','Dic']

function GaugeHalf({ value, color, label, sub }: {
  value: number; color: 'cyan' | 'lime' | 'violet'; label: string; sub?: string
}) {
  const pct = Math.min(Math.max(value, 0), 100)
  const r = 36, cx = 50, cy = 52
  const d = `M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`
  const hex    = color === 'cyan' ? '#00FFFF' : color === 'lime' ? '#39FF14' : '#BB86FC'
  const cls    = color === 'cyan' ? 'border-cyan/30 glow-cyan' : color === 'lime' ? 'border-lime/30 glow-lime' : 'border-violet/30 glow-violet'
  const textCls = color === 'cyan' ? 'text-cyan' : color === 'lime' ? 'text-lime' : 'text-violet'
  return (
    <div className={`card ${cls} flex flex-col items-center py-5`}>
      <svg viewBox="0 0 100 60" className="w-36 h-[82px]">
        <path d={d} fill="none" stroke="#111122" strokeWidth="8" strokeLinecap="round" pathLength="100" />
        <path d={d} fill="none" stroke={hex} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${pct} 100`} pathLength="100"
              style={{ filter: `drop-shadow(0 0 5px ${hex}99)` }} />
        <text x="50" y="47" textAnchor="middle" fill={hex}
              style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' }}>
          {value.toFixed(0)}%
        </text>
      </svg>
      <p className={`font-mono text-sm font-semibold ${textCls} -mt-1`}>{label}</p>
      {sub && <p className="text-xs text-dim text-center mt-0.5">{sub}</p>}
    </div>
  )
}

interface Venta { id: string; fecha: string; mes: string; producto: string; precio_venta: number; margen_pct: number; utilidad_bruta: number; canal: string }
interface Gasto { id: string; mes: string; tipo: string; categoria: string; monto: number }
interface Lead  { id: number; fecha: string; estado: string; canal: string; producto: string; nombre: string | null }

const fmt      = (n: number) => '$' + Math.round(n).toLocaleString('es-AR')
const fmtFecha = (f: string) => {
  if (!f?.includes('-')) return f || ''
  const [y, m, d] = f.split('-')
  return `${d}/${m}/${y}`
}

const ESTADO_STYLE: Record<string, { bar: string; text: string }> = {
  'Nuevo':       { bar: 'bg-cyan',    text: 'text-cyan'    },
  'Seguimiento': { bar: 'bg-violet',  text: 'text-violet'  },
  'Ganado':      { bar: 'bg-lime',    text: 'text-lime'    },
  'Perdido':     { bar: 'bg-red-400', text: 'text-red-400' },
}
const CANAL_TEXT: Record<string, string> = {
  'Presencial': 'text-cyan', 'WhatsApp': 'text-lime', 'IG': 'text-violet',
}

export default function DirectorPage() {
  const [ventas,  setVentas]  = useState<Venta[]>([])
  const [gastos,  setGastos]  = useState<Gasto[]>([])
  const [leads,   setLeads]   = useState<Lead[]>([])
  const [productos, setProductos] = useState<{ id: string; producto: string; stock: number; alerta_critica: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [mesFiltro, setMesFiltro] = useState<string | null>(null)

  const hoy             = new Date().toISOString().split('T')[0]
  const hora            = new Date().getHours()
  const mesActualNombre = MESES_NAMES[new Date().getMonth()]
  const saludo          = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches'

  useEffect(() => {
    Promise.all([
      supabase.from('ventas').select('id, fecha, mes, producto, precio_venta, margen_pct, utilidad_bruta, canal').order('fecha', { ascending: false }),
      supabase.from('gastos').select('id, mes, tipo, categoria, monto'),
      supabase.from('leads').select('id, fecha, estado, canal, producto, nombre').order('id', { ascending: false }),
      supabase.from('productos').select('id, producto, stock, alerta_critica'),
    ]).then(([{ data: v }, { data: g }, { data: l }, { data: p }]) => {
      setVentas(v || [])
      setGastos(g || [])
      setLeads(l || [])
      setProductos(p || [])
      setLoading(false)
    })
  }, [])

  // Siempre los 12 meses
  const mesesDisponibles = MESES_NAMES

  // Datos del mes seleccionado (o mes actual para el briefing)
  const ventasMesSel = mesFiltro ? ventas.filter(v => v.mes === mesFiltro) : []
  const gastosMesSel = mesFiltro ? gastos.filter(g => g.mes === mesFiltro) : []
  const revenueMesSel  = ventasMesSel.reduce((s, v) => s + (v.precio_venta || 0), 0)
  const gastosMesTotal = gastosMesSel.reduce((s, g) => s + (g.monto || 0), 0)
  const utilidadMesSel = revenueMesSel - gastosMesTotal

  // Datos generales (para briefing y gauges)
  const totalLeads = leads.length
  const ganados    = leads.filter(l => l.estado === 'Ganado').length
  const perdidos   = leads.filter(l => l.estado === 'Perdido').length
  const activos    = leads.filter(l => l.estado === 'Nuevo' || l.estado === 'Seguimiento').length
  const conversion = totalLeads ? (ganados / totalLeads) * 100 : 0
  const totalRevenue  = ventas.reduce((s, v) => s + (v.precio_venta || 0), 0)
  const utilidadBruta = ventas.reduce((s, v) => s + (v.utilidad_bruta || 0), 0)
  const margenProm    = ventas.length ? ventas.reduce((s, v) => s + (v.margen_pct || 0), 0) / ventas.length * 100 : 0
  const ticketProm    = ventas.length ? totalRevenue / ventas.length : 0
  const revenueXLead  = ganados ? totalRevenue / ganados : 0
  const leadsHoy      = leads.filter(l => l.fecha === hoy)
  const ventasHoy     = ventas.filter(v => v.fecha === hoy)
  const revenueHoy    = ventasHoy.reduce((s, v) => s + (v.precio_venta || 0), 0)
  const ventasMesAct  = ventas.filter(v => v.mes === mesActualNombre)
  const revenueMesAct = ventasMesAct.reduce((s, v) => s + (v.precio_venta || 0), 0)
  const utilidadBrutaMes = ventasMesAct.reduce((s, v) => s + (v.utilidad_bruta || 0), 0)
  const pipeline = (['Nuevo', 'Seguimiento', 'Ganado', 'Perdido'] as const).map(estado => ({
    estado, count: leads.filter(l => l.estado === estado).length,
    pct: totalLeads ? (leads.filter(l => l.estado === estado).length / totalLeads) * 100 : 0,
  }))
  const ultimas5 = ventas.slice(0, 5)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-dim font-mono animate-pulse">Cargando...</p>
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-mono text-xl font-bold text-muted">Director OS</h2>
        <p className="label mt-0.5">{saludo}, Rubén · Vista ejecutiva</p>
      </div>

      {/* ── SELECTOR DE MES ── */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <p className="label text-sm">Análisis por mes · Ventas vs Gastos</p>
          {mesFiltro && (
            <button onClick={() => setMesFiltro(null)}
              className="text-xs text-dim hover:text-muted border border-border rounded-lg px-3 py-1 cursor-pointer hover:border-cyan/30 transition-colors">
              Cerrar
            </button>
          )}
        </div>

        {/* Pills */}
        <div className="flex gap-2 flex-wrap">
          {mesesDisponibles.map(m => (
            <button key={m} onClick={() => setMesFiltro(mesFiltro === m ? null : m)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                mesFiltro === m
                  ? 'bg-cyan/10 border-cyan/40 text-cyan'
                  : 'bg-transparent border-border text-dim hover:text-muted hover:border-border/80'
              }`}>
              {m}
            </button>
          ))}
        </div>

        {/* Detalle del mes seleccionado */}
        {mesFiltro && (
          <div className="space-y-4 pt-1">
            {/* KPI row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card-2 rounded-xl p-4 border border-lime/20">
                <p className="text-xs text-dim mb-1">Ventas {mesFiltro}</p>
                <p className="font-mono text-xl font-bold text-lime">{fmt(revenueMesSel)}</p>
                <p className="text-xs text-dim mt-1">{ventasMesSel.length} registros</p>
              </div>
              <div className="bg-card-2 rounded-xl p-4 border border-violet/20">
                <p className="text-xs text-dim mb-1">Gastos {mesFiltro}</p>
                <p className="font-mono text-xl font-bold text-violet">{fmt(gastosMesTotal)}</p>
                <p className="text-xs text-dim mt-1">{gastosMesSel.length} registros</p>
              </div>
              <div className={`bg-card-2 rounded-xl p-4 border ${utilidadMesSel >= 0 ? 'border-cyan/20' : 'border-red-400/20'}`}>
                <p className="text-xs text-dim mb-1">Utilidad {mesFiltro}</p>
                <p className={`font-mono text-xl font-bold ${utilidadMesSel >= 0 ? 'text-cyan' : 'text-red-400'}`}>
                  {utilidadMesSel < 0 ? '-' : ''}{fmt(utilidadMesSel)}
                </p>
                <p className="text-xs text-dim mt-1">
                  {revenueMesSel > 0 ? `${((utilidadMesSel / revenueMesSel) * 100).toFixed(1)}% margen` : '—'}
                </p>
              </div>
            </div>

            {/* Tablas ventas y gastos del mes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Ventas del mes */}
              <div>
                <p className="text-xs text-dim font-mono mb-2">Ventas de {mesFiltro}</p>
                {ventasMesSel.length === 0 ? (
                  <p className="text-dim text-xs py-4 text-center">Sin ventas en {mesFiltro}</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {ventasMesSel.map(v => (
                      <div key={v.id} className="flex items-center justify-between bg-card-2 rounded-lg px-3 py-2 border border-border/50">
                        <div className="min-w-0">
                          <p className="text-xs text-muted truncate">{v.producto}</p>
                          <p className="text-xs text-dim">{fmtFecha(v.fecha)} · <span className={CANAL_TEXT[v.canal] || 'text-dim'}>{v.canal}</span></p>
                        </div>
                        <p className="font-mono text-sm text-lime shrink-0 ml-3">{fmt(v.precio_venta)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gastos del mes */}
              <div>
                <p className="text-xs text-dim font-mono mb-2">Gastos de {mesFiltro}</p>
                {gastosMesSel.length === 0 ? (
                  <p className="text-dim text-xs py-4 text-center">Sin gastos en {mesFiltro}</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {gastosMesSel.map(g => (
                      <div key={g.id} className="flex items-center justify-between bg-card-2 rounded-lg px-3 py-2 border border-border/50">
                        <div className="min-w-0">
                          <p className="text-xs text-muted truncate">{g.categoria}</p>
                          <p className="text-xs text-dim"><span className="text-violet">{g.tipo}</span></p>
                        </div>
                        <p className="font-mono text-sm text-violet shrink-0 ml-3">{fmt(g.monto)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!mesFiltro && (
          <p className="text-xs text-dim text-center py-2">Tocá un mes para ver el desglose de ventas y gastos</p>
        )}
      </div>

      {/* Morning Briefing */}
      <div className="card border-cyan/20" style={{ boxShadow: '0 0 24px rgba(0,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-dim uppercase tracking-widest font-mono">Morning Briefing</p>
            <p className="font-mono text-sm text-muted mt-0.5">{fmtFecha(hoy)}</p>
          </div>
          <Zap size={20} className="text-cyan" style={{ filter: 'drop-shadow(0 0 6px #00FFFF88)' }} />
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-dim mb-1">Leads hoy</p>
            <p className="font-mono text-3xl font-bold text-cyan">{leadsHoy.length}</p>
            <p className="text-xs text-dim mt-1 truncate">
              {leadsHoy.length > 0 ? (leadsHoy[0].nombre || leadsHoy[0].producto) : 'Sin actividad'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-dim mb-1">Ventas hoy</p>
            <p className="font-mono text-3xl font-bold text-lime">{ventasHoy.length}</p>
            <p className="text-xs text-dim mt-1 truncate">
              {ventasHoy.length > 0 ? ventasHoy[0].producto : 'Sin actividad'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-dim mb-1">Revenue hoy</p>
            <p className="font-mono text-3xl font-bold text-lime">{fmt(revenueHoy)}</p>
            <p className="text-xs text-dim mt-1">
              {revenueMesAct > 0 ? `${fmt(revenueMesAct)} en ${mesActualNombre}` : `Sin ventas en ${mesActualNombre}`}
            </p>
          </div>
        </div>
        
        {/* Alertas de Stock Crítico */}
        {productos.filter(p => p.alerta_critica && (p.stock ?? 0) === 0).length > 0 && (
          <div className="mt-4 p-3 bg-red-400/10 border border-red-400/30 rounded-xl space-y-1.5">
            <p className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              ALERTAS DE STOCK CRÍTICO:
            </p>
            <div className="flex flex-wrap gap-2">
              {productos.filter(p => p.alerta_critica && (p.stock ?? 0) === 0).map(a => (
                <span key={a.id} className="text-xs bg-red-400/20 text-red-400 px-2 py-0.5 rounded-lg border border-red-400/30 font-semibold flex items-center gap-1">
                  <Bell size={10} className="fill-red-400 text-red-400" /> {a.producto} (Agotado)
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-4 text-xs text-dim">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-violet inline-block" />{activos} oportunidades activas</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-lime inline-block" />{ganados} leads ganados</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />{perdidos} leads perdidos</span>
        </div>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GaugeHalf value={conversion} color="lime" label="Conversión" sub="leads ganados / total" />
        <GaugeHalf value={margenProm} color="cyan" label="Margen Bruto" sub="promedio de ventas" />
        <div className="card border-violet/30 glow-violet flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="label text-xs">Revenue Total</p>
            <TrendingUp size={16} className="text-violet" />
          </div>
          <p className="font-mono text-3xl font-bold text-violet mt-2">{fmt(totalRevenue)}</p>
          <p className="text-xs text-dim">acumulado</p>
          <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-3">
            <div><p className="text-xs text-dim">Utilidad bruta</p><p className="font-mono text-sm font-semibold text-muted mt-0.5">{fmt(utilidadBruta)}</p></div>
            <div><p className="text-xs text-dim">{mesActualNombre} · revenue</p><p className="font-mono text-sm font-semibold text-muted mt-0.5">{fmt(revenueMesAct)}</p></div>
            <div><p className="text-xs text-dim">{mesActualNombre} · utilidad</p><p className="font-mono text-sm font-semibold text-lime mt-0.5">{fmt(utilidadBrutaMes)}</p></div>
          </div>
        </div>
      </div>

      {/* Pipeline + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="label">Pipeline Comercial</p>
            <span className="text-xs font-mono text-dim">{totalLeads} leads</span>
          </div>
          <div className="space-y-4">
            {pipeline.map(({ estado, count, pct }) => (
              <div key={estado}>
                <div className="flex justify-between mb-1.5">
                  <span className={`text-xs font-mono font-semibold ${ESTADO_STYLE[estado].text}`}>{estado}</span>
                  <span className="text-xs text-dim font-mono">{count} · {pct.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 bg-card-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${ESTADO_STYLE[estado].bar}`}
                    style={{ width: `${pct}%`, opacity: estado === 'Ganado' ? 1 : 0.7 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <p className="label mb-4">KPIs Operacionales</p>
          {[
            { label: 'Ticket Promedio',          value: fmt(ticketProm),                   color: 'text-cyan'   },
            { label: 'Revenue por Lead Ganado',   value: ganados ? fmt(revenueXLead) : '—', color: 'text-lime'   },
            { label: 'Ventas este mes',           value: `${ventasMesAct.length} ventas`,   color: 'text-muted'  },
            { label: 'Revenue este mes',          value: fmt(revenueMesAct),                color: 'text-violet' },
            { label: 'Leads activos (pipeline)',  value: activos.toString(),                color: 'text-violet' },
            { label: 'Total ventas YTD',          value: `${ventas.length} ventas`,         color: 'text-muted'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center text-sm py-2.5 border-b border-border/40 last:border-0">
              <span className="text-dim">{label}</span>
              <span className={`font-mono font-semibold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Últimas 5 ventas */}
      <div className="card p-0 overflow-x-auto">
        <div className="px-4 pt-4 pb-3 border-b border-border flex items-center justify-between">
          <p className="label text-sm">Últimas 5 Ventas</p>
          <span className="text-xs text-dim font-mono">{ventas.length} total registradas</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Fecha','Producto','Precio','Margen','Canal'].map(h => (
                <th key={h} className="text-left px-4 py-3 label text-xs font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ultimas5.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-dim text-sm">Sin ventas registradas</td></tr>
            ) : ultimas5.map(v => {
              const margenPct   = (v.margen_pct || 0) * 100
              const margenColor = margenPct >= 65 ? 'text-lime' : margenPct >= 55 ? 'text-cyan' : 'text-violet'
              return (
                <tr key={v.id} className="border-b border-border/50 hover:bg-card-2/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-dim text-xs">{fmtFecha(v.fecha)}</td>
                  <td className="px-4 py-3 text-muted">{v.producto}</td>
                  <td className="px-4 py-3 font-mono text-cyan">{fmt(v.precio_venta)}</td>
                  <td className="px-4 py-3"><span className={`font-mono font-semibold text-xs ${margenColor}`}>{margenPct.toFixed(1)}%</span></td>
                  <td className="px-4 py-3"><span className={`text-xs font-mono ${CANAL_TEXT[v.canal] || 'text-dim'}`}>{v.canal || '–'}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
