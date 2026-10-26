import {ApiResponse, ID, Response} from 'src/_metronic/helpers'
import {
  DeclaratoriaComision,
  DeclaratoriaComisionQueryResponse,
  BackendResponse,
  DeclaratoriasComisionBackendData,
  PDFResponse,
  DeclaratoriaComisionPDFData,
  ReporteGeneralDeclaratoriaParams,
  Unidad,
} from './_models'
import axiosClient from 'src/app/services/axiosClient'
import {ValidationError} from 'src/app/utils/httpErrors'
import {toast} from 'react-toastify'
import {API_ROUTES} from 'src/app/config/apiRoutes'
import {AxiosResponse} from 'axios'

export const DECLARATORIA_URL = API_ROUTES.CONTROL_PERSONAL + '/declaratoria-comision'

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      const result = reader.result

      if (typeof result !== 'string') {
        reject(new Error('No se pudo leer el PDF generado'))
        return
      }

      resolve(result.split(',')[1] || '')
    }

    reader.onerror = () => reject(new Error('No se pudo leer el PDF generado'))
    reader.readAsDataURL(blob)
  })

const getDeclaratoriasComision = (query: string): Promise<DeclaratoriaComisionQueryResponse> => {
  return axiosClient
    .get<BackendResponse<DeclaratoriasComisionBackendData>>(`${DECLARATORIA_URL}?${query}`)
    .then((response) => {
      const backendData = response.data.data

      if (!backendData?.data || !Array.isArray(backendData.data)) {
        throw new Error('Estructura de datos inválida')
      }

      const result: DeclaratoriaComisionQueryResponse = {
        data: backendData.data,
        payload: {
          message: response.data.message,
          pagination: backendData.payload?.pagination,
        },
      }

      // Si el microservicio de personal no respondió, propagar el aviso al componente
      if (backendData.meta?.enrichment_failed) {
        result.warning = backendData.meta.message
      }

      return result
    })
    .catch((error) => {
      console.error('Error fetching declaratorias:', error)
      return {
        data: [],
        payload: {
          message: 'Error al obtener declaratorias',
          errors: {server: [error.message]},
        },
      }
    })
}

const getDeclaratoriaComisionById = (id: ID): Promise<DeclaratoriaComision | undefined> => {
  return axiosClient
    .get(`${DECLARATORIA_URL}/${id}`)
    .then((response: AxiosResponse<Response<DeclaratoriaComision>>) => response.data)
    .then((response: Response<DeclaratoriaComision>) => response.data)
}

