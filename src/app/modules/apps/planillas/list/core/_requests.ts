import axiosClient from 'src/app/services/axiosClient'
import {API_ROUTES} from 'src/app/config/apiRoutes'
import {
  BackendResponse,
  PlanillaCarrerasResponse,
  PlanillaEstadoCarrera,
  PlanillaModulo,
  PlanillaResumen,
} from './_models'

const routePrefix: Record<PlanillaModulo, string> = {
  docente: API_ROUTES.PLANILLA_DOCENTE,
  estudiante: API_ROUTES.PLANILLA_ESTUDIANTE,
}

const baseUrl = (modulo: PlanillaModulo) =>
  `${routePrefix[modulo]}/habilitacion/${modulo}`

export const getPlanillas = async (modulo: PlanillaModulo): Promise<PlanillaResumen[]> => {
  const response = await axiosClient.get<BackendResponse<PlanillaResumen[]>>(baseUrl(modulo))
  return response.data.data
}

export const getCarrerasPlanilla = async (
  modulo: PlanillaModulo,
  idPlanilla: number
): Promise<PlanillaCarrerasResponse> => {
  const response = await axiosClient.get<BackendResponse<PlanillaCarrerasResponse>>(
    `${baseUrl(modulo)}/${idPlanilla}/carreras`
  )
  return response.data.data
}

export const updateCarrerasFechas = async (
  modulo: PlanillaModulo,
  idPlanilla: number,
  carreras: number[],
  fechaInicio: string,
  fechaFin: string
) => {
  const response = await axiosClient.post(`${baseUrl(modulo)}/${idPlanilla}/carreras/fechas`, {
    carreras,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  })
  return response.data
}

export const updateCarreraEstado = async (
  modulo: PlanillaModulo,
  idPlanilla: number,
  idCarreraSede: number,
  estado: PlanillaEstadoCarrera
) => {
  const response = await axiosClient.patch(
    `${baseUrl(modulo)}/${idPlanilla}/carreras/${idCarreraSede}/estado`,
    {estado}
  )
  return response.data
}
