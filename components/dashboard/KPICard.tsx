import { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  color: 'cyan' | 'lime' | 'violet'
  trend?: 'up' | 'down'
}

const colorMap = {
  cyan:   { text: 'text-cyan',   border: 'border-cyan/30',   glow: 'glow-cyan',   bg: 'bg-cyan/10' },
  lime:   { text: 'text-lime',   border: 'border-lime/30',   glow: 'glow-lime',   bg: 'bg-lime/10' },
  violet: { text: 'text-violet', border: 'border-violet/30', glow: 'glow-violet', bg: 'bg-violet/10' },
}

export default function KPICard({ label, value, sub, icon: Icon, color, trend }: Props) {
  const c = colorMap[color]
  return (
    <div className={`card ${c.border} ${c.glow} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon size={18} className={c.text} />
        </div>
      </div>
      <div>
        <p className={`kpi-value ${c.text}`}>{value}</p>
        {sub && (
          <p className={`text-xs mt-1 ${trend === 'up' ? 'text-lime' : trend === 'down' ? 'text-red-400' : 'text-dim'}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}
