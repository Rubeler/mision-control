'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, Users, Receipt, Package, Menu, X } from 'lucide-react'
import { useState } from 'react'

const nav = [
  { href: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/ventas',    label: 'Ventas',     icon: ShoppingCart },
  { href: '/leads',     label: 'Leads CRM',  icon: Users },
  { href: '/gastos',    label: 'Gastos',     icon: Receipt },
  { href: '/productos', label: 'Productos',  icon: Package },
]

export default function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  const NavLinks = () => (
    <>
      {nav.map(({ href, label, icon: Icon }) => {
        const active = path === href
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all duration-150 cursor-pointer
              ${active ? 'bg-card-2 text-cyan border border-cyan/30 shadow-cyan' : 'text-dim hover:text-muted hover:bg-card'}`}>
            <Icon size={17} className={active ? 'text-cyan' : ''} />
            {label}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* DESKTOP sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-56 bg-[#0D0D1A] border-r border-border flex-col z-40">
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
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0D0D1A] border-b border-border flex items-center justify-between px-4 z-50">
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
