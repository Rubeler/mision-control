# Misión Control — Estado del Proyecto
**Última actualización:** 23/09/2026 — Implementado y desplegado el **bloqueo estricto de usuarios suspendidos (control de cobro/mensualidad)** + Fix de Admin (soporte `super_admin` en Sidebar y Navbar) + URL de invitación corregida a `mision-control.vercel.app`. Build verificado con 0 errores (29/29 rutas).

## 🟢 Sesión 23/09/2026 — Control de Cobro/Suspensión y Deploy a Producción

1. **🔒 Bloqueo Estricto por Falta de Pago (Suspensión de cuentas):**
   - **Lógica implementada:** Al desactivar a un usuario en `/admin` (toggle activo/inactivo):
     - Se actualiza `profiles.activo = false` y se sincroniza en Supabase Auth Admin con baneo temporal inmediato (`ban_duration: '876000h'`). Al reactivar, se restaura a `'none'`.
     - En `app/login/page.tsx`, se valida el campo `activo` y errores de baneo. Si la cuenta está suspendida, se cierra la sesión y se muestra el mensaje: *"Tu cuenta se encuentra suspendida por falta de pago o mantenimiento. Contactá a administración."*
     - En `Navbar.tsx` y `Sidebar.tsx`, si un usuario que ya tenía la sesión abierta es suspendido por Rubén mientras navega, en su siguiente interacción se cierra la sesión en segundo plano y se lo redirige inmediatamente a `/login?suspended=1`.
     - En `app/admin/page.tsx`, se corrigió la URL del mensaje copiado para enviar por WhatsApp al cliente (se cambió el dominio viejo `mision-control-omega.vercel.app` por el oficial `mision-control.vercel.app`).
   - **Compilación previa:** `npm run build` ejecutado en local (0 errores en las 29 rutas).

2. **✅ Deploy a Producción en Vercel:**
   - **Commit 1 (`6ce3269`):** Fix de permisos para `super_admin` en Sidebar y Navbar, inclusión de `DIAGRAMAS_SISTEMA.md` y `MARKETING_LANZAMIENTO.md` en el repositorio, y `.gitignore` reforzado.
   - **Commit 2 (`f669bd2`):** Sistema de suspensión estricta por falta de pago (`ban_duration` en Supabase Auth, validación en Login con aviso al cliente, y expulsión en tiempo real en Navbar/Sidebar). Desplegado en Vercel con éxito.

---

## 🟢 Sesión 19/09/2026 — Fix Admin local, Diagramas y Lanzamiento de Marketing

1. **✅ Fix de Admin en Frontend (Probado y confirmado en local):**
   - **Causa raíz:** En la migración a multi-tenancy del 07/09/2026, el perfil de `c.tecnozone@gmail.com` pasó a `role = 'super_admin'`. Tanto `Sidebar.tsx` como `Navbar.tsx` verificaban estrictamente `role === 'admin'`, por lo que el botón desapareció visualmente del menú.
   - **Solución aplicada:** Se amplió la validación en `components/layout/Sidebar.tsx` (L35) y `Navbar.tsx` (L31) para admitir ambos roles: `data?.role === 'admin' || data?.role === 'super_admin'`.
   - **Verificación local:** Build local (`npm run build`) completado con 0 errores (las 29 rutas generadas limpias). Servidor dev levantado en `http://localhost:3000`. El usuario probó en su navegador y confirmó con captura que el botón Admin en el Sidebar/Navbar y el panel `/admin` (con los 3 usuarios de DBM) están 100% operativos.
   - **Deploy realizado:** Subido a Vercel el 23/09/2026.

2. **🗺️ Diagramas de Arquitectura y Sistema (`DIAGRAMAS_SISTEMA.md`):**
   - Se redactó y guardó la documentación técnica visual completa con diagramas Mermaid:
     - **Flujo WhatsApp Zernio + Gemini:** Mensaje de cliente → Webhook con firma HMAC → `agentGate.js` → Gemini 3.6-Flash con function calling `consultar_modelos` (con turno en `role: "user"`) → Detección de `[TRANSFERIR_A_RUBEN]` → Pausa automática `leads.ai_paused = true` → Handover a Rubén en la app móvil de WhatsApp Business (Coexistencia).
     - **Arquitectura Multi-Tenancy & RLS:** Aislamiento de datos por `negocio_scope` (`mi_negocio_id()` y `es_super_admin()`) y mapa de los 3 clientes Supabase (Browser SSR cookies, Server, y Admin service-role).
     - **Matriz de Componentes del Sistema:** Estado y scope de cada módulo de Misión Control.

