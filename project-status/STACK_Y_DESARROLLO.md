# Misión Control — Stack Completo y Guía de Replicación
**Versión:** 1.0 · **Fecha:** 30/05/2026  
**App original:** Debuenamadera · **URL:** mision-control-omega.vercel.app

---

## ¿Qué es esta app?

Un **Business OS** (Sistema Operativo de Negocio) para una mueblería. Permite:
- Ver el negocio en un dashboard con KPIs, ventas, gastos, margen
- Gestionar clientes en un CRM tipo Kanban
- Tener un catálogo digital público (sin login) para enviar a clientes
- Enviar fotos de muebles específicos por WhatsApp desde el CRM
- Recibir mensajes de WhatsApp y convertirlos en leads automáticamente

**Para replicarla** para otra persona solo hay que cambiar:
- El nombre del negocio (en Sidebar, Navbar, catálogos, galería)
- Los colores del tema (tailwind.config.ts)
- Los datos en Supabase (nueva base de datos vacía)
- Las imágenes de la galería (public/galeria/)
- Las variables de entorno de WhatsApp (si usan bot)

---

## Stack tecnológico

| Capa | Tecnología | Versión | Rol |
|------|-----------|---------|-----|
| Frontend | Next.js | 14.2.5 | Framework principal (App Router) |
| UI | React | 18 | Componentes |
| Estilos | Tailwind CSS | 3.4.1 | Sistema de diseño |
| Base de datos | Supabase | ^2.44.2 | PostgreSQL + Storage + Auth |
| Gráficos | Recharts | 2.12.7 | Dashboard charts |
| Íconos | Lucide React | 0.400.0 | Íconos SVG |
| Excel | xlsx | 0.18.5 | Exportar datos |
| Fuentes | Google Fonts | - | Fira Code + Fira Sans |
| Deploy | Vercel | - | Hosting + CI/CD |
| Bot | Meta WhatsApp API | v19.0 | Recibir/enviar mensajes |
| Lenguaje | TypeScript | 5 | Todo el código |

---

## Estructura de archivos

```
mision-control/
├── app/                          # Rutas Next.js (App Router)
│   ├── layout.tsx                # Layout admin: Sidebar + Navbar
│   ├── page.tsx                  # Dashboard (/)
│   ├── globals.css               # Estilos globales + fuentes
│   ├── ventas/page.tsx           # CRUD ventas
│   ├── leads/page.tsx            # CRM Kanban + envío WhatsApp
│   ├── gastos/page.tsx           # CRUD gastos
│   ├── productos/page.tsx        # Catálogo admin + upload fotos
│   ├── director/page.tsx         # Vista Director (métricas avanzadas)
│   ├── api/whatsapp/route.ts     # Webhook bot WhatsApp
│   ├── catalogo/
│   │   ├── layout.tsx            # Oculta sidebar en páginas públicas
│   │   ├── page.tsx              # Landing selector de catálogos
│   │   ├── madera/page.tsx       # Catálogo público línea madera
│   │   ├── melamina/page.tsx     # Catálogo público línea melamina
│   │   └── seleccion/page.tsx    # Productos específicos por IDs
│   └── galeria/
│       ├── layout.tsx            # Oculta sidebar en páginas públicas
│       └── page.tsx              # Galería de presentación (slides)
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Menú lateral admin
│   │   └── Navbar.tsx            # Barra superior admin
│   └── dashboard/
│       ├── VentasChart.tsx       # Gráfico ventas vs gastos
│       ├── CanalDonut.tsx        # Donut chart canales
│       └── TopProductos.tsx      # Ranking productos
│
├── lib/
│   ├── supabase.ts               # Cliente Supabase
│   ├── whatsapp.ts               # Función enviar mensajes WA
│   └── exportExcel.ts            # Función exportar Excel
│
├── public/
│   └── galeria/                  # Slides de presentación (PNG estáticos)
│       ├── slide-01.png          # 14 slides Galería Orgánica
│       └── bedroom-01.png        # 10 slides DBM Bedroom Collection
│
├── next.config.js                # ignoreBuildErrors: true
├── tailwind.config.ts            # Paleta de colores + fuentes
└── tsconfig.json                 # TypeScript config
```

