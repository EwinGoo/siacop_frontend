import {Dispatch, SetStateAction} from 'react'
import {ID, PaginationState} from 'src/_metronic/helpers'

export type EstadoType = 'GENERADO' | 'ENVIADO' | 'RECEPCIONADO' | 'APROBADO' | 'OBSERVADO'

export type AsistenciaPermiso = {
  id_asistencia_permiso: ID
  id_temporal?: string
  id_persona?: ID
  id_tipo_permiso: number | null
  id_usuario_generador?: number | null
  id_usuario_aprobador?: number | null
  nombre_generador?: string | null
  estado_permiso: EstadoType
  nro_correlativo?: number
  hoja_ruta: string
  fecha_inicio_permiso: string // Date en formato ISO
  fecha_fin_permiso: string // Date en formato ISO
  detalle_permiso: string
  tipo_permiso_nombre?: string
  turno_permiso?: 'TARDE' | 'MAÑANA'
  tipo_documento?: string
  tipo_personal?: string
  observacion?: string
  id_multimedia?: number | null
  archivo_adjunto?: MultimediaFile | null
  ci?: string
  created_at?: string | null
  hash?: string
  unidad?: string | null
  nombre_cargo?: string
}

export type PermisoPDFData = {
  blob: Blob
  filename: string
  title?: string
}

// Tipo para el archivo multimedia
export type MultimediaFile = {
  id_multimedia: number
  nombre_archivo: string
  ruta_archivo: string
  size: number
  tipo_archivo: string
  extension: string
  url: string
  descripcion?: string
  created_at: string
}

// Respuesta del upload de multimedia
export type MultimediaUploadResponse = {
  success: boolean
  message: string
  data: {
    id_multimedia: number
    filename: string
    original_name: string
    mime_type: string
    size: number
    extension: string
    path: string
    url: string
    tipo_relacion: string
    descripcion: string
    created_at: string
  }
}

export type BackendResponse<T> = {
  status: number
  error: boolean
  message: string
  data: T
}

// Respuesta del Backend para AsistenciaPermiso
export type AsistenciaPermisoBackendResponse = {
  status: number
  error: boolean
  message: string
  data: AsistenciaPermiso[]
  pagination?: PaginationState
}

// Tipo específico para el endpoint de asistencias/permisos
export type EnrichmentMeta = {
  enrichment_failed: boolean
  message: string
}

export type AsistenciaPermisoBackendData = {
  data: AsistenciaPermiso[]
  payload?: {
    pagination?: PaginationState
    errors?: Record<string, string[]>
  }
  meta?: EnrichmentMeta
}

export type AsistenciaPermisoQueryResponse = {
  data?: AsistenciaPermiso[]
  payload?: {
    message?: string
    errors?: Record<string, string[]>
    pagination?: PaginationState
  }
  warning?: string
}

export type AsistenciaTipoPermisoQueryResponseData = {
  id: number
  nombre: string
}

type AutocompleteItem = {
  id: number
  valor: string
  texto: string
  tipo: string
  id_persona?: number
}

export type AutocompleteResponse = {
  type_respond: 'query' | 'cache'
  sugerencias: AutocompleteItem[]
  data: AutocompleteItem[]
  tiempo_respuesta: number
}

// Valores iniciales para un formulario de AsistenciaPermiso
export const initialAsistenciaPermiso: AsistenciaPermiso = {
  id_asistencia_permiso: undefined,
  id_persona: null,
  id_tipo_permiso: null,
  id_usuario_generador: null,
  id_usuario_aprobador: null,
  // numero_documento: null,
  estado_permiso: 'GENERADO',
  hoja_ruta: '',
  // numero_documento: '',
  fecha_inicio_permiso: new Date().toISOString().split('T')[0],
  fecha_fin_permiso: new Date().toISOString().split('T')[0],
  detalle_permiso: '',
  id_multimedia: null,
  archivo_adjunto: null,
}

export interface ApiResponse<T> {
  status: number
  error: boolean
  message: string
  data: T
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
  setAccion: Dispatch<SetStateAction<'editar' | 'aprobar' | 'observar' | 'report' | 'ver' | undefined>>
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
}

export interface ProcesarComisionParams {
  code: ID
  action: 'send' | 'approve' | 'observe' | 'receive'
  observacion?: string
  fecha?: string
}
