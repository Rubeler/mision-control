'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TrendingUp, ShoppingBag, Percent, DollarSign } from 'lucide-react'
import VentasChart from '@/components/dashboard/VentasChart'
import CanalDonut from '@/components/dashboard/CanalDonut'
import TopProductos from '@/components/dashboard/TopProductos'

const MESES_ORDER = ['Ene','Feb','Mar','Abr','Mayo','Junio','Jul','Ago','Sep','Oct','Nov','Dic']
const CANAL_COLORS: Record<string, string> = {
  'Presencial': '#00FFFF',
  'WhatsApp':   '#39FF14',
  'IG':         '#BB86FC',
}

interface KPIs {
  totalVendido: number
  cantVentas: number
  ticketPromedio: number
  margenPromedio: number
  utilidadBruta: number
  ventasPresencial: number
  ventasWhatsapp: number
  ventasIG: number
  sinCanal: number
  gastosFijos: number
  gastosVariables: number
  totalGastos: number
  utilidadNeta: number
  margenNeto: number
}

export interface VentasMes   { mes: string; ventas: number; gastos: number }
export interface VentasCanal { canal: string; valor: number; color: string }
export interface TopProd     { producto: string; ventas: number; margen: number }

const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('es-AR')

export default function Dashboard() {
  const [kpis, setKpis]           = useState<KPIs | null>(null)
  const [chartMeses, setChartMeses]   = useState<VentasMes[]>([])
  const [chartCanal, setChartCanal]   = useState<VentasCanal[]>([])
  const [chartProds, setChartProds]   = useState<TopProd[]>([])

  useEffect(() => {
    const cargar = async () => {
      const [{ data: ventas }, { data: gastos }] = await Promise.all([
        supabase.from('ventas').select('precio_venta, margen_pct, utilidad_bruta, canal, mes, producto'),
        supabase.from('gastos').select('tipo, monto, mes')
      ])

      const v = ventas || []
      const g = gastos || []

      const totalVendido   = v.reduce((s, x) => s + (x.precio_venta || 0), 0)
      const cantVentas     = v.length
      const utilidadBruta  = v.reduce((s, x) => s + (x.utilidad_bruta || 0), 0)
      const margenPromedio = cantVentas ? v.reduce((s, x) => s + (x.margen_pct || 0), 0) / cantVentas : 0
      const gastosFijos    = g.filter(x => x.tipo === 'Fijo').reduce((s, x) => s + x.monto, 0)
      const gastosVariables= g.filter(x => x.tipo === 'Variable').reduce((s, x) => s + x.monto, 0)
      const totalGastos    = gastosFijos + gastosVariables
      const utilidadNeta   = utilidadBruta - totalGastos

      setKpis({
        totalVendido, cantVentas,
        ticketPromedio: cantVentas ? totalVendido / cantVentas : 0,
        margenPromedio, utilidadBruta,
        ventasPresencial: v.filter(x => x.canal === 'Presencial').reduce((s, x) => s + x.precio_venta, 0),
        ventasWhatsapp:   v.filter(x => x.canal === 'WhatsApp').reduce((s, x) => s + x.precio_venta, 0),
        ventasIG:         v.filter(x => x.canal === 'IG').reduce((s, x) => s + x.precio_venta, 0),
        sinCanal:         v.filter(x => !x.canal).reduce((s, x) => s + x.precio_venta, 0),
        gastosFijos, gastosVariables, totalGastos, utilidadNeta,
        margenNeto: totalVendido ? utilidadNeta / totalVendido : 0
      })

      // --- Chart: Ventas vs Gastos por mes ---
      const vMap: Record<string, number> = {}
      const gMap: Record<string, number> = {}
      v.forEach(x => { if (x.mes) vMap[x.mes] = (vMap[x.mes] || 0) + (x.precio_venta || 0) })
      g.forEach(x => { if (x.mes) gMap[x.mes] = (gMap[x.mes] || 0) + (x.monto || 0) })
      const mesesActivos = new Set([...Object.keys(vMap), ...Object.keys(gMap)])
      setChartMeses(MESES_ORDER.filter(m => mesesActivos.has(m)).map(m => ({
        mes: m, ventas: vMap[m] || 0, gastos: gMap[m] || 0
      })))

      // --- Chart: Ventas por canal ---
      const cMap: Record<string, number> = {}
      v.forEach(x => {
        const c = x.canal || 'Sin canal'
        cMap[c] = (cMap[c] || 0) + (x.precio_venta || 0)
      })
      setChartCanal(Object.entries(cMap).filter(([,val]) => val > 0).map(([canal, valor]) => ({
        canal, valor, color: CANAL_COLORS[canal] || '#888899'
      })))

      // --- Chart: Top 5 productos ---
      const pMap: Record<string, { total: number; count: number; margen: number; nombre: string }> = {}
      v.forEach(x => {
        if (!x.producto) return
        const key = x.producto.trim().toLowerCase()
        if (!pMap[key]) pMap[key] = { total: 0, count: 0, margen: 0, nombre: x.producto.trim() }
        pMap[key].total  += x.precio_venta || 0
        pMap[key].count  += 1
        pMap[key].margen += x.margen_pct || 0
      })
      setChartProds(
        Object.values(pMap)
          .map(({ nombre, total, count, margen }) => ({
            producto: nombre, ventas: total,
            margen: count > 0 ? (margen / count) * 100 : 0
          }))
          .sort((a, b) => b.ventas - a.ventas)
          .slice(0, 5)
      )
    }
    cargar()
  }, [])

  if (!kpis) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-dim font-mono animate-pulse">Cargando datos...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-mono text-xl font-bold text-muted">Dashboard</h2>
        <p className="label mt-0.5">Resumen del negocio · 2026</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Vendido',   value: fmt(kpis.totalVendido),                     sub: 'año 2026',           icon: TrendingUp,  color: 'cyan' },
          { label: 'Cant. Ventas',    value: kpis.cantVentas.toString(),                  sub: 'registros',          icon: ShoppingBag, color: 'lime' },
          { label: 'Ticket Promedio', value: fmt(kpis.ticketPromedio),                    sub: 'por venta',          icon: ShoppingBag, color: 'cyan' },
          { label: 'Margen Promedio', value: `${(kpis.margenPromedio*100).toFixed(1)}%`,  sub: 'sobre precio venta', icon: Percent,     color: 'violet' },
          { label: 'Utilidad Bruta',  value: fmt(kpis.utilidadBruta),                     sub: 'antes de gastos',    icon: DollarSign,  color: 'lime' },
        ].map(({ label, value, sub, icon: Icon, color }) => {
          const c = color === 'cyan' ? { text:'text-cyan', border:'border-cyan/30', glow:'glow-cyan', bg:'bg-cyan/10' }
                  : color === 'lime' ? { text:'text-lime', border:'border-lime/30', glow:'glow-lime', bg:'bg-lime/10' }
                  : { text:'text-violet', border:'border-violet/30', glow:'glow-violet', bg:'bg-violet/10' }
          return (
            <div key={label} className={`card ${c.border} ${c.glow}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="label">{label}</span>
                <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <Icon size={18} className={c.text} />
                </div>
              </div>
              <p className={`kpi-value ${c.text}`}>{value}</p>
              <p className="text-xs text-dim mt-1">{sub}</p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><VentasChart data={chartMeses} /></div>
        <CanalDonut data={chartCanal} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductos data={chartProds} />

        {/* KPIs Rentabilidad */}
        <div className="card space-y-3">
          <p className="label">Rentabilidad</p>

          <div className="space-y-2">
            {[
              { label: 'Ventas Presencial', value: fmt(kpis.ventasPresencial), color: 'text-cyan' },
              { label: 'Ventas WhatsApp',   value: fmt(kpis.ventasWhatsapp),   color: 'text-lime' },
              { label: 'Ventas IG',         value: fmt(kpis.ventasIG),         color: 'text-violet' },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-dim">{r.label}</span>
                <span className={`font-mono font-semibold ${r.color}`}>{r.value}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            {[
              { label: 'Gastos fijos',    value: fmt(kpis.gastosFijos),    color: 'text-violet' },
              { label: 'Gastos variables',value: fmt(kpis.gastosVariables), color: 'text-violet' },
              { label: 'Total gastos',    value: fmt(kpis.totalGastos),    color: 'text-violet' },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-dim">{r.label}</span>
                <span className={`font-mono ${r.color}`}>{r.value}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dim">Utilidad Neta</span>
              <span className={`font-mono text-xl font-bold ${kpis.utilidadNeta >= 0 ? 'text-lime' : 'text-red-400'}`}>
                {kpis.utilidadNeta < 0 ? '-' : ''}{fmt(kpis.utilidadNeta)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-dim">Margen neto</span>
              <span className={`font-mono text-sm font-semibold ${kpis.margenNeto >= 0 ? 'text-lime' : 'text-red-400'}`}>
                {(kpis.margenNeto * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
