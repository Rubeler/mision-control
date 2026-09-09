import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, type Content, type GenerativeModel } from '@google/generative-ai'
import { createClient } from '@/lib/supabase-server'
import { toolDeclarations, createAsistenteTools } from '@/lib/asistenteTools'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'Mayo', 'Junio', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MAX_ROUNDS = 3

// Gemini a veces devuelve 429/503 por sobrecarga temporal del lado de Google
// (visto en producción — se resuelve solo al reintentar). 2 reintentos cortos
// evitan mostrarle ese hipo al usuario como si fuera un error real nuestro.
const STATUS_REINTENTABLES = [429, 503]

async function generarConReintento(model: GenerativeModel, contents: Content[], intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      return await model.generateContent({ contents })
    } catch (err) {
      const status = (err as { status?: number })?.status
      const esUltimoIntento = i === intentos - 1
      if (esUltimoIntento || !status || !STATUS_REINTENTABLES.includes(status)) throw err
      await new Promise(r => setTimeout(r, 700 * (i + 1)))
    }
  }
  throw new Error('No se pudo generar la respuesta')
}

function systemPrompt() {
  const hoy = new Date()
  return `Sos el Asistente IA de Misión Control, el sistema de gestión del negocio. Respondés preguntas del dueño/equipo sobre sus propios datos reales: ventas, gastos, leads, productos y stock — usando las herramientas disponibles, nunca inventando números.

Hoy es ${hoy.toLocaleDateString('es-AR')}, mes actual: ${MESES[hoy.getMonth()]}.

Reglas:
- Siempre que la pregunta involucre números del negocio, usá la herramienta correspondiente antes de responder — no asumas ni inventes cifras.
- Si necesitás varios datos para responder (ej. comparar ventas y gastos), llamá a más de una herramienta.
- Formateá montos en pesos argentinos con puntos de miles (ej. $1.234.567), sin decimales.
- Respondé corto y directo, en español, como lo haría un contador/asesor de confianza — sin rodeos ni relleno.
- Si una herramienta devuelve un error o no hay datos, decilo con naturalidad, no lo ocultes.
- No des consejos legales/impositivos formales — para eso derivá a un profesional.`
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Falta el mensaje' }, { status: 400 })
  }

  const contents: Content[] = messages.map((m: { role: string; text: string }) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }))

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    systemInstruction: systemPrompt(),
    tools: [{ functionDeclarations: toolDeclarations }],
  })

  const ejecutarTool = createAsistenteTools(supabase)

  try {
    let round = 0
    while (round < MAX_ROUNDS) {
      const result = await generarConReintento(model, contents)
      const calls = result.response.functionCalls()

      if (!calls || calls.length === 0) {
        return NextResponse.json({ reply: result.response.text() })
      }

      // El turno del modelo pidiendo las funciones va tal cual a la conversación.
      contents.push(result.response.candidates![0].content)

      // La API actual espera las respuestas de función bajo role "user" —
      // el SDK viejo (@google/generative-ai) usa "function" vía ChatSession,
      // que ya no acepta, así que se arma el turno a mano.
      const parts = await Promise.all(calls.map(async (call) => ({
        functionResponse: { name: call.name, response: (await ejecutarTool(call.name, call.args as Record<string, unknown>)) as object },
      })))
      contents.push({ role: 'user', parts })
      round++
    }

    const result = await generarConReintento(model, contents)
    return NextResponse.json({ reply: result.response.text() || 'No pude terminar de procesar eso, ¿podés reformular la pregunta?' })
  } catch (err) {
    console.error('[asistente] error:', err)
    const status = (err as { status?: number })?.status
    const mensaje = status && STATUS_REINTENTABLES.includes(status)
      ? 'Gemini está con mucha demanda en este momento. Probá de nuevo en unos segundos.'
      : 'Hubo un error generando la respuesta. Probá de nuevo.'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
