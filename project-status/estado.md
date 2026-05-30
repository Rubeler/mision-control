# Misión Control — Estado del Proyecto
**Última actualización:** 29/05/2026

---

## Deploy / Infraestructura
- Cuenta Vercel: **Edgardrive** (personal, plan Hobby)
- URL producción: https://mision-control-omega.vercel.app
- GitHub: https://github.com/Rubeler/mision-control (público)
- Webhook WhatsApp: https://mision-control-omega.vercel.app/api/whatsapp

---

## Módulos completados ✅

### Core
- Dashboard con charts conectados a Supabase (KPIs, ventas vs gastos, canal, top 5)
- Ventas — CRUD completo + exportación Excel
- Gastos — CRUD completo + exportación Excel
- Productos — CRUD + foto upload + linea + categoria + exportación Excel
- Leads CRM — Kanban drag & drop + editar + eliminar + teléfono + notas
- Director OS — métricas ejecutivas (gauges, KPIs, utilidad bruta del mes)
- Navbar — fecha en tiempo real

### WhatsApp Bot ✅ (resuelto 28/05/2026)
- Webhook recibe mensajes y crea leads automáticamente
- Auto-reply funcionando
- Token permanente (no expira) — usuario sistema `misioncontrol`
- Fix número Argentina: enviar con "15" (`54111536449059`), no con "9"

### Catálogo Digital ✅ (29/05/2026)
- `/catalogo` → Landing selector de línea
- `/catalogo/madera` → DBM madera de pino (fondo crema/marrón)
- `/catalogo/melamina` → MYM blanco & madera (fondo blanco/nórdico)
- `/catalogo/seleccion?ids=...` → Productos específicos para enviar a cliente
- Botón "Enviar muebles" en cada lead → modal selección → link WhatsApp
- Upload de fotos desde formulario de productos → Supabase Storage

---

## SQL ejecutados en Supabase
```sql
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'General';
ALTER TABLE productos ADD COLUMN IF NOT EXISTS linea TEXT DEFAULT 'madera';
```

---

## Supabase Storage
- Bucket: **"Productos"** (P mayúscula, público)
- Upload desde /productos → lápiz en producto → "Subir foto desde PC o celular"

---

## ⏳ PENDIENTE PRÓXIMA SESIÓN

### 1. Cargar imágenes a productos (PRIORIDAD)
- Ir a `/productos` → lápiz → "Subir foto desde PC o celular"
- El bucket ya está listo, el upload ya funciona
- Los catálogos muestran "Sin imagen" hasta que se carguen

### 2. Taggear productos por línea
- Todos los productos actuales tienen `linea = 'madera'` (default del SQL)
- Los de melamina hay que editarlos → cambiar Línea a "Blanco & Madera"
- `/catalogo/melamina` aparece vacío hasta que se haga esto

### 3. WhatsApp número real
- Conectar número dedicado de negocio → solo cambiar `WHATSAPP_PHONE_ID` en Vercel
- Variable `NEXT_PUBLIC_STORE_WHATSAPP` a configurar en Vercel para el botón del catálogo
- Mover app de Meta a modo producción

### 4. Auto-reply WhatsApp — probar en producción
- Fix aplicado (28/05/2026): normalización número Argentina
- Para probar: enviar mensaje al número de prueba Meta (+1 555 668 5409)
- Primero borrar lead duplicado "Ruben" en Supabase (duplicado de 7 días lo bloquea)

---

## 🚫 ERRORES CONOCIDOS / NO REPETIR

- **`Package2`** no existe en lucide-react v0.400.0 → usar `Package`, `Send`, `Upload`, `BookOpen`
- **Bucket Storage** se llama `"Productos"` con P **mayúscula** → `.from('Productos')`
- **Hot reload Windows** falla seguido → `Remove-Item -Recurse -Force .next` + `npm run dev`
- **Puerto ocupado** al reiniciar → servidor arranca en 3001, abrir `localhost:3001`
- **Build Vercel falla con TS errors** → `next.config.js` ya tiene `ignoreBuildErrors: true`, NO borrarlo
- **Imágenes del PDF son collages** (varios productos por imagen), no individuales

---

## Features backlog — próximas a implementar

### Módulo "Guiones de Venta" (sidebar)
Contestaciones programadas para llevar el lead a la venta.

**Concepto:** Desde el sidebar, una sección con guiones/cuestionarios por tipo de producto.
El vendedor abre el guión del producto que el lead pidió y sigue los pasos para calificarlo.

**Ejemplo — Cuestionario bajo mesada:**
1. ¿Cuánto espacio tiene disponible? (medidas del hueco)
2. ¿Tiene instalación de plomería? (define si necesita bacha)
3. ¿Qué estilo prefiere? (natural / pintado / melamina)
4. ¿Tiene presupuesto definido?
5. ¿Cuándo lo necesita?

**Con cada respuesta:**
- El sistema califica el lead (caliente / tibio / frío)
- Sugiere el producto exacto del catálogo
- Genera un mensaje de WhatsApp con la cotización

**Estructura técnica sugerida:**
- Nueva tabla Supabase: `guiones` (id, nombre, pasos JSON)
- Nueva ruta: `/guiones` con selector de producto
- Cada guión: secuencia de preguntas + lógica de recomendación
- Botón "Usar con lead" → abre el guión en el contexto del lead

---

## WhatsApp — Configuración Meta
- App: Mision Control-WA (ID: 1438898287993139) — modo desarrollo
- Número de prueba: +1 555 668 5409
- Phone ID: 1121915487672651
- WABA ID: 2013427192874818
- Número verificado: +54 9 11 3644 9059
- Usuario sistema: `misioncontrol` (ID: 61590263769122)
- Token: guardado en Vercel como `WHATSAPP_TOKEN` (no expira)

---

## Métricas actuales (dashboard 29/05/2026)
- Total vendido 2026: **$11.841.020**
- Ventas: **88 registros**
- Ticket promedio: **$134.557**
- Margen promedio: **60.2%**
- Utilidad bruta: **$7.184.127**

---

## Features planeadas (backlog)
- Multimedia entrante WhatsApp (fotos/videos de leads)
- Historial conversaciones por lead
- Tabla `mensajes_whatsapp` en Supabase
- Número real de negocio (requiere segundo chip/número)
