'use client'
import { useState } from 'react'
import { Copy, Check, ChevronLeft, ChevronRight, MessageCircle, Flame, Thermometer, Snowflake } from 'lucide-react'

// ── CUESTIONARIO BAJO MESADA ──────────────────────────────────────────────────
const PREGUNTAS = [
  {
    fase: 'Fase 1 — Recepción',
    texto: '¿El cliente busca un bajo mesada con medidas estándar o diseñado a medida?',
    opciones: ['Medidas estándar', 'A medida para su espacio', 'No sabe todavía'],
    key: 'tipo',
  },
  {
    fase: 'Fase 1 — Recepción',
    texto: '¿De qué zona es el cliente? (Clave para calcular flete desde Hurlingham)',
    opciones: ['Hurlingham / Tesei / Ituzaingó', 'GBA Oeste (cerca)', 'GBA Otro / CABA', 'Interior / No sabe'],
    key: 'zona',
  },
  {
    fase: 'Fase 2 — Calificación técnica',
    texto: '¿Tiene las medidas aproximadas del largo que necesita?',
    opciones: ['1.20m', '1.40m', '1.60m', '1.80m / 2.00m', 'Menos de 1.20m (0.40 a 0.80m)', 'No tiene medidas aún'],
    key: 'medida',
  },
  {
    fase: 'Fase 2 — Calificación técnica',
    texto: '¿Qué estilo prefiere para las puertas?',
    opciones: ['Escandinavo/moderno (madera + blanco)', 'Pino natural sin pintar', 'Otro color / No definió'],
    key: 'estilo',
  },
  {
    fase: 'Fase 2 — Calificación técnica',
    texto: '¿Los cajones los prefiere del lado izquierdo, derecho o indistinto?',
    opciones: ['Izquierdo', 'Derecho', 'Indistinto / No sabe'],
    key: 'cajones',
  },
  {
    fase: 'Fase 3 — Intención de compra',
    texto: '¿Es para una cocina que está armando desde cero o para reemplazar uno existente?',
    opciones: ['Desde cero (cocina nueva)', 'Reemplazar uno que ya tiene', 'No definió'],
    key: 'situacion',
  },
  {
    fase: 'Fase 3 — Intención de compra',
    texto: '¿Para cuándo estima que quiere tenerlo instalado?',
    opciones: ['Urgente (menos de 1 semana)', '2 a 3 semanas', '1 mes o más', 'Sin fecha definida'],
    key: 'urgencia',
  },
]

// ── SEGUIMIENTO 3 PASOS ───────────────────────────────────────────────────────
const PASOS_SEGUIMIENTO = [
  {
    paso: 1,
    titulo: 'El Salvavidas de Medidas',
    cuando: '24-48 horas después de enviar el precio, si no respondió',
    color: 'cyan',
    template: `¡Hola [Nombre]! ¿Cómo estás? Te escribía para quedarme tranquilo/a de que no te haya quedado ninguna duda con las medidas del [Mueble] que consultaste. A veces un par de centímetros cambian todo en el ambiente. Si querés, me pasás la foto o la medida de tu espacio y te confirmo si va a quedar cómodo. ¡Avisame y lo miramos! 📐`,
  },
  {
    paso: 2,
    titulo: 'El Aporte Visual',
    cuando: '3-4 días después del Paso 1, si sigue sin responder. Adjuntar foto del catálogo.',
    color: 'violet',
    template: `¡Hola [Nombre]! Te comparto por acá una foto de cómo queda este estilo combinado de madera y blanco ya colocado en la casa de uno de nuestros clientes de la zona. Te lo muestro porque le da un montón de luz y calidez a los ambientes. Si todavía estás armando tu espacio, recordá que podemos coordinar el envío directo acá en Hurlingham / Tesei. ¡Cualquier cosa me avisás! 🪵`,
  },
  {
    paso: 3,
    titulo: 'Cierre de Cupo',
    cuando: '4 días después del Paso 2. Último contacto individual — genera escasez real.',
    color: 'lime',
    template: `¡Hola [Nombre]! Espero que estés muy bien. Te contacto por última vez porque estamos armando la tanda de producción y logística para esta semana del [Mueble]. Quería asegurarme de consultarte antes de cerrar los cupos por si querías reservar el tuyo y congelar el valor. Si decidís dejarlo para más adelante, no hay ningún problema, ¡avisame y liberamos el lugar! Que tengas un lindo día. 😊`,
  },
]

