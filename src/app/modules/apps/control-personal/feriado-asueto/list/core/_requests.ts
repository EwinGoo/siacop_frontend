import axios, { AxiosResponse } from 'axios'
import { ID, Response } from '../../../../../../../_metronic/helpers'
import { FeriadoAsueto, FeriadoAsuetoQueryResponse, BackendResponse, FeriadoAsuetoBackendData } from './_models'
import { API_ROUTES } from 'src/app/config/apiRoutes'
import { ValidationError } from 'src/app/utils/httpErrors'

const FERIADO_ASUETO_URL = API_ROUTES.CONTROL_PERSONAL + '/asistencia-feriado-asueto'


const getFeriadosAsuetos = (query: string): Promise<FeriadoAsuetoQueryResponse> => {
  return axios
    .get<BackendResponse<FeriadoAsuetoBackendData>>(`${FERIADO_ASUETO_URL}?${query}`)
    .then((response) => {
      const backendData = response.data.data
      
      if (!backendData?.data || !Array.isArray(backendData.data)) {
        throw new Error('Estructura de datos inválida')
      }

      return {
        data: backendData.data, // Array de feriados/asuetos
        payload: {
          message: response.data.message,
          pagination: backendData.payload?.pagination
        }
      }
    })
    .catch((error) => {
      console.error('Error fetching feriados/asuetos:', error)
      return {
        data: [],
        payload: {
          message: 'Error al obtener feriados/asuetos',
          errors: { server: [error.message] }
        }
      }
    })
}

const getFeriadoAsuetoById = (id: ID): Promise<FeriadoAsueto | undefined> => {
  return axios
    .get(`${FERIADO_ASUETO_URL}/${id}`)
    .then((response: AxiosResponse<Response<FeriadoAsueto>>) => response.data)
    .then((response: Response<FeriadoAsueto>) => response.data)
}

const createFeriadoAsueto = async (
  feriadoAsueto: FeriadoAsueto
): Promise<FeriadoAsueto | undefined> => {
  try {
    const response = await axios.post(FERIADO_ASUETO_URL, feriadoAsueto)
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

const updateFeriadoAsueto = async (
  feriadoAsueto: FeriadoAsueto
): Promise<FeriadoAsueto | undefined> => {
  try {
    const response = await axios.put(
      `${FERIADO_ASUETO_URL}/${feriadoAsueto.id_asistencia_feriado_asueto}`,
      feriadoAsueto
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

const deleteFeriadoAsueto = (feriadoAsuetoId: ID): Promise<void> => {
  return axios.delete(`${FERIADO_ASUETO_URL}/${feriadoAsuetoId}`).then(() => {})
}

const deleteSelectedFeriadosAsuetos = (feriadoAsuetoIds: Array<ID>): Promise<void> => {
  const requests = feriadoAsuetoIds.map((id) => axios.delete(`${FERIADO_ASUETO_URL}/${id}`))
  return axios.all(requests).then(() => {})
}

export {
  getFeriadosAsuetos,
  deleteFeriadoAsueto,
  deleteSelectedFeriadosAsuetos,
  getFeriadoAsuetoById,
  createFeriadoAsueto,
  updateFeriadoAsueto
}
