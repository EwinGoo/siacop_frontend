import axios from 'axios'
import {API_ROUTES} from 'src/app/config/apiRoutes'
import {HorarioSemanalResponse, ConfiguracionCiclo, ProgramacionSemanalGuardia} from './_models'

const BASE_URL = `${API_ROUTES.GUARDIAS}/horario`
const BASE_PROGRAMACION_URL = `${API_ROUTES.GUARDIAS}/programaciones-semanales`

export const getHorarioSemana = (fechaInicio?: string, idHorarioTipo?: number | null): Promise<HorarioSemanalResponse> => {
  const searchParams = new URLSearchParams()
  if (fechaInicio) searchParams.set('fecha_inicio', fechaInicio)
  if (idHorarioTipo) searchParams.set('id_horario_tipo', String(idHorarioTipo))
  const params = searchParams.toString() ? `?${searchParams.toString()}` : ''
  return axios.get(`${BASE_URL}/semana${params}`).then((res) => res.data.data)
}

export const generarSemana = (fechaInicio: string): Promise<{asignaciones_creadas: number}> => {
  return axios.post(`${BASE_URL}/generar-semana`, {fecha_inicio: fechaInicio}).then((res) => res.data.data)
}

export const getConfiguracion = (): Promise<ConfiguracionCiclo | null> => {
  return axios.get(`${BASE_URL}/configuracion`).then((res) => res.data.data)
}

export const saveConfiguracion = (cfg: ConfiguracionCiclo): Promise<ConfiguracionCiclo> => {
  return axios.post(`${BASE_URL}/configuracion`, cfg).then((res) => res.data.data)
}

export const getProgramacionSemanal = (fechaInicioSemana: string): Promise<ProgramacionSemanalGuardia[]> => {
  return axios
    .get(`${BASE_PROGRAMACION_URL}?fecha_inicio_semana=${fechaInicioSemana}`)
    .then((res) => res.data.data || [])
}

export const createProgramacionSemanal = (
  payload: ProgramacionSemanalGuardia
): Promise<ProgramacionSemanalGuardia> => {
  return axios.post(BASE_PROGRAMACION_URL, payload).then((res) => res.data.data)
}

export const updateProgramacionSemanal = (
  id: number,
  payload: ProgramacionSemanalGuardia
): Promise<ProgramacionSemanalGuardia> => {
  return axios.put(`${BASE_PROGRAMACION_URL}/${id}`, payload).then((res) => res.data.data)
}

export const deleteProgramacionSemanal = (id: number): Promise<void> => {
  return axios.delete(`${BASE_PROGRAMACION_URL}/${id}`).then(() => {})
}
