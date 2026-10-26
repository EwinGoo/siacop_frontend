import {ReactNode} from 'react'
import {useListView} from '../../core/ListViewProvider'
import {ListToolbar} from './ListToolbar'
import {ListGrouping} from './ListGrouping'
import {ListSearchComponent} from './ListSearchComponent'

type Props = {
  extraContent?: ReactNode
}

const ListHeader = ({extraContent}: Props) => {
  const {selected} = useListView()
  return (
    <div className='card-header border-0 pt-6'>
      <ListSearchComponent />
      {/* begin::Card toolbar */}
      <div className='card-toolbar'>
        {extraContent}
        {/* begin::Group actions */}
        {selected.length > 0 ? <ListGrouping /> : <ListToolbar />}
        {/* end::Group actions */}
      </div>
      {/* end::Card toolbar */}
    </div>
  )
}

export {ListHeader}