// ── LÓGICA DE CALIFICACIÓN ────────────────────────────────────────────────────
function calcularTemperatura(respuestas: Record<string, string>) {
  let puntaje = 0
  if (respuestas.medida && !['No tiene medidas aún'].includes(respuestas.medida)) puntaje += 3
  if (respuestas.urgencia === 'Urgente (menos de 1 semana)') puntaje += 3
  if (respuestas.urgencia === '2 a 3 semanas') puntaje += 2
  if (respuestas.zona && respuestas.zona.includes('Hurlingham')) puntaje += 2
  if (respuestas.zona && respuestas.zona.includes('GBA Oeste')) puntaje += 1
  if (respuestas.situacion === 'Desde cero (cocina nueva)') puntaje += 1
  if (respuestas.estilo && !respuestas.estilo.includes('No definió')) puntaje += 1
  if (puntaje >= 7) return 'caliente'
  if (puntaje >= 4) return 'tibio'
  return 'frio'
}

function generarMensajeInicial(respuestas: Record<string, string>, nombre: string) {
  const medida = respuestas.medida && !respuestas.medida.includes('No') ? ` de ${respuestas.medida}` : ''
  const estilo = respuestas.estilo?.includes('madera') ? ' en estilo madera y blanco' : respuestas.estilo?.includes('natural') ? ' en pino natural' : ''
  const cajones = respuestas.cajones === 'Indistinto / No sabe' ? '' : ` con cajones del lado ${respuestas.cajones?.toLowerCase()}`
  const flete = respuestas.zona?.includes('Hurlingham') || respuestas.zona?.includes('Oeste')
    ? '\n\nEstás en zona de entrega directa — puedo cotizarte el flete y armado a domicilio también. ¿Lo sumo al presupuesto?'
    : '\n\n¿Querés que te cotice también el flete a tu zona?'

  return `¡Hola${nombre ? ' ' + nombre : ''}! Gracias por consultar por el bajo mesada${medida}${estilo}${cajones}. Ya tengo todo anotado para armarte el presupuesto ideal. Dejame procesar las medidas con nuestro stock y en breve te mando el número exacto.${flete} 🪵`
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function GuionesPage() {
  const [tab, setTab]             = useState<'calificacion' | 'seguimiento'>('calificacion')
  const [paso, setPaso]           = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [terminado, setTerminado] = useState(false)
  const [nombre, setNombre]       = useState('')
  const [mueble, setMueble]       = useState('bajo mesada')
  const [copiado, setCopiado]     = useState<number | null>(null)

  const preguntaActual = PREGUNTAS[paso]
  const temperatura    = calcularTemperatura(respuestas)

  const elegir = (opcion: string) => {
    const nuevas = { ...respuestas, [preguntaActual.key]: opcion }
    setRespuestas(nuevas)
    if (paso < PREGUNTAS.length - 1) {
      setPaso(paso + 1)
    } else {
      setTerminado(true)
    }
  }

  const reiniciar = () => {
    setPaso(0); setRespuestas({}); setTerminado(false); setNombre('')
  }

  const copiar = (texto: string, idx: number) => {
    const personalizado = texto.replace(/\[Nombre\]/g, nombre || '[Nombre]').replace(/\[Mueble\]/g, mueble || '[Mueble]')
    navigator.clipboard.writeText(personalizado)
    setCopiado(idx)
    setTimeout(() => setCopiado(null), 2000)
  }

  const tempConfig = {
    caliente: { icon: Flame,       color: 'text-lime',   bg: 'bg-lime/10',   border: 'border-lime/30',   label: '🔥 Lead CALIENTE — Alta prioridad' },
    tibio:    { icon: Thermometer, color: 'text-cyan',   bg: 'bg-cyan/10',   border: 'border-cyan/30',   label: '🌡️ Lead TIBIO — Seguimiento activo' },
    frio:     { icon: Snowflake,   color: 'text-violet', bg: 'bg-violet/10', border: 'border-violet/30', label: '❄️ Lead FRÍO — Informativo' },
  }[temperatura]

  const colorTab: Record<string, string> = { cyan: 'text-cyan border-cyan/30 bg-cyan/10', violet: 'text-violet border-violet/30 bg-violet/10', lime: 'text-lime border-lime/30 bg-lime/10' }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="font-mono text-xl font-bold text-muted">Guiones de Venta</h2>
        <p className="label mt-0.5">Bajo Mesada · Calificación + Seguimiento WhatsApp</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {(['calificacion', 'seguimiento'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-mono font-semibold border-b-2 transition-colors cursor-pointer -mb-px ${
              tab === t ? 'text-cyan border-cyan' : 'text-dim border-transparent hover:text-muted'
            }`}>
            {t === 'calificacion' ? '🎯 Calificación' : '📩 Seguimiento'}
          </button>
        ))}
      </div>

      {/* ── TAB CALIFICACIÓN ── */}
      {tab === 'calificacion' && (
        <div className="space-y-4">
          {!terminado ? (
            <>
              {/* Progreso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dim font-mono">{preguntaActual.fase}</span>
                  <span className="text-xs text-dim font-mono">Pregunta {paso + 1} / {PREGUNTAS.length}</span>
                </div>
                <div className="h-1.5 bg-card-2 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan rounded-full transition-all duration-300"
                    style={{ width: `${((paso + 1) / PREGUNTAS.length) * 100}%` }} />
                </div>
              </div>

              {/* Pregunta */}
              <div className="card">
                <p className="text-muted font-sans text-base leading-relaxed mb-5">{preguntaActual.texto}</p>
                <div className="space-y-2">
                  {preguntaActual.opciones.map(op => (
                    <button key={op} onClick={() => elegir(op)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-card-2 border border-border text-sm text-muted hover:border-cyan/50 hover:text-cyan hover:bg-cyan/5 transition-all cursor-pointer">
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              {/* Respuestas anteriores (resumen) */}
              {paso > 0 && (
                <div className="card space-y-1">
                  <p className="text-xs text-dim font-mono mb-2">Respuestas registradas:</p>
                  {Object.entries(respuestas).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
                      <span className="text-xs text-dim">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón volver */}
              {paso > 0 && (
                <button onClick={() => setPaso(paso - 1)}
                  className="flex items-center gap-1.5 text-xs text-dim hover:text-muted cursor-pointer transition-colors">
                  <ChevronLeft size={13} /> Pregunta anterior
                </button>
              )}
            </>
          ) : (
            /* ── RESULTADO ── */
            <div className="space-y-4">
              {/* Temperatura */}
              <div className={`card ${tempConfig.bg} border ${tempConfig.border}`}>
                <p className={`font-mono text-lg font-bold ${tempConfig.color} mb-1`}>{tempConfig.label}</p>
                <div className="space-y-1 mt-3">
                  {Object.entries(respuestas).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${tempConfig.color.replace('text-', 'bg-')}`} />
                      <span className="text-sm text-muted">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nombre para personalizar */}
              <div>
                <label className="label text-xs mb-1 block">Nombre del cliente (opcional)</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: María"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>

              {/* Mensaje inicial generado */}
              <div className="card space-y-3">
                <p className="text-xs text-dim font-mono">Mensaje inicial sugerido para WhatsApp:</p>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line bg-card-2 rounded-lg p-3 border border-border">
                  {generarMensajeInicial(respuestas, nombre)}
                </p>
                <button onClick={() => copiar(generarMensajeInicial(respuestas, nombre), 99)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer border ${
                    copiado === 99
                      ? 'bg-lime/10 border-lime/30 text-lime'
                      : 'bg-card-2 border-border text-dim hover:text-cyan hover:border-cyan/30'
                  }`}>
                  {copiado === 99 ? <><Check size={14} /> ¡Copiado!</> : <><Copy size={14} /> Copiar mensaje</>}
                </button>
              </div>

              <button onClick={reiniciar}
                className="flex items-center gap-2 text-xs text-dim hover:text-muted cursor-pointer transition-colors">
                <ChevronLeft size={13} /> Nueva calificación
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB SEGUIMIENTO ── */}
      {tab === 'seguimiento' && (
        <div className="space-y-4">
          <div className="card space-y-3">
            <p className="text-xs text-dim font-mono">Personalizar plantillas:</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs mb-1 block">Nombre del cliente</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: María"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
              <div>
                <label className="label text-xs mb-1 block">Mueble consultado</label>
                <input value={mueble} onChange={e => setMueble(e.target.value)}
                  placeholder="Ej: bajo mesada 1.40m"
                  className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
              </div>
            </div>
          </div>

          <div className="card bg-card-2/50 border-border/50 text-xs text-dim space-y-1">
            <p className="font-mono font-semibold text-muted mb-1">Reglas de oro:</p>
            <p>· Máximo 3 intentos de seguimiento después del precio</p>
            <p>· No insistir manualmente luego del Paso 3</p>
            <p>· Si no responde en 48h del Paso 3 → mover a <span className="text-violet">Lead Frío / Archivado</span></p>
          </div>

          {PASOS_SEGUIMIENTO.map((s, idx) => (
            <div key={s.paso} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${colorTab[s.color]}`}>
                      Paso {s.paso}
                    </span>
                    <span className="text-sm font-semibold text-muted">{s.titulo}</span>
                  </div>
                  <p className="text-xs text-dim">{s.cuando}</p>
                </div>
              </div>

              <div className="bg-card-2 rounded-xl p-4 border border-border text-sm text-muted leading-relaxed whitespace-pre-line">
                {s.template
                  .replace(/\[Nombre\]/g, nombre || '[Nombre]')
                  .replace(/\[Mueble\]/g, mueble || '[Mueble]')}
              </div>

              <button onClick={() => copiar(s.template, idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer border ${
                  copiado === idx
                    ? 'bg-lime/10 border-lime/30 text-lime'
                    : 'bg-card-2 border-border text-dim hover:text-cyan hover:border-cyan/30'
                }`}>
                {copiado === idx ? <><Check size={14} /> ¡Copiado!</> : <><Copy size={14} /> Copiar mensaje</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
