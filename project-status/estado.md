# Misión Control — Estado del Proyecto
**Última actualización:** 15/08/2026 — WhatsApp QR migrado a Evolution API (Railway): conexión y envío OK, webhook de leads entrantes pendiente + Toggle Entregas en Ventas

---

## Deploy / Infraestructura
- Cuenta Vercel: **Nexia's projects** (team `nexia-dbm`, plan Hobby) — corregido 15/08/2026, la doc vieja decía "Edgardrive" / `mision-control-omega.vercel.app`, que es un deploy viejo/huérfano que ya no recibe pushes. **No usar esa URL.**
- URL producción: https://mision-control.vercel.app
- GitHub: https://github.com/Rubeler/mision-control (público)
- Webhook WhatsApp (bot oficial Meta): https://mision-control.vercel.app/api/whatsapp
- Webhook WhatsApp QR (Evolution API): https://mision-control.vercel.app/api/evolution/webhook
- Último commit en producción: `11449cb` — fix(whatsapp): comparar el token de instancia correcto en el webhook

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

### WhatsApp QR ⚠️ (migrado a Evolution API 15/08/2026 — conexión y envío funcionan, falta el webhook de leads)

#### Intento 1 (12-15/08/2026, abandonado)
Microservicio Node.js propio en `whatsapp-service/` usando `@whiskeysockets/baileys` directo, corriendo en `localhost:4000`. Se arreglaron 3 bugs (columnas de Supabase mal mapeadas, mensajes salientes colgados por falta de `getMessage()`, sesión corrupta por reinicios abruptos) pero la causa de fondo no se pudo resolver: WhatsApp oculta el número real de los clientes detrás de un ID interno ("LID") para cuentas Business, y Baileys crudo no lo resuelve de forma confiable. Confirmado con un CRM competidor (Guelux OS) que el mismo número Business SÍ resuelve el número real cuando el conector es Evolution API. El código de `whatsapp-service/` queda en el repo sin usarse (referencia histórica), ya no se ejecuta.

#### Intento 2 (15/08/2026, en uso)
Se reemplazó el microservicio local por **Evolution API v2.3.7** (self-hosted, open source, más maduro que Baileys crudo), desplegado 24/7 en **Railway** (workspace `prolific-mercy`, proyecto "production", con Postgres + Redis), instancia `debuenamadera` vinculada al número 5491136449059. El sitio (Next.js) ya no depende de ningún proceso local: `/configuracion` llama a rutas propias del servidor (`app/api/evolution/status`, `/send`, `/logout`, `/webhook`, código en `lib/evolution.ts`) que hablan con Evolution API en Railway. Funciona igual en local que en producción.

**✅ Confirmado funcionando en producción (https://mision-control.vercel.app):**
- Conexión del número vía QR, estado en tiempo real en `/configuracion`
- Envío de mensaje de prueba (llegó correctamente al celular)
- Evolution API resuelve bien el número real del cliente aunque WhatsApp lo mande oculto detrás de un LID (queda en `data.key.remoteJidAlt` — confirmado con mensajes reales recibidos)

**❌ NO funciona — creación automática de Leads a partir de mensajes entrantes.** Este es el pendiente para la próxima sesión.

**Diagnóstico completo de hoy (para no repetir pasos):**
1. El webhook de Evolution API (`POST /api/evolution/webhook`) estuvo devolviendo 401 dos veces por errores nuestros, ya corregidos: primero porque no estaba en la lista `PUBLIC_ROUTES` del `middleware.ts` (el login lo bloqueaba) → corregido. Segundo porque comparábamos el campo `apikey` del payload contra la apikey global de administración, cuando Evolution en realidad manda ahí el **hash propio de la instancia** (`925607D1-06AE-4E84-9B3B-DBC9A3145F2E`, visto en los logs de Railway) → corregido, ahora se compara contra `EVOLUTION_INSTANCE_TOKEN` en Vercel.
2. Con esos dos fixes, **probado con curl simulando el payload exacto que manda Evolution (incluida la apikey correcta) → funciona perfecto**, crea el lead con el número real y las columnas correctas de Supabase (`nombre`, `telefono`, `producto`, `canal: 'WhatsApp QR'`, `estado: 'Nuevo'`, `fecha`, `notas`). O sea: el código de la ruta está probado y anda bien.
3. Confirmado en la base de Evolution API (`POST /chat/findMessages/debuenamadera`) que los mensajes reales SÍ llegan y se guardan ahí, con el número real disponible en `remoteJidAlt`.
4. Pero cuando el cliente manda un WhatsApp real, **Evolution API arma el payload del webhook (se ve en los logs de Railway: `destination`, `apikey`, etc.) pero no lo termina entregando** a `https://mision-control.vercel.app/api/evolution/webhook` — no llega ninguna request nueva (ni siquiera un intento fallido) a los logs de Vercel.
5. Se probó agregar `WEBHOOK_GLOBAL_ENABLED=true` a las variables del servicio Evolution API en Railway + redeploy del servicio → no cambió nada.
6. **Hipótesis principal sin confirmar:** restricción de red saliente en el plan trial de Railway (el banner "Connect GitHub or add a payment method to unlock full network access" que vimos al principio) — puede que conectar GitHub no haya sido suficiente para las conexiones salientes de un contenedor ya corriendo, y haga falta cargar una tarjeta (aunque sea sin consumir el crédito gratis) para destrabar el egress completo.

**Próximos pasos sugeridos para la próxima sesión:**
- Probar registrar el webhook apuntando a una URL de prueba pública simple (ej. `webhook.site`) para confirmar si Evolution API logra entregarlo ahí — si tampoco llega, confirma que es un problema de red saliente de Railway, no de Vercel/nuestro código.
- Si se confirma, evaluar agregar un método de pago en Railway (sin necesariamente gastar el crédito gratis) para desbloquear el network access completo, o migrar Evolution API a un plan pago.
- Revisar si Railway tiene una consola/shell para el contenedor y probar un `curl` saliente manual desde adentro del contenedor de Evolution API hacia cualquier URL externa.

**Variables de entorno nuevas:**
- `.env.local` y Vercel (Production/Preview/Development): `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`, `EVOLUTION_INSTANCE_TOKEN`
- Railway (servicio Evolution API): `WEBHOOK_GLOBAL_ENABLED=true` (agregado hoy, sin efecto confirmado todavía)

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
