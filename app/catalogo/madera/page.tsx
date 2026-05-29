'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageCircle, Package, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const STORE_WA = process.env.NEXT_PUBLIC_STORE_WHATSAPP || '5491136464905'

interface Producto {
  id: string
  producto: string
  precio_venta: number
  imagen_url?: string
  categoria?: string
  linea?: string
}

export default function CatalogoMadera() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading]     = useState(true)
  const [cat, setCat]             = useState('Todos')

  useEffect(() => {
    supabase
      .from('productos')
      .select('*')
      .order('producto')
      .then(({ data }) => {
        const filtrados = (data || []).filter(p => !p.linea || p.linea === 'madera')
        setProductos(filtrados.length > 0 ? filtrados : (data || []))
        setLoading(false)
      })
  }, [])

  const categorias = ['Todos', ...Array.from(new Set(productos.map(p => p.categoria || 'General'))).sort()]
  const filtered   = cat === 'Todos' ? productos : productos.filter(p => (p.categoria || 'General') === cat)

  const abrirWA = (nombre?: string) => {
    const msg = nombre
      ? encodeURIComponent(`Hola! Me interesa el mueble: *${nombre}* (línea madera maciza). ¿Me podés dar más info y precio?`)
      : encodeURIComponent('Hola! Quiero consultar sobre los muebles de madera maciza.')
    window.open(`https://wa.me/${STORE_WA}?text=${msg}`, '_blank')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F4EE', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#3D1E0A', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/catalogo" style={{ color: 'rgba(255,220,170,0.6)', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,220,170,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>
                DBM · Madera de Pino
              </p>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '2px 0 0' }}>
                Madera Maciza
              </h1>
            </div>
          </div>
          <button onClick={() => abrirWA()}
            style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '9999px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageCircle size={14} /> Consultá
          </button>
        </div>
      </div>

      {/* Filtros */}
      {!loading && categorias.length > 2 && (
        <div style={{ backgroundColor: '#F0E8DC', borderBottom: '1px solid #DDD0BB' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '6px', paddingTop: '10px', paddingBottom: '10px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {categorias.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{
                  padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', cursor: 'pointer',
                  fontWeight: cat === c ? 700 : 400,
                  border: `1.5px solid ${cat === c ? '#3D1E0A' : '#C5B09A'}`,
                  backgroundColor: cat === c ? '#3D1E0A' : 'transparent',
                  color: cat === c ? '#FBBF24' : '#7C5C3E',
                  flexShrink: 0, transition: 'all 0.15s',
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#EDE4D7', border: '1px solid #DDD0BB' }}>
                <div style={{ aspectRatio: '1', backgroundColor: '#E5D9C8' }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ height: '16px', backgroundColor: '#E5D9C8', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ height: '12px', backgroundColor: '#E5D9C8', borderRadius: '4px', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9B7A5A' }}>
            <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px' }}>No hay productos en esta categoría</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {filtered.map(p => (
              <div key={p.id}
                style={{ backgroundColor: '#FDF8F2', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5D9C8', boxShadow: '0 2px 8px rgba(61,30,10,0.08)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(61,30,10,0.16)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(61,30,10,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                {/* Imagen */}
                <div style={{ aspectRatio: '1', backgroundColor: '#EDE4D7', overflow: 'hidden', position: 'relative' }}>
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.producto}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Package size={36} style={{ color: '#C5A882' }} />
                      <span style={{ fontSize: '11px', color: '#B5946A' }}>Sin imagen</span>
                    </div>
                  )}
                  {p.categoria && p.categoria !== 'General' && (
                    <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(61,30,10,0.85)', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, color: '#FBBF24' }}>
                      {p.categoria}
                    </span>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: '14px 16px 16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#3D1E0A', margin: '0 0 4px', lineHeight: 1.3 }}>{p.producto}</h3>
                  <p style={{ fontSize: '19px', fontWeight: 800, color: '#6B3A1F', margin: '0 0 14px' }}>
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
            ))}
          </div>
        )}
      </div>

      <footer style={{ textAlign: 'center', padding: '32px 20px', color: '#B5946A', fontSize: '12px', borderTop: '1px solid #E5D9C8', marginTop: '16px' }}>
        <p>DBM · Muebles en Madera de Pino · Fabricación estándar y a medida</p>
        <p style={{ marginTop: '4px' }}>Todos los precios en pesos argentinos (ARS)</p>
      </footer>
    </div>
  )
}
