import {FC} from 'react'
import {KTIcon} from 'src/_metronic/helpers'
import {TipoPermiso} from '../core/_models'
import {ActionsCell} from './columns/ActionsCell'

type Props = {
  items: TipoPermiso[]
}

const TipoPermisoCards: FC<Props> = ({items}) => {
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
        <div className='col-12' key={item.id_tipo_permiso ?? `tipo-permiso-${index}`}>
          <div className='card border border-gray-200 shadow-sm h-100'>
            <div className='card-body p-5'>
              <div className='d-flex align-items-start justify-content-between gap-3 mb-4'>
                <div>
                  <div className='text-gray-900 fw-bolder fs-5'>{item.nombre}</div>
                  <div className='text-muted fs-7'>{item.tipo_permiso || 'N/D'}</div>
                </div>
                <span className='badge badge-light-primary'>#{index + 1}</span>
              </div>

              <div className='d-flex flex-column gap-4'>
                <div>
                  <div className='text-muted fs-8 text-uppercase fw-bold'>Requisitos</div>
                  <div
                    className='text-gray-800 fs-6'
                    dangerouslySetInnerHTML={{__html: item.instruccion || '<span class="text-muted">Sin requisitos</span>'}}
                  />
                </div>

                <div className='row g-3'>
                  <div className='col-6'>
                    <div className='bg-light rounded p-3 h-100'>
                      <div className='text-muted fs-8 text-uppercase fw-bold'>Limite dias</div>
                      <div className='text-gray-800 fw-semibold'>
                        {item.limite_dias ?? 'No definido'}
                      </div>
                    </div>
                  </div>
                  <div className='col-6'>
                    <div className='bg-light rounded p-3 h-100'>
                      <div className='text-muted fs-8 text-uppercase fw-bold'>Max. sol.</div>
                      <div className='text-gray-800 fw-semibold'>
                        {item.max_solicitudes_diarias ?? 'No definido'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='card-footer border-0 pt-0 px-5 pb-5'>
              <ActionsCell id={item.id_tipo_permiso} isActive={!item.deleted_at} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export {TipoPermisoCards}
