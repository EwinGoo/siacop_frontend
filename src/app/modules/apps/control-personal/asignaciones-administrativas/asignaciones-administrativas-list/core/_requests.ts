import axiosClient from 'src/app/services/axiosClient'
import {API_ROUTES} from 'src/app/config/apiRoutes'
import qs from 'qs'
import {PaginationState} from 'src/_metronic/helpers'
import {
  AsignacionAdministrativa,
  AsignacionAdministrativaListResponse,
  AsignacionAdministrativaQueryResponse,
  HorarioTipo,
} from './_models'

const ASIGNACION_ADMINISTRATIVO_URL = API_ROUTES.ASIGNACION_ADMINISTRATIVO

type BackendEnvelope<T> = {
  status: string
  data: T
  message: string
  timestamp: string
}

const buildPagination = (page: number, itemsPerPage: number, total: number): PaginationState => {
  const safePerPage =
    itemsPerPage === 30 || itemsPerPage === 50 || itemsPerPage === 100 ? itemsPerPage : 10
  const pageCount = Math.max(1, Math.ceil(total / safePerPage))
  const currentPage = Math.min(Math.max(1, page), pageCount)

  return {
    page: currentPage,
    items_per_page: safePerPage,
    currentPage,
    perPage: safePerPage,
    pageCount,
    total,
    next: currentPage < pageCount ? `?page=${currentPage + 1}&items_per_page=${safePerPage}` : null,
    previous: currentPage > 1 ? `?page=${currentPage - 1}&items_per_page=${safePerPage}` : null,
    links: [],
  }
}

export const listarAsignacionesAdministrativas = async (
  search: string,
  page: number,
  limit: number
): Promise<AsignacionAdministrativaListResponse> => {
  const response = await axiosClient.get<BackendEnvelope<AsignacionAdministrativaListResponse>>(
    ASIGNACION_ADMINISTRATIVO_URL,
    {
      params: {search, page, limit},
    }
  )

  return response.data.data
}

export const getAsignacionesAdministrativas = async (
  query: string
): Promise<AsignacionAdministrativaQueryResponse> => {
  try {
    const parsed = qs.parse(query)
    const page = Math.max(1, Number(parsed.page || 1))
    const limit = Number(parsed.items_per_page || 10)
    const search = typeof parsed.search === 'string' ? parsed.search : ''
    const estado =
      typeof parsed.filter_estado === 'string' && parsed.filter_estado !== ''
        ? Number(parsed.filter_estado)
        : undefined

    const response = await axiosClient.get<BackendEnvelope<AsignacionAdministrativaListResponse>>(
      ASIGNACION_ADMINISTRATIVO_URL,
      {
        params: {search, page, limit, estado},
      }
    )

    const backendData = response.data.data
    const total = Number(backendData?.pagination?.total || 0)

    return {
      data: backendData?.data || [],
      payload: {
        message: response.data.message,
        pagination: buildPagination(page, limit, total),
      },
    }
  } catch (error: any) {
    console.error('Error fetching asignaciones administrativas:', error)
    return {
      data: [],
      payload: {
        message: 'Error al obtener asignaciones administrativas',
        errors: {server: [error?.message || 'Error desconocido']},
        pagination: buildPagination(1, 10, 0),
      },
    }
  }
}

export const obtenerAsignacionAdministrativa = async (
  id: number
): Promise<AsignacionAdministrativa> => {
  const response = await axiosClient.get<BackendEnvelope<AsignacionAdministrativa>>(
    `${ASIGNACION_ADMINISTRATIVO_URL}/${id}`
  )

  return response.data.data
}

export const crearAsignacionAdministrativa = async (
  payload: AsignacionAdministrativa
): Promise<AsignacionAdministrativa> => {
  const response = await axiosClient.post<BackendEnvelope<AsignacionAdministrativa>>(
    ASIGNACION_ADMINISTRATIVO_URL,
    payload
  )

  return response.data.data
}

// export const actualizarAsignacionAdministrativa = async (
//   id: number,
//   payload: AsignacionAdministrativa
// ): Promise<AsignacionAdministrativa> => {
//   const response = await axiosClient.put<BackendEnvelope<AsignacionAdministrativa>>(
//     `${ASIGNACION_ADMINISTRATIVO_URL}/${id}`,
//     payload
//   )

//   return response.data.data
// }

export const actualizarAsignacionAdministrativa = async (
  id: number,
  payload: Partial<AsignacionAdministrativa>
): Promise<AsignacionAdministrativa> => {
  const response = await axiosClient.put<BackendEnvelope<AsignacionAdministrativa>>(
    `${ASIGNACION_ADMINISTRATIVO_URL}/${id}`,
    payload
  )

  return response.data.data
}

export const eliminarAsignacionAdministrativa = async (id: number): Promise<void> => {
  await axiosClient.delete(`${ASIGNACION_ADMINISTRATIVO_URL}/${id}`)
}

export const listarHorariosTipo = async (): Promise<HorarioTipo[]> => {
  const response = await axiosClient.get<BackendEnvelope<HorarioTipo[]>>(
    `${ASIGNACION_ADMINISTRATIVO_URL}/horario-tipos`
  )

  return response.data.data || []
}
