export const ventasMensuales = [
  { mes: 'Ene', ventas: 3496416, gastos: 2117170, utilidad: 1379246 },
  { mes: 'Feb', ventas: 251900,  gastos: 1780300, utilidad: -1528400 },
  { mes: 'Mar', ventas: 186625,  gastos: 1578350, utilidad: -1391725 },
  { mes: 'Abr', ventas: 320900,  gastos: 735400,  utilidad: -414500 },
  { mes: 'May', ventas: 509000,  gastos: 589400,  utilidad: -80400 },
  { mes: 'Jun', ventas: 320900,  gastos: 735400,  utilidad: -414500 },
]

export const ventasCanal = [
  { canal: 'Presencial', valor: 5200000, color: '#00FFFF' },
  { canal: 'WhatsApp',   valor: 1900000, color: '#39FF14' },
  { canal: 'IG',         valor: 920000,  color: '#BB86FC' },
]

export const topProductos = [
  { producto: 'Alacena a medida x4', ventas: 640000, margen: 75 },
  { producto: 'Combo Bajo 1.20 + alacena', ventas: 400000, margen: 55 },
  { producto: 'Ropero 1.20 corredizo', ventas: 270000, margen: 70 },
  { producto: '3 módulos interiores', ventas: 340000, margen: 65 },
  { producto: 'Cuna funcional', ventas: 320000, margen: 56 },
]

export const ventas = [
  { fecha: '02/01/2026', mes: 'Ene', producto: 'Banco escalera',      precio: 32000,  margen: 58.5, canal: '' },
  { fecha: '03/01/2026', mes: 'Ene', producto: 'Estanterías 60 cm',   precio: 70000,  margen: 68.6, canal: '' },
  { fecha: '05/01/2026', mes: 'Ene', producto: 'Silla infantil',       precio: 20000,  margen: 60.0, canal: '' },
  { fecha: '01/05/2026', mes: 'May', producto: 'Cuna funcional',       precio: 320000, margen: 56.3, canal: 'WhatsApp' },
  { fecha: '04/05/2026', mes: 'May', producto: 'Bajo mesada 2,00',     precio: 189000, margen: 51.3, canal: 'Presencial' },
  { fecha: '05/05/2026', mes: 'May', producto: 'Estantería a medida',  precio: 110000, margen: 72.7, canal: 'WhatsApp' },
  { fecha: '06/05/2026', mes: 'May', producto: 'Despensero 80 + Cómoda 1,60', precio: 400000, margen: 67.5, canal: 'Presencial' },
  { fecha: '13/05/2026', mes: 'May', producto: 'Ropero 1.20',          precio: 195000, margen: 56.9, canal: 'IG' },
  { fecha: '15/05/2026', mes: 'May', producto: '6 sillas coloniales',  precio: 132000, margen: 61.4, canal: 'Presencial' },
  { fecha: '19/05/2026', mes: 'May', producto: 'Vestidor 1.20m',       precio: 170000, margen: 62.9, canal: 'Presencial' },
  { fecha: '20/05/2026', mes: 'May', producto: 'Sillón pino macizo',   precio: 160000, margen: 53.8, canal: 'Presencial' },
  { fecha: '21/05/2026', mes: 'May', producto: 'Mesa quesera 60cm',    precio: 40000,  margen: 52.5, canal: 'Presencial' },
]

export const leads = [
  { fecha: '10/05/2026', canal: 'IG',        producto: 'Cocina a medida',  estado: 'Nuevo',       motivo: '' },
  { fecha: '12/05/2026', canal: 'WhatsApp',  producto: 'Ropero 1.60',      estado: 'Seguimiento', motivo: '' },
  { fecha: '14/05/2026', canal: 'Presencial',producto: 'Cama 2 plazas',    estado: 'Ganado',      motivo: '' },
  { fecha: '15/05/2026', canal: 'IG',        producto: 'Mesa comedor',     estado: 'Perdido',     motivo: 'Precio' },
  { fecha: '18/05/2026', canal: 'WhatsApp',  producto: 'Biblioteca 1m',    estado: 'Seguimiento', motivo: '' },
  { fecha: '20/05/2026', canal: 'Presencial',producto: 'Vestidor doble',   estado: 'Nuevo',       motivo: '' },
]

export const gastos = [
  { mes: 'Ene', tipo: 'Fijo',     categoria: 'Sueldo',          monto: 1000000 },
  { mes: 'Ene', tipo: 'Fijo',     categoria: 'Seguro negocio',  monto: 155000 },
  { mes: 'Ene', tipo: 'Fijo',     categoria: 'Edenor',          monto: 56000 },
  { mes: 'Ene', tipo: 'Fijo',     categoria: 'Contador',        monto: 48000 },
  { mes: 'Ene', tipo: 'Variable', categoria: 'Mecánico',        monto: 170000 },
  { mes: 'Feb', tipo: 'Fijo',     categoria: 'Sueldo',          monto: 1000000 },
  { mes: 'Feb', tipo: 'Fijo',     categoria: 'Seguro negocio',  monto: 155000 },
  { mes: 'Feb', tipo: 'Fijo',     categoria: 'Edenor',          monto: 157000 },
  { mes: 'May', tipo: 'Fijo',     categoria: 'Monotributo',     monto: 47000 },
  { mes: 'May', tipo: 'Fijo',     categoria: 'Edenor',          monto: 160000 },
  { mes: 'May', tipo: 'Fijo',     categoria: 'Contador',        monto: 62000 },
]

export const productos = [
  { producto: 'Alacena 60cm',          costo: 32000,  precio: 70000,  margen: 54.3 },
  { producto: 'Alacena 80cm',          costo: 33000,  precio: 70000,  margen: 52.9 },
  { producto: 'Alacena 1,20cm',        costo: 41000,  precio: 89000,  margen: 53.9 },
  { producto: 'Bajomesada 1,20',       costo: 64000,  precio: 128000, margen: 50.0 },
  { producto: 'Bajomesada 1,60',       costo: 80000,  precio: 169000, margen: 52.7 },
  { producto: 'Cama 1 plaza',          costo: 26000,  precio: 69000,  margen: 62.3 },
  { producto: 'Cama 2 plazas',         costo: 38000,  precio: 100000, margen: 62.0 },
  { producto: 'Cama superpuesta',      costo: 55000,  precio: 120000, margen: 54.2 },
  { producto: 'Chifo 80 2+4',          costo: 52000,  precio: 110000, margen: 52.7 },
  { producto: 'Cuna funcional',        costo: 140000, precio: 320000, margen: 56.3 },
  { producto: 'Despensero 80',         costo: 73000,  precio: 150000, margen: 51.3 },
  { producto: 'Escritorio 1m 4 caj',   costo: 37000,  precio: 120000, margen: 69.2 },
  { producto: 'Estanterías 60 cm',     costo: 22000,  precio: 70000,  margen: 68.6 },
  { producto: 'Mesa quesera 60cm',     costo: 19000,  precio: 79000,  margen: 75.9 },
  { producto: 'Ropero 1.20',           costo: 84000,  precio: 189000, margen: 55.6 },
  { producto: 'Ropero 1.60',           costo: 134000, precio: 280000, margen: 52.1 },
  { producto: 'Silla colonial',        costo: 8500,   precio: 20000,  margen: 57.5 },
  { producto: 'Vestidor macizo 1.20',  costo: 63000,  precio: 150000, margen: 58.0 },
]
