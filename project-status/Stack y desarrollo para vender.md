# Misión Control — Stack y Desarrollo (Versión para Venta)
**Versión:** 2.0 · **Fecha:** 02/06/2026

---

## ¿Qué es esta app?

Un **Business OS** (Sistema Operativo de Negocio) para mueblerías y negocios de fabricación. Reemplaza las planillas de Excel y los cuadernos por una plataforma web que centraliza ventas, gastos, clientes y métricas del negocio.

**Módulos incluidos:**
- Dashboard con KPIs, gráficos y selector de mes
- Registro de ventas con margen automático
- Control de gastos fijos y variables
- Catálogo interno de productos con rentabilidad
- CRM de leads tipo Kanban con integración WhatsApp
- Vista Director con análisis mes a mes
- Guiones de venta con scripts listos para copiar
- Bot de WhatsApp que convierte mensajes en leads automáticamente

**Para replicarla** para otro negocio solo hay que cambiar:
- El nombre del negocio (Sidebar, Navbar)
- Los colores del tema (`tailwind.config.ts`)
- Los datos en Supabase (base de datos vacía nueva)
- Las variables de entorno de WhatsApp (si usan bot)

---

## Stack tecnológico

| Capa | Tecnología | Versión | Rol |
|------|-----------|---------|-----|
| Frontend | Next.js | 14.2.5 | Framework principal (App Router) |
| UI | React | 18 | Componentes |
| Estilos | Tailwind CSS | 3.4.1 | Sistema de diseño |
| Base de datos | Supabase | ^2.44.2 | PostgreSQL gestionado |
| Gráficos | Recharts | 2.12.7 | Dashboard charts |
| Íconos | Lucide React | 0.400.0 | Íconos SVG |
| Excel | xlsx | 0.18.5 | Exportar datos |
| Fuentes | Google Fonts | — | Fira Code + Fira Sans |
| Deploy | Vercel | — | Hosting + CI/CD automático |
| Bot | Meta WhatsApp API | v19.0 | Recibir/enviar mensajes |
| Lenguaje | TypeScript | 5 | Todo el código |

---

## Estructura de archivos

```
mision-control/
├── app/
│   ├── layout.tsx                # Layout admin: Sidebar + Navbar
│   ├── page.tsx                  # Dashboard (/) + selector de mes
│   ├── globals.css               # Estilos globales + fuentes
│   ├── ventas/page.tsx           # CRUD ventas + exportar Excel
│   ├── leads/page.tsx            # CRM Kanban + botones WhatsApp
│   ├── gastos/page.tsx           # CRUD gastos + exportar Excel
│   ├── productos/page.tsx        # Catálogo interno con márgenes
│   ├── director/page.tsx         # Vista ejecutiva + análisis por mes
│   ├── guiones/page.tsx          # Scripts de venta + seguimiento WA
│   └── api/whatsapp/route.ts     # Webhook bot WhatsApp
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Menú lateral admin
│   │   └── Navbar.tsx            # Barra superior con fecha
│   └── dashboard/
│       ├── VentasChart.tsx       # Gráfico ventas vs gastos
│       ├── CanalDonut.tsx        # Donut chart canales de venta
│       └── TopProductos.tsx      # Ranking top 5 productos
│
├── lib/
│   ├── supabase.ts               # Cliente Supabase
│   ├── whatsapp.ts               # Función enviar mensajes WA
│   └── exportExcel.ts            # Función exportar a Excel
│
├── next.config.js                # ignoreBuildErrors: true
├── tailwind.config.ts            # Paleta de colores + fuentes
└── tsconfig.json
```

---

## Base de datos (Supabase)

### Tabla: `ventas`
```sql
create table ventas (
  id           bigserial primary key,
  fecha        date not null,
  mes          text,                    -- 'Ene' | 'Feb' | ... | 'Dic'
  producto     text not null,
  canal        text not null,           -- 'Presencial' | 'WhatsApp' | 'IG'
  precio_venta numeric not null,
  costo        numeric,
  margen_pct   numeric,
  utilidad_bruta numeric,
  created_at   timestamptz default now()
);
```

### Tabla: `leads`
```sql
create table leads (
  id         bigserial primary key,
  fecha      date not null,
  nombre     text,
  producto   text not null,
  canal      text not null,             -- 'Presencial' | 'WhatsApp' | 'IG'
  estado     text not null,             -- 'Nuevo' | 'Seguimiento' | 'Ganado' | 'Perdido'
  motivo     text,
  telefono   text,                      -- Formato: 5491130216559
  notas      text,
  created_at timestamptz default now()
);
```

