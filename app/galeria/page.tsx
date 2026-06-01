'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, MessageCircle, Share2, Download } from 'lucide-react'

const STORE_WA = process.env.NEXT_PUBLIC_STORE_WHATSAPP || '5491136464905'

const FONT = `'Georgia', 'Times New Roman', serif`
const SANS = `system-ui, -apple-system, sans-serif`
const BG   = '#F5EFE6'
const DARK = '#2C2415'
const MID  = '#6B5744'
const LINE = '#C8B89A'

// 14 slides Galería Orgánica + 10 slides DBM Bedroom Collection = 24 total
const IMAGE_SLIDES = [
  ...Array.from({ length: 14 }, (_, i) => ({
    src: `/galeria/slide-${String(i + 1).padStart(2, '0')}.png`,
    alt: `Galería Orgánica — Slide ${i + 1}`,
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    src: `/galeria/bedroom-${String(i + 1).padStart(2, '0')}.png`,
    alt: `Colección Dormitorio — Slide ${i + 1}`,
  })),
]

const TOTAL = IMAGE_SLIDES.length // 24

// Slide de cierre con datos reales de Debuenamadera (reemplaza bedroom-10)
const SlideCierre = () => (
  <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#F5F0E8', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
    {/* Marco navy */}
    <div style={{ position: 'absolute', inset: 0, border: '22px solid #1A2744', pointerEvents: 'none' }} />
    {/* Contenido centrado */}
    <div style={{ textAlign: 'center', padding: '0 10%' }}>
      <h2 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 48px)', fontWeight: 400, fontStyle: 'italic', color: '#1A2744', margin: '0 0 4%', lineHeight: 1.2 }}>
        Calidez, orden y diseño atemporal.
      </h2>
      <p style={{ fontFamily: SANS, fontSize: 'clamp(12px, 1.8vw, 20px)', color: '#4A5568', margin: '0 0 8%', lineHeight: 1.6 }}>
        Consultanos para configurar tu espacio<br />con la nobleza del pino natural macizo.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        <p style={{ fontFamily: SANS, fontSize: 'clamp(11px, 1.5vw, 17px)', color: '#1A2744', fontWeight: 600, margin: 0 }}>
          WhatsApp: 11 3644-9059
        </p>
        <p style={{ fontFamily: SANS, fontSize: 'clamp(10px, 1.3vw, 15px)', color: '#4A5568', margin: 0 }}>
          infotiendademuebles@gmail.com
        </p>
      </div>
      <div style={{ marginTop: '8%', paddingTop: '4%', borderTop: '1px solid #C8B89A' }}>
        <p style={{ fontFamily: FONT, fontSize: 'clamp(13px, 1.8vw, 20px)', color: '#1A2744', fontWeight: 600, margin: 0 }}>
          Debuenamadera · Muebles en Madera de Pino
        </p>
        <p style={{ fontFamily: SANS, fontSize: 'clamp(9px, 1.1vw, 13px)', color: '#9CA3AF', margin: '4px 0 0' }}>
          Av Vergara 2304, Hurlingham · Buenos Aires
        </p>
      </div>
    </div>
  </div>
)

export default function GaleriaPage() {
  const [current, setCurrent]   = useState(0)
  const [copiado, setCopiado]   = useState(false)

  const compartirGaleria = () => {
    const url = window.location.origin + '/galeria'
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  const compartirSlide = () => {
    const url = window.location.origin + '/galeria'
    const msg = encodeURIComponent(`Mirá nuestra colección de muebles:\n${url}`)
    window.open(`https://wa.me/${STORE_WA}?text=${msg}`, '_blank')
  }

  const descargarSlide = () => {
    const link = document.createElement('a')
    link.href = IMAGE_SLIDES[current].src
    link.download = `debuenamadera-slide-${current + 1}.png`
    link.click()
  }

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${LINE}` }}>
        <div>
          <p style={{ fontFamily: SANS, fontSize: '10px', color: LINE, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>Colección</p>
          <h1 style={{ fontFamily: FONT, fontSize: '20px', fontWeight: 400, color: DARK, margin: '2px 0 0' }}>Debuenamadera</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Compartir link */}
          <button onClick={compartirGaleria}
            style={{ backgroundColor: copiado ? '#2C2415' : 'transparent', color: copiado ? '#fff' : DARK, border: `1px solid ${LINE}`, borderRadius: '9999px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: SANS, transition: 'all 0.2s' }}>
            <Share2 size={13} /> {copiado ? '¡Link copiado!' : 'Compartir'}
          </button>
          {/* WhatsApp */}
          <button onClick={compartirSlide}
            style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: SANS }}>
            <MessageCircle size={14} /> Consultá
          </button>
        </div>
      </div>

      {/* Slide area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: '960px', position: 'relative' }}>
          {/* Slide */}
          <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 30px rgba(44,36,21,0.12)', backgroundColor: BG }}>
            {current === TOTAL - 1 ? (
              <SlideCierre />
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
          <button onClick={descargarSlide}
            style={{ backgroundColor: 'transparent', color: MID, border: `1px solid ${LINE}`, borderRadius: '9999px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: SANS }}>
            <Download size={12} /> Descargar imagen
          </button>
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
