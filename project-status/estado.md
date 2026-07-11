# Misión Control — Estado del Proyecto
**Última actualización:** 11/07/2026 — Sesión tarde (Control de Stock + Fix build Vercel)

---

## Deploy / Infraestructura
- Cuenta Vercel: **Edgardrive** (personal, plan Hobby)
- URL producción: https://mision-control-omega.vercel.app
- GitHub: https://github.com/Rubeler/mision-control (público)
- Webhook WhatsApp: https://mision-control-omega.vercel.app/api/whatsapp
- Último commit en producción: `ba7bc9d` — build exitoso ✅

---

## Módulos completados ✅

### Core
- Dashboard — KPIs anuales + selector de mes (filtra todos los KPIs y charts)
- Ventas — CRUD completo + exportación Excel (con descuento automático de stock de catálogo e indicador de stock en modal)
- Gastos — CRUD completo + exportación Excel
- Productos — CRUD + margen automático + exportación Excel
- Control de Stock — CRUD de stock en `/stock` + carga automática de muebles base de proveedores + campanas de alerta crítica por producto + estilo de advertencia visual
- Leads CRM — Kanban drag & drop + botón "Muebles" + botón "Catálogo"
- Director OS — métricas ejecutivas + selector de mes Ene-Dic con ventas vs gastos desglosados + sección de alertas críticas de stock
- Guiones de Venta — calificación 7 preguntas + 3 plantillas seguimiento WhatsApp
- Navbar — fecha en tiempo real

### WhatsApp Bot ✅ (resuelto 28/05/2026)
- Webhook recibe mensajes y crea leads automáticamente
- Auto-reply funcionando
- Token permanente (no expira)
- Fix número Argentina: con "15"

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

## ⏳ PRÓXIMA SESIÓN — Prueba de instalación en otra PC

El objetivo es hacer una instalación completa desde cero siguiendo los pasos del documento "Stack y desarrollo para vender.md" como si fuera un cliente, para:
- Verificar que los pasos están correctos y completos
- Medir el tiempo real de instalación
- Detectar pasos que falten o confundan
- Tener la app funcionando al 100% en una URL nueva

**Versión a instalar:** Opción A (sin WhatsApp bot) para validar primero la base.

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
