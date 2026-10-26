import {useListView} from '../../core/ListViewProvider'
import {ListToolbar} from './ListToolbar'
import {ListGrouping} from './ListGrouping'
import {ListSearchComponent} from './ListSearchComponent'

const ListHeader = () => {
  const {selected} = useListView()
  return (
    <div className='card-header border-0 pt-6 d-flex flex-wrap flex-lg-nowrap align-items-center justify-content-between gap-4'>
      <div className='flex-grow-1' style={{minWidth: 280}}>
        <ListSearchComponent />
      </div>
      <div className='card-toolbar justify-content-end flex-shrink-0'>
        {selected.length > 0 ? <ListGrouping /> : <ListToolbar />}
      </div>
    </div>
  )
}

export {ListHeader}
