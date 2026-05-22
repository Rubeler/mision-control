'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ventasCanal } from '@/lib/mock'

export default function CanalDonut() {
  return (
    <div className="card h-72">
      <p className="label mb-4">Ventas por Canal</p>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={ventasCanal}
            dataKey="valor"
            nameKey="canal"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            strokeWidth={0}
          >
            {ventasCanal.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={0.9} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#16213E', border: '1px solid #333366', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`$${v.toLocaleString('es-AR')}`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#888899' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