### Tabla: `gastos`
```sql
create table gastos (
  id         bigserial primary key,
  mes        text not null,             -- 'Ene' | 'Feb' | ... | 'Dic'
  tipo       text not null,             -- 'Fijo' | 'Variable'
  categoria  text not null,             -- descripción del gasto
  monto      numeric not null,
  created_at timestamptz default now()
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
  created_at   timestamptz default now()
);
```

### Políticas RLS (Supabase)
```sql
-- Lectura y escritura con anon key (sin login)
create policy "Public read"   on ventas   for select using (true);
create policy "Anon insert"   on ventas   for insert with check (true);
create policy "Anon update"   on ventas   for update using (true);
create policy "Anon delete"   on ventas   for delete using (true);

create policy "Public read"   on leads    for select using (true);
create policy "Anon insert"   on leads    for insert with check (true);
create policy "Anon update"   on leads    for update using (true);
create policy "Anon delete"   on leads    for delete using (true);

create policy "Public read"   on gastos   for select using (true);
create policy "Anon insert"   on gastos   for insert with check (true);
create policy "Anon delete"   on gastos   for delete using (true);

create policy "Public read"   on productos for select using (true);
create policy "Anon insert"   on productos for insert with check (true);
create policy "Anon update"   on productos for update using (true);
create policy "Anon delete"   on productos for delete using (true);
```

---

## Variables de entorno

Archivo `.env.local` en la raíz del proyecto:
```env
# Supabase (obligatorias)
NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# WhatsApp Bot (opcionales — solo si se usa el bot)
WHATSAPP_TOKEN=EAAxxxxx
WHATSAPP_PHONE_ID=1234567890
WHATSAPP_VERIFY_TOKEN=cualquier_string_secreto
```

En Vercel: Settings → Environment Variables → cargar las mismas.

---

## Tema visual (Tailwind)

El admin usa un tema **dark cyberpunk** personalizable en un solo archivo:

```ts
// tailwind.config.ts
colors: {
  bg:      '#0D0D1A',   // Fondo principal (negro azulado)
  card:    '#16213E',   // Tarjetas
  'card-2':'#0F3460',   // Tarjetas secundarias
  cyan:    '#00FFFF',   // Acento principal
  lime:    '#39FF14',   // Acento positivo (ganancias)
  violet:  '#BB86FC',   // Acento terciario
  border:  '#333366',   // Bordes
  muted:   '#E0E0E0',   // Texto principal
  dim:     '#888899',   // Texto secundario
}
fontFamily: {
  mono: ['Fira Code', 'monospace'],
  sans: ['Fira Sans', 'sans-serif'],
}
```

Cambiar los colores hex cambia toda la app al instante.

---

## Módulos — qué hace cada uno

### Dashboard (`/`)
- KPIs anuales: total vendido, cantidad de ventas, ticket promedio, margen promedio, utilidad bruta
- **Selector de mes (Ene–Dic):** filtra todos los KPIs y charts al mes elegido
- Gráfico de líneas: ventas vs gastos mes a mes (Recharts)
- Gráfico donut: distribución por canal (Presencial / WhatsApp / IG)
- Top 5 productos más vendidos con margen
- Panel de rentabilidad por canal + gastos + utilidad neta

### Ventas (`/ventas`)
- Tabla con todas las ventas ordenadas
- Buscar por producto
- Crear / editar venta: fecha, producto, canal, precio, costo → calcula margen automático
- Exportar a Excel

### Gastos (`/gastos`)
- Tabla con mes, tipo (Fijo/Variable), categoría, monto
- Totales separados: fijos vs variables
- Crear / eliminar gastos
- Exportar a Excel

### Productos (`/productos`)
- Catálogo interno del negocio (no público)
- Tabla con nombre, costo, precio de venta, margen (barra visual de color)
- Crear / editar productos: nombre, costo, precio → margen calculado automático
- Margen promedio de todo el catálogo visible en el header

