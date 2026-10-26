export type TurnoInfo = {
  id_guardia_turno: number
  nombre: string
  hora_inicio: string
  hora_fin: string
  color: string
}

export type GrupoInfo = {
  id_guardia_grupo: number
  nombre: string
  orden: number
  descripcion?: string | null
  miembros: MiembroInfo[]
}

export type MiembroInfo = {
  id_guardia_grupo_miembro: number
  id_persona: number
  id_guardia_bloque?: number | null
  ci: string
  nombre: string
  paterno: string
  materno: string
  nombre_bloque?: string | null
}

export type AsignacionDia = {
  id_guardia_asignacion: number
  id_guardia_reemplazo?: number | null
  id_persona: number
  id_guardia_turno: number
  id_guardia_bloque?: number | null
  id_guardia_grupo?: number | null
  id_persona_titular?: number | null
  id_guardia_asignacion_titular?: number | null
  ci: string
  nombre_persona: string
  paterno: string
  materno: string
  nombre_turno: string
  color_turno: string
  nombre_bloque?: string | null
  nombre_grupo?: string | null
  titular_nombre?: string
  titular_nombre_persona?: string
  titular_paterno?: string
  titular_materno?: string
  titular_nombre_completo?: string
  reemplazo_activo?: boolean
  id_guardia_reemplazo_actual?: number | null
  id_guardia_asignacion_reemplazo_actual?: number | null
  reemplazo_nombre?: string
  reemplazo_nombre_persona?: string
  reemplazo_paterno?: string
  reemplazo_materno?: string
  reemplazo_nombre_completo?: string
  tipo_origen: 'AUTO' | 'MANUAL' | 'EMERGENCIA'
  observacion?: string | null
}

export type DiaSemana = {
  fecha: string
  dia_semana: string
  es_fin_semana: boolean
  asignaciones: AsignacionDia[]
}

export type SemanaInfo = {
  fecha_inicio: string
  fecha_fin: string
  posicion_ciclo: number | null
  numero_ciclo: number | null
  id_horario_tipo?: number | null
}

export type ProgramacionSemanalGuardia = {
  id_guardia_programacion_semanal?: number
  id_guardia_grupo: number
  nombre_grupo?: string
  orden_grupo?: number | null
  id_guardia_turno: number
  nombre_turno?: string
  color_turno?: string | null
  hora_inicio?: string | null
  hora_fin?: string | null
  fecha_inicio_semana: string
  fecha_fin_semana: string
  tipo_programacion: 'CICLO' | 'MANUAL' | 'AJUSTE'
  observacion?: string | null
}

export type HorarioSemanalResponse = {
  semana: SemanaInfo
  configuracion: ConfiguracionCiclo | null
  grupos: GrupoInfo[]
  turnos: TurnoInfo[]
  programaciones: ProgramacionSemanalGuardia[]
  dias: DiaSemana[]
}

export type HorarioBusquedaTarget = {
  fecha: string
  id_persona: number
  id_guardia_grupo?: number | null
  id_guardia_turno?: number | null
}

export type ConfiguracionCiclo = {
  id_guardia_configuracion?: number
  fecha_inicio_ciclo: string
  descripcion?: string | null
}
