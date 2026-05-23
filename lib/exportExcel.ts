import * as XLSX from 'xlsx'

export function exportarExcel(sheets: { nombre: string; datos: Record<string, unknown>[] }[], archivo: string) {
  const wb = XLSX.utils.book_new()
  sheets.forEach(({ nombre, datos }) => {
    const ws = XLSX.utils.json_to_sheet(datos)
    XLSX.utils.book_append_sheet(wb, ws, nombre)
  })
  XLSX.writeFile(wb, `${archivo}.xlsx`)
}