### Leads CRM (`/leads`)
- Kanban con 4 columnas: Nuevo / Seguimiento / Ganado / Perdido
- Drag & drop entre columnas (actualiza en Supabase automáticamente)
- Cada tarjeta muestra: nombre, producto consultado, teléfono, canal, fecha, notas
- Tasa de conversión en tiempo real en el header
- **Botón "Muebles":** seleccionás productos del catálogo → genera link de selección → abre WhatsApp con el número del lead y el link listo
- **Botón "Catálogo":** abre WhatsApp directo con un mensaje al número del lead
- Crear / editar / eliminar leads
- Motivo de pérdida cuando el lead se mueve a "Perdido"

### Director OS (`/director`)
- **Morning Briefing diario:** leads de hoy, ventas de hoy, revenue de hoy
- Gauge visual: % de conversión de leads (ganados/total)
- Gauge visual: margen bruto promedio de ventas
- Revenue total acumulado + utilidad bruta + revenue del mes actual
- **Selector de mes (Ene–Dic):**
  - Total ventas del mes vs total gastos del mes
  - Utilidad del mes con porcentaje de margen
  - Lista de todas las ventas del mes con fecha, producto, precio, canal
  - Lista de todos los gastos del mes con categoría, tipo, monto
- Pipeline comercial: barras por estado con porcentaje
- KPIs operacionales: ticket promedio, revenue por lead ganado, leads activos
- Últimas 5 ventas registradas

### Guiones de Venta (`/guiones`)
- Scripts de venta para llevar al cliente desde la consulta a la compra

**Tab Calificación:**
- Cuestionario de 7 preguntas en 4 fases (Recepción → Calificación técnica → Intención de compra → Cierre)
- Al terminar califica el lead como: 🔥 Caliente / 🌡️ Tibio / ❄️ Frío
- Genera el mensaje inicial de WhatsApp personalizado con las respuestas del cliente, listo para copiar y enviar

**Tab Seguimiento:**
- 3 plantillas de mensajes (anti-pesados) con momentos exactos de envío:
  - Paso 1 — "El Salvavidas" (24-48hs sin respuesta)
  - Paso 2 — "El Aporte Visual" (3-4 días)
  - Paso 3 — "Cierre de Cupo" (último contacto, genera urgencia real)
- Campos [Nombre] y [Mueble] que actualizan las plantillas en tiempo real
- Botón copiar en cada mensaje
- Reglas de oro: máximo 3 contactos, criterio para archivar lead

### Bot WhatsApp (`/api/whatsapp`)
- Endpoint GET: verificación del webhook con Meta
- Endpoint POST: recibe mensajes entrantes de WhatsApp
  - Extrae nombre, número y texto del mensaje
  - Crea automáticamente un nuevo lead en Supabase
  - Normaliza números Argentina (formato 549 + código de área)
  - Responde automáticamente al cliente

---

## Deploy (Vercel)

1. Crear repo en GitHub
2. Conectar repo a Vercel (import project)
3. Cargar variables de entorno en Vercel → Settings → Environment Variables
4. `git push origin master` → deploy automático

**next.config.js obligatorio:**
```js
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
}
```

---

## WhatsApp Bot — setup paso a paso

