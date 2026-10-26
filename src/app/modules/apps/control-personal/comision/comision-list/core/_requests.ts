import {AxiosResponse} from 'axios'
import axiosClient from 'src/app/services/axiosClient'
import {ID, ApiResponse as ApiResponseT} from '../../../../../../../_metronic/helpers'

import {
  Comision,
  ComisionQueryResponse,
  BackendResponse,
  ComisionesBackendData,
  ProcesarComisionParams,
  ApiResponse,
  AutocompleteResponse,
  SucursalCajaSalud,
  ComisionPDFData,
  ReporteGeneralComisionParams,
} from './_models'
import {API_ROUTES} from 'src/app/config/apiRoutes'
import {ValidationError} from 'src/app/utils/httpErrors'
import {TipoPermiso} from '../../../permisos/tipos-permisos/list/core/_models'

export const COMISION_URL = API_ROUTES.CONTROL_PERSONAL + '/boletas-comision'

const getComisiones = (query: string): Promise<ComisionQueryResponse> => {
  return axiosClient
    .get<BackendResponse<ComisionesBackendData>>(`${COMISION_URL}?${query}`, {
      // withCredentials: true,
    })
    .then((response) => {
      const backendData = response.data.data

      if (!backendData?.data || !Array.isArray(backendData.data)) {
        throw new Error('Estructura de datos inválida')
      }

      const result: ComisionQueryResponse = {
        data: backendData.data,
        payload: {
          message: response.data.message,
          pagination: backendData.payload?.pagination,
        },
      }

      if (backendData.meta?.enrichment_failed) {
        result.warning = backendData.meta.message
      }

      return result
    })
    .catch((error) => {
      console.error('Error fetching comisiones:', error)
      return {
        data: [],
        payload: {
          message: 'Error al obtener comisiones',
          errors: {server: [error.message]},
        },
      }
    })
}

const getComisionById = async (id: ID): Promise<Comision> => {
  const response = await axiosClient.get<BackendResponse<Comision>>(`${COMISION_URL}/${id}`)
  const data = response.data

  if (data.error) {
    throw new Error(data.message || 'Error desconocido al obtener la comisión')
  }

  if (!data.data) {
    throw new Error('Comisión no encontrada')
  }

  return data.data
}

const createComision = async (comision: Comision): Promise<Comision> => {
  try {
    const response = await axiosClient.post(COMISION_URL, comision)
    return response.data.data
  } catch (error: any) {
    const status = error?.response?.status
    const validationErrors =
      error?.response?.data?.validation_errors || error?.response?.data?.data || {}
    const message = error?.response?.data?.message || 'Ocurrió un error'

    if (status === 400 || status === 422) {
      throw new ValidationError(validationErrors, message)
    }

    throw new Error(message)
  }
}

const updateComision = async (comision: Comision): Promise<Comision> => {
  try {
    const response = await axiosClient.put(`${COMISION_URL}/${comision.id_comision}`, comision)
    // return {message: response.data.message, res: response.data.data}
    return response.data.data
  } catch (error: any) {
    if (error.response?.status === 422 || error.response?.status === 400) {
      const validationErrors =
        error.response.data.validation_errors || error.response.data.data || {}

      throw new ValidationError(
        validationErrors,
        error.response.data.message
      )
    }
    throw error
  }
}

const deleteComision = (comisionId: ID): Promise<void> => {
  return axiosClient.delete(`${COMISION_URL}/${comisionId}`).then(() => {})
}

const aprobarComision = async (comisionId: ID): Promise<void> => {
  // return await axiosClient.post(`${COMISION_URL}/aprobar`).then(() => {})
  return axiosClient.post(`${COMISION_URL}/aprobar`, {id: comisionId})
}
const verficarAsignacion = async (): Promise<any> => {
  try {
    const response = await axiosClient.get(`${COMISION_URL}/verificar-asignacion`)
    return response.data
  } catch (error: any) {
    throw error
  }
}

const getTiposPermiso = async (): Promise<TipoPermiso[]> => {
  try {
    const response: AxiosResponse<ApiResponseT<TipoPermiso[]>> = await axiosClient.get(
      `${COMISION_URL}/tipos-permiso`
    )
    return response.data.data
  } catch (error) {
    console.error('Error fetching tipos permiso:', error)
    return []
  }
}
const getCajaSaludSucursales = async (): Promise<SucursalCajaSalud[]> => {
  try {
    const response: AxiosResponse<ApiResponseT<SucursalCajaSalud[]>> = await axiosClient.get(
      `${COMISION_URL}/caja-salud-sucursales`
    )
    return response.data.data
  } catch (error) {
    console.error('Error fetching sucursales caja salud:', error)
    return []
  }
}

