import axiosClient from 'src/app/services/axiosClient'
import {API_ROUTES} from 'src/app/config/apiRoutes'
import {Horario, HorarioAlterno, HorarioBase, HorarioTipo, ListResponse} from './_models'

type BackendEnvelope<T> = {
  status: string
  data: T
  message: string
  timestamp: string
}

const unwrap = <T,>(response: {data: BackendEnvelope<T>}): T => response.data.data

export const listarHorarioTipos = async (search: string, page: number, limit: number): Promise<ListResponse<HorarioTipo>> => {
  const response = await axiosClient.get<BackendEnvelope<ListResponse<HorarioTipo>>>(API_ROUTES.HORARIO_TIPOS, {params: {search, page, limit}})
  return unwrap(response)
}

export const listarHorarioTiposDropdown = async (): Promise<HorarioTipo[]> => {
  const response = await axiosClient.get<BackendEnvelope<HorarioTipo[]>>(`${API_ROUTES.HORARIO_TIPOS}/dropdown`)
  return unwrap(response) || []
}

export const crearHorarioTipo = async (payload: HorarioTipo): Promise<HorarioTipo> => {
  const response = await axiosClient.post<BackendEnvelope<HorarioTipo>>(API_ROUTES.HORARIO_TIPOS, payload)
  return unwrap(response)
}

export const actualizarHorarioTipo = async (id: number, payload: Partial<HorarioTipo>): Promise<HorarioTipo> => {
  const response = await axiosClient.put<BackendEnvelope<HorarioTipo>>(`${API_ROUTES.HORARIO_TIPOS}/${id}`, payload)
  return unwrap(response)
}

export const eliminarHorarioTipo = async (id: number): Promise<HorarioTipo> => {
  const response = await axiosClient.delete<BackendEnvelope<HorarioTipo>>(`${API_ROUTES.HORARIO_TIPOS}/${id}`)
  return unwrap(response)
}

export const listarHorarios = async (params: Record<string, unknown>): Promise<ListResponse<Horario>> => {
  const response = await axiosClient.get<BackendEnvelope<ListResponse<Horario>>>(API_ROUTES.HORARIOS, {params})
  return unwrap(response)
}

export const listarHorariosDropdown = async (): Promise<HorarioBase[]> => {
  const response = await axiosClient.get<BackendEnvelope<HorarioBase[]>>(`${API_ROUTES.HORARIOS}/dropdown`)
  return unwrap(response) || []
}

export const crearHorario = async (payload: Horario): Promise<Horario> => {
  const response = await axiosClient.post<BackendEnvelope<Horario>>(API_ROUTES.HORARIOS, payload)
  return unwrap(response)
}

export const actualizarHorario = async (id: number, payload: Partial<Horario>): Promise<Horario> => {
  const response = await axiosClient.put<BackendEnvelope<Horario>>(`${API_ROUTES.HORARIOS}/${id}`, payload)
  return unwrap(response)
}

export const eliminarHorario = async (id: number): Promise<Horario> => {
  const response = await axiosClient.delete<BackendEnvelope<Horario>>(`${API_ROUTES.HORARIOS}/${id}`)
  return unwrap(response)
}

export const listarHorariosBase = async (): Promise<HorarioBase[]> => {
  const response = await axiosClient.get<BackendEnvelope<HorarioBase[]>>(`${API_ROUTES.HORARIO_ALTERNOS}/horarios-base`)
  return unwrap(response) || []
}

export const listarHorarioAlternos = async (params: Record<string, unknown>): Promise<ListResponse<HorarioAlterno>> => {
  const response = await axiosClient.get<BackendEnvelope<ListResponse<HorarioAlterno>>>(API_ROUTES.HORARIO_ALTERNOS, {params})
  return unwrap(response)
}

export const crearHorarioAlterno = async (payload: HorarioAlterno): Promise<HorarioAlterno> => {
  const response = await axiosClient.post<BackendEnvelope<HorarioAlterno>>(API_ROUTES.HORARIO_ALTERNOS, payload)
  return unwrap(response)
}

export const actualizarHorarioAlterno = async (id: number, payload: Partial<HorarioAlterno>): Promise<HorarioAlterno> => {
  const response = await axiosClient.put<BackendEnvelope<HorarioAlterno>>(`${API_ROUTES.HORARIO_ALTERNOS}/${id}`, payload)
  return unwrap(response)
}

export const eliminarHorarioAlterno = async (id: number): Promise<HorarioAlterno> => {
  const response = await axiosClient.delete<BackendEnvelope<HorarioAlterno>>(`${API_ROUTES.HORARIO_ALTERNOS}/${id}`)
  return unwrap(response)
}