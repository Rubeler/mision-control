import type { TopProd } from '@/app/page'

export default function TopProductos({ data }: { data: TopProd[] }) {
  const max = Math.max(...data.map(p => p.ventas), 1)
  return (
    <div className="card">
      <p className="label mb-4">Top 5 Productos</p>
      {data.length === 0
        ? <p className="text-dim text-sm text-center py-4">Sin datos</p>
        : (
          <div className="space-y-3">
            {data.map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted truncate max-w-[55%]">{p.producto}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dim font-mono">{p.count} {p.count === 1 ? 'venta' : 'ventas'}</span>
                    <span className="font-mono text-cyan">${p.ventas.toLocaleString('es-AR')}</span>
                  </div>
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
        )
      }
    </div>
  )
}
