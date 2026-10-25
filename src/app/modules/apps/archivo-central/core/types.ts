export type ModoArchivo = 'auditoria' | 'gestion'
export interface ApiResponse<T> {
  status: 'success' | 'error'
  data: T | null
  message: string
  timestamp: string
}
export interface Pagina<T> {
  data: T[]
  pagination: {page: number; items_per_page: number; total: number}
}
export interface Administrativo {
  persona_id: number
  ci: string
  expedido: string
  nombre: string
  paterno: string
  materno: string | null
  apellido_de_casado: string | null
  nombre_completo: string
  tiene_expediente: boolean
  codigo_archivo: number | null
  cantidad_documentos: number
}
export interface Expediente {
  persona: Administrativo
  codigo_archivo: number
  fecha_registro: string | null
  cantidad_documentos: number
}
export interface Documento {
  id: number
  persona_id: number
  documento_id: number
  categoria_id: number | null
  nombre: string | null
  categoria: string | null
  tipo: 'FOTOCOPIA' | 'FOTOCOPIA-LEGALIZADA' | 'ORIGINAL' | null
  fecha_inicio: string | null
  fecha_fin: string | null
  descripcion: string | null
  fecha_registro: string | null
  archivo: {estado: 'sin_archivo' | 'historico_pendiente' | 'disponible' | 'no_disponible'}
}
export interface Categoria {
  id: number
  nombre: string | null
  descripcion: string | null
  orden: number | null
  habilitado: boolean
}
export interface Catalogos {
  categorias: Categoria[]
  documentos: Array<Categoria & {categoria_id: number}>
  acceso: {puede_consultar: boolean; puede_gestionar: boolean; escrituras_habilitadas: boolean}
}
export interface BusquedaAdministrativos {
  search: string
  codigo_archivo?: string
  page: number
  limit: number
  sort: 'nombre' | 'ci' | 'codigo_archivo'
  order: 'asc' | 'desc'
}
export interface BusquedaDocumentos {
  page: number
  limit: number
  search: string
  categoria_id?: number
  sort: 'nombre' | 'fecha_registro' | 'fecha_inicio' | 'fecha_fin'
  order: 'asc' | 'desc'
}
