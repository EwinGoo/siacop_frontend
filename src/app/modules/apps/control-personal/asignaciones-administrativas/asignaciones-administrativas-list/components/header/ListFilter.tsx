import {useEffect, useState} from 'react'
import {MenuComponent} from 'src/_metronic/assets/ts/components'
import {KTIcon, initialQueryState} from 'src/_metronic/helpers'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {defaultQueryState} from '../../core/QueryRequestProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'

const ListFilter = () => {
  const {updateState} = useQueryRequest()
  const {isLoading} = useQueryResponse()
  const [estado, setEstado] = useState<string>('1')

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const resetData = () => {
    setEstado('1')
    updateState(defaultQueryState)
  }

  const filterData = () => {
    updateState({
      filter: estado === '' ? undefined : {estado},
      ...initialQueryState,
    })
  }

  return (
    <>
      <button
        disabled={isLoading}
        type='button'
        className='btn btn-light-primary me-0'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        <KTIcon iconName='filter' className='fs-2' />
        Filtro
      </button>

      <div className='menu menu-sub menu-sub-dropdown w-300px w-md-325px' data-kt-menu='true'>
        <div className='px-7 py-5'>
          <div className='fs-5 text-dark fw-bolder'>Opciones de Filtro</div>
        </div>

        <div className='separator border-gray-200'></div>

        <div className='px-7 py-5' data-kt-user-table-filter='form'>
          <div className='mb-10'>
            <label className='form-label fs-6 fw-bold'>Estado:</label>
            <select
              className='form-select form-select-solid fw-bolder'
              data-hide-search='true'
              onChange={(e) => setEstado(e.target.value)}
              value={estado}
            >
              <option value=''>Todos</option>
              <option value='1'>Activo</option>
              <option value='0'>Inactivo</option>
            </select>
          </div>

          <div className='d-flex justify-content-end'>
            <button
              type='button'
              disabled={isLoading}
              onClick={resetData}
              className='btn btn-light btn-active-light-primary fw-bold me-2 px-6'
              data-kt-menu-dismiss='true'
            >
              Resetear
            </button>
            <button
              disabled={isLoading}
              type='button'
              onClick={filterData}
              className='btn btn-primary fw-bold px-6'
              data-kt-menu-dismiss='true'
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export {ListFilter}
