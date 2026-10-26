export type Pagination = {
  page: number
  items_per_page: number
  total: number
}

export type ListResponse<T> = {
  data: T[]
  pagination: Pagination
}

export type HorarioTipo = {
  id_horario_tipo?: number
  nombre_horario_tipo: string
  descripcion_horario_tipo?: string | null
  estado_horario_tipo?: number | boolean
  fecha_creacion_horario_tipo?: string | null
  total_funcionarios_asignados?: number
}

export type Horario = {
  id_horario?: number
  id_horario_tipo: number | ''
  nombre_horario_tipo?: string | null
  hora_inicio: string
  hora_fin: string
  descripcion_horario?: string | null
  estado_horario?: number | boolean
  fecha_creacion_horario?: string | null
}

export type HorarioBase = {
  id_horario: number
  id_horario_tipo: number
  nombre_horario_tipo?: string | null
  hora_inicio?: string | null
  hora_fin?: string | null
  descripcion_horario?: string | null
  estado_horario?: number | boolean
}

export type HorarioAlterno = {
  id_horario_alterno?: number
  id_horario: number | ''
  id_horario_tipo?: number | null
  nombre_horario_tipo?: string | null
  fecha_inicio_horario_alterno: string
  fecha_fin_horario_alterno: string
  hora_inicio_alterno: string
  hora_fin_alterno: string
  descripcion_horario_alterno?: string | null
  estado_horario_alterno?: number | boolean
  hora_inicio?: string | null
  hora_fin?: string | null
  descripcion_horario?: string | null
  fecha_creacion_horario_alterno?: string | null
}

export const initialHorarioTipo: HorarioTipo = {
  nombre_horario_tipo: '',
  descripcion_horario_tipo: '',
  estado_horario_tipo: true,
}

export const initialHorario: Horario = {
  id_horario_tipo: '',
  hora_inicio: '',
  hora_fin: '',
  descripcion_horario: '',
  estado_horario: true,
}

export const initialHorarioAlterno: HorarioAlterno = {
  id_horario: '',
  fecha_inicio_horario_alterno: '',
  fecha_fin_horario_alterno: '',
  hora_inicio_alterno: '',
  hora_fin_alterno: '',
  descripcion_horario_alterno: '',
  estado_horario_alterno: true,
}