import {ID, PaginationState} from '../../../../../../../../_metronic/helpers'

export type Bloque = {
  id_guardia_bloque?: ID
  nombre?: string
  descripcion?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export type BloqueBackendData = {
  data: Bloque[]
  payload?: {
    pagination?: PaginationState
  }
}

export type BloqueQueryResponse = {
  data?: Bloque[]
  payload?: {
    message?: string
    pagination?: PaginationState
  }
}

export const initialBloque: Bloque = {
  nombre: '',
  descripcion: '',
}