3. **🚀 Paquete de Marketing & Lanzamiento en Redes (`MARKETING_LANZAMIENTO.md`):**
   - Se diseñó el plan para comenzar a comunicar lunes y martes:
     - **Carrusel Instagram (5 slides, formato 4:5, paleta Cyberpunk Navy/Cian/Verde):** Enfocado en el dolor de las mueblerías que pierden ventas por demoras en cotizar por WhatsApp y cómo Misión Control califica 24/7.
     - **Reel / Video Demo (60s):** Demostración en pantalla dividida (celular enviando mensaje → bot calificando medidas y zona → Misión Control creando el Lead automáticamente y actualizando KPIs).
     - **Conexión Directa a Instagram vía Zernio MCP:** Documentado el uso del conector `https://mcp.zernio.com/mcp` en Claude / Antigravity para programar y publicar carruseles y posts directamente en `@nexia.soluciones` / `@debuenamadera`.
     - **Guion de DM en Frío:** Mensaje breve y conversacional para prospectar 15-20 mueblerías por Instagram o WhatsApp.

4. **⏳ Próximos pasos pendientes:**
   - [ ] Probar en vivo el flujo completo del bot de WhatsApp (Zernio + ngrok o migración a Route Handlers en Vercel para no depender de la PC prendida).
   - [ ] Evaluar y ajustar el system prompt de WhatsApp según los productos de catálogo.
   - [ ] Programar / publicar la primera pieza de marketing para el lanzamiento de la semana.
   - [x] git commit + push a Vercel del fix de Admin (completado el 23/09/2026, commit `6ce3269`).

---

## 🗺️ Mapa visual en Miro (10/09/2026)

Arrancó una serie de boards en Miro — un mapa gráfico por proyecto (organización, stack, arquitectura, marketing, prospección, qué falta), con la paleta real de NexIA (navy/teal/dorado + semáforo verde/ámbar/rojo de estado). Misión Control fue el primero.

**Board:** https://miro.com/app/board/uXjVHpfqlfo=/ — "Misión Control — Mapa del Proyecto". Contenido con datos reales de este proyecto (multi-tenancy, stack, RLS, marketing/prospección honestamente marcados como flojos, roadmap de 7 pendientes).

Mismo día se armó el segundo, de CafeteriaOS (otro producto de NexIA): https://miro.com/app/board/uXjVHpeA7fI=/ — con una salvedad importante: el usuario confirma que el sistema real (QR mesa→cocina→caja) **ya está construido y funcionando**, pero no se localizó la carpeta del código (se buscó en el vault, en Boveda_Ruben/Sistemas completo y en el Escritorio, sin resultado) — el board quedó marcado con esa parte "a confirmar" hasta que se aporte la carpeta real, en vez de inventar detalles técnicos.

**Pendiente:** cuando el usuario pase la carpeta real de CafeteriaOS, actualizar ese board con el stack/arquitectura real. Seguir con el resto de los proyectos usando el mismo molde.

## 🔴 Gemini API en plan gratuito — 20 req/día, ya agotado (10/09/2026)

Al intentar probar el bot de WhatsApp, se encontró que `GEMINI_API_KEY` está en el **free tier** de Google AI Studio: límite de **20 requests/día por modelo** (`gemini-3.6-flash`), compartido entre el Asistente IA (web) y el bot de WhatsApp de Zernio — usan la misma key. Ya se agotó entre las pruebas de ayer y hoy (primero apareció como 503 "high demand", después como 429 con el mensaje explícito de cuota: `GenerateRequestsPerDayPerProjectPerModel-FreeTier`, `limit: 20`).

**Por qué importa en serio:** el bot de WhatsApp responde a clientes reales de DBM durante todo el día. Con 20/día, es probable que en algún momento del día dejara de responder — silenciosamente, sin ningún aviso — hasta el reset. El lead se sigue creando igual (no depende de Gemini), pero sin respuesta automática al cliente.

**Decisión del usuario (10/09/2026):** se queda en plan gratuito **hasta vender el primer Misión Control a un cliente pago** — no tiene sentido pagar Gemini todavía sin ingresos del producto. La prueba en vivo del bot de WhatsApp (Zernio + ngrok, confirmado que la arquitectura sigue siendo esa) se pospone para mañana, cuando resetee el cupo diario.

