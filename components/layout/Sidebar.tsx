'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, Users, Receipt, Package } from 'lucide-react'

const nav = [
  { href: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/ventas',    label: 'Ventas',     icon: ShoppingCart },
  { href: '/leads',     label: 'Leads CRM',  icon: Users },
  { href: '/gastos',    label: 'Gastos',     icon: Receipt },
  { href: '/productos', label: 'Productos',  icon: Package },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-[#0D0D1A] border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border">
        <p className="font-mono text-xs text-dim uppercase tracking-widest">Debuenamadera</p>
        <h1 className="font-mono text-lg font-bold text-cyan mt-0.5" style={{ textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
          Misión Control
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all duration-150 cursor-pointer
                ${active
                  ? 'bg-card-2 text-cyan border border-cyan/30 shadow-cyan'
                  : 'text-dim hover:text-muted hover:bg-card'
                }`}
            >
              <Icon size={17} className={active ? 'text-cyan' : ''} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-xs text-dim font-mono">v1.0 · Business OS</p>
      </div>
    </aside>
  )
}
