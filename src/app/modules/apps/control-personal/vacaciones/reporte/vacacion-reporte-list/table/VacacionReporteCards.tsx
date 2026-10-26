import {FC} from 'react'
import useDateFormatter from 'src/app/hooks/useDateFormatter'
import {KTIcon} from 'src/_metronic/helpers'
import {Vacacion} from 'src/app/modules/apps/control-personal/vacaciones/core/_models'

type Props = {
  items: Vacacion[]
}

const estadoBadge: Record<string, string> = {
  GENERADO: 'badge-light-primary',
  ENVIADO: 'badge-light-info',
  RECEPCIONADO: 'badge-light-warning',
  APROBADO: 'badge-light-success',
  OBSERVADO: 'badge-light-danger',
}

const VacacionReporteCards: FC<Props> = ({items}) => {
  const {formatShortDate} = useDateFormatter()

  if (!items.length) {
    return (
      <div className='alert alert-light d-flex align-items-center mb-0'>
        <KTIcon iconName='information-5' className='fs-2 text-primary me-3' />
        <span>No se encontraron registros de vacaciones</span>
      </div>
    )
  }

  return (
    <div className='row g-5'>
      {items.map((item, index) => (
        <div className='col-12' key={item.id_vacacion_solicitado ?? `vacacion-${index}`}>
          <div className='card border border-gray-200 shadow-sm h-100'>
            <div className='card-body p-5'>
              <div className='d-flex align-items-start justify-content-between gap-3 mb-4'>
                <div>
                  <div className='text-gray-900 fw-bolder fs-5'>{item.nombre_generador || 'N/D'}</div>
                  <div className='text-muted fs-7'>CI {item.ci || 'N/D'}</div>
                </div>
                <span className={`badge ${estadoBadge[item.estado_vacacion] ?? 'badge-light'}`}>
                  {item.estado_vacacion}
                </span>
              </div>

              <div className='d-flex flex-column gap-4'>
                <div>
                  <div className='text-muted fs-8 text-uppercase fw-bold'>Cargo</div>
                  <div className='text-gray-800 fw-semibold'>{item.nombre_cargo || 'N/D'}</div>
                </div>

                <div className='row g-3'>
                  <div className='col-6'>
                    <div className='bg-light rounded p-3 h-100'>
                      <div className='text-muted fs-8 text-uppercase fw-bold'>Tipo</div>
                      <div className='text-gray-800 fw-semibold'>{item.tipo_solicitud || 'N/D'}</div>
                    </div>
                  </div>
                  <div className='col-6'>
                    <div className='bg-light rounded p-3 h-100'>
                      <div className='text-muted fs-8 text-uppercase fw-bold'>Dias</div>
                      <div className='text-gray-800 fw-semibold'>{item.dias_solicitado}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className='text-muted fs-8 text-uppercase fw-bold'>Solicitud</div>
                  <div className='text-gray-800 fw-semibold'>{formatShortDate(item.fecha_solicitud)}</div>
                </div>

                <div>
                  <div className='text-muted fs-8 text-uppercase fw-bold'>Vacacion</div>
                  <div className='text-gray-800 fw-semibold'>
                    {formatShortDate(item.fecha_vacacion_inicio)} al {formatShortDate(item.fecha_vacacion_fin)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export {VacacionReporteCards}
