# Misión Control — Planes Comerciales
**Versión:** 1.0 · **Fecha:** 04/06/2026

---

## Modelo de negocio

**Estructura:** 1 pago inicial (instalación + personalización) + cuota mensual de mantenimiento.

---

## Plan Básico
*"Para arrancar a organizar el negocio"*

**Módulos incluidos:**
- ✅ Login con email y contraseña (1 usuario)
- ✅ Dashboard con KPIs anuales
- ✅ Registro de ventas + exportar Excel
- ✅ Registro de gastos + exportar Excel
- ✅ Catálogo de productos con márgenes automáticos
- ✅ Leads CRM básico (Kanban drag & drop)

**No incluye:**
- ❌ Selector de mes en Dashboard
- ❌ Director OS
- ❌ Guiones de venta
- ❌ Integración WhatsApp
- ❌ Bot de WhatsApp

---

## Plan Pro
*"Control total del negocio"*

**Todo el Básico más:**
- ✅ Dashboard con selector de mes (filtra todos los KPIs)
- ✅ Director OS — análisis mes a mes (ventas vs gastos desglosados)
- ✅ Guiones de venta — calificación de leads + 3 plantillas de seguimiento WhatsApp
- ✅ Leads CRM completo — botones "Enviar muebles" y "Catálogo" por WhatsApp
- ✅ Hasta 3 usuarios

**No incluye:**
- ❌ Bot de WhatsApp automático
- ❌ Número propio de WhatsApp integrado

---

## Plan Premium
*"El negocio trabaja solo"*

**Todo el Pro más:**
- ✅ Bot de WhatsApp — convierte cada mensaje entrante en un lead automáticamente
- ✅ Número propio de WhatsApp del negocio integrado
- ✅ Respuesta automática a clientes
- ✅ Usuarios ilimitados

---

## Seguridad — implementación por plan

Todos los planes incluyen **login con email y contraseña** (Supabase Auth).

| Feature | Básico | Pro | Premium |
|---|---|---|---|
| Login email + contraseña | ✅ | ✅ | ✅ |
| Usuarios | 1 | 3 | Ilimitados |
| Protección de rutas | ✅ | ✅ | ✅ |
| Bot WhatsApp | ❌ | ❌ | ✅ |

---

## Modelo de pago recomendado

**Híbrido:**
- **1 pago inicial** → instalación, personalización y configuración
- **Cuota mensual** → hosting, mantenimiento y actualizaciones

---

## Próximos pasos de desarrollo

1. Implementar login con Supabase Auth (email + contraseña)
2. Proteger rutas del admin con middleware Next.js
3. Crear versión Básica sin los módulos Pro/Premium
4. Documentar diferencias técnicas entre planes para el proceso de instalación
