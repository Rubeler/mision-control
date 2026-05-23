'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { VentasMes } from '@/app/page'

const fmt = (v: number) => `$${(v / 1000).toFixed(0)}k`

export default function VentasChart({ data }: { data: VentasMes[] }) {
  return (
    <div className="card h-72">
      <p className="label mb-4">Ventas vs Gastos — 2026</p>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00FFFF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00FFFF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gGastos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#BB86FC" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#BB86FC" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333366" />
          <XAxis dataKey="mes" tick={{ fill: '#888899', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmt} tick={{ fill: '#888899', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#16213E', border: '1px solid #333366', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`$${v.toLocaleString('es-AR')}`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#888899' }} />
          <Area type="monotone" dataKey="ventas" name="Ventas" stroke="#00FFFF" strokeWidth={2} fill="url(#gVentas)" />
          <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#BB86FC" strokeWidth={2} fill="url(#gGastos)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
