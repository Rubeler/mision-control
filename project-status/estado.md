# Misión Control — Estado del Proyecto
**Última actualización:** 12/08/2026 — WhatsApp QR Local + Toggle Entregas en Ventas

---

## Deploy / Infraestructura
- Cuenta Vercel: **Edgardrive** (personal, plan Hobby)
- URL producción: https://mision-control-omega.vercel.app
- GitHub: https://github.com/Rubeler/mision-control (público)
- Webhook WhatsApp: https://mision-control-omega.vercel.app/api/whatsapp
- Último commit en producción: `44372fb` — docs: actualizar estado.md

---

## Módulos completados ✅

### Core
- Dashboard — KPIs anuales + selector de mes (filtra todos los KPIs y charts)
- Ventas — CRUD completo + exportación Excel (con descuento automático de stock de catálogo, indicador de stock en modal y toggle de estado de entrega **Entregada/Pendiente**)
- Compras — CRUD histórico de mercadería a proveedores y métricas de inversión
- Gastos — CRUD completo + exportación Excel + alertas de vencimientos de gastos fijos + toggle para marcar gastos como pagados
- Productos — CRUD + margen automático + exportación Excel
- Control de Stock — CRUD de stock en `/stock` + carga automática de muebles base de proveedores + campanas de alerta crítica por producto + estilo de advertencia visual
- Leads CRM — Kanban drag & drop + botón "Muebles" + botón "Catálogo"
- Director OS — métricas ejecutivas + selector de mes Ene-Dic con ventas vs gastos desglosados + sección de alertas críticas de stock + banner de vencimientos de gastos fijos
- Guiones de Venta — calificación 7 preguntas + 3 plantillas seguimiento WhatsApp
- Navbar — fecha en tiempo real
- **Configuración** — pantalla `/configuracion` con QR de WhatsApp en tiempo real, indicador de estado (Conectado/Esperando/Desconectado) y formulario de prueba de envío

### WhatsApp Bot Oficial API ✅ (resuelto 28/05/2026)
- Webhook recibe mensajes y crea leads automáticamente via Meta Cloud API
- Auto-reply funcionando
- Token permanente (no expira)
- Fix número Argentina: con "15"

### WhatsApp QR Local ⚠️ (implementado 12/08/2026 — MODO LOCAL, pendiente deploy productivo)
- Microservicio Node.js independiente en `whatsapp-service/` usando **@whiskeysockets/baileys** (Multi-Device)
- Servidor Express en `localhost:4000` con endpoints REST: `GET /status`, `POST /send`, `POST /logout`
- Genera código QR en Base64 y lo expone al frontend. Se refresca automáticamente al expirar
- Al escanear el QR con WhatsApp del celular, la sesión queda activa y se guardan las credenciales en `auth_info_baileys/`
- Mensajes entrantes de clientes crean **Leads automáticamente** en Supabase (filtra `status@broadcast` y grupos)
- Envío de mensajes salientes via `POST /send` desde cualquier parte del frontend
- **Pantalla `/configuracion`** con QR en pantalla, badge de estado animado y formulario de prueba de envío
- **Botón `Configuración`** agregado al Sidebar (icono Settings)
- **Stack del microservicio:** `node.js v24` + `@whiskeysockets/baileys ^6.7.12` + `express ^4.21.2` + `qrcode ^1.5.4` + `@supabase/supabase-js ^2.48.1` + `dotenv ^16.4.7`

#### ⚠️ Limitación actual (MODO LOCAL)
El microservicio corre en tu computadora y requiere que la PC esté encendida. Para llevarlo a producción 24/7 se necesita desplegarlo en un servidor externo como **Railway**, **Render** o **Fly.io** con soporte para procesos Node.js persistentes (NO Vercel serverless).

#### 🔧 Bugs conocidos/resueltos del microservicio
- **Status broadcasts**: Baileys capturaba estados de WhatsApp (`status@broadcast`) como mensajes → filtrado corregido
- **Leads vacíos**: Mensajes de media sin texto generaban leads vacíos → filtrado por `texto.trim()` corregido
- **Pre-keys faltantes**: Al primer inicio puede aparecer `error in handling message` → solución: borrar `auth_info_baileys/` y volver a escanear QR

### Catálogo Digital ✅ (en producción, no incluido en versión para venta)
- `/catalogo` → Landing selector
- `/catalogo/madera` y `/catalogo/melamina`
- `/catalogo/seleccion?ids=...`
- `/galeria` → 24 slides con botones compartir/descargar

### Seguridad y Login ⚠️ (subido 04/06/2026 - pendiente de verificación)
- Login con Supabase Auth e interceptor por middleware.
- Verificación de rol `'admin'` mediante consulta a base de datos en frontend (`Navbar` y `Sidebar`).
- Subido a GitHub en la rama `master`. En producción (Vercel) el panel de administración no se visualiza tras iniciar sesión, requiere depuración.

