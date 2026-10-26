import {useEffect, useState} from 'react'
import {useListView} from '../../core/ListViewProvider'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {useQueryResponseLoading} from '../../core/QueryResponseProvider'
import {ListSearchComponent} from './ListSearchComponent'

const ListHeader = () => {
  const {setIsShow, setAccion} = useListView()
  const isLoading = useQueryResponseLoading()
  const {updateState} = useQueryRequest()
  const [showSecondaryActions, setShowSecondaryActions] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 992 : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth < 992)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleOpenReport = () => {
    setAccion('report')
    setIsShow(true)
  }

  const filters = (
    <select
      className='form-select form-select-solid w-100'
      onChange={(e) => updateState({filter_estado: e.target.value, page: 1} as any)}
      disabled={isLoading}
      style={{height: '44px'}}
    >
      <option value=''>Todos los estados</option>
      <option value='GENERADO'>Generado</option>
      <option value='ENVIADO'>Enviado</option>
      <option value='RECEPCIONADO'>Recepcionado</option>
      <option value='APROBADO'>Aprobado</option>
    </select>
  )

  return (
    <div className='card-header border-0 pt-6 d-flex flex-column gap-4'>
      <div className='w-100'>
        <div className='row w-100 g-3 align-items-center'>
          <div className='col-12 col-lg-4'>
            <ListSearchComponent />
          </div>

          {!isMobileViewport ? (
            <div className='col-12 col-lg-8'>
              <div className='d-flex flex-wrap justify-content-lg-end gap-3'>
                <div className='w-100 w-md-200px'>{filters}</div>

                <button
                  type='button'
                  className='btn btn-danger w-100 w-md-auto'
                  onClick={handleOpenReport}
                  disabled={isLoading}
                >
                  <i className='bi bi-file-earmark-pdf me-2'></i>
                  Reporte PDF
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {isMobileViewport ? (
        <div className='d-flex flex-column gap-3 w-100'>
          <div className='d-flex align-items-center justify-content-between gap-3 w-100'>
            <button
              type='button'
              className={`btn btn-sm d-inline-flex align-items-center justify-content-center flex-shrink-0 ${
                showSecondaryActions ? 'btn-primary' : 'btn-light'
              }`}
              onClick={() => setShowSecondaryActions((prev) => !prev)}
              title='Mostrar acciones'
              aria-expanded={showSecondaryActions}
              style={{width: '44px', minWidth: '44px', height: '44px', padding: 0}}
            >
              <i className={`bi ${showSecondaryActions ? 'bi-x-lg' : 'bi-list'} fs-2`}></i>
            </button>

            <button
              type='button'
              className='btn btn-danger flex-grow-1'
              onClick={handleOpenReport}
              disabled={isLoading}
              style={{height: '44px'}}
            >
              <i className='bi bi-file-earmark-pdf me-2'></i>
              Reporte PDF
            </button>
          </div>

          {showSecondaryActions ? <div className='w-100'>{filters}</div> : null}
        </div>
      ) : null}
    </div>
  )
}

export {ListHeader}
