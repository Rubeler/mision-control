'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CatalogoLanding() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '48px 20px 32px' }}>
        <p style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 8px' }}>
          Catálogos oficiales
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>
          Debuenamadera
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
          Elegí la línea que te interesa
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 20px 48px', maxWidth: '520px', margin: '0 auto', width: '100%' }}>

        {/* Madera maciza */}
        <Link href="/catalogo/madera" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3D1E0A 0%, #6B3A1F 100%)',
            borderRadius: '20px', padding: '32px 28px',
            cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 20px rgba(61,30,10,0.25)',
            position: 'relative', overflow: 'hidden'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(61,30,10,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(61,30,10,0.25)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', borderRadius: '0 20px 0 120px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <p style={{ fontSize: '11px', color: 'rgba(255,220,170,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 8px' }}>
              Línea DBM
            </p>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.1 }}>
              Madera Maciza
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,220,170,0.8)', margin: '0 0 24px', lineHeight: 1.5 }}>
              Muebles de pino macizo · Fabricación estándar y a medida
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FBBF24', fontWeight: 700, fontSize: '13px' }}>
              Ver catálogo <ArrowRight size={15} />
            </div>
          </div>
        </Link>

        {/* Melamina */}
        <Link href="/catalogo/melamina" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #F8F4EF 0%, #EDE8E0 100%)',
            border: '1.5px solid #E5DDD4',
            borderRadius: '20px', padding: '32px 28px',
            cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            position: 'relative', overflow: 'hidden'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', borderRadius: '0 20px 0 120px', backgroundColor: 'rgba(200,168,122,0.15)' }} />
            <p style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 8px' }}>
              Línea MYM
            </p>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1c1917', margin: '0 0 8px', lineHeight: 1.1 }}>
              Blanco & Madera
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px', lineHeight: 1.5 }}>
              Melamina moderna · Diseño nórdico y contemporáneo
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C8A87A', fontWeight: 700, fontSize: '13px' }}>
              Ver catálogo <ArrowRight size={15} />
            </div>
          </div>
        </Link>
      </div>

      <footer style={{ textAlign: 'center', padding: '20px', color: '#d1d5db', fontSize: '12px', marginTop: 'auto' }}>
        Debuenamadera · Av Vergara 2304, Hurlingham · 11 3646 4905
      </footer>
    </div>
  )
}
