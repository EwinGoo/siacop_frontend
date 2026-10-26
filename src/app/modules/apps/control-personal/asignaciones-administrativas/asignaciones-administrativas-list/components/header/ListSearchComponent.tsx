/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react'
import {useQueryClient} from 'react-query'
import {KTIcon, useDebounce} from 'src/_metronic/helpers'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {
  ASIGNACIONES_ADMINISTRATIVAS_QUERY_KEY,
  useQueryResponse,
} from '../../core/QueryResponseProvider'

const ListSearchComponent = () => {
  const {updateState} = useQueryRequest()
  const [searchTerm, setSearchTerm] = useState('')
  const {query} = useQueryResponse()
  const queryClient = useQueryClient()
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    updateState({
      page: 1,
      search: debouncedSearchTerm || '',
    })
  }, [debouncedSearchTerm])

  return (
    <div className='d-flex align-items-center gap-3 w-100 flex-nowrap'>
      <button
        type='button'
        className='btn btn-light btn-sm d-inline-flex align-items-center justify-content-center flex-shrink-0'
        onClick={() => {
          queryClient.invalidateQueries([`${ASIGNACIONES_ADMINISTRATIVAS_QUERY_KEY}-${query}`])
        }}
        title='Actualizar tabla'
        style={{width: '44px', minWidth: '44px', height: '44px', padding: 0}}
      >
        <KTIcon iconName='arrows-circle' className='fs-1' />
      </button>

      <div className='d-flex align-items-center position-relative flex-grow-1'>
        <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-6' />
        <input
          type='text'
          className='form-control form-control-solid ps-14 pe-14'
          placeholder='Buscar por CI, nombre o cargo'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{width: '100%', minWidth: 0, height: '44px'}}
        />
        {searchTerm && (
          <span
            className='position-absolute end-0 me-5 cursor-pointer text-muted'
            style={{fontSize: '1.2rem'}}
            onClick={() => setSearchTerm('')}
          >
            &times;
          </span>
        )}
      </div>
    </div>
  )
}

export {ListSearchComponent}
