import {ListViewProvider, useListView} from './core/ListViewProvider'
import {QueryRequestProvider} from './core/QueryRequestProvider'
import {QueryResponseProvider} from './core/QueryResponseProvider'
import {ListHeader} from './components/header/ListHeader'
import {GrupoTable} from './table/GrupoTable'
import {EditModal} from './edit-modal/EditModal'
import {MembersModal} from './edit-modal/MembersModal'
import {KTCard} from '../../../../../../../_metronic/helpers'

const GrupoList = () => {
  const {itemIdForUpdate, modalType} = useListView()
  return (
    <>
      <KTCard>
        <ListHeader />
        <GrupoTable />
      </KTCard>
      {itemIdForUpdate !== undefined && modalType === 'form' && <EditModal />}
      {itemIdForUpdate !== undefined && modalType === 'members' && <MembersModal />}
    </>
  )
}

const GrupoListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <GrupoList />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {GrupoListWrapper}
