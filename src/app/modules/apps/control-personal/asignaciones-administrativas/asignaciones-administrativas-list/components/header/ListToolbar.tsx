import {ChangeEvent} from 'react'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {useQueryResponsePagination} from '../../core/QueryResponseProvider'
import {ListFilter} from './ListFilter'

const ListToolbar = () => {
  const {updateState} = useQueryRequest()
  const pagination = useQueryResponsePagination()

  const handleItemsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const itemsPerPage = Number(event.target.value) as 10 | 30 | 50 | 100

    updateState({
      page: 1,
      items_per_page: itemsPerPage,
    })
  }

  return (
    <div className='d-flex align-items-center gap-3 flex-wrap justify-content-end'>
      <ListFilter />

      <div className='d-flex align-items-center gap-2'>
        <span className='text-muted fw-semibold fs-7'>Registros</span>
        <select
          className='form-select form-select-solid w-auto'
          value={pagination.items_per_page}
          onChange={handleItemsPerPageChange}
          style={{minWidth: '90px'}}
        >
          {[10, 30, 50, 100].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className='text-muted fs-7'>
        Total: <span className='fw-bold'>{pagination.total || 0}</span>
      </div>
    </div>
  )
}

export {ListToolbar}
