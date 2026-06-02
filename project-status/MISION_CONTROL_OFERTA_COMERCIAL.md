# Misión Control — Business OS para Mueblerías
## Documento de oferta comercial · Versión 1.0 · Junio 2026

---

## ¿Qué es Misión Control?

**Misión Control** es un sistema de gestión completo (Business OS) diseñado específicamente para mueblerías y negocios de fabricación de muebles. Reemplaza las planillas de Excel, los cuadernos y los grupos de WhatsApp desorganizados por una única plataforma web accesible desde cualquier dispositivo.

El dueño del negocio tiene todo en un solo lugar: qué vendió, cuánto ganó, qué gastos tuvo, qué clientes están en proceso y cómo va el negocio mes a mes.

---

## ¿Qué incluye?

### 1. Dashboard — Vista general del negocio

El panel principal muestra en tiempo real el estado financiero del negocio.

**KPIs visibles:**
- Total vendido (año completo)
- Cantidad de ventas registradas
- Ticket promedio por venta
- Margen de ganancia promedio
- Utilidad bruta antes de gastos

**Gráficos incluidos:**
- Ventas vs. Gastos por mes (gráfico de líneas anual)
- Distribución de ventas por canal (Presencial / WhatsApp / Instagram) — gráfico donut
- Top 5 productos más vendidos con su margen

**Selector de mes:** el dueño puede elegir cualquier mes (Enero a Diciembre) y ver todos los datos filtrados para ese período — ideal para comparar meses o revisar resultados históricos.

---

### 2. Ventas — Registro completo

Sistema de registro de cada venta realizada.

**Datos por venta:**
- Fecha
- Producto vendido
- Canal de venta (Presencial / WhatsApp / Instagram)
- Precio de venta
- Costo directo del producto
- Margen calculado automáticamente

**Funciones:**
- Crear, editar y eliminar ventas
- Búsqueda por producto o fecha
- Exportar todas las ventas a Excel con un click

---

### 3. Gastos — Control de costos

Registro de todos los gastos del negocio con clasificación por tipo.

**Datos por gasto:**
- Mes
- Categoría (agua, monotributo, seguro, sueldo, flete, etc.)
- Tipo: Fijo o Variable
- Monto

**Funciones:**
- Crear y eliminar gastos
- Ver totales por tipo (fijos vs. variables)
- Exportar a Excel
- **En Director OS:** ver los gastos desglosados por mes seleccionado, comparados contra las ventas de ese mismo mes

---

### 4. Productos — Catálogo interno con márgenes

Base de datos interna de todos los productos que fabrica o vende el negocio. Esta sección es solo para el dueño — no es pública.

**Datos por producto:**
- Nombre del producto
- Costo directo de fabricación
- Precio de venta al público
- Margen de ganancia (calculado automáticamente)
- Barra visual de rentabilidad

**Funciones:**
- Buscar productos por nombre
- Crear, editar precios y costos
- Ver margen promedio de todo el catálogo
- Exportar a Excel

---

### 5. Leads CRM — Gestión de clientes potenciales

Sistema tipo Kanban para gestionar todos los clientes que consultaron pero todavía no compraron.

**Columnas del tablero:**
- **Nuevo** — consulta recién llegada
- **Seguimiento** — en proceso de negociación
- **Ganado** — venta cerrada
- **Perdido** — no compró (con motivo registrado)

**Datos por lead:**
- Nombre del cliente
- Producto que consultó
- Teléfono (WhatsApp)
- Canal de contacto
- Fecha
- Notas internas

**Funciones:**
- Arrastrar y soltar leads entre columnas (drag & drop)
- Editar y eliminar leads
- Ver tasa de conversión general en tiempo real
- **Botón "Enviar muebles"**: seleccionás productos del catálogo y generás un link de selección que se envía por WhatsApp al número del lead con 1 click
- **Botón "Catálogo"**: envía por WhatsApp el link del catálogo completo al lead

---

### 6. Director OS — Vista ejecutiva

