export interface BackendEnvelope<T> {
  status?: string
  data: T
  message?: string
  timestamp?: string
}

export interface PaginationPayload {
  page?: number
  pages?: number
  total?: number
  items_per_page?: number
}

export interface ImportacionArchivoResultado {
  id_importacion_archivo?: number
  archivo_origen: string
  ruta_archivo_guardado?: string
  total_lineas_archivo?: number
  lineas_validas?: number
  lineas_invalidas?: number
  marcaciones_insertadas?: number
  marcaciones_duplicadas?: number
  sin_persona_relacionada?: number
  lineas_invalidas_detalle?: Array<Record<string, unknown>>
  estado_importacion?: string
  duracion_ms?: number
  duracion_s?: number
  mensaje_error?: string
  reintentos_batch?: number
  created_at?: string
}

export interface ImportacionResumenResponse {
  total_archivos: number
  total_ok: number
  total_error: number
  archivos: ImportacionArchivoResultado[]
}

export interface ProcesoPlanilla {
  id_proceso: number
  tipo_proceso?: string
  gestion?: number
  mes?: number
  fecha_inicio?: string
  fecha_fin?: string
  estado_proceso?: string
  total_funcionarios?: number
  total_marcaciones?: number
  total_dias?: number
  mensaje_error?: string | null
  observacion?: string | null
  fecha_inicio_proceso?: string | null
  fecha_fin_proceso?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ProcesoPlanillaDetalle extends ProcesoPlanilla {
  parametros_json?: Record<string, unknown> | null
  fuentes?: Array<Record<string, unknown>>
  personas?: Array<Record<string, unknown>>
}

export interface ListadoPaginado<T> {
  data: T[]
  pagination?: PaginationPayload
  payload?: {
    pagination?: PaginationPayload
  }
}

export interface ResultadoDiario {
  id_resultado_diario?: number
  id_persona: number
  id_asignacion_administrativo?: number
  fecha: string
  id_horario_tipo?: number | null
  nombre_horario_tipo?: string | null
  tipo_horario?: string | null
  cantidad_marcaciones_esperadas?: number
  cantidad_marcaciones_validas?: number
  estado_dia?: string
  justificativo_principal?: string | null
  minutos_atraso_calculado?: number
  minutos_atraso_oficial?: number
  dias_descuento_calculado?: number
  dias_descuento_oficial?: number
  es_no_descontable?: number | boolean
  motivo_no_descuento?: string | null
  observacion?: string | null
  persona?: {
    ci?: string | null
    genero?: string | null
    nombre_completo?: string | null
    nombre_cargo?: string | null
    nombre_unidad?: string | null
    user_id_biometrico_principal?: string | null
  }
}

export interface ResultadoPunto {
  orden: number
  nombre_punto: string
  tipo_resultado: string
  codigo_punto?: string | null
  hora_esperada?: string | null
  valor_mostrado?: string | null
  hora_marcada?: string | null
  id_marcacion?: number | null
  fecha_hora_marcacion?: string | null
  minutos_atraso?: number
  minutos_desfase?: number
  justificativo_punto?: string | null
  observacion?: string | null
}

export interface ResultadoMarcacionDetalle {
  id_marcacion?: number | null
  fecha_hora_marcacion?: string | null
}

export interface ResultadoGuardiaDetalle {
  id_guardia_asignacion?: number | null
  id_guardia_turno?: number | null
  nombre_turno?: string | null
  fecha?: string | null
  hora_inicio?: string | null
  hora_fin?: string | null
}

export interface ResultadoReemplazoDetalle {
  id_guardia_reemplazo?: number | null
  id_persona_titular?: number | null
  id_persona_reemplazo?: number | null
  ci_reemplazo?: string | null
  nombre_completo_reemplazo?: string | null
  user_id_biometrico_reemplazo?: string | null
  fecha?: string | null
  hora_inicio?: string | null
  hora_fin?: string | null
}

export interface ResultadoJustificativoDetalle {
  codigo?: string | null
  cobertura?: string | null
  observacion?: string | null
}

export interface ResultadoDiarioContexto {
  guardia?: ResultadoGuardiaDetalle | null
  guardias?: ResultadoGuardiaDetalle[]
  reemplazos_titular?: ResultadoReemplazoDetalle[]
  justificativo?: ResultadoJustificativoDetalle | null
  marcaciones?: ResultadoMarcacionDetalle[]
  marcaciones_sobrantes?: ResultadoMarcacionDetalle[]
  es_no_descontable?: boolean
}

export interface ResultadoDiarioDetalle extends ResultadoDiario {
  detalle_json?: ResultadoDiarioContexto | null
  puntos?: ResultadoPunto[]
}

export interface ResultadoMensual {
  id_persona: number
  id_asignacion_administrativo?: number
  dias_trabajados?: number
  dias_justificados?: number
  dias_falta?: number
  dias_abandono?: number
  minutos_atraso_calculado?: number
  minutos_atraso_oficial?: number
  dias_descuento_calculado?: number
  dias_descuento_oficial?: number
  estado_mensual?: string
  observacion?: string | null
  persona?: {
    ci?: string | null
    genero?: string | null
    nombre_completo?: string | null
    nombre_cargo?: string | null
    nombre_unidad?: string | null
    user_id_biometrico_principal?: string | null
  }
}

export interface ResultadoMensualDetalle extends ResultadoMensual {
  detalle_json?: Record<string, unknown> | null
}

export interface PlanillaMensualPDFData {
  blob: Blob
  filename: string
  title?: string
}

export interface ReportePlanillaMensualParams {
  filtroReporte: 'TODOS' | 'CON_ATRASO' | 'CON_SANCION' | 'CON_ATRASO_O_SANCION'
  search?: string
}

export interface ReporteResultadosDiariosParams {
  filtroReporte:
    | 'TODOS'
    | 'CON_ATRASO'
    | 'CON_SANCION'
    | 'CON_FALTA_O_ABANDONO'
    | 'SOLO_OBSERVADOS'
  search?: string
  estadoDia?: string
}

export interface BonoRefrigerioResumen {
  id_proceso: number
  id_persona: number
  id_asignacion_administrativo: number
  dias_validos_bono: number
  dias_excluidos_bono: number
  dias_observados_bono: number
  dias_no_validos_bono: number
  dias_total_registrados: number
  minutos_atraso_oficial: number
  dias_descuento_oficial: number
  estado_bono: 'CON_DIAS_PAGABLES' | 'SIN_DIAS_PAGABLES' | 'OBSERVADO' | string
  persona?: {
    ci?: string | null
    genero?: string | null
    nombre_completo?: string | null
    nombre_cargo?: string | null
    nombre_unidad?: string | null
    user_id_biometrico_principal?: string | null
  }
}

export interface BonoRefrigerioDiaDetalle {
  id_resultado_diario: number
  fecha?: string | null
  estado_dia?: string | null
  estado_bono_dia?: 'VALIDO' | 'EXCLUIDO' | 'NO_VALIDO' | 'OBSERVADO' | string
  motivo_bono?: string | null
  justificativo_principal?: string | null
  tipo_horario?: string | null
  nombre_horario_tipo?: string | null
  cantidad_marcaciones_esperadas?: number
  cantidad_marcaciones_validas?: number
  minutos_atraso_oficial?: number
  dias_descuento_oficial?: number
  observacion?: string | null
}

export interface BonoRefrigerioDetalle {
  resumen: BonoRefrigerioResumen
  dias: BonoRefrigerioDiaDetalle[]
}

export interface ReporteBonoRefrigerioParams {
  filtroReporte:
    | 'TODOS'
    | 'SOLO_BENEFICIARIOS'
    | 'CON_ATRASO'
    | 'CON_SANCION'
    | 'CON_ATRASO_O_SANCION'
    | 'SOLO_OBSERVADOS'
  search?: string
}
export interface MarcacionNormalizada {
  id_marcacion: number
  archivo_origen?: string | null
  linea_origen?: number | null
  fecha_recepcion?: string | null
  usuario_importacion?: string | null
  id_persona?: number | null
  id_biometrico_dispositivo?: number | null
  serial_dispositivo?: string | null
  user_id_biometrico?: string | null
  fecha_hora_marcacion?: string | null
  fecha_marcacion?: string | null
  hora_marcacion?: string | null
  tipo_origen?: string | null
  tipo_verificacion?: string | null
  estado_marcacion?: string | null
  work_code?: string | null
  estado_procesamiento?: string | null
  observacion?: string | null
  hash_evento?: string | null
  es_principal?: number | string | null
}

export interface MiMarcacionOficialPunto {
  id_resultado_punto: number
  codigo_punto?: string | null
  nombre_punto?: string | null
  orden?: number | null
  hora_esperada?: string | null
  hora_marcada?: string | null
  id_marcacion?: number | null
  fecha_hora_marcacion?: string | null
  estado_punto?: string | null
  minutos_desfase?: number | null
  observacion?: string | null
}

export interface MiMarcacionOficialDia {
  id_resultado_diario: number
  id_proceso: number
  id_persona: number
  id_asignacion_administrativo: number
  id_horario_tipo?: number | null
  nombre_horario_tipo?: string | null
  fecha?: string | null
  tipo_horario?: string | null
  estado_dia?: string | null
  cantidad_marcaciones_esperadas?: number | null
  cantidad_marcaciones_validas?: number | null
  minutos_atraso_oficial?: number | null
  observacion?: string | null
  puntos: MiMarcacionOficialPunto[]
}

export interface MisMarcacionesResponse extends ListadoPaginado<MarcacionNormalizada> {
  oficiales?: MiMarcacionOficialDia[]
  resumen_atrasos?: {
    rango?: {
      fecha_desde?: string | null
      fecha_hasta?: string | null
      es_rango_operativo_actual?: boolean
    }
    id_asignacion_administrativo?: number | null
    id_horario_tipo?: number | null
    nombre_horario_tipo?: string | null
    tolerancia_diaria_entrada_minutos?: number
    minutos_atraso_acumulado?: number
    dias_con_atraso?: number
    dias_laborables_evaluados?: number
    dias_con_marcacion_entrada?: number
    detalle_por_dia?: Array<{
      fecha?: string | null
      id_horario_tipo?: number | null
      nombre_horario_tipo?: string | null
      minutos_atraso?: number
      con_atraso?: boolean
      entradas?: Array<{
        codigo_punto?: string | null
        nombre_punto?: string | null
        hora_esperada?: string | null
        hora_marcada?: string | null
        fecha_hora_marcacion?: string | null
        estado_punto?: string | null
        minutos_desfase?: number | null
      }>
    }>
    message?: string | null
  }
  sincronizacion_externa?: {
    status?: string
    message?: string | null
    origen?: string | null
  }
  estado_sincronizacion?: {
    persona?: number
    serial_solicitado?: string | null
    total_dispositivos_evaluados?: number
    total_dispositivos_habilitados_consulta?: number
    ultima_sincronizacion_marcaciones?: string | null
    ultima_fecha_marcacion_sync?: string | null
    mensaje?: string | null
    dispositivos?: Array<{
      id_biometrico_dispositivo?: number | null
      serial?: string | null
      nombre?: string | null
      estado?: string | null
      ip?: string | null
      metodo_ingesta_marcacion?: string | null
      fuente_principal_marcacion?: string | null
      permite_consulta_bajo_demanda?: boolean
      consulta_bajo_demanda_habilitada?: boolean
      ultima_sincronizacion_marcaciones?: string | null
      ultima_fecha_marcacion_sync?: string | null
      asociado_a_persona?: boolean
    }>
  }
}

export interface MisMarcacionesSyncResponse {
  status?: string
  message?: string | null
  origen?: string | null
  sync?: Record<string, unknown>
}
