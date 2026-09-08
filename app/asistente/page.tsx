'use client'
import { useEffect, useRef, useState } from 'react'
import { Sparkles, Send, Bot, User } from 'lucide-react'

type Msg = { role: 'user' | 'model'; text: string }

const SUGERENCIAS = [
  '¿Cómo vengo este mes comparado al anterior?',
  '¿Qué gastos fijos tengo por vencer?',
  'Dame el top 5 de productos más vendidos',
  '¿Cómo está el pipeline de leads?',
  '¿Qué productos están agotados?',
]

export default function AsistentePage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const enviar = async (texto?: string) => {
    const contenido = (texto ?? input).trim()
    if (!contenido || loading) return

    const nuevos: Msg[] = [...messages, { role: 'user', text: contenido }]
    setMessages(nuevos)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nuevos }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error desconocido')
      setMessages(prev => [...prev, { role: 'model', text: data.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error consultando al asistente')
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-violet" style={{ filter: 'drop-shadow(0 0 6px #BB86FC88)' }} />
          <h2 className="font-mono text-xl font-bold text-muted">Asistente IA</h2>
        </div>
        <p className="label mt-0.5">Preguntale por tus ventas, gastos, leads y stock reales</p>
      </div>

      <div className="flex-1 overflow-y-auto card space-y-4 mb-3">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-8 gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet/10 border border-violet/30 flex items-center justify-center">
              <Bot size={22} className="text-violet" />
            </div>
            <p className="text-dim text-sm max-w-sm">
              Preguntame lo que quieras sobre tu negocio — reviso los datos reales de Misión Control antes de responder.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGERENCIAS.map(s => (
                <button key={s} onClick={() => enviar(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-dim hover:text-violet hover:border-violet/30 transition-colors cursor-pointer">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'model' && (
              <div className="w-7 h-7 shrink-0 rounded-lg bg-violet/10 border border-violet/30 flex items-center justify-center">
                <Bot size={14} className="text-violet" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
              m.role === 'user'
                ? 'bg-cyan/10 border border-cyan/30 text-muted'
                : 'bg-card-2 border border-border text-muted'
            }`}>
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 shrink-0 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center">
                <User size={14} className="text-cyan" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-violet/10 border border-violet/30 flex items-center justify-center">
              <Bot size={14} className="text-violet" />
            </div>
            <div className="bg-card-2 border border-border rounded-xl px-4 py-2.5">
              <p className="text-dim text-sm font-mono animate-pulse">Revisando tus datos...</p>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2">
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown}
          placeholder="Preguntá algo sobre tu negocio..." rows={1}
          className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-sm text-muted placeholder:text-dim focus:outline-none focus:border-violet/50 resize-none" />
        <button onClick={() => enviar()} disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-violet/10 border border-violet/30 text-violet hover:bg-violet/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
