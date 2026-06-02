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

## Cómo replicar para un nuevo cliente

### Paso 1 — Clonar el repo
```bash
git clone https://github.com/[repo]/mision-control.git nuevo-cliente
cd nuevo-cliente
npm install
```

### Paso 2 — Nuevo Supabase
1. Crear proyecto en supabase.com (gratis)
2. Ejecutar los 4 `CREATE TABLE` de arriba en el SQL Editor
3. Aplicar las políticas RLS
4. Copiar URL y anon key

### Paso 3 — Personalizar (5 cambios)
```
components/layout/Sidebar.tsx  → línea 50: nombre del negocio
components/layout/Navbar.tsx   → línea 20: nombre del dueño
app/layout.tsx                 → <title>: nombre del negocio
tailwind.config.ts             → colores hex si se quiere otro tema
```

### Paso 4 — Variables de entorno
Crear `.env.local` con los datos del nuevo Supabase + WhatsApp si aplica.

### Paso 5 — Deploy
```bash
git remote set-url origin https://github.com/[nuevo-repo].git
git push origin master
```
Conectar en Vercel → cargar env vars → listo.

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
