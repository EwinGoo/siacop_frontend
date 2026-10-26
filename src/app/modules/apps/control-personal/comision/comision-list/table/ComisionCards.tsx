import {FC} from 'react'
import useDateFormatter from 'src/app/hooks/useDateFormatter'
import {KTIcon} from 'src/_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {Comision, ComisionPDFData} from '../core/_models'
import {ActionsCell} from './columns/ActionsCell'
import {EstadoBadge} from './components/EstadoBadge'

type Props = {
  comisiones: Comision[]
  canManage: boolean
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: ComisionPDFData) => void
  onCancelPDF: () => void
}

const ComisionCards: FC<Props> = ({
  comisiones,
  canManage,
  onPreparePDF,
  onShowPDF,
  onCancelPDF,
}) => {
  const {formatLongDate, formatTimeFromString} = useDateFormatter()
  const {selected, onSelect} = useListView()

  if (!comisiones.length) {
    return (
      <div className='alert alert-light d-flex align-items-center mb-0'>
        <KTIcon iconName='information-5' className='fs-2 text-primary me-3' />
        <span>No se encontraron registros</span>
      </div>
    )
  }

  return (
    <div className='row g-4'>
      {comisiones.map((comision, index) => {
        const isSelected = !!comision.id_comision && selected.includes(comision.id_comision)

        return (
          <div className='col-12 col-xl-6' key={comision.id_comision ?? `comision-card-${index}`}>
            {/* <div className='card border border-gray-200 shadow-sm h-100'> */}
            <div
              className={`card border h-100 shadow-sm border-primary
              `}
              style={isSelected ? {borderWidth: '1px'} : {}}
            >
              <div className='card-body p-4'>
                <div className='d-flex align-items-start justify-content-between gap-3 mb-3'>
                  <div className='d-flex align-items-center gap-3'>
                    {canManage && comision.id_comision ? (
                      <div className='form-check form-check-sm form-check-custom form-check-solid mt-1'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => onSelect(comision.id_comision!)}
                        />
                      </div>
                    ) : null}

                    <div>
                      <div className='text-gray-900 fw-bolder fs-5'>
                        {comision.tipo_comision || 'OTROS'}
                      </div>
                      <div className='text-muted fs-7'>
                        Código:{' '}
                        <span className='fw-semibold'>{comision.id_temporal || 'Sin código'}</span>
                      </div>
                    </div>
                  </div>

                  <EstadoBadge estado={comision.estado_boleta_comision} />
                </div>

                <div className='separator separator-dashed my-3'></div>

                <div className='d-flex flex-column gap-3'>
                  <div className='d-flex align-items-start gap-3'>
                    <KTIcon iconName='profile-user' className='fs-2 text-primary mt-1' />
                    <div>
                      <div className='text-muted fs-8 text-uppercase fw-bold'>Solicitante</div>
                      <div className='text-gray-800 fw-semibold'>
                        {comision.nombre_generador || 'N/D'}
                      </div>
                      <div className='text-muted fs-8'>
                        {comision.unidad || comision.nombre_cargo || 'Sin unidad'}
                      </div>
                    </div>
                  </div>

                  <div className='row g-3'>
                    <div className='col-6'>
                      <div className='d-flex align-items-start gap-2 h-100'>
                        <KTIcon iconName='calendar-8' className='fs-2 text-primary mt-1' />
                        <div>
                          <div className='text-muted fs-8 text-uppercase fw-bold'>Fecha</div>
                          <div className='text-gray-800 fw-semibold fs-7'>
                            {formatLongDate(comision.fecha_comision)}
                            {comision.fecha_comision_fin
                              ? ` al ${formatLongDate(comision.fecha_comision_fin)}`
                              : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='col-6'>
                      <div className='d-flex align-items-start gap-2 h-100'>
                        <KTIcon iconName='time' className='fs-2 text-primary mt-1' />
                        <div>
                          <div className='text-muted fs-8 text-uppercase fw-bold'>Horario</div>
                          <div className='text-gray-800 fw-semibold fs-7'>
                            {formatTimeFromString(comision.hora_salida)} -{' '}
                            {formatTimeFromString(comision.hora_retorno)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {comision.observacion ? (
                    <div className='notice d-flex rounded border border-dashed border-warning bg-light-warning p-4'>
                      <KTIcon iconName='information-4' className='fs-2 text-warning me-3' />
                      <div>
                        <div className='text-warning fw-bolder fs-8 text-uppercase'>
                          Observacion
                        </div>
                        <div className='text-gray-800 fs-7'>{comision.observacion}</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className='card-footer border-0 pt-0 px-4 pb-4'>
                <div className='d-flex flex-nowrap gap-2'>
                  {comision.id_comision ? (
                    <ActionsCell
                      id={comision.id_comision}
                      estado={comision.estado_boleta_comision}
                      hash={comision.hash}
                      carnet={comision.ci}
                      tipo={comision.tipo_comision}
                      buttonLabel='Acciones'
                      buttonClassName='btn btn-outline btn-outline-primary btn-sm flex-fill'
                      inlinePrimaryActions
                      onPreparePDF={onPreparePDF}
                      onShowPDF={onShowPDF}
                      onCancelPDF={onCancelPDF}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export {ComisionCards}
