# Misión Control — Estado del Proyecto
**Última actualización:** 26/05/2026

---

## Vercel / Deploy
- Cuenta: **Edgardrive** (personal, plan Hobby)
- URL producción: https://mision-control-omega.vercel.app
- GitHub: https://github.com/Rubeler/mision-control (público)
- Webhook WhatsApp: https://mision-control-omega.vercel.app/api/whatsapp

---

## Módulos completados
- Dashboard con charts conectados a Supabase
- Ventas — CRUD completo + exportación Excel
- Gastos — CRUD completo + exportación Excel
- Productos — CRUD completo + exportación Excel
- Leads CRM — Kanban drag & drop conectado a Supabase
- Director OS — métricas ejecutivas (gauges, KPIs)
- Webhook WhatsApp — recibe mensajes, crea leads automáticamente

---

## Pendiente inmediato

### 1. Probar auto-reply WhatsApp
- Fix aplicado en commit `c5505e1`: normalización número Argentina (541130216559 → 5491130216559)
- Para probar: borrar lead "Ruben - Hola Misión posible" en Supabase, luego mandar mensaje nuevo al +1 555 668 5409

### 2. Leads CRM — funciones faltantes
- Ver número de WhatsApp en la tarjeta del lead
- Editar lead (modal)
- Eliminar lead (con confirmación)

---

## WhatsApp — Configuración Meta
- App en modo desarrollo (no publicada)
- Número de prueba: +1 555 668 5409
- Phone ID: 1121915487672651
- Número destinatario de prueba: +54 11 3021-6559
- Webhook suscripto al campo: `messages`

---

## Próximas features planeadas
- WhatsApp avanzado: historial de conversaciones por lead, respuestas manuales desde la app
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