Panel avanzado diseñado para el dueño que quiere una vista rápida del estado del negocio cada mañana.

**Morning Briefing diario:**
- Leads recibidos hoy (con nombre del primero)
- Ventas registradas hoy
- Revenue generado hoy

**Métricas en tiempo real:**
- Porcentaje de conversión de leads (gauge visual)
- Margen bruto promedio (gauge visual)
- Revenue total acumulado
- Utilidad bruta del período

**Análisis por mes (selector Ene-Dic):**
- Al seleccionar un mes, muestra:
  - Total ventas de ese mes vs. total gastos de ese mes
  - Utilidad del mes (ventas − gastos) con porcentaje de margen
  - Lista completa de todas las ventas de ese mes
  - Lista completa de todos los gastos de ese mes

**Pipeline comercial:**
- Barra de distribución de leads por estado
- KPIs operacionales: ticket promedio, revenue por lead ganado, leads activos

**Últimas 5 ventas registradas** con fecha, producto, precio, margen y canal.

---

### 7. Guiones de Venta — Scripts para cerrar ventas

Módulo de scripts de ventas para que el vendedor o el dueño tenga las respuestas exactas para llevar al cliente desde la consulta hasta la compra.

**Tab Calificación (por producto):**
- Cuestionario guiado de 7 preguntas en 4 fases
- Al terminar, el sistema calcula si el lead es:
  - 🔥 **Caliente** (alta prioridad — necesita respuesta inmediata)
  - 🌡️ **Tibio** (seguimiento activo)
  - ❄️ **Frío** (informativo, baja urgencia)
- Genera automáticamente el **mensaje inicial de WhatsApp** personalizado con los datos que respondió el cliente — listo para copiar y enviar

**Tab Seguimiento:**
- 3 plantillas de mensajes de WhatsApp para follow-up (anti-pesados)
  - Paso 1: "El Salvavidas de Medidas" (24-48hs sin respuesta)
  - Paso 2: "El Aporte Visual" (3-4 días sin respuesta)
  - Paso 3: "Cierre de Cupo" (último contacto, genera urgencia)
- Campos personalizables: [Nombre del cliente] y [Mueble consultado]
- Las plantillas se actualizan en tiempo real al escribir
- Botón copiar en cada mensaje
- Reglas de oro visibles: máximo 3 contactos, criterio de archivado

---

### 8. Bot de WhatsApp — Leads automáticos

Integración con la API oficial de WhatsApp Business (Meta). Cuando un cliente escribe al número del negocio:

1. El sistema recibe el mensaje automáticamente
2. Crea un nuevo lead en el CRM con:
   - Nombre del contacto
   - Número de teléfono
   - Texto del mensaje (como "producto" del lead)
   - Canal: WhatsApp
   - Estado: Nuevo
3. Envía una respuesta automática al cliente

**Resultado:** ningún mensaje de WhatsApp se pierde. Cada consulta queda registrada en el CRM sin que el dueño tenga que hacer nada.

---

## Stack tecnológico

| Componente | Tecnología | Detalle |
|---|---|---|
| Framework | **Next.js 14** | App Router, TypeScript, server components |
| UI | **React 18 + Tailwind CSS** | Tema dark cyberpunk personalizable |
| Base de datos | **Supabase** | PostgreSQL gestionado, gratis hasta cierto volumen |
| Gráficos | **Recharts** | Charts de ventas y canal |
| Hosting | **Vercel** | Deploy automático, plan Hobby (gratis) |
| Bot WhatsApp | **Meta API v19.0** | Webhook oficial, token permanente |
| Exportación | **xlsx** | Excel nativo sin dependencias |
| Íconos | **Lucide React** | SVG escalables |
| Lenguaje | **TypeScript 5** | Todo tipado |

**Costo de infraestructura mensual para el comprador: $0** (Supabase free + Vercel Hobby son gratuitos para el volumen de una mueblería mediana).

---

## Base de datos (Supabase)

