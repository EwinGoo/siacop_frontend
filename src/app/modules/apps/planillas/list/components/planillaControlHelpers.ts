import {PlanillaEstadoCarrera, PlanillaModulo, PlanillaResumen} from '../core/_models'
import {format} from 'date-fns'
import {es} from 'date-fns/locale'

export type EstadoFiltro = 'TODOS' | PlanillaEstadoCarrera

export const estadosCarrera: PlanillaEstadoCarrera[] = ['PENDIENTE', 'ENVIADO', 'APROBADO']

export const moduleLabel: Record<PlanillaModulo, string> = {
  docente: 'Docente',
  estudiante: 'Estudiante',
}

export const esPlanillaAprobada = (planilla: Pick<PlanillaResumen, 'estado_planilla'>) =>
  planilla.estado_planilla.toUpperCase() === 'APROBADO'

export const esPlanillaPendiente = (planilla: Pick<PlanillaResumen, 'estado_planilla'>) =>
  planilla.estado_planilla.toUpperCase() === 'PENDIENTE'

export const toNumber = (value: string | number | null | undefined) => Number(value || 0)

export const formatNumber = (value: string | number | null | undefined) =>
  new Intl.NumberFormat('es-BO', {maximumFractionDigits: 2}).format(toNumber(value))

export const getApprovedPercent = (planilla: PlanillaResumen) => {
  const total = toNumber(planilla.total_carreras)
  if (total === 0) return 0

  return Math.round((toNumber(planilla.total_aprobadas) / total) * 100)
}