**Pendiente para retomar:**
- [ ] Probar el bot de WhatsApp en vivo (mandar un mensaje real de prueba al número de DBM) una vez reseteado el cupo diario.
- [ ] Decidir si se activa facturación en el proyecto de Google AI Studio/Cloud (plan pago, límites mucho más altos, costo bajo para este volumen) o se consigue una key nueva ya en plan pago — sigue sin resolverse, es una decisión de plata que le corresponde al usuario.
- [ ] Mientras siga en plan gratuito, ser conservador con las pruebas (cada test consume del mismo cupo compartido con el bot real).

**Fix aplicado hoy en `whatsapp-service/lib/geminiAgent.js`:** mismo bug que se encontró y corrigió el 09/09 en el Asistente IA — `ChatSession.sendMessage()` arma la respuesta de una función con `role: "function"`, que la API ya no acepta. Se reescribió `generateAgentReply()` para armar los turnos a mano con `model.generateContent({ contents })` y `role: "user"` explícito en la respuesta de la tool `consultar_modelos`. Verificado que el código corre (se cortó por el límite de cuota, no por este bug — el error de Gemini fue de cuota, no de rol). **Sigue sin confirmarse un tool-call real end-to-end** porque se agotó el cupo antes de completar la prueba — confirmar mañana junto con la prueba en vivo del bot.

---

## Deploy / Infraestructura
- Cuenta Vercel: **Nexia's projects** (team `nexia-dbm`, plan Hobby) — corregido 15/08/2026, la doc vieja decía "Edgardrive" / `mision-control-omega.vercel.app`, que es un deploy viejo/huérfano que ya no recibe pushes. **No usar esa URL.**
- URL producción: https://mision-control.vercel.app
- GitHub: https://github.com/Rubeler/mision-control (público)
- Webhook WhatsApp (bot oficial Meta, en desuso — ver Frente WhatsApp): https://mision-control.vercel.app/api/whatsapp
- Webhook WhatsApp QR (Evolution API, en desuso — ver Frente WhatsApp): https://mision-control.vercel.app/api/evolution/webhook
- **Canal WhatsApp realmente activo hoy:** Zernio, vía `whatsapp-service/index.js` corriendo local en la PC + túnel fijo de ngrok (`undiluted-carton-unbitten.ngrok-free.dev`) — necesita las 2 ventanas de PowerShell abiertas (ver pasos en `../MisionControl.md`).
- Último commit en producción: `f669bd2` — feat(billing): bloqueo estricto de usuarios suspendidos por falta de pago y expulsión en tiempo real (23/09/2026)
- Variable de entorno nueva (Vercel + `.env.local` + `whatsapp-service/.env` heredado): `NEGOCIO_ID_DBM=1bb1dfbe-f746-466e-8f6f-4a96bb420758` — UUID fijo del negocio "De Buena Madera" en la tabla nueva `negocios`, usado por el código server-side que inserta sin sesión de usuario (ver sección Multi-tenancy).
- Variables de entorno agregadas a Vercel (08/09/2026): `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-3.6-flash` — las usa el nuevo Asistente IA (ver sección dedicada).

---

## 🤖 Asistente IA — primera feature de IA a nivel "sistema operativo" (08/09/2026)

Arrancó la línea de "qué le puede aportar un agente de IA a una PyME que usa Misión Control" (brainstorm de 6 ideas: chat conversacional sobre los datos, briefing proactivo por WhatsApp, reposición de stock predictiva, priorización de leads, reporte periódico automático, optimización de precio/margen). Se decidió arrancar por la de mayor impacto con menor infraestructura nueva: el chat conversacional.

**Qué se construyó:**
- Página `/asistente` (nueva, con link en el sidebar) — chat simple con sugerencias de preguntas, estilo visual consistente con el resto de la app.
- `app/api/asistente/route.ts` — usa Gemini (`gemini-3.6-flash`, mismo modelo que el agente de WhatsApp) con function-calling sobre 5 herramientas de solo lectura: `resumen_ventas`, `resumen_gastos`, `top_productos`, `resumen_leads`, `resumen_stock` (`lib/asistenteTools.ts`).
- **Seguridad heredada sin trabajo extra:** las consultas usan `lib/supabase-server.ts` (cliente de Supabase por cookies, con la sesión real del usuario logueado) — así las políticas RLS `negocio_scope` del 07/09 se aplican solas. Un usuario normal de un negocio futuro solo va a poder preguntarle por sus propios datos; el `super_admin` ve todos los negocios, igual que en Director OS.