---

## Base de datos (Supabase)

### Tabla: `ventas`
```sql
create table ventas (
  id          bigserial primary key,
  fecha       date not null,
  producto    text not null,
  canal       text not null,         -- 'Presencial' | 'WhatsApp' | 'IG'
  precio_venta numeric not null,
  costo       numeric,
  margen_pct  numeric,
  created_at  timestamptz default now()
);
```

### Tabla: `leads`
```sql
create table leads (
  id          bigserial primary key,
  fecha       date not null,
  nombre      text,
  producto    text not null,
  canal       text not null,         -- 'Presencial' | 'WhatsApp' | 'IG'
  estado      text not null,         -- 'Nuevo' | 'Seguimiento' | 'Ganado' | 'Perdido'
  motivo      text,                  -- Motivo de pérdida
  telefono    text,                  -- Formato: 5491130216559
  notas       text,
  created_at  timestamptz default now()
);
```

### Tabla: `gastos`
```sql
create table gastos (
  id          bigserial primary key,
  fecha       date not null,
  descripcion text not null,
  tipo        text not null,         -- 'Fijo' | 'Variable'
  monto       numeric not null,
  created_at  timestamptz default now()
);
```

### Tabla: `productos`
```sql
create table productos (
  id           uuid default gen_random_uuid() primary key,
  producto     text not null,
  costo        numeric not null,
  precio_venta numeric not null,
  margen_pct   numeric,
  imagen_url   text,                 -- URL pública (Supabase Storage)
  categoria    text default 'General',
  linea        text default 'madera', -- 'madera' | 'melamina'
  created_at   timestamptz default now()
);
```

### Storage (Supabase)
- **Bucket:** `Productos` (con P mayúscula, público)
- Guarda las fotos de los productos
- URL pública: `https://[project].supabase.co/storage/v1/object/public/Productos/[archivo]`

### Políticas RLS recomendadas
```sql
-- Permitir lectura pública (para catálogos sin login)
create policy "Public read" on productos for select using (true);
create policy "Public read" on ventas for select using (true);
create policy "Public read" on leads for select using (true);
create policy "Public read" on gastos for select using (true);

-- Permitir escritura con anon key
create policy "Anon insert" on ventas for insert with check (true);
create policy "Anon insert" on leads for insert with check (true);
create policy "Anon insert" on gastos for insert with check (true);
create policy "Anon insert" on productos for insert with check (true);
create policy "Anon update" on ventas for update using (true);
create policy "Anon update" on leads for update using (true);
create policy "Anon update" on productos for update using (true);
create policy "Anon delete" on leads for delete using (true);
create policy "Anon delete" on ventas for delete using (true);
create policy "Anon delete" on gastos for delete using (true);
```

---

## Variables de entorno

Crear archivo `.env.local` en la raíz:
```env
# Supabase (obligatorias)
NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# WhatsApp Bot (opcionales - solo si usás bot)
WHATSAPP_TOKEN=EAAxxxxx
WHATSAPP_PHONE_ID=1234567890
WHATSAPP_VERIFY_TOKEN=cualquier_string_secreto

# Catálogo - número WhatsApp del negocio
NEXT_PUBLIC_STORE_WHATSAPP=5491112345678
```

En Vercel, cargar las mismas variables en Settings → Environment Variables.

---

## Tema visual (Tailwind)

