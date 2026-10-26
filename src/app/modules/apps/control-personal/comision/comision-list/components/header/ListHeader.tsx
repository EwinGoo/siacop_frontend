import {useListView} from '../../core/ListViewProvider'
import {ListToolbar} from './ListToolbar'
import {ListGrouping} from './ListGrouping'
import {ListSearchComponent} from './ListSearchComponent'

const ListHeader = () => {
  const {selected, viewMode, setViewMode, isMobileViewport} = useListView()

  const viewModeToggle = (
    <div className='d-flex align-items-center justify-content-end flex-shrink-0'>
      <div
        className='btn-group'
        role='group'
        aria-label={`Cambiar vista de comisiones ${isMobileViewport ? 'mobile' : 'desktop'}`}
        style={{width: '88px', minWidth: '88px'}}
      >
        <button
          type='button'
          className={`btn btn-sm ${
            viewMode === 'table' ? 'btn-primary' : 'btn-light-secondary text-gray-600'
          }`}
          onClick={() => setViewMode('table')}
          title='Vista tabla'
          aria-pressed={viewMode === 'table'}
          style={{width: '44px', minWidth: '44px', height: '44px', padding: 0}}
        >
          <i className='bi bi-list fs-2 p-0'></i>
        </button>
        <button
          type='button'
          className={`btn btn-sm ${
            viewMode === 'cards' ? 'btn-primary' : 'btn-light-secondary text-gray-600'
          }`}
          onClick={() => setViewMode('cards')}
          title='Vista cards'
          aria-pressed={viewMode === 'cards'}
          style={{width: '44px', minWidth: '44px', height: '44px', padding: 0}}
        >
          <i className='bi bi-grid-3x2-gap fs-2 p-0'></i>
        </button>
      </div>
    </div>
  )

  if (isMobileViewport) {
    return (
      <div className='card-header border-0 pt-6 d-flex align-items-stretch gap-2 position-relative'>
        <div className='flex-grow-1 min-w-0'>
          {selected.length > 0 ? (
            <ListGrouping />
          ) : (
            <div className='d-flex align-items-center gap-2 w-100'>
              <div className='flex-grow-1 min-w-0'>
                <ListSearchComponent />
              </div>
              <div className='flex-shrink-0'>
                <ListToolbar viewModeToggle={viewModeToggle} compactMobile />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='card-header border-0 pt-6 d-flex flex-column flex-xl-row align-items-stretch gap-4'>
      <div className='d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-3 flex-grow-1'>
        <div className='flex-grow-1'>
          <ListSearchComponent />
        </div>

        {viewModeToggle}
      </div>

      <div className='card-toolbar w-100 w-xl-auto justify-content-end'>
        {selected.length > 0 ? <ListGrouping /> : <ListToolbar />}
      </div>
    </div>
  )
}

export {ListHeader}