const createDeclaratoriaComision = async (
  declaratoria: DeclaratoriaComision
): Promise<DeclaratoriaComision> => {
  try {
    const response = await axiosClient.post(DECLARATORIA_URL, declaratoria)
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

const updateDeclaratoriaComision = async (
  declaratoria: DeclaratoriaComision
): Promise<DeclaratoriaComision> => {
  try {
    const response = await axiosClient.put(
      `${DECLARATORIA_URL}/${declaratoria.id_declaratoria_comision}`,
      declaratoria
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

const deleteDeclaratoriaComision = (declaratoriaId: ID): Promise<void> => {
  return axiosClient.delete(`${DECLARATORIA_URL}/${declaratoriaId}`).then(() => {})
}

// const anularDeclaratoriaComision = (declaratoriaId: ID): Promise<AxiosResponse<ApiResponse>> => {
//   return axiosClient.post<ApiResponse>(`${DECLARATORIA_URL}/anular/${declaratoriaId}`).then(() => {})
// }
const anularDeclaratoriaComision = async (
  declaratoriaId: ID
): Promise<AxiosResponse<ApiResponse>> => {
  try {
    const response = await axiosClient.put(`${DECLARATORIA_URL}/${declaratoriaId}/anular`)
    return response
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


const getBlobErrorMessage = async (error: any): Promise<string> => {
  const data = error?.response?.data

  if (data instanceof Blob) {
    const text = await data.text()
    try {
      const parsed = JSON.parse(text)
      return parsed.message || 'No se pudo generar el reporte. Intente más tarde.'
    } catch {
      return text || 'No se pudo generar el reporte. Intente más tarde.'
    }
  }

  return error?.response?.data?.message || error?.message || 'No se pudo generar el reporte. Intente más tarde.'
}
const getUnidades = async (): Promise<Unidad[]> => {
  try {
    const response: AxiosResponse<ApiResponse<Unidad[]>> = await axiosClient.get(
      `${DECLARATORIA_URL}/unidades`
    )
    return response.data.data
  } catch (error) {
    console.error('Error fetching unidades:', error)
    toast.warning('No se pudieron cargar las unidades. Intente recargar.', {
      position: 'top-right',
      autoClose: 6000,
      closeOnClick: true,
    })
    return []
  }
}

// const deleteSelectedDeclaratorias = (declaratoriaIds: Array<ID>): Promise<void> => {
//   const requests = declaratoriaIds.map((id) => axiosClient.delete(`${DECLARATORIA_URL}/${id}`))
//   return axiosClient.all(requests).then(() => {})
//}

// const imprimirDeclaratoriaComision = (id: ID): Promise<Blob> => {
//   return axiosClient
//     .get(`${DECLARATORIA_URL}/imprimir/${id}`, {responseType: 'blob'})
//     .then((response) => response.data)
// }


const generarReporteGeneralDeclaratoriaComision = async (
  params: ReporteGeneralDeclaratoriaParams
): Promise<DeclaratoriaComisionPDFData> => {
  try {
    const formData = new FormData()
    formData.append('fechaInicio', params.fechaInicio)
    formData.append('fechaFin', params.fechaFin)
    formData.append('estado', params.estado)
    formData.append('tipoViatico', params.tipoViatico)

    const response = await axiosClient.post<Blob>(`${DECLARATORIA_URL}/reporte-general`, formData, {
      responseType: 'blob',
    })

    return {
      blob: response.data,
      filename: `REPORTE_DECLARATORIAS_COMISION.PDF`,
      title: 'Reporte de declaratorias en comisión',
    }
  } catch (error: any) {
    throw new Error(await getBlobErrorMessage(error))
  }
}
const imprimirDeclaratoriaComision = async (id: ID): Promise<PDFResponse> => {
  try {
    const response = await axiosClient.get(`${DECLARATORIA_URL}/reporte/${id}`, {
      responseType: 'blob',
    })
    const contentType = response.headers['content-type'] || 'application/pdf'
    const filename =
      response.headers['content-disposition']?.match(/filename="?([^"]+)"?/)?.[1] ||
      `declaratoria-comision-${id}.pdf`

    if (contentType.includes('application/json')) {
      const responseText = await response.data.text()
      const responseData = JSON.parse(responseText) as BackendResponse<PDFResponse> | PDFResponse
      const pdfData = 'pdf_base64' in responseData ? responseData : responseData.data

      if (!pdfData?.pdf_base64) {
        throw new Error('La respuesta del reporte no contiene el PDF')
      }

      return pdfData
    }

    const pdfBase64 = await blobToBase64(response.data)

    if (!pdfBase64) {
      throw new Error('La respuesta del reporte no contiene el PDF')
    }

    return {
      pdf_base64: pdfBase64,
      filename,
      mime_type: contentType,
    }
  } catch (error: any) {
    console.error('Error al imprimir declaratoria:', error)
    throw error
  }
}

export {
  getDeclaratoriasComision,
  deleteDeclaratoriaComision,
  anularDeclaratoriaComision,
  getDeclaratoriaComisionById,
  createDeclaratoriaComision,
  updateDeclaratoriaComision,
  imprimirDeclaratoriaComision,
  generarReporteGeneralDeclaratoriaComision,
  getUnidades,
}
