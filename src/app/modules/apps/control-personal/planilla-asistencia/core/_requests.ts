import axiosClient from 'src/app/services/axiosClient'
import {API_ROUTES} from 'src/app/config/apiRoutes'
import {
  BackendEnvelope,
  BonoRefrigerioDetalle,
  BonoRefrigerioResumen,
  ImportacionResumenResponse,
  ListadoPaginado,
  MarcacionNormalizada,
  MisMarcacionesResponse,
  MisMarcacionesSyncResponse,
  PlanillaMensualPDFData,
  ProcesoPlanilla,
  ProcesoPlanillaDetalle,
  ReporteBonoRefrigerioParams,
  ReportePlanillaMensualParams,
  ReporteResultadosDiariosParams,
  ResultadoDiario,
  ResultadoDiarioDetalle,
  ResultadoMensual,
  ResultadoMensualDetalle,
} from './_models'

const BASE_URL = API_ROUTES.PLANILLA_ASISTENCIA

const unwrap = <T,>(response: {data: BackendEnvelope<T>}): T => response.data.data

const getBlobErrorMessage = async (error: any): Promise<string> => {
  const fallback = error?.message || 'No se pudo generar el PDF.'
  const blob = error?.response?.data

  if (!(blob instanceof Blob)) {
    return fallback
  }

  try {
    const text = await blob.text()
    const parsed = JSON.parse(text)
    return parsed?.message || fallback
  } catch {
    return fallback
  }
}

