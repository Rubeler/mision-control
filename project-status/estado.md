# Misión Control — Estado del Proyecto
**Última actualización:** 01/06/2026

---

## Deploy / Infraestructura
- Cuenta Vercel: **Edgardrive** (personal, plan Hobby)
- URL producción: https://mision-control-omega.vercel.app
- GitHub: https://github.com/Rubeler/mision-control (público)
- Webhook WhatsApp: https://mision-control-omega.vercel.app/api/whatsapp

---

## Módulos completados ✅

### Core
- Dashboard — KPIs anuales + **selector de mes** (filtra todos los KPIs y charts)
- Ventas — CRUD completo + exportación Excel
- Gastos — CRUD completo + exportación Excel
- Productos — CRUD + foto upload + linea + categoria + exportación Excel
- Leads CRM — Kanban drag & drop + botón "Muebles" + botón "Catálogo"
- Director OS — métricas ejecutivas + **selector de mes Ene-Dic** con ventas vs gastos desglosados
- Navbar — fecha en tiempo real

### WhatsApp Bot ✅ (resuelto 28/05/2026)
- Webhook recibe mensajes y crea leads automáticamente
- Auto-reply funcionando
- Token permanente (no expira) — usuario sistema `misioncontrol`
- Fix número Argentina: enviar con "15" (`54111536449059`), no con "9"

### Catálogo Digital ✅
- `/catalogo` → Landing selector de línea (Madera / Melamina)
- `/catalogo/madera` → Catálogo DBM madera de pino
- `/catalogo/melamina` → Catálogo MYM blanco & madera (vacío hasta taggear productos)
- `/catalogo/seleccion?ids=...` → Productos específicos para enviar a cliente
- Botón "Muebles" en cada lead → modal selección → link WhatsApp
- Botón "Catálogo" en cada lead → abre WhatsApp con link galería

### Galería Digital ✅ (30/05/2026)
- `/galeria` → Presentación 24 slides con navegación (← → y teclado)
- 14 slides: Galería Orgánica (melamina blanco & madera)
- 10 slides: DBM Bedroom Collection (roperos y alzadas con fotos reales)
- **Botón "Compartir"** → copia link al portapapeles
- **Botón "Consultá"** → abre WhatsApp con link de galería
- **Botón "Descargar imagen"** → descarga el PNG del slide actual
- Imágenes en `public/galeria/` (estáticas en Vercel, NO en Supabase)

### Guiones de Venta ✅ (01/06/2026)
- `/guiones` → Módulo de scripts de venta para bajo mesada
- **Tab Calificación**: 7 preguntas en 4 fases → calcula temperatura (Caliente/Tibio/Frío) → genera mensaje WhatsApp inicial
- **Tab Seguimiento**: 3 plantillas anti-pesados con campos [Nombre] y [Mueble] personalizables + botón copiar
- Reglas de oro del CRM (máx 3 contactos, archivar si no responde)

---

## SQL ejecutados en Supabase
```sql
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'General';
ALTER TABLE productos ADD COLUMN IF NOT EXISTS linea TEXT DEFAULT 'madera';
```

---

## Supabase Storage
- Bucket: **"Productos"** (P mayúscula, público) — **VACÍO**, sin fotos cargadas aún
- Upload desde /productos → lápiz en producto → "Subir foto desde PC o celular"

---

## ⏳ PENDIENTE PRÓXIMA SESIÓN

### 1. Cargar imágenes a productos (PRIORIDAD)
- Ir a `/productos` → lápiz → "Subir foto desde PC o celular"
- Implementar **upload múltiple** (drag & drop de varias fotos a la vez)
- Sin fotos: `/catalogo/madera` y `/catalogo/seleccion` muestran placeholder "Sin imagen"

### 2. Taggear productos melamina
- Todos los productos tienen `linea = 'madera'` (default)
- Editar los productos MYM → cambiar Línea a "Blanco & Madera"
- `/catalogo/melamina` aparece vacío hasta que se haga

### 3. Sistema de imágenes para escalar a otras mueblerías
- Cada mueblería necesita su propio Supabase + bucket
- Construir panel de gestión de imágenes en la app
- Evaluar: upload múltiple / drag & drop / organización por categoría

### 4. WhatsApp número real
- Variable `NEXT_PUBLIC_STORE_WHATSAPP` configurar en Vercel
- Actualmente usa fallback `5491136464905`

---

## 🚫 ERRORES CONOCIDOS / NO REPETIR

- **`Package2`** no existe en lucide-react v0.400.0 → usar `Package`, `Send`, `Upload`, `BookOpen`
- **Bucket Storage** se llama `"Productos"` con P **mayúscula** → `.from('Productos')`
- **Gastos** no tiene campo `fecha` ni `descripcion` → campos son `mes`, `tipo`, `categoria`, `monto`
- **Hot reload Windows** falla → `Remove-Item -Recurse -Force .next` + `npm run dev`
- **Puerto ocupado** al reiniciar → servidor en 3001, abrir `localhost:3001`
- **Build Vercel falla con TS errors** → `next.config.js` ya tiene `ignoreBuildErrors: true`, NO borrarlo

---

## Backlog — Features planeadas

### Módulo "Guiones de Venta" — expansión
- Agregar guiones para otros productos (ropero, alacena, cocina completa)
- Botón "Usar con lead" → pre-completa [Nombre] desde el lead seleccionado

### Multimedia WhatsApp
- Recibir fotos/videos de leads entrantes

### Historial conversaciones
- Tabla `mensajes_whatsapp` por lead

### Login / Auth
- Actualmente sin autenticación (cualquiera con la URL accede al admin)
- Supabase Auth para proteger las rutas del admin

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

## Métricas (dashboard 01/06/2026)
- Total vendido 2026: **$11.841.020**
- Ventas: **88 registros**
- Ticket promedio: **$134.557**
- Margen promedio: **60.2%**
- Utilidad bruta: **$7.184.127**
