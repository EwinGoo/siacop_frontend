import {FC} from 'react'
import useDateFormatter from 'src/app/hooks/useDateFormatter'
import {KTIcon} from 'src/_metronic/helpers'
import {FeriadoAsueto} from '../core/_models'
import {ActionsCell} from './columns/ActionsCell'

type Props = {
  items: FeriadoAsueto[]
}

const FeriadoAsuetoCards: FC<Props> = ({items}) => {
  const {formatLongDate, formatTimeFromString} = useDateFormatter()

  if (!items.length) {
    return (
      <div className='alert alert-light d-flex align-items-center mb-0'>
        <KTIcon iconName='information-5' className='fs-2 text-primary me-3' />
        <span>No se encontraron feriados o asuetos registrados</span>
      </div>
    )
  }

  return (
    <div className='row g-5'>
      {items.map((item, index) => (
        <div className='col-12' key={item.id_asistencia_feriado_asueto ?? `feriado-${index}`}>
          <div className='card border border-gray-200 shadow-sm h-100'>
            <div className='card-body p-5'>
              <div className='d-flex align-items-start justify-content-between gap-3 mb-4'>
                <div>
                  <div className='text-gray-900 fw-bolder fs-5'>{item.nombre_evento || 'Evento'}</div>
                  <div className='text-muted fs-7'>{item.tipo_evento || 'N/D'}</div>
                </div>
                <span
                  className={`badge badge-light-${
                    item.tipo_evento === 'FERIADO' ? 'primary' : 'info'
                  }`}
                >
                  {item.tipo_evento}
                </span>
              </div>

              <div className='d-flex flex-column gap-4'>
                <div>
                  <div className='text-muted fs-8 text-uppercase fw-bold'>Fecha</div>
                  <div className='text-gray-800 fw-semibold'>
                    {item.tipo_evento === 'FERIADO'
                      ? `${formatLongDate(item.fecha_inicio)} al ${formatLongDate(item.fecha_fin)}`
                      : formatLongDate(item.fecha_evento)}
                  </div>
                </div>

                <div>
                  <div className='text-muted fs-8 text-uppercase fw-bold'>Horario</div>
                  <div className='text-gray-800 fw-semibold'>
                    {item.tipo_evento === 'ASUETO'
                      ? `${formatTimeFromString(item.hora_inicio || '')} - ${formatTimeFromString(item.hora_fin || '')}`
                      : 'Todo el dia'}
                  </div>
                </div>

                <div>
                  <div className='text-muted fs-8 text-uppercase fw-bold'>Aplicado a</div>
                  <span
                    className={`badge badge-light-${
                      item.aplicado_a === 'TODOS'
                        ? 'success'
                        : item.aplicado_a === 'MASCULINO'
                        ? 'primary'
                        : 'danger'
                    }`}
                  >
                    {item.aplicado_a}
                  </span>
                </div>
              </div>
            </div>

            <div className='card-footer border-0 pt-0 px-5 pb-5'>
              <ActionsCell id={item.id_asistencia_feriado_asueto} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export {FeriadoAsuetoCards}
