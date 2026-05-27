# Misión Control — Estado del Proyecto
**Última actualización:** 27/05/2026

---

## Vercel / Deploy
- Cuenta: **Edgardrive** (personal, plan Hobby)
- URL producción: https://mision-control-omega.vercel.app
- GitHub: https://github.com/Rubeler/mision-control (público)
- Webhook WhatsApp: https://mision-control-omega.vercel.app/api/whatsapp

---

## Módulos completados ✅
- Dashboard con charts conectados a Supabase
- Ventas — CRUD completo + exportación Excel
- Gastos — CRUD completo + exportación Excel
- Productos — CRUD completo + exportación Excel
- Leads CRM — Kanban drag & drop + editar + eliminar + teléfono + notas
- Director OS — métricas ejecutivas (gauges, KPIs, utilidad bruta del mes)
- Navbar — fecha en tiempo real (no más fecha cacheada)
- Webhook WhatsApp — recibe mensajes, crea leads automáticamente

---

## Pendiente inmediato 🔧

### Auto-reply WhatsApp — pendiente de prueba final
- Último fix (commit `adb701e`): separar formato número para storage (`549...`) y envío (`54...`)
- Para probar: borrar lead de prueba en Supabase → mandar mensaje a +1 555 668 5409
- Número verificado en Meta: +54 9 11 3644 9059
- Token vigente (renovado hoy ~18hs)

### Historial de errores resueltos:
1. ✅ Token expirado → renovado
2. ✅ Número no verificado → verificado con OTP
3. ✅ Bug nombre siempre "Cliente" → waIdRaw para buscar contacto
4. 🔧 Formato número: webhook recibe `5491136449059`, Meta espera `541136449059` → fix aplicado, pendiente prueba

---

## Próximas features planeadas
- **Opción B WhatsApp**: conectar número real de negocio (no test)
- **WhatsApp avanzado**: historial de conversaciones por lead, respuestas manuales desde la app
  - Requiere tabla `mensajes_whatsapp` en Supabase:
    ```sql
    create table mensajes_whatsapp (
      id         bigserial primary key,
      lead_id    bigint references leads(id),
      wa_id      text not null,
      tipo       text not null check (tipo in ('entrante', 'saliente')),
      texto      text not null,
      created_at timestamptz default now()
    );
    ```

---

## WhatsApp — Configuración Meta
- App en modo desarrollo (no publicada)
- Número de prueba: +1 555 668 5409
- Phone ID: 1121915487672651
- Número destinatario verificado: +54 9 11 3644 9059
- Webhook suscripto al campo: `messages`
