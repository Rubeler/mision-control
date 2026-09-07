// Único lugar que registra lo que el agente dijo (se haya enviado o no) —
// sirve como bitácora completa para revisión humana, en modo sombra o en vivo.
export async function recordShadowReply(supabase, {
  leadId,
  telefono,
  conversationId,
  incomingMessage,
  generatedReply,
  handoverRequested,
  sentAtSource,
  sent,
  negocioId,
}) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (sent) {
    console.log(`📤 [ENVIADO] Respuesta IA para ${telefono}`)
  } else {
    console.log(`🕶️  [SHADOW MODE] Respuesta IA generada para ${telefono} (NO enviada)`)
  }
  console.log(`   Pregunta: "${incomingMessage}"`)
  console.log(`   Respuesta: "${generatedReply}"`)
  if (handoverRequested) console.log('   → Pide TRANSFERIR_A_RUBEN, se pausa la IA para este cliente')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const { error } = await supabase.from('ai_shadow_log').insert({
    lead_id: leadId,
    telefono,
    conversation_id: conversationId,
    incoming_message: incomingMessage,
    generated_reply: generatedReply,
    handover_requested: handoverRequested,
    sent: Boolean(sent),
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    sent_at_source: sentAtSource || null,
    negocio_id: negocioId,
  })
  if (error) console.error('Error guardando ai_shadow_log:', error.message)
}
