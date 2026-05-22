'use client'
import { leads } from '@/lib/mock'
import { Plus } from 'lucide-react'

const estados = ['Nuevo', 'Seguimiento', 'Ganado', 'Perdido']

const estadoColor: Record<string, string> = {
  'Nuevo':       'text-cyan   bg-cyan/10   border-cyan/30',
  'Seguimiento': 'text-violet bg-violet/10 border-violet/30',
  'Ganado':      'text-lime   bg-lime/10   border-lime/30',
  'Perdido':     'text-red-400 bg-red-400/10 border-red-400/30',
}

const canalColor: Record<string, string> = {
  'Presencial': 'text-cyan',
  'WhatsApp':   'text-lime',
  'IG':         'text-violet',
}

export default function LeadsPage() {
  const total    = leads.length
  const ganados  = leads.filter(l => l.estado === 'Ganado').length
  const tasa     = total ? ((ganados / total) * 100).toFixed(0) : '0'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-xl font-bold text-muted">Leads CRM</h2>
          <p className="label mt-0.5">
            {total} leads · <span className="text-lime">{ganados} ganados</span> · Conversión <span className="text-cyan font-mono">{tasa}%</span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime/10 border border-lime/30 text-lime text-sm hover:bg-lime/20 transition-colors cursor-pointer">
          <Plus size={15} /> Nuevo lead
        </button>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {estados.map(estado => {
          const items = leads.filter(l => l.estado === estado)
          return (
            <div key={estado} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${estadoColor[estado]}`}>
                  {estado}
                </span>
                <span className="text-dim text-xs font-mono">{items.length}</span>
              </div>
              {items.length === 0 && (
                <p className="text-dim text-xs text-center py-4">Sin leads</p>
              )}
              {items.map((l, i) => (
                <div key={i} className="bg-card-2 border border-border rounded-lg p-3 space-y-1.5 hover:border-cyan/30 transition-colors cursor-pointer">
                  <p className="text-sm text-muted">{l.producto}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${canalColor[l.canal] || 'text-dim'}`}>{l.canal}</span>
                    <span className="text-xs text-dim">{l.fecha}</span>
                  </div>
                  {l.motivo && (
                    <p className="text-xs text-red-400">Perdido: {l.motivo}</p>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
