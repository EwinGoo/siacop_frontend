import {ID, Response, PaginationState} from '../../../../../../../_metronic/helpers'
export type TipoViatico = 'con_viatico' | 'sin_viatico'

export type DeclaratoriaComision = {
  id_declaratoria_comision?: ID
  id_asignacion_administrativo: number | null
  id_usuario: number | null
  id_unidad_sede: number | null
  fecha_elaboracion?: string
  nota_interna: string | null
  nro_correlativo?: number
  rrhh_hoja_ruta_numero?: string
  rrhh_hoja_ruta_fecha?: string
  tipo_viatico: boolean | TipoViatico
  fecha_inicio?: string
  fecha_fin?: string
  destino?: string
  motivo?: string
  estado: string
  nombre_generador?: string | null
  ci?: string | null
  hash?: string
  descripcion_cua?: string
  correlativo?: string
  created_at?: string
  updated_at?: string | null;
}

export type DataPayload = Omit<DeclaratoriaComision, 'tipo_viatico'> & {
  tipo_viatico: string
}

export type DeclaratoriaComisionBackendResponse = {
  status: number
  error: boolean
  message: string
  data: DeclaratoriaComision[] // Array de declaratorias
  pagination?: PaginationState
}

export type BackendResponse<T> = {
  status: number
  error: boolean
  message: string
  data: T
}

export type EnrichmentMeta = {
  enrichment_failed: boolean
  message: string
}

export type DeclaratoriasComisionBackendData = {
  data: DeclaratoriaComision[]
  payload?: {
    pagination?: PaginationState
    errors?: Record<string, string[]>
  }
  meta?: EnrichmentMeta
}

export type DeclaratoriaComisionQueryResponse = {
  data?: DeclaratoriaComision[]
  payload?: {
    message?: string
    errors?: Record<string, string[]>
    pagination?: PaginationState
  }
  warning?: string
}
export interface PDFResponse {
  pdf_base64: string;
  filename: string;
  mime_type: string;
}

export type Unidad ={
  id_tipo_unidad: ID
  unidad: string
}

export const initialDeclaratoriaComision: DeclaratoriaComision = {
  id_asignacion_administrativo: null,
  id_usuario: null,
  id_unidad_sede: null,
  fecha_elaboracion: new Date().toISOString().split('T')[0], // Fecha actual (YYYY-MM-DD)
  nota_interna: '',
  rrhh_hoja_ruta_numero: '',
  rrhh_hoja_ruta_fecha: new Date().toISOString().split('T')[0],
  tipo_viatico: false,
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: new Date().toISOString().split('T')[0],
  destino: '',
  motivo: '',
  estado: 'GENERADO',
}

// export const initialDeclaratoriaComision: DeclaratoriaComision = {
//   id_asignacion_administrativo: 12068,
//   id_usuario: null,
//   estado: 'GENERADO',
//   id_unidad_sede: null,
//   fecha_elaboracion: new Date().toISOString().split('T')[0],
//   nota_interna: '1234',
//   rrhh_hoja_ruta_numero: '1234',
//   rrhh_hoja_ruta_fecha: new Date().toISOString().split('T')[0],
//   tipo_viatico: false,
//   fecha_inicio: new Date().toISOString().split('T')[0],
//   fecha_fin: new Date().toISOString().split('T')[0],
//   destino: 'UMSA',
//   motivo: 'Congreso de universidades',
// }

export type DeclaratoriaComisionPDFData = {
  blob: Blob
  filename: string
  title?: string
}

export type ReporteGeneralDeclaratoriaParams = {
  fechaInicio: string
  fechaFin: string
  estado: string
  tipoViatico: string
}