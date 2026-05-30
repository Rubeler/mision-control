'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, Users, Receipt, Package, Menu, X, Gauge, BookOpen } from 'lucide-react'
import { useState } from 'react'

const nav = [
  { href: '/',          label: 'Dashboard',   icon: LayoutDashboard, accent: false },
  { href: '/ventas',    label: 'Ventas',      icon: ShoppingCart,    accent: false },
  { href: '/leads',     label: 'Leads CRM',   icon: Users,           accent: false },
  { href: '/gastos',    label: 'Gastos',      icon: Receipt,         accent: false },
  { href: '/productos', label: 'Productos',   icon: Package,         accent: false },
  { href: '/director',  label: 'Director OS', icon: Gauge,           accent: true  },
  { href: '/galeria',   label: 'Ver catálogo', icon: BookOpen,        accent: true  },
]

export default function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  const NavLinks = () => (
    <>
      {nav.map(({ href, label, icon: Icon, accent }) => {
        const active = path === href
        return (
          <div key={href}>
            {accent && <div className="border-t border-border my-2 mx-1" />}
            <Link href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all duration-150 cursor-pointer
                ${active
                  ? 'bg-card-2 text-cyan border border-cyan/30 shadow-cyan'
                  : accent
                  ? 'text-violet/60 hover:text-violet hover:bg-violet/10 border border-transparent hover:border-violet/20'
                  : 'text-dim hover:text-muted hover:bg-card'
                }`}>
              <Icon size={17} className={active ? 'text-cyan' : accent ? 'text-violet/60' : ''} />
              {label}
            </Link>
          </div>
        )
      })}
    </>
  )

  return (
    <>
      {/* DESKTOP sidebar */}
      <aside data-admin className="hidden md:flex fixed top-0 left-0 h-screen w-56 bg-[#0D0D1A] border-r border-border flex-col z-40">
        <div className="px-5 py-6 border-b border-border">
          <p className="font-mono text-xs text-dim uppercase tracking-widest">Debuenamadera</p>
          <h1 className="font-mono text-lg font-bold text-cyan mt-0.5" style={{ textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
            Misión Control
          </h1>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavLinks />
        </nav>
        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs text-dim font-mono">v1.0 · Business OS</p>
        </div>
      </aside>

      {/* MOBILE top bar */}
      <div data-admin className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0D0D1A] border-b border-border flex items-center justify-between px-4 z-50">
        <div>
          <p className="font-mono text-xs text-dim">Debuenamadera</p>
          <h1 className="font-mono text-sm font-bold text-cyan" style={{ textShadow: '0 0 8px rgba(0,255,255,0.5)' }}>
            Misión Control
          </h1>
        </div>
        <button onClick={() => setOpen(!open)} className="text-dim hover:text-cyan cursor-pointer p-2">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-[#0D0D1A] border-r border-border flex flex-col pt-16 px-3 space-y-1">
            <NavLinks />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
