import {ID, Response, PaginationState} from 'src/_metronic/helpers'
import {Dispatch, SetStateAction} from 'react'

export type EstadoType = 'GENERADO' | 'ENVIADO' | 'RECEPCIONADO' | 'APROBADO' | 'OBSERVADO'
export type ComisionViewMode = 'table' | 'cards'

export type Comision = {
  id_comision?: ID | undefined
  id_temporal?: string
  id_asignacion_administrativo?: number | null
  id_usuario_generador?: number | null
  id_usuario_aprobador?: number | null
  fecha_comision: string
  fecha_comision_fin?: string
  hora_salida: string
  hora_retorno: string
  descripcion_comision?: string
  recorrido_de?: string
  recorrido_a?: string
  estado_boleta_comision: EstadoType
  id_tipo_permiso?: ID
  tipo_comision?: string
  tipo_documento?: string
  nro_correlativo?: number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  id_historico?: number | null
  nombre_generador?: string | null
  nombre_cargo?: string | null
  observacion?: string | null
  ci?: string | null
  unidad: string | null
  hash: string | undefined
  tipo_personal?: string | null
  id_caja_salud_sucursal?: ID
}

export type SucursalCajaSalud = {
  id_caja_salud_sucursal: ID
  nombre_sucursal: string
}

// Respuesta del Backend para Comisiones
export type ComisionBackendResponse = {
  status: number
  error: boolean
  message: string
  data: Comision[] // Array de comisiones
  pagination?: PaginationState
}

// Tipo genérico para respuestas del backend
export type BackendResponse<T> = {
  status: number
  error: boolean
  message: string
  data: T
}
export type ApiResponse = {
  status: number
  error: boolean
  message: string
  data: boolean
}

// Tipo específico para el endpoint de comisiones
export type EnrichmentMeta = {
  enrichment_failed: boolean
  message: string
}

export type ComisionesBackendData = {
  data: Comision[]
  payload?: {
    pagination?: PaginationState
    errors?: Record<string, string[]>
  }
  meta?: EnrichmentMeta
}

type AutocompleteItem = {
  id: number
  valor: string
  texto: string
  tipo: string
  id_asignacion_administrativo?: number
}

export type AutocompleteResponse = {
  type_respond: 'query' | 'cache'
  sugerencias: AutocompleteItem[]
  tiempo_respuesta: number
}

// Respuesta del Frontend (Query)
export type ComisionQueryResponse = {
  data?: Comision[]
  payload?: {
    message?: string
    errors?: Record<string, string[]>
    pagination?: PaginationState
  }
  warning?: string
}

// Valores iniciales para un formulario de Comisión
export const initialComision: Comision = {
  id_asignacion_administrativo: null,
  id_usuario_generador: null,
  id_usuario_aprobador: null,
  fecha_comision: new Date().toISOString().split('T')[0], // Fecha actual (YYYY-MM-DD)
  fecha_comision_fin: new Date().toISOString().split('T')[0], // Fecha actual (YYYY-MM-DD)
  hora_salida: '08:30',
  hora_retorno: '12:30',
  descripcion_comision: '',
  // descripcion_comision: '',
  recorrido_de: 'CASA MATRIZ UPEA',
  // recorrido_a: '',
  recorrido_a: '',
  estado_boleta_comision: 'GENERADO',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  id_historico: null,
  observacion: null,
  unidad: null,
  hash: undefined,
}
// export const initialComision: Comision = {
//   id_asignacion_administrativo: null,
//   id_usuario_generador: null,
//   id_usuario_aprobador: null,
//   fecha_comision: new Date().toISOString().split('T')[0], // Fecha actual (YYYY-MM-DD)
//   hora_salida: '08:30',
//   hora_retorno: '12:30',
//   descripcion_comision: 'descripcion',
//   // descripcion_comision: '',
//   recorrido_de: 'CASA MATRIZ UPEA',
//   // recorrido_a: '',
//   recorrido_a: 'umsa',
//   estado_boleta_comision: 'GENERADO',
//   created_at: new Date().toISOString(),
//   updated_at: new Date().toISOString(),
//   deleted_at: null,
//   id_historico: null,
//   observacion: null,
//   unidad: null,
//   hash: undefined,
// }

export interface ProcesarComisionParams {
  code: ID
  action: 'send' | 'approve' | 'observe' | 'receive'
  observacion?: string
  fecha?: string
}

export type ComisionPDFData = {
  blob: Blob
  filename: string
  title?: string
}

export type ReporteGeneralComisionParams = {
  fechaInicio: string
  fechaFin: string
  estado: string
  tipoComision: string
}

export type ListViewContextProps = {
  selected: Array<ID>
  onSelect: (selectedId: ID) => void
  onSelectAll: () => void
  clearSelected: () => void

  // NULL => (CREATION MODE) | MODAL IS OPENED
  // NUMBER => (EDIT MODE) | MODAL IS OPENED
  // UNDEFINED => MODAL IS CLOSED
  itemIdForUpdate?: ID
  setItemIdForUpdate: Dispatch<SetStateAction<ID>>
  isAllSelected: boolean
  disabled: boolean
  isShow: boolean // Tipo explícito para isShow
  setIsShow: Dispatch<SetStateAction<boolean>> // Make sure this is included
  accion?: 'editar' | 'aprobar' | 'observar' | 'report' | 'ver'
  setAccion: Dispatch<
    SetStateAction<'editar' | 'aprobar' | 'observar' | 'report' | 'ver' | undefined>
  >
  viewMode: ComisionViewMode
  setViewMode: Dispatch<SetStateAction<ComisionViewMode>>
  isMobileViewport: boolean
}

export const initialListView: ListViewContextProps = {
  selected: [],
  onSelect: () => {},
  onSelectAll: () => {},
  clearSelected: () => {},
  setItemIdForUpdate: () => {},
  isAllSelected: false,
  disabled: false,
  isShow: false, // Make sure this is included
  setIsShow: () => {}, // Make sure this is included
  accion: undefined,
  setAccion: () => {},
  viewMode: 'table',
  setViewMode: () => {},
  isMobileViewport: false,
}

export const estadoOptions = [
  {value: 'TODO', label: 'Todo'},
  {value: 'GENERADO', label: 'Generado'},
  {value: 'ENVIADO', label: 'Enviado'},
  {value: 'RECEPCIONADO', label: 'Recepcionado'},
  {value: 'APROBADO', label: 'Aprobado'},
  {value: 'OBSERVADO', label: 'Observado'},
]
