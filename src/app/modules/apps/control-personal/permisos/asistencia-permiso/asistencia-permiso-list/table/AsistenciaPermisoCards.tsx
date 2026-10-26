import {FC} from 'react'
import useDateFormatter from 'src/app/hooks/useDateFormatter'
import {KTIcon} from 'src/_metronic/helpers'
import {AsistenciaPermiso, PermisoPDFData} from '../core/_models'
import {useListView} from '../core/ListViewProvider'
import {ActionsCell} from './columns/ActionsCell'
import {EstadoBadge} from 'src/app/modules/apps/control-personal/comision/comision-list/table/components/EstadoBadge'

type Props = {
  items: AsistenciaPermiso[]
  canManage: boolean
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: PermisoPDFData) => void
  onCancelPDF: () => void
}

const AsistenciaPermisoCards: FC<Props> = ({
  items,
  canManage,
  onPreparePDF,
  onShowPDF,
  onCancelPDF,
}) => {
  const {formatLongDate} = useDateFormatter()
  const {selected, onSelect} = useListView()

  if (!items.length) {
    return (
      <div className='alert alert-light d-flex align-items-center mb-0'>
        <KTIcon iconName='information-5' className='fs-2 text-primary me-3' />
        <span>No se encontraron registros</span>
      </div>
    )
  }

  return (
    <div className='row g-4'>
      {items.map((item, index) => {
        const isSelected = selected.includes(item.id_asistencia_permiso)

        return (
          <div className='col-12 col-xl-6' key={item.id_asistencia_permiso ?? `permiso-${index}`}>
            <div className='card border border-primary shadow-sm h-100'>
              <div className='card-body p-4'>
                <div className='d-flex align-items-start justify-content-between gap-3 mb-3'>
                  <div className='d-flex align-items-center gap-3'>
                    {canManage ? (
                      <div className='form-check form-check-sm form-check-custom form-check-solid mt-1'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => onSelect(item.id_asistencia_permiso)}
                        />
                      </div>
                    ) : null}
                    <div>
                      <div className='text-gray-900 fw-bolder fs-5'>
                        {item.tipo_permiso_nombre || 'Permiso'}
                      </div>
                      <div className='text-muted fs-7'>
                        Código: <span className='fw-semibold'>{item.id_temporal || 'Sin codigo'}</span>
                      </div>
                    </div>
                  </div>
                  <EstadoBadge estado={item.estado_permiso} />
                </div>

                <div className='separator separator-dashed my-3'></div>

                <div className='d-flex flex-column gap-3'>
                  <div className='d-flex align-items-start gap-3'>
                    <KTIcon iconName='profile-user' className='fs-2 text-primary mt-1' />
                    <div>
                      <div className='text-muted fs-8 text-uppercase fw-bold'>Solicitante</div>
                      <div className='text-gray-800 fw-semibold'>{item.nombre_generador || 'N/D'}</div>
                      <div className='text-muted fs-8'>
                        {item.tipo_personal || item.ci || 'Sin tipo registrado'}
                      </div>
                    </div>
                  </div>

                  <div className='row g-3'>
                    <div className='col-6'>
                      <div className='d-flex align-items-start gap-2 h-100'>
                        <KTIcon iconName='calendar-8' className='fs-2 text-primary mt-1' />
                        <div>
                          <div className='text-muted fs-8 text-uppercase fw-bold'>Inicio</div>
                          <div className='text-gray-800 fw-semibold fs-7'>
                            {formatLongDate(item.fecha_inicio_permiso)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='col-6'>
                      <div className='d-flex align-items-start gap-2 h-100'>
                        <KTIcon iconName='calendar-2' className='fs-2 text-primary mt-1' />
                        <div>
                          <div className='text-muted fs-8 text-uppercase fw-bold'>Fin</div>
                          <div className='text-gray-800 fw-semibold fs-7'>
                            {formatLongDate(item.fecha_fin_permiso)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className='text-muted fs-8 text-uppercase fw-bold'>Detalle</div>
                    <div className='text-gray-800 fs-6'>{item.detalle_permiso || 'Sin detalle'}</div>
                  </div>

                  {item.observacion ? (
                    <div className='notice d-flex rounded border border-dashed border-warning bg-light-warning p-4'>
                      <KTIcon iconName='information-4' className='fs-2 text-warning me-3' />
                      <div className='text-gray-800 fs-7'>{item.observacion}</div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className='card-footer border-0 pt-0 px-4 pb-4'>
                <div className='d-flex flex-nowrap gap-2'>
                  <ActionsCell
                    id={item.id_asistencia_permiso}
                    estado={item.estado_permiso}
                    hash={item.hash}
                    carnet={item.ci}
                    buttonLabel='Acciones'
                    buttonClassName='btn btn-outline btn-outline-primary btn-sm flex-fill'
                    inlinePrimaryActions
                    onPreparePDF={onPreparePDF}
                    onShowPDF={onShowPDF}
                    onCancelPDF={onCancelPDF}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export {AsistenciaPermisoCards}
