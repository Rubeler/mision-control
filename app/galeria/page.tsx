'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'

const STORE_WA = process.env.NEXT_PUBLIC_STORE_WHATSAPP || '5491136464905'

const FONT = `'Georgia', 'Times New Roman', serif`
const SANS = `system-ui, -apple-system, sans-serif`
const BG   = '#F5EFE6'
const DARK = '#2C2415'
const MID  = '#6B5744'
const LINE = '#C8B89A'

// Slides 1-14 son imágenes del PPTX
const IMAGE_SLIDES = Array.from({ length: 14 }, (_, i) => ({
  type: 'image' as const,
  src: `/galeria/slide-${String(i + 1).padStart(2, '0')}.png`,
  alt: `Slide ${i + 1}`,
}))

// Slide 15 — Roperos (HTML, estilo idéntico al PPTX)
const RoperoSlide = () => (
  <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: BG, padding: '5% 6%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
    {/* Título */}
    <div style={{ borderBottom: `1.5px solid ${LINE}`, paddingBottom: '2%', marginBottom: '4%' }}>
      <h2 style={{ fontFamily: FONT, fontSize: 'clamp(18px, 3.5vw, 38px)', fontWeight: 400, color: DARK, margin: 0, letterSpacing: '-0.01em' }}>
        Dormitorio: Roperos
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 'clamp(10px, 1.4vw, 16px)', color: MID, margin: '0.5% 0 0', fontWeight: 300 }}>
        Pino macizo · Fabricación estándar y a medida · Pintado o natural
      </p>
    </div>

    {/* 3 columnas */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3%', flex: 1 }}>
      {/* 2 Puertas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4%' }}>
        <div style={{ flex: 1, backgroundColor: '#EDE4D7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(8px, 1vw, 12px)', color: LINE, margin: 0 }}>foto próximamente</p>
        </div>
        <div>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(11px, 1.8vw, 20px)', fontWeight: 600, color: DARK, margin: '0 0 2%' }}>
            2 Puertas
          </p>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(8px, 1.1vw, 13px)', color: MID, margin: '0 0 1%', lineHeight: 1.5 }}>
            Ancho: 0.80m<br />
            Alto: 1.80m | Prof: 0.45m<br />
            Interior: 1 barra + 3 cajones
          </p>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(8px, 1vw, 12px)', color: LINE, margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            COD. ROP-80
          </p>
        </div>
      </div>

      {/* 3 Puertas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4%' }}>
        <div style={{ flex: 1, backgroundColor: '#EDE4D7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(8px, 1vw, 12px)', color: LINE, margin: 0 }}>foto próximamente</p>
        </div>
        <div>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(11px, 1.8vw, 20px)', fontWeight: 600, color: DARK, margin: '0 0 2%' }}>
            3 Puertas
          </p>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(8px, 1.1vw, 13px)', color: MID, margin: '0 0 1%', lineHeight: 1.5 }}>
            Ancho: 1.20m<br />
            Alto: 1.80m | Prof: 0.45m<br />
            Interior: 2 barras + cajones
          </p>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(8px, 1vw, 12px)', color: LINE, margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            COD. ROP-120
          </p>
        </div>
      </div>

      {/* 4 Puertas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4%' }}>
        <div style={{ flex: 1, backgroundColor: '#EDE4D7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(8px, 1vw, 12px)', color: LINE, margin: 0 }}>foto próximamente</p>
        </div>
        <div>
          <p style={{ fontFamily: FONT, fontSize: 'clamp(11px, 1.8vw, 20px)', fontWeight: 600, color: DARK, margin: '0 0 2%' }}>
            4 Puertas
          </p>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(8px, 1.1vw, 13px)', color: MID, margin: '0 0 1%', lineHeight: 1.5 }}>
            Ancho: 1.60m / 2.00m<br />
            Alto: 1.80m | Prof: 0.45m<br />
            Interior: 2 barras + 4 cajones
          </p>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(8px, 1vw, 12px)', color: LINE, margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            COD. ROP-160 / ROP-200
          </p>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div style={{ marginTop: '3%', paddingTop: '2%', borderTop: `1px solid ${LINE}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p style={{ fontFamily: SANS, fontSize: 'clamp(7px, 0.9vw, 11px)', color: LINE, margin: 0 }}>
        Disponibles con alzada · Medidas especiales a pedido
      </p>
      <p style={{ fontFamily: SANS, fontSize: 'clamp(7px, 0.9vw, 11px)', color: LINE, margin: 0 }}>
        @debuenamadera3
      </p>
    </div>
  </div>
)

const TOTAL = IMAGE_SLIDES.length + 1 // 14 imágenes + 1 ropero

export default function GaleriaPage() {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), [])
  const next = useCallback(() => setCurrent(c => Math.min(TOTAL - 1, c + 1)), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  const isRopero = current === TOTAL - 1

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${LINE}` }}>
        <div>
          <p style={{ fontFamily: SANS, fontSize: '10px', color: LINE, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>Colección</p>
          <h1 style={{ fontFamily: FONT, fontSize: '20px', fontWeight: 400, color: DARK, margin: '2px 0 0' }}>Debuenamadera</h1>
        </div>
        <a href={`https://wa.me/${STORE_WA}?text=${encodeURIComponent('Hola! Vi el catálogo y quiero consultar.')}`}
          target="_blank" rel="noopener noreferrer"
          style={{ backgroundColor: '#25D366', color: '#fff', borderRadius: '9999px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageCircle size={14} /> Consultá
        </a>
      </div>

      {/* Slide area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: '960px', position: 'relative' }}>
          {/* Slide */}
          <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 30px rgba(44,36,21,0.12)', backgroundColor: BG }}>
            {isRopero ? (
              <RoperoSlide />
            ) : (
              <img
                src={IMAGE_SLIDES[current].src}
                alt={IMAGE_SLIDES[current].alt}
                style={{ width: '100%', display: 'block' }}
              />
            )}
          </div>

          {/* Nav arrows */}
          <button onClick={prev} disabled={current === 0}
            style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', border: `1px solid ${LINE}`, backgroundColor: BG, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: current === 0 ? LINE : DARK, transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} disabled={current === TOTAL - 1}
            style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', border: `1px solid ${LINE}`, backgroundColor: BG, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: current === TOTAL - 1 ? LINE : DARK, transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dots + counter */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '400px' }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                style={{ width: i === current ? '24px' : '8px', height: '8px', borderRadius: '9999px', border: 'none', backgroundColor: i === current ? DARK : LINE, cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
            ))}
          </div>
          <p style={{ fontFamily: SANS, fontSize: '12px', color: MID, margin: 0 }}>
            {current + 1} / {TOTAL}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${LINE}`, textAlign: 'center' }}>
        <p style={{ fontFamily: SANS, fontSize: '11px', color: LINE, margin: 0 }}>
          Debuenamadera · Av Vergara 2304, Hurlingham · 11 3646 4905 · infotiendademuebles@gmail.com
        </p>
      </div>
    </div>
  )
}
