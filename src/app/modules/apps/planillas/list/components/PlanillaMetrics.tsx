import {formatNumber} from './planillaControlHelpers'

export type PlanillaCarreraTotals = {
  pendiente: number
  enviado: number
  aprobado: number
  asignaciones: number
  horasAsignadas: number
  horasTrabajadas: number
}

type Props = {
  carrerasCount: number
  totals: PlanillaCarreraTotals
}

export const PlanillaMetrics = ({carrerasCount, totals}: Props) => (
  <div className='row g-4 mb-6'>
    <Metric title='Carreras' value={carrerasCount} tone='primary' />
    <Metric title='Pendientes' value={totals.pendiente} tone='warning' />
    <Metric title='Enviadas' value={totals.enviado} tone='info' />
    <Metric title='Aprobadas' value={totals.aprobado} tone='success' />
    <Metric title='Asignaciones' value={totals.asignaciones} tone='secondary' />
    <Metric title='Horas trabajadas' value={formatNumber(totals.horasTrabajadas)} tone='dark' />
  </div>
)

type MetricProps = {
  title: string
  value: string | number
  tone: string
}

const Metric = ({title, value, tone}: MetricProps) => (
  <div className='col-6 col-md-4 col-xl-2'>
    <div className={`border border-${tone} border-dashed rounded py-3 px-4 h-100`}>
      <div className={`fs-4 fw-bold text-${tone}`}>{value}</div>
      <div className='fw-semibold text-muted fs-7'>{title}</div>
    </div>
  </div>
)
