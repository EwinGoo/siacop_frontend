import {ID, PaginationState} from '../../../../../../../../_metronic/helpers'

export type GrupoMiembro = {
  id_guardia_grupo_miembro?: ID
  id_guardia_grupo?: number
  id_persona?: number
  id_guardia_bloque?: number | null
  ci?: string
  nombre?: string
  paterno?: string
  materno?: string
  nombre_completo?: string
  nombre_bloque?: string | null
}

export type Grupo = {
  id_guardia_grupo?: ID
  nombre?: string
  descripcion?: string | null
  orden?: number
  total_miembros?: number
  miembros?: GrupoMiembro[]
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export type GrupoQueryResponse = {
  data?: Grupo[]
  payload?: {
    message?: string
    pagination?: PaginationState
  }
}

export const initialGrupo: Grupo = {
  nombre: '',
  descripcion: '',
  orden: 1,
}
