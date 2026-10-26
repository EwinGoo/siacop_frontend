import {FC} from 'react'
import useDateFormatter from 'src/app/hooks/useDateFormatter'
import {KTIcon} from 'src/_metronic/helpers'
import {DeclaratoriaComision} from '../core/_models'
import {ActionsCell} from './columns/ActionsCell'
import {PDFData} from './columns/_columns'
import {EstadoBadge} from '../components/EstadoBadge'

type Props = {
  items: DeclaratoriaComision[]
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: PDFData) => void
  onCancelPDF: () => void
  onShowData: (declaratoria: any) => void
  onSetLoading: (declaratoriaId: string, isLoading: boolean) => void
  getLoadingState: (declaratoriaId: string) => boolean
}

const DeclaratoriaComisionCards: FC<Props> = ({
  items,
  onPreparePDF,
  onShowPDF,
  onCancelPDF,
  onShowData,
  onSetLoading,
  getLoadingState,
}) => {
  const {formatShortDate} = useDateFormatter()

  if (!items.length) {
    return (
      <div className='alert alert-light d-flex align-items-center mb-0'>
        <KTIcon iconName='information-5' className='fs-2 text-primary me-3' />
        <span>No se encontraron registros</span>
      </div>
    )
  }

  return (
    <div className='row g-5'>
      {items.map((item, index) => (
        <div className='col-12' key={item.id_declaratoria_comision ?? `declaratoria-${index}`}>
          <div className='card border border-gray-200 shadow-sm h-100'>
            <div className='card-body p-5'>
              <div className='d-flex align-items-start justify-content-between gap-3 mb-4'>
                <div>
                  <div className='text-gray-900 fw-bolder fs-5'>{item.nombre_generador || 'N/D'}</div>
                  <div className='text-muted fs-7'>
                    Correlativo {item.nro_correlativo || 'N/D'} · CI {item.ci || 'N/D'}
                  </div>
                </div>
                <EstadoBadge estado={item.estado} />
              </div>

              <div className='d-flex flex-column gap-4'>
                <div>
                  <div className='text-muted fs-8 text-uppercase fw-bold'>Periodo</div>
                  <div className='text-gray-800 fw-semibold'>
                    {formatShortDate(item.fecha_inicio)} al {formatShortDate(item.fecha_fin)}
                  </div>
                </div>

                <div>
                  <div className='text-muted fs-8 text-uppercase fw-bold'>Destino</div>
                  <div className='text-gray-800 fw-semibold'>{item.destino || 'Sin destino'}</div>
                </div>

                <div className='row g-3'>
                  <div className='col-6'>
                    <div className='bg-light rounded p-3 h-100'>
                      <div className='text-muted fs-8 text-uppercase fw-bold'>Viatico</div>
                      <div className='text-gray-800 fw-semibold'>
                        {item.tipo_viatico === 'con_viatico' ? 'Con viatico' : 'Sin viatico'}
                      </div>
                    </div>
                  </div>
                  <div className='col-6'>
                    <div className='bg-light rounded p-3 h-100'>
                      <div className='text-muted fs-8 text-uppercase fw-bold'>HR N°</div>
                      <div className='text-gray-800 fw-semibold'>{item.rrhh_hoja_ruta_numero || 'N/D'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className='text-muted fs-8 text-uppercase fw-bold'>Elaboracion</div>
                  <div className='text-gray-800 fw-semibold'>{formatShortDate(item.fecha_elaboracion)}</div>
                </div>
              </div>
            </div>

            <div className='card-footer border-0 pt-0 px-5 pb-5'>
              <ActionsCell
                declaratoria={item}
                onPreparePDF={onPreparePDF}
                onShowPDF={onShowPDF}
                onCancelPDF={onCancelPDF}
                onShowData={onShowData}
                onSetLoading={onSetLoading}
                isLoading={getLoadingState(item.id_declaratoria_comision?.toString() || '')}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export {DeclaratoriaComisionCards}