El admin usa un tema **dark cyberpunk**:
```ts
colors: {
  bg:      '#0D0D1A',   // Fondo principal (negro azulado)
  card:    '#16213E',   // Tarjetas
  'card-2':'#0F3460',   // Tarjetas secundarias
  cyan:    '#00FFFF',   // Acento principal (neón)
  lime:    '#39FF14',   // Acento positivo (ganancias)
  violet:  '#BB86FC',   // Acento terciario
  border:  '#333366',   // Bordes
  muted:   '#E0E0E0',   // Texto principal
  dim:     '#888899',   // Texto secundario
}
fontFamily: {
  mono: ['Fira Code', 'monospace'],   // Números y datos
  sans: ['Fira Sans', 'sans-serif'],  // Texto general
}
```

**Para personalizar:** cambiar los colores hex y los nombres de las fuentes en Google Fonts.

Los catálogos públicos usan su propia paleta (definida inline en cada página).

---

## Módulos — qué hace cada uno

### Dashboard (`/`)
- Calcula KPIs anuales: total vendido, cantidad de ventas, ticket promedio, margen, utilidad bruta/neta
- Gráfico de líneas: ventas vs gastos por mes (Recharts)
- Gráfico donut: distribución de ventas por canal
- Tabla Top 5 productos más vendidos
- Tabla de rentabilidad por canal

### Ventas (`/ventas`)
- Tabla de todas las ventas con búsqueda
- Crear / editar venta: fecha, producto, canal, precio, costo (calcula margen automático)
- Exportar a Excel (librería xlsx)

### Leads CRM (`/leads`)
- Kanban con 4 columnas: Nuevo / Seguimiento / Ganado / Perdido
- Drag & drop entre columnas (actualiza estado en Supabase)
- Cada tarjeta: nombre, producto de interés, teléfono, canal, fecha, notas
- **Botón "Muebles"**: abre modal → seleccionás productos de la base de datos → genera link `/catalogo/seleccion?ids=...` → abre WhatsApp con el número del lead
- **Botón "Catálogo"**: abre WhatsApp con el número del lead y el link de la galería

### Gastos (`/gastos`)
- Tabla con tipo (Fijo/Variable), descripción, monto, fecha
- CRUD completo + exportar Excel

### Productos (`/productos`)
- Tabla de 145+ productos con thumbnail, línea, categoría, costo, precio, margen (barra visual)
- Crear/editar: nombre, línea (madera/melamina), categoría, costo, precio (calcula margen), imagen
- **Upload de foto**: sube directo a Supabase Storage bucket "Productos", guarda la URL
- Botón "Ver catálogo" → abre `/galeria`
- Exportar a Excel

### Director OS (`/director`)
- Vista ejecutiva: métricas del mes actual vs mes anterior
- Gauges de performance, utilidad neta, alertas

### Bot WhatsApp (`/api/whatsapp`)
- Endpoint GET: verificación del webhook con Meta
- Endpoint POST: recibe mensajes entrantes
  - Si el mensaje es de texto → crea lead en Supabase con nombre, teléfono, producto (texto del mensaje), canal=WhatsApp
  - Normaliza números Argentina (549 → 5491X con 15)
  - Responde automáticamente: "¡Hola! Recibimos tu consulta…"

---

## Catálogos públicos (sin login)

### Cómo funcionan sin login
Los catálogos usan `data-admin` en Sidebar y Navbar + CSS injection en el layout para ocultarlos. El cliente ve solo el catálogo, sin ningún elemento del admin.

```tsx
// app/catalogo/layout.tsx
<style>{`
  [data-admin] { display: none !important; }
  main { margin: 0 !important; padding: 0 !important; }
  main > div { padding: 0 !important; }
`}</style>
```

### `/catalogo` — Landing
Dos botones: Madera Maciza (DBM) y Blanco & Madera (MYM)

### `/catalogo/madera` — Catálogo madera
- Fetcha productos con `linea = 'madera'` de Supabase
- Grid de tarjetas: foto, nombre, precio, botón WhatsApp
- Filtro por categoría
- Estilo: fondo crema/marrón, acento dorado

### `/catalogo/melamina` — Catálogo melamina
- Fetcha productos con `linea = 'melamina'`
- Mismo grid, estilo blanco/nórdico