**🐛 Bug encontrado y corregido (mismo día):** el SDK `@google/generative-ai` arma el turno de respuesta de una función usando `role: "function"` a través de `ChatSession.sendMessage()` — la API de Gemini ya no acepta ese rol (solo admite `user`/`model` en las versiones actuales). Se probó primero bajar la versión del SDK a la misma que usa `whatsapp-service` (`0.21.0`, la "probada") pensando que era un tema de versión — dio el mismo error, confirmando que el bug es estructural del SDK viejo, no de la versión puntual. Se resolvió armando el turno a mano con `model.generateContent({ contents })` en vez de `ChatSession`, agregando el `functionResponse` con `role: "user"` explícito. **Nota para el WhatsApp bot:** este mismo patrón (`ChatSession.sendMessage` con `functionResponse`) lo usa `whatsapp-service/lib/geminiAgent.js` para la tool `consultar_modelos` — según `MisionControl.md` esa tool nunca se confirmó funcionando end-to-end en producción real (quedó pendiente por una sobrecarga de Gemini el día que se probó). Es probable que tenga el mismo bug latente y nunca se haya notado. **Pendiente para la próxima sesión: aplicarle el mismo fix a `geminiAgent.js`.**

**Confirmado funcionando en producción** (08/09/2026): el usuario probó preguntas reales en `mision-control.vercel.app/asistente` y las respuestas fueron correctas y coherentes con los datos reales.

### 🐛 Dos bugs más encontrados y corregidos al día siguiente (09/09/2026)

Al abrir el asistente en producción a la mañana, la pregunta "¿Cómo vengo este mes comparado al anterior?" tiró error. Se investigó reproduciendo la llamada real a Gemini con un script aparte (sin necesitar login), lo que permitió ver la causa exacta sin depender de logs de Vercel:

1. **503 "high demand" transitorio de Google** — no es un bug nuestro, es sobrecarga del lado de Gemini (mismo patrón ya visto el 28/08). Por eso reintentar a mano funcionaba. **Fix:** `generarConReintento()` en `app/api/asistente/route.ts` — hasta 3 intentos con backoff corto ante 429/503, antes de mostrarle el error al usuario.
2. **Bug más serio, encontrado de casualidad mientras se reproducía el 503:** para responder "el mes anterior", el modelo llamó a las tools con `mes: "Aug"` (inglés) en vez de `"Ago"` — el filtro no matcheaba ninguna fila de la base y devolvía **$0 sin ningún error visible**. Es decir, sin este fix el asistente podía haber dicho con total confianza "el mes pasado vendiste $0" siendo mentira, y nadie se hubiera dado cuenta. **Fix:** `normalizarMes()` en `lib/asistenteTools.ts` — mapea variantes en inglés/español/mayúsculas al código exacto que usa la base, y si el mes no matchea ninguno conocido devuelve un error explícito en vez de filtrar mal en silencio.

**Lección:** cuando un agente de IA arma parámetros para consultar datos reales (no solo para responder texto libre), un parámetro mal formado no tira error — devuelve un resultado vacío/cero que parece válido. Cualquier tool nueva que filtre por un valor tipo-enum (mes, categoría, estado, canal) necesita normalizar/validar esos valores en el código, no confiar en que el modelo siempre mande el string exacto pese a la instrucción en el prompt.

---

## 🏗️ Multi-tenancy (negocios + RLS) — activado en producción (07/09/2026)

Se detectaron huecos de seguridad reales usando el conector de Supabase: no había tabla de tenants, ni `negocio_id` en las tablas de datos, ni RLS activa (`using (true)` para cualquiera) — cualquier usuario logueado podía leer/tocar los datos de cualquier otro negocio. Se resolvió antes de vender Misión Control a un segundo cliente.