const getPersonaAutocomplete = async (termino: string): Promise<AutocompleteResponse> => {
  try {
    const response = await axiosClient.get(`${API_ROUTES.PERSONA}/autocompletar?termino=${termino}`)

    const data = response.data

    if (data.error) {
      throw new Error(data.message || 'Error desconocido al obtener la comisión')
    }

    if (!data.sugerencias) {
      throw new Error('No se encontraron sugerencias')
    }

    return data as AutocompleteResponse
  } catch (error: any) {
    console.error('Error en getPersonaAutocomplete:', error)
    throw new Error(error.message || 'Error al obtener datos de autocompletado')
  }
}

const aprobarComisiones = async (): Promise<ApiResponse> => {
  const response = await axiosClient.post(`${COMISION_URL}/aprobar-comisiones-recepcionados`)
  return response.data // <- Esto es lo que espera useMutation
}

const aprobarSelectedComisiones = async (
  comisionIds: ID[]
): Promise<{success: boolean; message: string}> => {
  try {
    const response = await axiosClient.post(`${COMISION_URL}/aprobar-seleccionados`, {
      ids: comisionIds,
    })
    return response.data
  } catch (error) {
    // console.error('Error al aprobar comisiones:', error.response?.data)
    throw error
  }
}
const aprobarComisionPorQR = (code: string): Promise<BackendResponse<ComisionesBackendData>> => {
  return axiosClient.post(`${COMISION_URL}/aprobar`, {id: code})
}

const procesarEstadoComision = (
  params: ProcesarComisionParams
): Promise<BackendResponse<ComisionesBackendData>> => {
  // Estructura los datos según la acción
  // console.log('requst '+params.fecha);

  const requestData = {
    id: params.code,
    action: params.action,
    ...(params.action === 'observe' && {observacion: params.observacion}),
    ...(params.action === 'receive' && {fecha: params.fecha}),
  }

  return axiosClient.post(`${COMISION_URL}/comision-qr`, requestData)
}

const buildBoletaFilename = (identifier: string): string => {
  const safeIdentifier = identifier.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase()
  return `BOLETA_COMISION_${safeIdentifier}.PDF`
}

const getBlobErrorMessage = async (error: any): Promise<string> => {
  const data = error?.response?.data

  if (data instanceof Blob) {
    const text = await data.text()
    try {
      const parsed = JSON.parse(text)
      return parsed.message || 'Datos personales no disponibles. Intente más tarde.'
    } catch {
      return text || 'Datos personales no disponibles. Intente más tarde.'
    }
  }

  return error?.response?.data?.message || 'Datos personales no disponibles. Intente más tarde.'
}

const imprimirComisionFormulario = async (
  hash: string,
  carnet?: string | null
): Promise<ComisionPDFData> => {
  try {
    const response = await axiosClient.get<Blob>(`${COMISION_URL}/reporte/${hash}`, {
      responseType: 'blob',
    })
    const filename = buildBoletaFilename(carnet || hash)

    return {
      blob: response.data,
      filename,
    }
  } catch (error: any) {
    throw new Error(await getBlobErrorMessage(error))
  }
}

const generarReporteGeneralComision = async (
  params: ReporteGeneralComisionParams
): Promise<ComisionPDFData> => {
  try {
    const formData = new FormData()
    formData.append('fechaInicio', params.fechaInicio)
    formData.append('fechaFin', params.fechaFin)
    formData.append('estado', params.estado)
    formData.append('tipoComision', params.tipoComision)

    const response = await axiosClient.post<Blob>(`${COMISION_URL}/reporte-general`, formData, {
      responseType: 'blob',
    })

    const tipoReporte = params.tipoComision === 'BAJA_MEDICA' ? 'BAJAS_MEDICAS' : 'BOLETAS_COMISION'

    return {
      blob: response.data,
      filename: `REPORTE_${tipoReporte}.PDF`,
      title: 'Reporte de comisiones',
    }
  } catch (error: any) {
    throw new Error(await getBlobErrorMessage(error))
  }
}

export {
  getComisiones,
  deleteComision,
  aprobarSelectedComisiones,
  getComisionById,
  createComision,
  updateComision,
  aprobarComisionPorQR,
  aprobarComision,
  procesarEstadoComision,
  aprobarComisiones,
  getPersonaAutocomplete,
  verficarAsignacion,
  getTiposPermiso,
  getCajaSaludSucursales,
  imprimirComisionFormulario,
  generarReporteGeneralComision,
}
