import {ListSearchComponent} from './ListSearchComponent'
import {ListToolbar} from './ListToolbar'

const ListHeader = () => {
  return (
    <div className='card-header border-0 pt-6 d-flex flex-column flex-xl-row align-items-stretch gap-4'>
      <div className='d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-3 flex-grow-1'>
        <div className='flex-grow-1'>
          <ListSearchComponent />
        </div>
      </div>

      <div className='card-toolbar w-100 w-xl-auto justify-content-end'>
        <ListToolbar />
      </div>
    </div>
  )
}

export {ListHeader}
