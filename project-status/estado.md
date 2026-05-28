# Misión Control — Estado del Proyecto
**Última actualización:** 28/05/2026

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
- **Auto-reply WhatsApp ✅ — FUNCIONANDO** (resuelto 28/05/2026)

---

## WhatsApp — Solución completa (28/05/2026)

### Token permanente
- Usuario del sistema: `misioncontrol` (Admin) en Business Manager → Debuenamadera Metricas
- ID usuario: 61590263769122
- App asignada: Mision Control-WA — Control total
- WhatsApp asignado: Test WhatsApp Business Account — Control total
- Permisos del token: `whatsapp_business_management` + `whatsapp_business_messaging`
- **Token NO expira** → guardado en Vercel como `WHATSAPP_TOKEN`

### Formato número Argentina — Fix clave
- El webhook de Meta recibe el número como `5491136449059` (E.164 con 9)
- Meta guarda la lista de permitidos como `+54 11 15-3644-9059` (formato local argentino)
- El API call debe usar: `54111536449059` (formato con "15" en lugar del "9")
- Conversión en `app/api/whatsapp/route.ts`: `'54' + waId.slice(3,5) + '15' + waId.slice(5)`
- Storage en Supabase sigue siendo `5491136449059` (con 9)

### Historial errores resueltos:
1. ✅ Token expirado (#190) → token permanente via sistema de usuario Admin
2. ✅ Número no verificado (#131030) → verificado con OTP en Meta API Setup
3. ✅ Bug nombre siempre "Cliente" → usar `waIdRaw` para buscar contacto en `contacts[]`
4. ✅ Formato número Argentina → enviar con "15" (`54111536449059`), no con "9" (`5491136449059`)

### Configuración Meta
- App: Mision Control-WA (ID: 1438898287993139) — modo desarrollo
- Número de prueba: +1 555 668 5409
- Phone ID: 1121915487672651
- WABA ID: 2013427192874818
- Número destinatario verificado: +54 9 11 3644 9059
- Webhook suscripto al campo: `messages`

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
