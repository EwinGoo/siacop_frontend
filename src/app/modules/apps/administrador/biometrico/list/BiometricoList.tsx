import {useState} from 'react'
import {ListViewProvider} from './core/ListViewProvider'
import {QueryRequestProvider} from './core/QueryRequestProvider'
import {QueryResponseProvider, useQueryResponseData} from './core/QueryResponseProvider'
import {ListHeader} from './components/header/ListHeader'
import {BiometricoTable} from './table/BiometricoTable'
import {EditModal} from './edit-modal/EditModal'
import {KTCard} from '../../../../../../_metronic/helpers'
import {BiometricoDashboard, BiometricoSummaryStrip} from './components/dashboard/BiometricoDashboard'
import {ListPagination} from './components/pagination/ListPagination'

const BiometricoList = () => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const dispositivos = useQueryResponseData()

  return (
    <>
      <BiometricoSummaryStrip dispositivos={dispositivos} />

      <KTCard>
        <ListHeader
          extraContent={
            <div className='btn-group me-3'>
              <button
                type='button'
                className={`btn btn-sm ${
                  viewMode === 'cards' ? 'btn-primary' : 'btn-light-primary'
                }`}
                onClick={() => setViewMode('cards')}
              >
                <i className='bi bi-grid-1x2 me-2' />
              </button>
              <button
                type='button'
                className={`btn btn-sm ${
                  viewMode === 'table' ? 'btn-primary' : 'btn-light-primary'
                }`}
                onClick={() => setViewMode('table')}
              >
                <i className='bi bi-table me-2' />
              </button>
            </div>
          }
        />
        {viewMode === 'cards' ? (
          <>
            <BiometricoDashboard dispositivos={dispositivos} />
            <div className='px-7 pb-7'>
              <ListPagination />
            </div>
          </>
        ) : (
          <BiometricoTable />
        )}
      </KTCard>
      {/* {itemIdForUpdate !== undefined && <EditModal />} */}
      <EditModal />
    </>
  )
}

const BiometricoListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <BiometricoList />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {BiometricoListWrapper}
