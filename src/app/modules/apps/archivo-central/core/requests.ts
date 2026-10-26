import axios from 'axios'
import axiosClient from '../../../../services/axiosClient'
import {API_ROUTES} from '../../../../config/apiRoutes'
import {
  Administrativo,
  ApiResponse,
  BusquedaAdministrativos,
  BusquedaDocumentos,
  Catalogos,
  Documento,
  Expediente,
  Pagina,
} from './types'

export class ArchivoApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly campos: Record<string, string> = {}
  ) {
    super(message)
    this.name = 'ArchivoApiError'
  }
}

async function consultar<T>(path: string, params?: object, signal?: AbortSignal): Promise<T> {
  try {
    const {data} = await axiosClient.get<ApiResponse<T>>(`${API_ROUTES.ARCHIVO_CENTRAL}${path}`, {
      params,
      signal,
      withCredentials: true,
      timeout: 20000,
    })
    if (data.status !== 'success' || data.data === null) {
      throw new ArchivoApiError(502, 'No se pudo interpretar la respuesta del servidor.')
    }
    return data.data
  } catch (error: unknown) {
    if (axios.isCancel(error) || error instanceof ArchivoApiError) throw error
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0
      const messages: Record<number, string> = {
        401: 'Tu sesión ha finalizado. Inicia sesión nuevamente para continuar.',
        403: 'No tienes acceso a esta consulta o debes completar la verificación de seguridad.',
        404: 'El recurso solicitado no existe o no está disponible.',
        422: 'Revisa los filtros de búsqueda e inténtalo nuevamente.',
      }
      throw new ArchivoApiError(
        status,
        messages[status] ?? 'No se pudo conectar con Archivo Central. Inténtalo nuevamente.'
      )
    }
    throw new ArchivoApiError(0, 'No se pudo consultar Archivo Central.')
  }
}
export const getAdministrativos = (filtros: BusquedaAdministrativos, signal?: AbortSignal) =>
  consultar<Pagina<Administrativo>>('/administrativos', filtros, signal)
export const getAdministrativo = (id: number, signal?: AbortSignal) =>
  consultar<Administrativo>(`/administrativos/${id}`, undefined, signal)
export const getExpediente = (id: number, signal?: AbortSignal) =>
  consultar<Expediente>(`/expedientes/${id}`, undefined, signal)
export const getDocumentos = (id: number, filtros: BusquedaDocumentos, signal?: AbortSignal) =>
  consultar<Pagina<Documento>>(`/expedientes/${id}/documentos`, filtros, signal)
export const getCatalogos = (signal?: AbortSignal) =>
  consultar<Catalogos>('/catalogos', undefined, signal)

export async function getPdfDocumento(
  id: number,
  accion: 'preview' | 'download',
  signal?: AbortSignal
): Promise<Blob> {
  try {
    const response = await axiosClient.get<Blob>(
      `${API_ROUTES.ARCHIVO_CENTRAL}/documentos/${id}/${accion}`,
      {
        withCredentials: true,
        responseType: 'blob',
        signal,
        timeout: 30000,
      }
    )
    if (
      !(response.data instanceof Blob) ||
      !response.data.type.startsWith('application/pdf') ||
      response.data.size === 0
    ) {
      throw new ArchivoApiError(502, 'El servidor no devolvió un PDF válido.')
    }
    return response.data
  } catch (error: unknown) {
    if (axios.isCancel(error) || error instanceof ArchivoApiError) throw error
    const status = axios.isAxiosError(error) ? error.response?.status ?? 0 : 0
    const messages: Record<number, string> = {
      401: 'Tu sesión ha finalizado. Inicia sesión nuevamente para continuar.',
      403: 'No tienes acceso a este archivo.',
      404: 'El archivo no está disponible.',
      409: 'Este PDF histórico todavía no está disponible desde SIACOP V3.',
    }
    throw new ArchivoApiError(
      status,
      messages[status] ?? 'No se pudo obtener el PDF. Inténtalo nuevamente.'
    )
  }
}

// Cada mutación obtiene el token de sesión vigente. No se reintenta una escritura automáticamente.
async function gestionar<T>(
  path: string,
  datos: Record<string, unknown> | FormData,
  eliminar = false,
  progreso?: (valor: number) => void
): Promise<T> {
  const token = await consultar<{name: string; hash: string}>('/csrf')
  const body = datos instanceof FormData ? datos : {...datos}
  if (body instanceof FormData) body.set(token.name, token.hash)
  else body[token.name] = token.hash
  try {
    const response = await axiosClient.request<ApiResponse<T>>({
      url: `${API_ROUTES.ARCHIVO_CENTRAL}${path}`,
      method: eliminar ? 'DELETE' : 'POST',
      data: body,
      withCredentials: true,
      timeout: 120000,
      onUploadProgress: progreso
        ? (event) => {
            if (event.total) progreso(Math.round((event.loaded * 100) / event.total))
          }
        : undefined,
    })
    if (response.data.status !== 'success' || response.data.data === null) {
      throw new ArchivoApiError(502, 'No se pudo interpretar la respuesta del servidor.')
    }
    return response.data.data
  } catch (error: unknown) {
    if (error instanceof ArchivoApiError) throw error
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as ApiResponse<Record<string, string>> | undefined
      throw new ArchivoApiError(
        error.response?.status ?? 0,
        typeof data?.message === 'string'
          ? data.message
          : 'No se pudo completar la operación. Comprueba el listado antes de reintentar.',
        data?.data && typeof data.data === 'object' ? data.data : {}
      )
    }
    throw new ArchivoApiError(0, 'No se pudo completar la operación.')
  }
}
export const registrarExpediente = (personaId: number) =>
  gestionar<{persona_id: number}>('/expedientes', {persona_id: personaId})
export const registrarDocumento = (
  personaId: number,
  datos: FormData,
  progreso: (valor: number) => void
) =>
  gestionar<{id: number; persona_id: number}>(
    `/expedientes/${personaId}/documentos`,
    datos,
    false,
    progreso
  )
export const eliminarDocumento = (id: number) =>
  gestionar<{id: number; persona_id: number}>(`/documentos/${id}`, {}, true)