### `/catalogo/seleccion?ids=abc,def,ghi` — Selección específica
- Recibe IDs de productos como query params
- Muestra solo esos productos
- Se usa cuando el vendedor selecciona muebles específicos desde el CRM

### `/galeria` — Presentación
- Slideshow con 24 slides (imágenes PNG estáticas en `public/galeria/`)
- Navegación con flechas y dots
- Keyboard navigation (← →)
- 14 slides: Galería Orgánica (melamina blanco y madera)
- 10 slides: DBM Bedroom Collection (roperos y alzadas)

---

## Deploy (Vercel)

1. Crear repo en GitHub
2. Conectar repo a Vercel (import project)
3. Cargar variables de entorno en Vercel → Settings → Environment Variables
4. Cada `git push origin master` hace deploy automático

**next.config.js obligatorio:**
```js
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
}
```

---

## WhatsApp Bot — setup

1. Crear app en Meta Developers → Añadir producto WhatsApp
2. Configurar webhook → URL: `https://[tu-app].vercel.app/api/whatsapp`
3. Verify token: el mismo que pusiste en `WHATSAPP_VERIFY_TOKEN`
4. Suscribir al campo `messages`
5. Crear usuario del sistema en Business Manager → asignar app → generar token sin vencimiento
6. Guardar `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_ID` en Vercel

**Limitación:** Con número de prueba de Meta solo podés enviar a números verificados. Para usar número propio hay que pasar App Review de Meta.

---

## Cómo replicar para otra persona

### Paso 1 — Clonar repo
```bash
git clone https://github.com/Rubeler/mision-control.git mi-nuevo-negocio
cd mi-nuevo-negocio
npm install
```

### Paso 2 — Nuevo Supabase
1. Crear proyecto nuevo en supabase.com
2. Ejecutar todos los `CREATE TABLE` de arriba
3. Aplicar las políticas RLS
4. Crear bucket `Productos` (público)
5. Copiar URL y anon key

### Paso 3 — Personalizar
- `app/layout.tsx` → cambiar título del `<title>`
- `components/layout/Sidebar.tsx` → cambiar nombre del negocio (línea 50-51)
- `components/layout/Navbar.tsx` → cambiar nombre del dueño (línea 20)
- `app/catalogo/page.tsx` → cambiar nombre del negocio y líneas
- `app/galeria/page.tsx` → cambiar nombre y footer
- `tailwind.config.ts` → cambiar colores si se quiere otro tema
- `public/galeria/` → reemplazar slides PNG con los del nuevo negocio

### Paso 4 — Variables de entorno
```bash
cp .env.local.example .env.local
# Completar con datos del nuevo Supabase
```

### Paso 5 — Deploy
```bash
git remote set-url origin https://github.com/[nuevo-usuario]/[nuevo-repo].git
git push origin master
```
Conectar a Vercel y cargar las env vars.

---

## Tiempo estimado de replicación

| Tarea | Tiempo |
|-------|--------|
| Clonar + instalar | 10 min |
| Crear Supabase + SQL | 20 min |
| Personalizar textos | 30 min |
| Variables de entorno | 10 min |
| Deploy Vercel | 10 min |
| Reemplazar slides galería | 20 min |
| **Total** | **~1.5 horas** |

Sin WhatsApp bot: 1.5 horas  
Con WhatsApp bot: agregar ~2 horas para la configuración de Meta

---

## Lo que NO está incluido (pendiente)

- **Autenticación/login**: cualquiera que tenga la URL puede acceder al admin. Para agregar login: usar Supabase Auth o middleware de Next.js.
- **Fotos de productos**: el bucket existe y el upload funciona, pero las fotos hay que cargarlas una por una desde `/productos`.
- **Número real WhatsApp**: el bot funciona con número de prueba. Para número propio de negocio hay que pasar App Review de Meta.
- **Multi-usuario**: todos comparten el mismo admin sin roles. Para agregar roles: Supabase Auth + Row Level Security por usuario.