---

## Documentos comerciales (project-status/)

| Archivo | Contenido |
|---|---|
| `MISION_CONTROL_OFERTA_COMERCIAL.md` | Qué es la app, módulos, beneficios, FAQ — para mostrar al cliente |
| `Stack y desarrollo para vender.md` | Stack técnico completo + guía de instalación en 2 versiones |
| `STACK_Y_DESARROLLO.md` | Versión original completa (con catálogo) — NO tocar |
| `MEJORAS_CRM_LEADS.md` | Opciones y propuestas de mejoras para ordenar el CRM y seguimientos |
| `estado.md` | Este archivo |

---

## Pendientes del proyecto propio (Debuenamadera)

### 1. Cargar imágenes a productos
- Bucket "Productos" en Supabase listo y vacío
- Upload implementado en /productos → lápiz → "Subir foto"

### 2. Taggear productos melamina
- `/catalogo/melamina` vacío hasta editar productos MYM y cambiar línea

### 3. Video cocinas (HyperFrames)
- MP4 renderizado en `C:\Users\Ruben\Desktop\debuenamadera-cocinas\debuenamadera-cocinas.mp4`
- Problema: overlay de texto no se ve bien sobre las imágenes — hay que corregir antes de subir a IG
- Para renderizar: `$env:HYPERFRAMES_BROWSER = "C:\Users\Ruben\.cache\hyperframes\chrome\chrome-headless-shell\win64-149.0.7827.54\chrome-headless-shell-win64\chrome-headless-shell.exe"`

### 4. NEXT_PUBLIC_STORE_WHATSAPP en Vercel
- El botón "Consultá" del catálogo usa fallback, no el número real

---

## ⏳ PRÓXIMA SESIÓN

### 1. Prueba de instalación en otra PC
El objetivo es hacer una instalación completa desde cero siguiendo los pasos del documento "Stack y desarrollo para vender.md" como si fuera un cliente, para:
- Verificar que los pasos están correctos y completos
- Medir el tiempo real de instalación
- Detectar pasos que falten o confundan
- Tener la app funcionando al 100% en una URL nueva

**Versión a instalar:** Opción A (sin WhatsApp bot) para validar primero la base.

### 2. Revisión de Mejoras en CRM Leads
- Analizar y elegir una opción de diseño detallada en [MEJORAS_CRM_LEADS.md](file:///c:/Users/Ruben/Desktop/mision-control/project-status/MEJORAS_CRM_LEADS.md) para resolver la acumulación de leads y organizar los seguimientos.

---

## 🚫 ERRORES CONOCIDOS / NO REPETIR

- **`Package2`** no existe en lucide-react v0.400.0 → usar `Package`, `Send`, `Upload`, `BookOpen`
- **Bucket Storage** se llama `"Productos"` con P mayúscula → `.from('Productos')`
- **Gastos** no tiene campo `fecha` ni `descripcion` → campos son `mes`, `tipo`, `categoria`, `monto`
- **Hot reload Windows** falla → `Remove-Item -Recurse -Force .next` + `npm run dev`
- **Puerto ocupado** al reiniciar → servidor en 3001, abrir `localhost:3001`
- **Build Vercel falla con TS errors** → `next.config.js` ya tiene `ignoreBuildErrors: true`, NO borrarlo
- **HyperFrames render** → siempre setear `$env:HYPERFRAMES_BROWSER` antes de `npx hyperframes render`
- **⚠️ supabase-admin NO inicializar a nivel de módulo** → El cliente de Supabase con `service_role` DEBE crearse dentro de una función (lazy), no como `export const supabaseAdmin = createClient(...)` al tope del archivo. Vercel falla en build porque las env vars no existen en tiempo de compilación estática. Usar `export function getSupabaseAdmin() { return createClient(...) }` — ya corregido en `lib/supabase-admin.ts` (commit `ba7bc9d`)
- **⚠️ whatsapp-service: NO subir `auth_info_baileys/` a GitHub** → contiene credenciales de sesión activa de WhatsApp. Agregar al `.gitignore`

---

## WhatsApp — Configuración Meta (Debuenamadera)
- App: Mision Control-WA (ID: 1438898287993139) — modo desarrollo
- Número de prueba: +1 555 668 5409
- Phone ID: 1121915487672651 · WABA ID: 2013427192874818
- Número verificado: +54 9 11 3644 9059
- Token: guardado en Vercel como `WHATSAPP_TOKEN` (no expira)

---

## Métricas (dashboard 02/06/2026)
- Total vendido 2026: **$11.841.020** · Ventas: **88 registros**
- Ticket promedio: **$134.557** · Margen: **60.2%** · Utilidad bruta: **$7.184.127**
