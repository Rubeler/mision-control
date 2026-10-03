-- Vincula cada compra a un artículo real de Control de Stock (tabla productos),
-- para poder sumarle stock automáticamente al registrar la compra en vez de
-- copiar y pegar a mano. Nullable: las compras históricas quedan sin vínculo
-- y no se tocan.
alter table compras
  add column if not exists producto_id uuid references productos(id) on delete set null;

create index if not exists compras_producto_id_idx on compras(producto_id);