export const uploadMarcaciones = async (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('archivos[]', file))
  const response = await axiosClient.post<BackendEnvelope<ImportacionResumenResponse>>(
    `${BASE_URL}/importaciones/marcaciones/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return unwrap(response)
}

export const getResumenImportaciones = async () => {
  const response = await axiosClient.get<BackendEnvelope<ImportacionResumenResponse>>(
    `${BASE_URL}/importaciones/marcaciones/resumen`
  )
  return unwrap(response)
}

export const getMarcaciones = async (page = 1, itemsPerPage = 25, params?: Record<string, unknown>) => {
  const response = await axiosClient.get<BackendEnvelope<ListadoPaginado<MarcacionNormalizada>>>(
    `${BASE_URL}/importaciones/marcaciones`,
    {
      params: {
        page,
        items_per_page: itemsPerPage,
        ...(params || {}),
      },
    }
  )
  return unwrap(response)
}


export const getMisMarcaciones = async (
  page = 1,
  itemsPerPage = 25,
  params?: Record<string, unknown>
) => {
  const response = await axiosClient.get<BackendEnvelope<MisMarcacionesResponse>>(
    `${BASE_URL}/importaciones/marcaciones/mias`,
    {
      params: {
        page,
        items_per_page: itemsPerPage,
        ...(params || {}),
      },
    }
  )
  return unwrap(response)
}

export const syncMisMarcacionesBiometrico = async (params?: Record<string, unknown>) => {
  const response = await axiosClient.post<BackendEnvelope<MisMarcacionesSyncResponse>>(
    `${BASE_URL}/importaciones/marcaciones/mias/sincronizar-biometrico`,
    null,
    {
      params: {
        ...(params || {}),
      },
    }
  )
  return unwrap(response)
}

export const getMisMarcacionesEstadoSync = async (params?: Record<string, unknown>) => {
  const response = await axiosClient.get<
    BackendEnvelope<MisMarcacionesResponse['estado_sincronizacion']>
  >(`${BASE_URL}/importaciones/marcaciones/mias/estado-sync`, {
    params: {
      ...(params || {}),
    },
  })
  return unwrap(response)
}

export const getMisMarcacionesResumenAtrasos = async (params?: Record<string, unknown>) => {
  const response = await axiosClient.get<
    BackendEnvelope<MisMarcacionesResponse['resumen_atrasos']>
  >(`${BASE_URL}/importaciones/marcaciones/mias/resumen-atrasos`, {
    params: {
      ...(params || {}),
    },
  })
  return unwrap(response)
}

export const generarReporteMisMarcaciones = async (
  tipo: 'HISTORIAL' | 'HORARIO',
  params?: {fecha_desde?: string; fecha_hasta?: string}
): Promise<PlanillaMensualPDFData> => {
  try {
    const response = await axiosClient.get<Blob>(
      `${BASE_URL}/importaciones/marcaciones/mias/reporte`,
      {
        params: {
          tipo,
          fecha_desde: params?.fecha_desde,
          fecha_hasta: params?.fecha_hasta,
        },
        responseType: 'blob',
      }
    )

    return {
      blob: response.data,
      filename: `MIS_MARCACIONES_${tipo}_${params?.fecha_desde || ''}_${params?.fecha_hasta || ''}.pdf`,
      title: tipo === 'HORARIO' ? 'Marcaciones por horario' : 'Historial biométrico',
    }
  } catch (error: any) {
    throw new Error(await getBlobErrorMessage(error))
  }
}
export const getProcesosPlanilla = async (
  page = 1,
  itemsPerPage = 10,
  paramsExtra?: Record<string, unknown>
) => {
  const response = await axiosClient.get<BackendEnvelope<ListadoPaginado<ProcesoPlanilla>>>(
    `${BASE_URL}/procesos`,
    {
      params: {
        page,
        items_per_page: itemsPerPage,
        ...(paramsExtra || {}),
      },
    }
  )
  return unwrap(response)
}

export const createProcesoPlanilla = async (payload: {fecha_inicio: string; fecha_fin: string}) => {
  const response = await axiosClient.post<BackendEnvelope<ProcesoPlanilla>>(`${BASE_URL}/procesos`, payload)
  return unwrap(response)
}

export const ejecutarProcesoPlanilla = async (idProceso: number) => {
  const response = await axiosClient.post<BackendEnvelope<ProcesoPlanilla>>(
    `${BASE_URL}/procesos/${idProceso}/ejecutar`
  )
  return unwrap(response)
}

export const getProcesosBonoRefrigerio = async (page = 1, itemsPerPage = 20) => {
  const response = await axiosClient.get<BackendEnvelope<ListadoPaginado<ProcesoPlanilla>>>(
    `${BASE_URL}/bono-refrigerio/procesos`,
    {
      params: {
        page,
        items_per_page: itemsPerPage,
      },
    }
  )
  return unwrap(response)
}

export const crearProcesoBonoRefrigerio = async (payload: {gestion: number; mes: number}) => {
  const response = await axiosClient.post<BackendEnvelope<ProcesoPlanilla>>(
    `${BASE_URL}/bono-refrigerio/procesos`,
    payload
  )
  return unwrap(response)
}

export const ejecutarProcesoBonoRefrigerio = async (idProceso: number) => {
  const response = await axiosClient.post<BackendEnvelope<ProcesoPlanilla>>(
    `${BASE_URL}/bono-refrigerio/procesos/${idProceso}/ejecutar`
  )
  return unwrap(response)
}
export const getDetalleProcesoPlanilla = async (idProceso: number) => {
  const response = await axiosClient.get<BackendEnvelope<ProcesoPlanillaDetalle>>(
    `${BASE_URL}/procesos/${idProceso}`
  )
  return unwrap(response)
}

export const getResultadosDiarios = async (idProceso: number, params?: Record<string, unknown>) => {
  const response = await axiosClient.get<BackendEnvelope<ListadoPaginado<ResultadoDiario>>>(
    `${BASE_URL}/procesos/${idProceso}/resultados`,
    {params}
  )
  return unwrap(response)
}

export const getDetalleResultadoDiario = async (
  idProceso: number,
  idPersona: number,
  fecha: string,
  idAsignacionAdministrativo?: number
) => {
  const response = await axiosClient.get<BackendEnvelope<any>>(
    `${BASE_URL}/procesos/${idProceso}/resultados/persona/${idPersona}`,
    {
      params: {fecha, id_asignacion_administrativo: idAsignacionAdministrativo || undefined},
    }
  )
  const payload = unwrap(response)
  const detalle = payload?.detalle || null

  return {
    ...(payload?.resultado_diario || {}),
    detalle_json: detalle
      ? {
          guardia: detalle?.guardia || null,
          guardias: Array.isArray(detalle?.guardias) ? detalle.guardias : [],
          reemplazos_titular: Array.isArray(detalle?.reemplazos_titular)
            ? detalle.reemplazos_titular
            : [],
          justificativo: detalle?.justificativo || null,
          marcaciones: Array.isArray(detalle?.marcaciones) ? detalle.marcaciones : [],
          marcaciones_sobrantes: Array.isArray(detalle?.marcaciones_sobrantes)
            ? detalle.marcaciones_sobrantes
            : [],
          es_no_descontable: Boolean(detalle?.es_no_descontable),
        }
      : null,
    puntos: Array.isArray(payload?.puntos)
      ? payload.puntos.map((punto: any) => ({
          orden: Number(punto?.orden || 0),
          nombre_punto: punto?.nombre_punto || '-',
          tipo_resultado: punto?.estado_punto || 'SIN_MARCACION',
          codigo_punto: punto?.codigo_punto || null,
          hora_esperada: punto?.hora_esperada || null,
          valor_mostrado: punto?.hora_marcada || punto?.justificativo_punto || null,
          hora_marcada: punto?.hora_marcada || null,
          id_marcacion: punto?.id_marcacion ? Number(punto.id_marcacion) : null,
          fecha_hora_marcacion: punto?.fecha_hora_marcacion || null,
          minutos_atraso:
            (punto?.estado_punto || '').toUpperCase() === 'ATRASO'
              ? Number(punto?.minutos_desfase || 0)
              : 0,
          minutos_desfase: Number(punto?.minutos_desfase || 0),
          justificativo_punto: punto?.justificativo_punto || null,
          observacion: punto?.observacion || null,
        }))
      : [],
  } as ResultadoDiarioDetalle
}

export const generarReporteResultadosDiarios = async (
  idProceso: number,
  params: ReporteResultadosDiariosParams
): Promise<PlanillaMensualPDFData> => {
  try {
    const formData = new FormData()
    formData.append('filtroReporte', params.filtroReporte)
    if (params.search?.trim()) {
      formData.append('search', params.search.trim())
    }
    if (params.estadoDia?.trim()) {
      formData.append('estadoDia', params.estadoDia.trim())
    }

    const response = await axiosClient.post<Blob>(
      `${BASE_URL}/procesos/${idProceso}/resultados/reporte-general`,
      formData,
      {responseType: 'blob'}
    )

    return {
      blob: response.data,
      filename: `REPORTE_RESULTADOS_DIARIOS_PROCESO_${idProceso}.pdf`,
      title: 'Reporte de resultados diarios',
    }
  } catch (error: any) {
    throw new Error(await getBlobErrorMessage(error))
  }
}

export const getResultadosMensuales = async (idProceso: number, params?: Record<string, unknown>) => {
  const response = await axiosClient.get<BackendEnvelope<ListadoPaginado<ResultadoMensual>>>(
    `${BASE_URL}/procesos/${idProceso}/resultados-mensuales`,
    {params}
  )
  return unwrap(response)
}

export const getDetalleResultadoMensual = async (
  idProceso: number,
  idPersona: number,
  idAsignacionAdministrativo?: number
) => {
  const response = await axiosClient.get<BackendEnvelope<ResultadoMensualDetalle>>(
    `${BASE_URL}/procesos/${idProceso}/resultados-mensuales/persona/${idPersona}`,
    {params: {id_asignacion_administrativo: idAsignacionAdministrativo || undefined}}
  )
  return unwrap(response)
}

export const generarReportePlanillaMensual = async (
  idProceso: number,
  params: ReportePlanillaMensualParams
): Promise<PlanillaMensualPDFData> => {
  try {
    const formData = new FormData()
    formData.append('filtroReporte', params.filtroReporte)
    if (params.search?.trim()) {
      formData.append('search', params.search.trim())
    }

    const response = await axiosClient.post<Blob>(
      `${BASE_URL}/procesos/${idProceso}/resultados-mensuales/reporte-general`,
      formData,
      {responseType: 'blob'}
    )

    return {
      blob: response.data,
      filename: `REPORTE_PLANILLA_MENSUAL_PROCESO_${idProceso}.pdf`,
      title: 'Reporte de planilla mensual',
    }
  } catch (error: any) {
    throw new Error(await getBlobErrorMessage(error))
  }
}

export const getBonoRefrigerio = async (idProceso: number, params?: Record<string, unknown>) => {
  const response = await axiosClient.get<BackendEnvelope<ListadoPaginado<BonoRefrigerioResumen>>>(
    `${BASE_URL}/procesos/${idProceso}/bono-refrigerio`,
    {params}
  )
  return unwrap(response)
}

export const getDetalleBonoRefrigerio = async (
  idProceso: number,
  idPersona: number,
  idAsignacionAdministrativo?: number
) => {
  const response = await axiosClient.get<BackendEnvelope<BonoRefrigerioDetalle>>(
    `${BASE_URL}/procesos/${idProceso}/bono-refrigerio/persona/${idPersona}`,
    {params: {id_asignacion_administrativo: idAsignacionAdministrativo || undefined}}
  )
  return unwrap(response)
}

export const generarReporteBonoRefrigerio = async (
  idProceso: number,
  params: ReporteBonoRefrigerioParams
): Promise<PlanillaMensualPDFData> => {
  try {
    const formData = new FormData()
    formData.append('filtroReporte', params.filtroReporte)
    if (params.search?.trim()) {
      formData.append('search', params.search.trim())
    }

    const response = await axiosClient.post<Blob>(
      `${BASE_URL}/procesos/${idProceso}/bono-refrigerio/reporte-general`,
      formData,
      {responseType: 'blob'}
    )

    return {
      blob: response.data,
      filename: `REPORTE_BONO_REFRIGERIO_PROCESO_${idProceso}.pdf`,
      title: 'Reporte de bono refrigerio',
    }
  } catch (error: any) {
    throw new Error(await getBlobErrorMessage(error))
  }
}
