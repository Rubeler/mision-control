'use client'

import { useEffect, useState } from 'react'
import { QrCode, RefreshCw, LogOut, Send, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react'

interface WhatsAppStatus {
  status: 'DISCONNECTED' | 'SCAN_QR' | 'CONNECTED'
  qr?: string | null
  user?: { id: string; name: string } | null
}

export default function ConfiguracionPage() {
  const [waStatus, setWaStatus] = useState<WhatsAppStatus>({ status: 'DISCONNECTED' })
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  // Formulario de prueba de envío
  const [testPhone, setTestPhone] = useState('')
  const [testMsg, setTestMsg] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [sendResult, setSendResult] = useState<{ success?: boolean; error?: string } | null>(null)

  const checkStatus = async () => {
    try {
      const res = await fetch('http://localhost:4000/status')
      if (res.ok) {
        const data = await res.json()
        setWaStatus(data)
      } else {
        setWaStatus({ status: 'DISCONNECTED' })
      }
    } catch {
      setWaStatus({ status: 'DISCONNECTED' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 2500)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    if (!window.confirm('¿Confirmás que querés cerrar la sesión de WhatsApp vinculada?')) return
    setLoggingOut(true)
    try {
      await fetch('http://localhost:4000/logout', { method: 'POST' })
      await checkStatus()
    } catch (err) {
      alert('Error al cerrar sesión: ' + err.message)
    } finally {
      setLoggingOut(false)
    }
  }

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testPhone || !testMsg) return
    setSendingMsg(true)
    setSendResult(null)

    try {
      const res = await fetch('http://localhost:4000/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone, message: testMsg })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSendResult({ success: true })
        setTestMsg('')
      } else {
        setSendResult({ error: data.error || 'No se pudo enviar el mensaje' })
      }
    } catch (err: any) {
      setSendResult({ error: 'El servidor local de WhatsApp no está respondiendo (puerto 4000).' })
    } finally {
      setSendingMsg(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-mono text-xl font-bold text-muted">Configuración</h2>
        <p className="label mt-0.5">Gestión de conexiones, integración de WhatsApp y parámetros del sistema</p>
      </div>

      {/* SECCIÓN WHATSAPP QR */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-lime/10 border border-lime/30 text-lime">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="font-mono text-base font-bold text-muted">WhatsApp QR</h3>
              <p className="text-xs text-dim">Vinculación de cuenta personal o Business mediante código QR</p>
            </div>
          </div>

          <div>
            {waStatus.status === 'CONNECTED' ? (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-lime animate-pulse" />
                Conectado
              </span>
            ) : waStatus.status === 'SCAN_QR' ? (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold">
                <RefreshCw size={12} className="animate-spin" />
                Esperando escaneo...
              </span>
            ) : (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <AlertCircle size={12} />
                Desconectado / Iniciando...
              </span>
            )}
          </div>
        </div>

        {/* CONTENIDO SEGÚN ESTADO */}
        {loading ? (
          <p className="text-dim text-sm py-8 text-center">Cargando estado del servicio...</p>
        ) : waStatus.status === 'SCAN_QR' && waStatus.qr ? (
          <div className="space-y-4">
            <p className="text-sm text-dim">
              Escaneá este código QR con tu celular en <strong className="text-muted">WhatsApp → Dispositivos vinculados → Vincular un dispositivo</strong>. Se refresca automáticamente.
            </p>
            <div className="flex flex-col items-center justify-center p-6 bg-card-2 border border-border rounded-2xl max-w-sm mx-auto space-y-4">
              <img src={waStatus.qr} alt="WhatsApp QR Code" className="w-64 h-64 rounded-xl border border-white/10 shadow-2xl bg-white p-2" />
              <p className="text-xs text-cyan font-mono flex items-center gap-1.5">
                <QrCode size={14} /> Código QR activo
              </p>
            </div>
          </div>
        ) : waStatus.status === 'CONNECTED' ? (
          <div className="bg-card-2 border border-lime/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-lime" />
                <div>
                  <p className="text-sm font-semibold text-muted">Sesión activa en WhatsApp</p>
                  <p className="text-xs text-dim font-mono mt-0.5">
                    Usuario: {waStatus.user?.name || waStatus.user?.id || 'Conectado'}
                  </p>
                </div>
              </div>
              <button onClick={handleLogout} disabled={loggingOut}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50">
                <LogOut size={14} />
                {loggingOut ? 'Cerrando...' : 'Desconectar'}
              </button>
            </div>
            <p className="text-xs text-dim">
              Todos los mensajes entrantes a este WhatsApp crearán automáticamente un Lead en Misión Control y podrás responderles en tiempo real.
            </p>
          </div>
        ) : (
          <div className="bg-card-2 border border-border rounded-2xl p-6 text-center space-y-3 max-w-md mx-auto">
            <AlertCircle size={32} className="text-amber-400 mx-auto opacity-80" />
            <h4 className="font-mono text-sm font-bold text-muted">Servidor local de WhatsApp no detectado</h4>
            <p className="text-xs text-dim leading-relaxed">
              Para vincular el QR, asegurate de tener corriendo el servicio local en la terminal con:
            </p>
            <div className="bg-black/50 border border-border rounded-lg p-2.5 font-mono text-xs text-cyan select-all">
              cd whatsapp-service && npm start
            </div>
          </div>
        )}
      </div>

      {/* FORMULARIO DE PRUEBA DE ENVÍO DE MENSAJES */}
      <div className="card p-6 space-y-4">
        <h3 className="font-mono text-base font-bold text-muted flex items-center gap-2">
          <Send size={18} className="text-cyan" />
          Probar envío de mensaje por WhatsApp
        </h3>
        <p className="text-xs text-dim">
          Envía un mensaje directo a cualquier número para verificar que la vinculación está funcionando correctamente.
        </p>

        <form onSubmit={handleSendTest} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label text-xs mb-1 block">Teléfono (con código de país)</label>
              <input type="text" placeholder="+5491136449059" value={testPhone} onChange={e => setTestPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
            </div>
            <div className="md:col-span-2">
              <label className="label text-xs mb-1 block">Mensaje de prueba</label>
              <input type="text" placeholder="¡Hola! Mensaje de prueba desde Misión Control 🚀" value={testMsg} onChange={e => setTestMsg(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-card-2 border border-border text-sm text-muted focus:outline-none focus:border-cyan/50" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="submit" disabled={sendingMsg || waStatus.status !== 'CONNECTED'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan text-sm font-semibold hover:bg-cyan/20 transition-colors cursor-pointer disabled:opacity-40">
              <Send size={14} />
              {sendingMsg ? 'Enviando...' : 'Enviar mensaje de prueba'}
            </button>

            {sendResult?.success && (
              <span className="text-xs text-lime font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} /> ¡Mensaje enviado con éxito!
              </span>
            )}
            {sendResult?.error && (
              <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <AlertCircle size={14} /> {sendResult.error}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
