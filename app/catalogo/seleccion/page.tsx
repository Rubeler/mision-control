'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MessageCircle, Package, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

const STORE_WA = process.env.NEXT_PUBLIC_STORE_WHATSAPP || '5491136464905'

interface Producto {
  id: string
  producto: string
  precio_venta: number
  imagen_url?: string
  categoria?: string
  linea?: string
}

function SeleccionContent() {
  const params  = useSearchParams()
  const idsParam = params.get('ids') || ''

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!idsParam) { setLoading(false); return }
    const ids = idsParam.split(',').filter(Boolean)
    supabase
      .from('productos')
      .select('*')
      .in('id', ids)
      .then(({ data }) => {
        // Mantener el orden original de selección
        const ordered = ids.map(id => data?.find(p => p.id === id)).filter(Boolean) as Producto[]
        setProductos(ordered)
        setLoading(false)
      })
  }, [idsParam])

  const abrirWA = (nombre?: string) => {
    const msg = nombre
      ? encodeURIComponent(`Hola! Me interesa este mueble: *${nombre}*. ¿Me podés dar más info?`)
      : encodeURIComponent('Hola! Quiero consultar sobre estos muebles.')
    window.open(`https://wa.me/${STORE_WA}?text=${msg}`, '_blank')
  }

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', padding: '24px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fff', border: '1px solid #f3f4f6' }}>
            <div style={{ aspectRatio: '1', backgroundColor: '#f3f4f6' }} />
            <div style={{ padding: '16px' }}>
              <div style={{ height: '16px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '12px', backgroundColor: '#f3f4f6', borderRadius: '4px', width: '50%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (productos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
        <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
        <p>No se encontraron los productos</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {productos.map(p => {
          const esMadera = (p.linea || 'madera') === 'madera'
          return (
            <div key={p.id}
              style={{ backgroundColor: esMadera ? '#FDF8F2' : '#fff', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${esMadera ? '#E5D9C8' : '#F3F4F6'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <div style={{ aspectRatio: '1', backgroundColor: esMadera ? '#EDE4D7' : '#F9FAFB', overflow: 'hidden', position: 'relative' }}>
                {p.imagen_url ? (
                  <img src={p.imagen_url} alt={p.producto}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Package size={36} style={{ color: esMadera ? '#C5A882' : '#D1D5DB' }} />
                  </div>
                )}
                <span style={{
                  position: 'absolute', top: '10px', left: '10px',
                  backgroundColor: esMadera ? 'rgba(61,30,10,0.85)' : 'rgba(200,168,122,0.92)',
                  padding: '3px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700,
                  color: esMadera ? '#FBBF24' : '#fff', letterSpacing: '0.05em'
                }}>
                  {esMadera ? 'Madera Maciza' : 'Blanco & Madera'}
                </span>
              </div>
              <div style={{ padding: '14px 16px 16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: esMadera ? '#3D1E0A' : '#1c1917', margin: '0 0 4px', lineHeight: 1.3 }}>{p.producto}</h3>
                <p style={{ fontSize: '19px', fontWeight: 800, color: esMadera ? '#6B3A1F' : '#1c1917', margin: '0 0 14px' }}>
                  ${p.precio_venta?.toLocaleString('es-AR')}
                </p>
                <button onClick={() => abrirWA(p.producto)}
                  style={{ width: '100%', padding: '9px', borderRadius: '10px', backgroundColor: '#25D366', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1fad56')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#25D366')}>
                  <MessageCircle size={14} /> Consultar por WhatsApp
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SeleccionPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/catalogo" style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>Selección especial</p>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917', margin: '2px 0 0' }}>Debuenamadera</h1>
            </div>
          </div>
          <button onClick={() => window.open(`https://wa.me/${STORE_WA}?text=${encodeURIComponent('Hola! Quiero consultar sobre estos muebles.')}`, '_blank')}
            style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '9999px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageCircle size={14} /> Consultá
          </button>
        </div>
      </div>

      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Cargando...</div>}>
        <SeleccionContent />
      </Suspense>

      <footer style={{ textAlign: 'center', padding: '32px 20px', color: '#9ca3af', fontSize: '12px', borderTop: '1px solid #f3f4f6', marginTop: '16px' }}>
        <p>Debuenamadera · Muebles de madera</p>
        <p style={{ marginTop: '4px' }}>Todos los precios en pesos argentinos (ARS)</p>
      </footer>
    </div>
  )
}
