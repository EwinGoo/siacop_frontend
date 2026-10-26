import {KTCard} from 'src/_metronic/helpers'
import {EstadoBadge} from 'src/app/modules/components/EstadoBadge'
import {PlanillaResumen} from '../core/_models'
import {esPlanillaAprobada, formatNumber, getApprovedPercent} from './planillaControlHelpers'
import {PlanillaSearchHeader} from './PlanillaSearchHeader'

type Props = {
  planillas: PlanillaResumen[]
  search: string
  loading: boolean
  onSearch: (value: string) => void
  onOpen: (idPlanilla: number) => void
  onReload: () => void
}

export const PlanillaListView = ({planillas, search, loading, onSearch, onOpen, onReload}: Props) => {
  return (
    <KTCard>
      <PlanillaSearchHeader
        search={search}
        placeholder='Buscar por numero, mes o estado'
        onSearch={onSearch}
        onReload={onReload}
      />

      <div className='card-body py-5'>
        <div className='row g-5'>
          {planillas.map((planilla) => {
            const approvedPercent = getApprovedPercent(planilla)

            return (
              <div className='col-12 col-lg-6 col-xxl-4' key={planilla.id_planilla}>
                <div className='border border-gray-300 rounded p-5 h-100'>
                  <div className='d-flex justify-content-between align-items-start mb-4'>
                    <div>
                      <div className='fs-4 fw-bold text-gray-900'> {planilla.tipo_planilla} {planilla.mes_gestion}</div>
                    </div>
                    <EstadoBadge estado={planilla.estado_planilla} />
                  </div>

                  <div className='d-flex justify-content-between text-muted fw-semibold fs-7 mb-2'>
                    <span>Carreras aprobadas</span>
                    <span>{approvedPercent}%</span>
                  </div>
                  <div className='progress h-8px mb-5'>
                    <div className='progress-bar bg-success' style={{width: `${approvedPercent}%`}} />
                  </div>

                  <div className='row g-3 mb-5'>
                    <MiniStat label='Carreras' value={planilla.total_carreras} />
                    <MiniStat label='Pend.' value={planilla.total_pendientes} />
                    <MiniStat label='Env.' value={planilla.total_enviadas} />
                    <MiniStat label='Aprob.' value={planilla.total_aprobadas} />
                  </div>

                  <div className='d-flex justify-content-between align-items-center'>
                    <span className='text-muted fs-7'>Items generados: {formatNumber(planilla.total_items)}</span>
                    <button className='btn btn-sm btn-primary' onClick={() => onOpen(planilla.id_planilla)}>
                      {esPlanillaAprobada(planilla) ? 'Ver planilla' : 'Gestionar carreras'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {!loading && planillas.length === 0 && (
            <div className='col-12'>
              <div className='text-center text-muted py-15'>No se encontraron planillas disponibles</div>
            </div>
          )}

          {loading && (
            <div className='col-12'>
              <div className='text-center text-muted py-15'>Cargando planillas...</div>
            </div>
          )}
        </div>
      </div>
    </KTCard>
  )
}

type MiniStatProps = {
  label: string
  value: string | number | null
}

const MiniStat = ({label, value}: MiniStatProps) => (
  <div className='col-3'>
    <div className='bg-light rounded px-3 py-2 text-center h-100'>
      <div className='fw-bold text-gray-900'>{formatNumber(value)}</div>
      <div className='text-muted fs-8'>{label}</div>
    </div>
  </div>
)
