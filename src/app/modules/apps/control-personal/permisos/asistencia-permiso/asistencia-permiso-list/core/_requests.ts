import axios, {AxiosResponse, AxiosProgressEvent} from 'axios'
import {ApiResponse, ID, Response} from 'src/_metronic/helpers'
import {
  AsistenciaPermiso,
  AsistenciaPermisoQueryResponse,
  BackendResponse,
  AsistenciaPermisoBackendData,
  ProcesarComisionParams,
  AutocompleteResponse,
  PermisoPDFData,
} from './_models'
import {API_ROUTES, API_BASE_URL} from 'src/app/config/apiRoutes'
import {TipoPermiso} from '../../../tipos-permisos/list/core/_models'
import axiosClient from 'src/app/services/axiosClient'
import {ValidationError} from 'src/app/utils/httpErrors'

export const ASISTENCIA_PERMISO_URL = API_ROUTES.CONTROL_PERSONAL + '/permisos'

const getAsistenciasPermiso = (query: string): Promise<AsistenciaPermisoQueryResponse> => {
  return axios
    .get<BackendResponse<AsistenciaPermisoBackendData>>(`${ASISTENCIA_PERMISO_URL}?${query}`)
    .then((response) => {
      const backendData = response.data.data

      if (!backendData?.data || !Array.isArray(backendData.data)) {
        throw new Error('Estructura de datos inválida')
      }

      const result: AsistenciaPermisoQueryResponse = {
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
      console.error('Error fetching asistencias permiso:', error)
      return {
        data: [],
        payload: {
          message: 'Error al obtener asistencias permiso',
          errors: {server: [error.message]},
        },
      }
    })
}

const getAsistenciaPermisoById = (id: ID): Promise<AsistenciaPermiso | undefined> => {
  return axios
    .get(`${ASISTENCIA_PERMISO_URL}/${id}`)
    .then((response: AxiosResponse<Response<AsistenciaPermiso>>) => response.data)
    .then((response: Response<AsistenciaPermiso>) => response.data)
}

const createAsistenciaPermiso = async (
  asistenciaPermiso: AsistenciaPermiso
): Promise<AsistenciaPermiso> => {
  try {
    const response = await axiosClient.post(ASISTENCIA_PERMISO_URL, asistenciaPermiso)
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

const updateAsistenciaPermiso = async (
  asistenciaPermiso: AsistenciaPermiso
): Promise<AsistenciaPermiso | undefined> => {
  try {
    const response = await axiosClient.put(
      `${ASISTENCIA_PERMISO_URL}/${asistenciaPermiso.id_asistencia_permiso}`,
      asistenciaPermiso
    )
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

const deleteAsistenciaPermiso = (asistenciaPermisoId: ID): Promise<void> => {
  return axios.delete(`${ASISTENCIA_PERMISO_URL}/${asistenciaPermisoId}`).then(() => {})
}

const deleteSelectedAsistenciasPermiso = (asistenciaPermisoIds: Array<ID>): Promise<void> => {
  const requests = asistenciaPermisoIds.map((id) => axios.delete(`${ASISTENCIA_PERMISO_URL}/${id}`))
  return axios.all(requests).then(() => {})
}

const toggleAsistenciaPermisoStatus = (id: ID): Promise<AsistenciaPermiso | undefined> => {
  return axios
    .patch(`${ASISTENCIA_PERMISO_URL}/${id}/toggle-status`)
    .then((response: AxiosResponse<Response<AsistenciaPermiso>>) => response.data)
    .then((response: Response<AsistenciaPermiso>) => response.data)
}

// Función adicional para aprobar/rechazar permisos
const cambiarEstadoPermiso = (
  id: ID,
  estado: 'APROBADO' | 'RECHAZADO'
): Promise<AsistenciaPermiso | undefined> => {
  return axios
    .patch(`${ASISTENCIA_PERMISO_URL}/${id}/cambiar-estado`, {estado})
    .then((response: AxiosResponse<Response<AsistenciaPermiso>>) => response.data)
    .then((response: Response<AsistenciaPermiso>) => response.data)
}

const getTiposPermiso = async (): Promise<TipoPermiso[]> => {
  try {
    const response: AxiosResponse<ApiResponse<TipoPermiso[]>> = await axios.get(
      `${ASISTENCIA_PERMISO_URL}/tipos-permiso`
    )
    return response.data.data
  } catch (error) {
    console.error('Error fetching tipos permiso:', error)
    return []
  }
}
const aprobarComisiones = async (): Promise<ApiResponse<any>> => {
  const response = await axiosClient.post(
    `${ASISTENCIA_PERMISO_URL}/aprobar-comisiones-recepcionados`
  )
  return response.data // <- Esto es lo que espera useMutation
}

const uploadFile = (
  formData: FormData,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<AxiosResponse<Response<{id_multimedia: number}>>> => {
  return axios.post(`${API_BASE_URL}/upload-multimedia`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  })
}

const procesarEstadoPermiso = (
  params: ProcesarComisionParams
): Promise<BackendResponse<AsistenciaPermisoBackendData>> => {
  // Estructura los datos según la acción
  // console.log('requst '+params.fecha);

  const requestData = {
    id: params.code,
    action: params.action,
    ...(params.action === 'observe' && {observacion: params.observacion}),
    ...(params.action === 'receive' && {fecha: params.fecha}),
  }

  return axiosClient.post(`${ASISTENCIA_PERMISO_URL}/procesar-estado`, requestData)
}

const aprobarSelectedPermisos = async (
  comisionIds: ID[]
): Promise<{success: boolean; message: string}> => {
  try {
    const response = await axiosClient.post(`${ASISTENCIA_PERMISO_URL}/aprobar-seleccionados`, {
      ids: comisionIds,
    })
    return response.data
  } catch (error) {
    // console.error('Error al aprobar comisiones:', error.response?.data)
    throw error
  }
}

const buildPermisoFilename = (identifier: string): string => {
  const safeIdentifier = identifier.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase()
  return `PERMISO_${safeIdentifier}.PDF`
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

const imprimirPermisoFormulario = async (
  hash: string,
  carnet?: string | null
): Promise<PermisoPDFData> => {
  try {
    const response = await axiosClient.get<Blob>(`${ASISTENCIA_PERMISO_URL}/reporte/${hash}`, {
      responseType: 'blob',
    })

    return {
      blob: response.data,
      filename: buildPermisoFilename(carnet || hash),
      title: 'Permiso',
    }
  } catch (error: any) {
    throw new Error(await getBlobErrorMessage(error))
  }
}

const generarReporteGeneralPermiso = async (params: {
  fechaInicio: string
  fechaFin: string
  estado: string
  tipoPermiso: string
}): Promise<PermisoPDFData> => {
  try {
    const formData = new FormData()
    formData.append('fechaInicio', params.fechaInicio)
    formData.append('fechaFin', params.fechaFin)
    formData.append('estado', params.estado)
    formData.append('tipoPermiso', params.tipoPermiso)

    const response = await axiosClient.post<Blob>(
      `${ASISTENCIA_PERMISO_URL}/reporte-general`,
      formData,
      {responseType: 'blob'}
    )

    return {
      blob: response.data,
      filename: 'REPORTE_PERMISOS.PDF',
      title: 'Reporte de permisos',
    }
  } catch (error: any) {
    throw new Error(await getBlobErrorMessage(error))
  }
}

const getPersonaAutocomplete = async (termino: string): Promise<AutocompleteResponse> => {
  try {
    const response = await axiosClient.get(
      `${ASISTENCIA_PERMISO_URL}/autocompletar?termino=${termino}`
    )

    const res = response.data

    if (res.status !== 'success') {
      throw new Error(res.message || 'Error en la respuesta del servidor')
    }

    if (!res.data || res.data.length === 0) {
      throw new Error('No se encontraron sugerencias')
    }

    return res as AutocompleteResponse
  } catch (error: any) {
    console.error('Error en getPersonaAutocomplete:', error)
    throw new Error(error.message || 'Error al obtener datos de autocompletado')
  }
}

export {
  getAsistenciasPermiso,
  deleteAsistenciaPermiso,
  deleteSelectedAsistenciasPermiso,
  getAsistenciaPermisoById,
  createAsistenciaPermiso,
  updateAsistenciaPermiso,
  toggleAsistenciaPermisoStatus,
  cambiarEstadoPermiso,
  getTiposPermiso,
  uploadFile,
  procesarEstadoPermiso,
  aprobarComisiones,
  aprobarSelectedPermisos,
  getPersonaAutocomplete,
  imprimirPermisoFormulario,
  generarReporteGeneralPermiso,
}
