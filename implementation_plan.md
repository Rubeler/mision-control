# Misión Control — 2 Mejoras

Implementación local-first. Solo se sube a producción una vez que Rubén aprueba en local.

---

## Mejora 1 — Módulo de Compras (`/compras`)

### ¿Por qué separado de Control de Stock?

**Control de Stock** = inventario físico actual en el local (cuántas unidades hay).  
**Compras** = registro histórico de órdenes de compra a proveedores (qué se compró, cuándo, a quién y a qué precio).

Son conceptos distintos pero **conectados**: al registrar una compra, el stock del producto sube automáticamente.

### ¿Qué incluye el módulo?

- **Tabla `compras` nueva en Supabase** con los campos:
  - `fecha` (date)
  - `proveedor` (text) — lista sugerida: DBM / Galería Orgánica / Otro
  - `producto` (text) — nombre libre (no requiere estar en el catálogo)
  - `cantidad` (integer)
  - `precio_unitario` (numeric) — costo de compra
  - `total` (calculado: cantidad × precio_unitario)
  - `notas` (text, opcional)

- **Página `/compras`** con:
  - Lista de compras ordenadas por fecha (más reciente primero)
  - Filtro por proveedor y por mes
  - Botón "+ Nueva Compra" → modal con formulario
  - Total invertido en mercadería (KPI card arriba)
  - Exportar a Excel

- **No conecta automáticamente al stock** (por ahora), para mantenerlo simple y evitar errores. Al registrar una compra, el usuario sube el stock manualmente en Control de Stock. Podemos agregar la integración automática en una segunda iteración si lo aprueba.

- **Sidebar**: nuevo ítem "Compras" entre Gastos y Productos, con ícono `ShoppingBag` de lucide-react.

---

## Mejora 2 — Alertas de Gastos Fijos (en Director OS)

### Lógica

Los gastos fijos del local tienen una fecha de vencimiento mensual (ej: Edenor vence el 15, Monotributo el 20). El sistema calcula cuántos días faltan para esa fecha en el **mes actual** y avisa si faltan **3 días o menos**.

### Cambios en Supabase

Agregar columna `dia_vencimiento` (integer, nullable) a la tabla `gastos`.  
Solo aplica a gastos de tipo `'Fijo'`. Los gastos variables lo dejan vacío.

### Cambios en la UI de Gastos (`/gastos`)

- En el modal "Nuevo Gasto" y edición: si `tipo === 'Fijo'`, aparece un campo extra **"¿Qué día del mes vence?"** (número 1-31).
- En la tabla, los gastos fijos con `dia_vencimiento` muestran el día en una columna extra.
- Se puede editar un gasto existente para agregarle el día de vencimiento.

### Alerta visual en Director OS

En la sección **Morning Briefing** (que ya existe), se agrega un bloque de alertas de gastos, similar al bloque de stock crítico que ya existe, con este comportamiento:

- **Rojo (URGENTE)** si vence hoy o mañana (≤1 día)
- **Naranja (PRÓXIMO)** si vence en 2-3 días
- No muestra nada si no hay gastos próximos a vencer

El bloque dice:
```
⚠️ GASTOS FIJOS PRÓXIMOS A VENCER:
🔴 Edenor — vence el 1 Ago (¡mañana!) · $56.000
🟡 Monotributo — vence el 3 Ago (en 3 días) · $37.000
```

---

## Propuesta de Cambios

### [NEW] Tabla `compras` en Supabase (SQL a correr manualmente)
```sql
create table compras (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  proveedor text not null,
  producto text not null,
  cantidad integer not null default 1,
  precio_unitario numeric not null,
  total numeric generated always as (cantidad * precio_unitario) stored,
  notas text,
  created_at timestamptz default now()
);
```

### [NEW] Columna `dia_vencimiento` en tabla `gastos` (SQL a correr manualmente)
```sql
alter table gastos add column if not exists dia_vencimiento integer;
```

---

## Archivos a modificar / crear

### Mejora 1 — Compras

#### [NEW] `app/compras/page.tsx`
Página completa del módulo de compras.

#### [MODIFY] `components/layout/Sidebar.tsx`
Agregar ítem `{ href: '/compras', label: 'Compras', icon: ShoppingBag }` entre Gastos y Productos.

---

### Mejora 2 — Alertas Gastos Fijos

#### [MODIFY] `app/gastos/page.tsx`
- Agregar campo `dia_vencimiento` al interface `Gasto`
- En el formulario modal: mostrar input de día cuando `tipo === 'Fijo'`
- Incluir `dia_vencimiento` al guardar/actualizar en Supabase
- Agregar columna "Vence" en la tabla (solo visible para Fijos)

#### [MODIFY] `app/director/page.tsx`
- Agregar lógica de cálculo: para cada gasto Fijo con `dia_vencimiento`, calcular días hasta vencimiento en el mes actual
- Agregar bloque visual de alertas en Morning Briefing (igual estilo que las alertas de stock)

---

## Orden de implementación

1. Correr los 2 SQLs en Supabase (vos los corrés manualmente o los corro yo si me das acceso)
2. Implementar Mejora 2 (gastos + director) — sin tocar Sidebar
3. Implementar Mejora 1 (compras + sidebar)
4. Probar en local
5. Si aprobás → commit + push a Vercel

---

## Verificación

- [ ] `/compras` carga sin errores, se puede crear una compra, aparece en la lista
- [ ] El sidebar muestra el nuevo ítem "Compras"
- [ ] Al agregar un gasto Fijo se puede ingresar el día de vencimiento
- [ ] En Director OS el bloque de alertas aparece cuando hay gastos con vencimiento en ≤3 días
- [ ] No aparece el bloque si no hay vencimientos próximos
- [ ] Build sin errores TypeScript
