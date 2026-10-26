export const codigoArchivo = (codigo: number | null) =>
  codigo === null ? 'Sin expediente' : String(codigo).padStart(6, '0')
// Evita convertir fechas civiles a UTC y desplazar el día según el navegador.
export const fechaDocumento = (fecha: string | null) => {
  if (!fecha) return 'Sin dato'
  const match = /^(\d{4})-(\d{2})-(\d{2})(.*)$/.exec(fecha)
  return match
    ? `${match[3]}/${match[2]}/${match[1]}${match[4] ? ' ' + match[4].replace('T', '').trim() : ''}`
    : fecha
}
