import { topProductos } from '@/lib/mock'

export default function TopProductos() {
  const max = Math.max(...topProductos.map(p => p.ventas))
  return (
    <div className="card">
      <p className="label mb-4">Top 5 Productos</p>
      <div className="space-y-3">
        {topProductos.map((p, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted truncate max-w-[60%]">{p.producto}</span>
              <span className="font-mono text-cyan">${p.ventas.toLocaleString('es-AR')}</span>
            </div>
            <div className="h-1.5 bg-card-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-lime"
                style={{ width: `${(p.ventas / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
