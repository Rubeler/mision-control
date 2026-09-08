import { SchemaType, type FunctionDeclaration, type Schema } from '@google/generative-ai'
import type { SupabaseClient } from '@supabase/supabase-js'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'Mayo', 'Junio', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const mesEnum: Schema = { type: SchemaType.STRING, description: `Mes a filtrar (${MESES.join(', ')}). Omitir para traer todos los meses.` }
const limiteParam: Schema = { type: SchemaType.NUMBER, description: 'Cantidad de productos a devolver (por defecto 5)' }

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'resumen_ventas',
    description: 'Totales y desglose de ventas: monto vendido, cantidad, ticket promedio, margen, utilidad bruta y ventas por canal (Presencial/WhatsApp/IG). Filtra por mes si se indica.',
    parameters: { type: SchemaType.OBJECT, properties: { mes: mesEnum } },
  },
  {
    name: 'resumen_gastos',
    description: 'Totales y desglose de gastos: fijos vs variables, por categoría, y gastos fijos pendientes de pago con su día de vencimiento. Filtra por mes si se indica.',
    parameters: { type: SchemaType.OBJECT, properties: { mes: mesEnum } },
  },
  {
    name: 'top_productos',
    description: 'Los productos más vendidos por monto, con cantidad de ventas y margen promedio de cada uno. Filtra por mes si se indica.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        mes: mesEnum,
        limite: limiteParam,
      },
    },
  },
  {
    name: 'resumen_leads',
    description: 'Estado del pipeline de leads: cantidad por estado (Nuevo/Seguimiento/Ganado/Perdido), tasa de conversión y desglose por canal.',
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: 'resumen_stock',
    description: 'Estado del inventario: unidades totales, productos agotados, y cuáles tienen alerta crítica activada.',
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
]

type Args = Record<string, unknown>

async function resumenVentas(supabase: SupabaseClient, { mes }: Args) {
  let q = supabase.from('ventas').select('mes, producto, precio_venta, margen_pct, utilidad_bruta, canal')
  if (typeof mes === 'string') q = q.eq('mes', mes)
  const { data, error } = await q
  if (error) return { error: error.message }
  const v = data || []
  const totalVendido = v.reduce((s, x) => s + (x.precio_venta || 0), 0)
  const cantidad = v.length
  const porCanal: Record<string, number> = {}
  v.forEach(x => { const c = x.canal || 'Sin canal'; porCanal[c] = (porCanal[c] || 0) + (x.precio_venta || 0) })
  return {
    mes: mes ?? 'todos',
    totalVendido,
    cantidadVentas: cantidad,
    ticketPromedio: cantidad ? totalVendido / cantidad : 0,
    margenPromedioPct: cantidad ? (v.reduce((s, x) => s + (x.margen_pct || 0), 0) / cantidad) * 100 : 0,
    utilidadBruta: v.reduce((s, x) => s + (x.utilidad_bruta || 0), 0),
    ventasPorCanal: porCanal,
  }
}

async function resumenGastos(supabase: SupabaseClient, { mes }: Args) {
  let q = supabase.from('gastos').select('mes, tipo, categoria, monto, pagado, dia_vencimiento')
  if (typeof mes === 'string') q = q.eq('mes', mes)
  const { data, error } = await q
  if (error) return { error: error.message }
  const g = data || []
  const porCategoria: Record<string, number> = {}
  g.forEach(x => { porCategoria[x.categoria] = (porCategoria[x.categoria] || 0) + (x.monto || 0) })
  const pendientes = g
    .filter(x => x.tipo === 'Fijo' && !x.pagado && x.dia_vencimiento != null)
    .map(x => ({ categoria: x.categoria, monto: x.monto, diaVencimiento: x.dia_vencimiento }))
  return {
    mes: mes ?? 'todos',
    total: g.reduce((s, x) => s + (x.monto || 0), 0),
    fijos: g.filter(x => x.tipo === 'Fijo').reduce((s, x) => s + (x.monto || 0), 0),
    variables: g.filter(x => x.tipo === 'Variable').reduce((s, x) => s + (x.monto || 0), 0),
    porCategoria,
    fijosPendientesDePago: pendientes,
  }
}

async function topProductos(supabase: SupabaseClient, { mes, limite }: Args) {
  let q = supabase.from('ventas').select('mes, producto, precio_venta, margen_pct')
  if (typeof mes === 'string') q = q.eq('mes', mes)
  const { data, error } = await q
  if (error) return { error: error.message }
  const map: Record<string, { total: number; count: number; margen: number }> = {}
  ;(data || []).forEach(x => {
    if (!x.producto) return
    const key = x.producto.trim()
    if (!map[key]) map[key] = { total: 0, count: 0, margen: 0 }
    map[key].total += x.precio_venta || 0
    map[key].count += 1
    map[key].margen += x.margen_pct || 0
  })
  const n = typeof limite === 'number' && limite > 0 ? limite : 5
  const productos = Object.entries(map)
    .map(([producto, v]) => ({ producto, totalVendido: v.total, cantidadVentas: v.count, margenPromedioPct: (v.margen / v.count) * 100 }))
    .sort((a, b) => b.totalVendido - a.totalVendido)
    .slice(0, n)
  return { mes: mes ?? 'todos', productos }
}

async function resumenLeads(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('leads').select('estado, canal')
  if (error) return { error: error.message }
  const l = data || []
  const porEstado: Record<string, number> = {}
  const porCanal: Record<string, number> = {}
  l.forEach(x => {
    porEstado[x.estado] = (porEstado[x.estado] || 0) + 1
    porCanal[x.canal || 'Sin canal'] = (porCanal[x.canal || 'Sin canal'] || 0) + 1
  })
  const total = l.length
  const ganados = porEstado['Ganado'] || 0
  return {
    totalLeads: total,
    porEstado,
    porCanal,
    tasaConversionPct: total ? (ganados / total) * 100 : 0,
  }
}

async function resumenStock(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('productos').select('producto, stock, alerta_critica, categoria')
  if (error) return { error: error.message }
  const p = data || []
  const agotados = p.filter(x => (x.stock ?? 0) === 0)
  return {
    totalArticulos: p.length,
    unidadesTotales: p.reduce((s, x) => s + (x.stock ?? 0), 0),
    agotados: agotados.length,
    alertaCriticaAgotados: agotados.filter(x => x.alerta_critica).map(x => x.producto),
  }
}

export function createAsistenteTools(supabase: SupabaseClient) {
  const impl: Record<string, (args: Args) => Promise<unknown>> = {
    resumen_ventas: (args) => resumenVentas(supabase, args),
    resumen_gastos: (args) => resumenGastos(supabase, args),
    top_productos: (args) => topProductos(supabase, args),
    resumen_leads: () => resumenLeads(supabase),
    resumen_stock: () => resumenStock(supabase),
  }
  return async function ejecutarTool(name: string, args: Args) {
    const fn = impl[name]
    if (!fn) return { error: `Herramienta desconocida: ${name}` }
    try {
      return await fn(args)
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error consultando los datos' }
    }
  }
}
