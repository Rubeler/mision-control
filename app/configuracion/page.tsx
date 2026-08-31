'use client'

import { useEffect, useState } from 'react'
import { Bot, Moon } from 'lucide-react'

interface AgentSettings {
  liveSendEnabled: boolean
  updatedAt: string | null
}

export default function ConfiguracionPage() {
  // Modo del agente IA de WhatsApp (Zernio): en vivo o modo sombra
  const [agentSettings, setAgentSettings] = useState<AgentSettings | null>(null)
  const [agentLoading, setAgentLoading] = useState(true)
  const [togglingAgent, setTogglingAgent] = useState(false)

  const checkAgentSettings = async () => {
    try {
      const res = await fetch('/api/agent-settings')
      if (res.ok) setAgentSettings(await res.json())
    } finally {
      setAgentLoading(false)
    }
  }

  useEffect(() => {
    checkAgentSettings()
  }, [])

  const handleToggleAgentMode = async () => {
    if (!agentSettings) return
    const goingLive = !agentSettings.liveSendEnabled
    const confirmMsg = goingLive
      ? '¿Confirmás que el agente IA empiece a mandar sus respuestas en vivo a clientes reales de WhatsApp?'
      : '¿Confirmás pasar el agente IA a modo sombra? Va a seguir generando y guardando respuestas en Supabase, pero deja de mandar nada por WhatsApp.'
    if (!window.confirm(confirmMsg)) return

    setTogglingAgent(true)
    try {
      const res = await fetch('/api/agent-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveSendEnabled: goingLive })
      })
      if (res.ok) {
        const data = await res.json()
        setAgentSettings({ liveSendEnabled: data.liveSendEnabled, updatedAt: new Date().toISOString() })
      } else {
        alert('No se pudo cambiar el modo del agente')
      }
    } catch {
      alert('No se pudo contactar el servidor para cambiar el modo del agente')
    } finally {
      setTogglingAgent(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-mono text-xl font-bold text-muted">Configuración</h2>
        <p className="label mt-0.5">Gestión de conexiones, integración de WhatsApp y parámetros del sistema</p>
      </div>

      {/* SECCIÓN AGENTE IA WHATSAPP (ZERNIO) */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-lime/10 border border-lime/30 text-lime">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-mono text-base font-bold text-muted">Agente IA de WhatsApp</h3>
              <p className="text-xs text-dim">Número real de DBM conectado vía Zernio. Controlá acá si contesta en vivo o solo entrena en modo sombra.</p>
            </div>
          </div>

          {agentLoading ? (
            <span className="text-xs text-dim">Cargando...</span>
          ) : agentSettings?.liveSendEnabled ? (
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-lime animate-pulse" />
              En vivo
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold">
              <Moon size={12} />
              Modo sombra
            </span>
          )}
        </div>

        <div className="bg-card-2 border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
          <p className="text-xs text-dim leading-relaxed max-w-xl">
            {agentSettings?.liveSendEnabled
              ? 'El agente responde de verdad por WhatsApp a los clientes que escriben. Podés pasarlo a modo sombra en cualquier momento sin desconectar el número de Zernio.'
              : 'El agente sigue leyendo los mensajes y generando respuestas (podés revisarlas en Supabase, tabla ai_shadow_log), pero no le manda nada al cliente todavía — útil para seguir entrenando/ajustando el prompt sin riesgo.'}
          </p>
          <button
            onClick={handleToggleAgentMode}
            disabled={agentLoading || togglingAgent || !agentSettings}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
              agentSettings?.liveSendEnabled
                ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                : 'bg-lime/10 border border-lime/30 text-lime hover:bg-lime/20'
            }`}
          >
            {togglingAgent ? 'Cambiando...' : agentSettings?.liveSendEnabled ? 'Pasar a modo sombra' : 'Activar envío en vivo'}
          </button>
        </div>
      </div>
    </div>
  )
}