1. Crear cuenta en [Meta Developers](https://developers.facebook.com)
2. Nueva app → añadir producto WhatsApp
3. Webhook URL: `https://[tu-app].vercel.app/api/whatsapp`
4. Verify token: el mismo que pusiste en `WHATSAPP_VERIFY_TOKEN`
5. Suscribir al campo `messages`
6. Crear usuario del sistema en Business Manager → asignar app → generar token sin vencimiento
7. Guardar `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_ID` en Vercel

> Con número de prueba de Meta solo podés enviar a números verificados.  
> Para número propio de negocio hay que pasar App Review de Meta (gratuito, ~1 semana).

---

## Guía completa de instalación para un nuevo cliente

### ✅ Qué pedirle al cliente ANTES de empezar

Antes de tocar código, el cliente tiene que darte estos datos. Sin ellos no se puede instalar.

**Siempre (obligatorio):**
| Dato | Para qué sirve | Ejemplo |
|------|---------------|---------|
| Nombre del negocio | Aparece en el sidebar y el título de la app | "Mueblería El Pino" |
| Nombre del dueño | Aparece en el saludo del navbar | "Carlos" |
| Listado de productos (nombre, costo, precio) | Carga inicial en la base de datos | Excel o lista escrita |
| Listado de gastos fijos mensuales | Carga inicial de gastos | Monotributo $X, Luz $Y... |

**Solo si quieren el bot de WhatsApp:**
| Dato | Para qué sirve |
|------|---------------|
| Número de WhatsApp del negocio | El número que los clientes van a escribir |
| Acceso a Meta Business Manager | Para crear la app del bot |
| ¿Tienen número dedicado de negocio o usan el personal? | Si usan el personal, hay que hablar antes |

> **Nota importante sobre el número de WhatsApp:** el bot se conecta al número que los clientes escriben. Si el cliente usa su número personal de WhatsApp para el negocio, no se puede usar directamente — se necesita un número aparte o un chip dedicado para el negocio.

---

### 🔵 OPCIÓN A — Instalación SIN bot de WhatsApp

**Tiempo total: ~1 hora**

#### Paso 1 — Crear cuenta en Supabase (base de datos)
1. Ir a [supabase.com](https://supabase.com) → crear cuenta con Gmail del cliente
2. Clic en "New Project" → elegir nombre (ej: `muebleria-el-pino`) → elegir región `South America (São Paulo)` → crear
3. Esperar ~2 minutos que termine de crear
4. Guardar: `Project URL` y `anon public key` (están en Settings → API)

#### Paso 2 — Crear las tablas en Supabase
1. En el panel de Supabase → SQL Editor → New Query
2. Pegar y ejecutar este SQL completo:

```sql
-- Tabla ventas
create table ventas (
  id bigserial primary key,
  fecha date not null,
  mes text,
  producto text not null,
  canal text not null,
  precio_venta numeric not null,
  costo numeric,
  margen_pct numeric,
  utilidad_bruta numeric,
  created_at timestamptz default now()
);

-- Tabla leads
create table leads (
  id bigserial primary key,
  fecha date not null,
  nombre text,
  producto text not null,
  canal text not null,
  estado text not null default 'Nuevo',
  motivo text,
  telefono text,
  notas text,
  created_at timestamptz default now()
);

-- Tabla gastos
create table gastos (
  id bigserial primary key,
  mes text not null,
  tipo text not null,
  categoria text not null,
  monto numeric not null,
  created_at timestamptz default now()
);

-- Tabla productos
create table productos (
  id uuid default gen_random_uuid() primary key,
  producto text not null,
  costo numeric not null,
  precio_venta numeric not null,
  margen_pct numeric,
  created_at timestamptz default now()
);

-- Políticas de acceso (ejecutar cada línea por separado si da error en bloque)
create policy "Public read"  on ventas   for select using (true);
create policy "Anon insert"  on ventas   for insert with check (true);
create policy "Anon update"  on ventas   for update using (true);
create policy "Anon delete"  on ventas   for delete using (true);

create policy "Public read"  on leads    for select using (true);
create policy "Anon insert"  on leads    for insert with check (true);
create policy "Anon update"  on leads    for update using (true);
create policy "Anon delete"  on leads    for delete using (true);

create policy "Public read"  on gastos   for select using (true);
create policy "Anon insert"  on gastos   for insert with check (true);
create policy "Anon delete"  on gastos   for delete using (true);

create policy "Public read"  on productos for select using (true);
create policy "Anon insert"  on productos for insert with check (true);
create policy "Anon update"  on productos for update using (true);
create policy "Anon delete"  on productos for delete using (true);

-- Habilitar RLS en todas las tablas
alter table ventas    enable row level security;
alter table leads     enable row level security;
alter table gastos    enable row level security;
alter table productos enable row level security;
```

#### Paso 3 — Crear cuenta en Vercel (hosting)
1. Ir a [vercel.com](https://vercel.com) → crear cuenta con Gmail del cliente
2. Conectar con GitHub (si no tiene cuenta GitHub, crearla también)

#### Paso 4 — Descargar el código base a tu PC

**Primero: instalar Git** (solo la primera vez en cada PC)
- Ir a [git-scm.com](https://git-scm.com) → Download → instalar con opciones por defecto

**Opción A (sin saber código) — Descarga directa como ZIP:**
1. Ir a `https://github.com/Rubeler/mision-control`
2. Click en el botón verde **"Code"** → **"Download ZIP"**
3. Descomprimir el ZIP en el escritorio
4. Abrir PowerShell o CMD dentro de esa carpeta → correr `npm install`

**Opción B (recomendada) — Clonar con Git:**
1. Abrir PowerShell o CMD
2. Correr estos comandos uno por uno:
   ```bash
   git clone https://github.com/Rubeler/mision-control.git muebleria-el-pino
   cd muebleria-el-pino
   npm install
   ```
3. Esperar que termine `npm install` (~1-2 minutos)

**Luego, cambiar los textos del cliente** (abrir los archivos con el Bloc de notas o VS Code):
- `components/layout/Sidebar.tsx` → línea 50: nombre del negocio
- `components/layout/Navbar.tsx` → línea 20: nombre del dueño
- `app/layout.tsx` → `<title>`: nombre del negocio

#### Paso 5 — Deploy en Vercel
1. En Vercel → "Add New Project" → importar el repo del cliente desde GitHub
2. Antes de hacer deploy, en "Environment Variables" agregar:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = [URL del proyecto Supabase]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon key de Supabase]
   ```
3. Clic en Deploy → esperar ~2 minutos
4. La URL queda como: `https://[nombre-del-repo].vercel.app`

#### Paso 6 — URL personalizada (opcional)
- Por defecto queda `nombre-del-repo.vercel.app` — ya funciona y es gratis
- Si el cliente quiere un dominio propio (`app.muebleriaxyz.com`): en Vercel → Domains → agregar dominio

#### Paso 7 — Carga inicial de datos
1. Entrar a la app con la URL
2. Ir a `/productos` → cargar los productos del cliente uno a uno (o importar con Excel si se implementa esa función)
3. Ir a `/gastos` → cargar los gastos fijos mensuales del cliente

**¡Listo! La app está funcionando al 100%.**

---

### 🟢 OPCIÓN B — Instalación CON bot de WhatsApp

**Tiempo total: ~3 horas**  
13 pasos en orden. Los primeros 7 son idénticos a la Opción A.

#### Paso 1 — Crear cuenta en Supabase (base de datos)
1. Ir a [supabase.com](https://supabase.com) → crear cuenta con Gmail del cliente
2. Clic en "New Project" → elegir nombre (ej: `muebleria-el-pino`) → región `South America (São Paulo)` → crear
3. Esperar ~2 minutos
4. Guardar: `Project URL` y `anon public key` (están en Settings → API)

#### Paso 2 — Crear las tablas en Supabase
1. Panel de Supabase → SQL Editor → New Query
2. Pegar y ejecutar el mismo SQL completo del Paso 2 de la Opción A (tablas ventas, leads, gastos, productos + políticas RLS)

#### Paso 3 — Crear cuenta en Vercel (hosting)
1. Ir a [vercel.com](https://vercel.com) → crear cuenta con Gmail del cliente
2. Conectar con GitHub (crear cuenta si no tiene)

#### Paso 4 — Descargar el código base a tu PC

**Primero: instalar Git** (solo la primera vez en cada PC)
- Ir a [git-scm.com](https://git-scm.com) → Download → instalar con opciones por defecto

**Opción rápida — Descarga como ZIP (sin saber código):**
1. Ir a `https://github.com/Rubeler/mision-control`
2. Click en el botón verde **"Code"** → **"Download ZIP"**
3. Descomprimir el ZIP en el escritorio
4. Abrir PowerShell o CMD dentro de esa carpeta → correr `npm install`

**Opción recomendada — Clonar con Git:**
1. Abrir PowerShell o CMD
2. Correr estos comandos uno por uno:
   ```bash
   git clone https://github.com/Rubeler/mision-control.git muebleria-el-pino
   cd muebleria-el-pino
   npm install
   ```
3. Esperar que termine `npm install` (~1-2 minutos)

**Luego, cambiar los textos del cliente** (abrir con Bloc de notas o VS Code):
- `components/layout/Sidebar.tsx` → línea 50: nombre del negocio
- `components/layout/Navbar.tsx` → línea 20: nombre del dueño
- `app/layout.tsx` → `<title>`: nombre del negocio

#### Paso 5 — Deploy en Vercel
1. Vercel → "Add New Project" → importar el repo del cliente desde GitHub
2. En "Environment Variables" agregar solo las de Supabase por ahora:
   ```
   NEXT_PUBLIC_SUPABASE_URL      = [URL del proyecto Supabase]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon key de Supabase]
   ```
3. Clic en Deploy → esperar ~2 minutos
4. URL queda como: `https://[nombre-del-repo].vercel.app`

#### Paso 6 — URL personalizada (opcional)
- Por defecto queda `nombre-del-repo.vercel.app` — funciona y es gratis
- Si el cliente quiere dominio propio (`app.muebleriaxyz.com`): Vercel → Domains → agregar dominio

#### Paso 7 — Carga inicial de datos
1. Entrar a la app con la URL
2. `/productos` → cargar los productos del cliente
3. `/gastos` → cargar los gastos fijos mensuales

#### Paso 8 — Crear la app en Meta Developers
1. Ir a [developers.facebook.com](https://developers.facebook.com) → entrar con el Facebook del cliente (crear cuenta si no tiene)
2. "Create App" → tipo: Business → nombre: "[Negocio] WA Bot"
3. En el dashboard → "Add Products" → buscar WhatsApp → "Set Up"

#### Paso 9 — Configurar el número de WhatsApp
1. En el panel de WhatsApp → "Getting Started"
2. Si tiene número de negocio propio: "Add phone number" → verificar con código SMS
3. Si no tiene número propio: usar el número de prueba de Meta (solo puede enviar a números verificados manualmente)
4. Copiar el **Phone number ID** — lo vas a necesitar en el Paso 12

#### Paso 10 — Generar el token permanente
1. Meta Business Manager → Configuración → Usuarios del sistema → "Agregar"
2. Crear usuario del sistema con rol Admin → asignar la app → asignar el número de WhatsApp
3. Generar token → permisos: `whatsapp_business_messaging` + `whatsapp_business_management`
4. Copiar el token (empieza con EAA...) — **guardarlo bien, solo se muestra una vez**

#### Paso 11 — Configurar el webhook
1. En la app de Meta → WhatsApp → Configuration → Webhook
2. Callback URL: `https://[url-de-vercel].vercel.app/api/whatsapp`
3. Verify Token: inventar una palabra clave (ej: `mitoken2026`) → guardarla
4. Clic en "Verify and Save"
5. Suscribir al campo: `messages`

#### Paso 12 — Agregar las variables de WhatsApp en Vercel
Vercel → Settings → Environment Variables → agregar:
```
WHATSAPP_TOKEN        = [token del Paso 10]
WHATSAPP_PHONE_ID     = [Phone number ID del Paso 9]
WHATSAPP_VERIFY_TOKEN = [palabra clave del Paso 11]
```
Hacer redeploy en Vercel para que tome las nuevas variables.

#### Paso 13 — Probar el bot
1. Desde el celular del cliente → escribir al número configurado
2. El mensaje debe crear un nuevo lead en `/leads` dentro de la app
3. El cliente debe recibir una respuesta automática

**¡Bot funcionando!** Cada consulta de WhatsApp aparece automáticamente en el CRM.

---

## Tiempo estimado de entrega

| Tarea | Tiempo |
|-------|--------|
| Crear Supabase + ejecutar SQL | 20 min |
| Personalizar nombre y textos | 15 min |
| Deploy en Vercel | 15 min |
| Carga inicial de productos y gastos | 20 min |
| **Total SIN bot** | **~1 hora** |
| Configurar Meta Developers | +1 hora |
| Webhook + token + pruebas | +1 hora |
| **Total CON bot** | **~3 horas** |

---

## Tiempo estimado de entrega

| Tarea | Tiempo |
|-------|--------|
| Clonar + instalar dependencias | 10 min |
| Crear Supabase + ejecutar SQL | 20 min |
| Personalizar nombre y colores | 20 min |
| Cargar variables de entorno | 10 min |
| Deploy en Vercel | 10 min |
| **Total sin bot** | **~1 hora** |
| Configurar bot WhatsApp | +2 horas |

---

## Costo de infraestructura para el comprador

| Servicio | Costo |
|---|---|
| Supabase (hasta 500MB / 50k filas) | **Gratis** |
| Vercel (plan Hobby) | **Gratis** |
| Meta WhatsApp API (número de prueba) | **Gratis** |
| Meta WhatsApp API (número propio) | Gratis hasta 1000 conversaciones/mes |
| **Total mensual** | **$0** |

---

## Lo que NO incluye esta versión

- Catálogo digital público para clientes
- Galería de presentación de productos
- Login / autenticación (acceso directo por URL)
- App móvil nativa
- Multi-usuario / roles diferenciados
- Historial de conversaciones de WhatsApp por lead
- Número de WhatsApp propio sin App Review de Meta
