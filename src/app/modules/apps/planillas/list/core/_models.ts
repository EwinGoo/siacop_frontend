export type PlanillaModulo = 'docente' | 'estudiante'

export type PlanillaEstadoCarrera = 'PENDIENTE' | 'ENVIADO' | 'APROBADO'

export type BackendResponse<T> = {
  status: number
  error: boolean
  message: string
  data: T
}

export type PlanillaResumen = {
  id_planilla: number
  mes_gestion: string
  planilla?: 'INSTITUCIONAL' | 'ESTUDIANTIL'
  tipo_planilla: string
  numero_planilla: string | null
  estado_planilla: string
  fecha_inicio_llenado_asistencia: string | null
  fecha_fin_llenado_asistencia: string | null
  total_carreras: string | number
  total_pendientes: string | number
  total_enviadas: string | number
  total_aprobadas: string | number
  total_items: string | number
}

export type PlanillaCarrera = {
  id_planilla_carrera_sede: string
  id_planilla: number
  id_carrera_sede: number
  nombre_completo_carrera: string
  nombre_sede: string
  llenado_asistencia_fecha_inicio: string | null
  llenado_asistencia_fecha_fin: string | null
  llenado_asistencia_estado: PlanillaEstadoCarrera
  numero_asignaciones: string | number | null
  horas_asignadas: string | number | null
  horas_trabajadas: string | number | null
  numero_asignaciones_con_nombramiento: string | number | null
  carga_horaria_mensual?: string | number | null
  carga_horaria_anual?: string | number | null
}

export type PlanillaCarrerasResponse = {
  planilla: PlanillaResumen
  carreras: PlanillaCarrera[]
  carreras_habilitadas: PlanillaCarrera[]
}