4 tablas simples:

```
ventas     → fecha, producto, canal, precio_venta, costo, margen_pct, utilidad_bruta, mes
gastos     → mes, tipo, categoria, monto
productos  → producto, costo, precio_venta, margen_pct
leads      → fecha, nombre, producto, canal, estado, telefono, notas, motivo
```

Sin servidor propio, sin mantenimiento, sin backup manual — Supabase lo gestiona todo.

---

## ¿Cómo funciona el proceso de venta y entrega?

### Lo que recibe el comprador

1. **Acceso al repositorio** de código (GitHub privado)
2. **Cuenta en Supabase** configurada con las 4 tablas y datos de ejemplo
3. **Deploy en Vercel** con el dominio `[sunegocio].vercel.app`
4. **Variables de entorno** cargadas (Supabase URL + Key)
5. **Guía de personalización** de 1 página (cambiar nombre, colores, datos)

### Personalización incluida

- Nombre del negocio en sidebar y navbar
- Colores del tema (cambio en 1 archivo: `tailwind.config.ts`)
- Datos iniciales en Supabase (productos del negocio del comprador)

### Tiempo de entrega

- App funcionando: **2-4 horas** desde el pago
- Cargado con datos del comprador (productos, gastos fijos): **1 día adicional**

---

## Beneficios para el comprador

| Problema actual | Lo que resuelve Misión Control |
|---|---|
| "No sé cuánto gané este mes" | Dashboard con utilidad neta = ventas − gastos en tiempo real |
| "Pierdo clientes porque no hago seguimiento" | CRM Kanban con estados + guiones de WhatsApp listos |
| "Los clientes me escriben y se me pasan" | Bot que convierte cada mensaje de WhatsApp en un lead automáticamente |
| "No sé qué producto me deja más ganancia" | Catálogo de productos con margen calculado y barra visual |
| "Quiero comparar este mes con el anterior" | Selector de mes en Dashboard y Director OS |
| "Tengo todo en Excel y se desorganiza" | Base de datos centralizada, accesible desde celular o PC |
| "No sé qué decirle al cliente para cerrar la venta" | Guiones de venta con mensajes listos para copiar |

---

## Lo que NO incluye esta versión

- Catálogo digital público para clientes (página web de productos)
- Galería de presentación (slides)
- Videos de productos
- Login / autenticación (el admin es acceso directo por URL)
- App móvil nativa (funciona en el browser del celular)
- Historial de conversaciones de WhatsApp
- Multi-usuario / roles

---

## Requisitos del comprador

- Una cuenta de Gmail (para Supabase y Vercel — ambas gratuitas)
- Un número de WhatsApp Business (para el bot — opcional)
- Nada más. No necesita servidor, hosting pago, ni conocimientos técnicos para usarla.

---

## Preguntas frecuentes

**¿Funciona desde el celular?**
Sí. Es una web app responsive. El dueño puede registrar una venta, ver el dashboard o revisar leads desde el celular sin instalar nada.

**¿Qué pasa si Supabase o Vercel cobran en el futuro?**
El plan gratuito de Supabase soporta hasta 500MB de datos y 50.000 filas — más que suficiente para años de uso en una mueblería. Vercel Hobby es gratuito para sitios de bajo tráfico. Si en algún momento necesitaran escalar, el costo es mínimo ($10-25/mes).

**¿Se puede agregar más funciones después?**
Sí. Al entregar el código fuente, el comprador puede contratar cualquier desarrollador para agregar funciones. La arquitectura es estándar (Next.js + Supabase) y cualquier desarrollador la entiende.

**¿Los datos son privados?**
Los datos viven en la cuenta de Supabase del comprador. Nadie más tiene acceso. No hay servidor compartido.

**¿Funciona para otro rubro que no sea mueblería?**
Sí. Los campos son genéricos: producto, precio, costo, canal, cliente. Sirve para cualquier negocio que venda productos y quiera trackear ventas, gastos y leads.