**Qué se agregó (SQL en `mision-control/supabase/migrations/2026-09-07_multitenancy.sql`, corrido completo en Supabase):**
- Tabla `negocios` (tenants) — un solo negocio hoy: "De Buena Madera", `id = 1bb1dfbe-f746-466e-8f6f-4a96bb420758`.
- `negocio_id` en `profiles`, `ventas`, `leads`, `gastos`, `productos`, `compras`, `agent_settings` y `ai_shadow_log` — todo backfillado a DBM, `NOT NULL`, con índice.
- Funciones `mi_negocio_id()` y `es_super_admin()` (SQL, `SECURITY DEFINER`) — evitan repetir el subquery y la recursión de RLS.
- `negocio_id` con `DEFAULT mi_negocio_id()` en las 6 tablas de datos — así los inserts hechos desde el browser por un usuario logueado no necesitan tocar código, se autocompletan solos.
- `c.tecnozone@gmail.com` → `role = super_admin`, ve todos los negocios (Director OS, Admin) vía `es_super_admin()` en las políticas.
- RLS activada + política estándar `negocio_scope` (`FOR ALL TO authenticated USING (negocio_id = mi_negocio_id() OR es_super_admin())`) en las 7 tablas, reemplazando las políticas viejas abiertas.
- Política extra `catalogo_publico` (`FOR SELECT TO anon USING (true)`) en `productos` — necesaria porque `/catalogo/madera`, `/catalogo/melamina` y `/catalogo/seleccion` las abren clientes sin sesión, vía link de WhatsApp.

**Código actualizado (commit `4484239`):**
- `app/admin/page.tsx` + `app/api/admin/users/route.ts` — el alta de usuarios ahora busca/crea el negocio real en la tabla `negocios` en vez de guardar el nombre como texto libre.
- `whatsapp-service/index.js` + `whatsapp-service/lib/shadowLog.js` (el bot de Zernio, canal real de producción) y las rutas legacy `app/api/whatsapp/route.ts` / `app/api/evolution/webhook/route.ts` — pasan `negocio_id: NEGOCIO_ID_DBM` explícito en cada insert, porque corren sin sesión de usuario (`auth.uid()` = NULL ahí, el `DEFAULT` de la columna no les sirve). Las 2 rutas legacy además se pasaron de cliente anon a `getSupabaseAdmin()` (service-role), porque con RLS activa un cliente anon sin sesión hubiera quedado bloqueado directamente.
- `app/api/agent-settings/route.ts` — sin cambios, sigue filtrando por `id = 1` (la fila de DBM). Cuando se sume un segundo negocio con agente propio va a necesitar recibir `negocio_id` como parámetro.

**🔴 Incidente el mismo día — "se perdieron todos los datos del año" (resuelto, ver 🚫 Errores conocidos):** al activar RLS, Ventas/Gastos/Compras/Leads/Stock/Productos/Dashboard/Director OS quedaron en blanco para todos, incluido el super_admin. La data nunca se tocó (se verificó con `select count(*) from ventas` en Supabase — 237 filas intactas). Era un bug de arquitectura preexistente: esas 8 páginas usaban un cliente de Supabase (`lib/supabase.ts`) que nunca compartía sesión con el login. Corregido en el mismo commit `4484239`. Detalle completo en `../MisionControl.md`.

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

### 0. Verificar el resto de las páginas post-multitenancy
El 07/09/2026 se confirmó en producción que **Ventas**, **Dashboard** y **Director OS** ya muestran los datos reales otra vez tras el fix del cliente de Supabase. Falta confirmar del mismo modo (login real, no solo mirar el código): **Gastos, Compras, Leads, Stock, Productos** y los 3 catálogos públicos (`/catalogo/madera`, `/catalogo/melamina`, `/catalogo/seleccion` — probar sin sesión iniciada, como los ve un cliente real).

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
- **⚠️ El proyecto tiene 3 clientes de Supabase distintos que NO comparten sesión** → `lib/supabase.ts` (anon key plano, sesión en localStorage, nunca autenticado), `lib/supabase-browser.ts` (`@supabase/ssr`, sesión en cookies, el que usan Login y Admin), `lib/supabase-admin.ts` (service-role, servidor). Antes del 07/09/2026, 8 páginas (ventas, gastos, compras, leads, stock, productos, dashboard, director) usaban el cliente equivocado (`lib/supabase.ts`) y corrían siempre como anónimas — invisible mientras las políticas de RLS eran abiertas para cualquiera. Al activar RLS `TO authenticated`, esas 8 páginas quedaron en blanco sin ningún error. **Antes de activar RLS en cualquier tabla nueva: grepear qué cliente usa cada página que la toca y confirmar que comparten sesión real con el login.** Si algún día se reporta "se perdieron los datos" justo después de un cambio de permisos, primer chequeo: `select count(*) from <tabla>` directo en Supabase (bypassa RLS) antes de asumir pérdida real.

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
