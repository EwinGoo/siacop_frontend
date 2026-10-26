import {FC, useState, createContext, useContext, useMemo} from 'react'
import {ID, calculatedGroupingIsDisabled, calculateIsAllDataSelected, groupingOnSelect, groupingOnSelectAll, WithChildren} from '../../../../../../../../_metronic/helpers'
import {useQueryResponseData} from './QueryResponseProvider'

export type GrupoModalType = 'form' | 'members' | undefined

type ListViewContextProps = {
  selected: Array<ID>
  onSelect: (id: ID) => void
  onSelectAll: () => void
  clearSelected: () => void
  isAllSelected: boolean
  disabled: boolean
  itemIdForUpdate: ID
  setItemIdForUpdate: (id: ID) => void
  modalType: GrupoModalType
  setModalType: (type: GrupoModalType) => void
  openCreateModal: () => void
  openEditModal: (id: ID) => void
  openMembersModal: (id: ID) => void
  closeModal: () => void
}

const ListViewContext = createContext<ListViewContextProps>({
  selected: [], onSelect: () => {}, onSelectAll: () => {}, clearSelected: () => {},
  isAllSelected: false, disabled: false, itemIdForUpdate: undefined, setItemIdForUpdate: () => {},
  modalType: undefined, setModalType: () => {}, openCreateModal: () => {}, openEditModal: () => {},
  openMembersModal: () => {}, closeModal: () => {},
})

const ListViewProvider: FC<WithChildren> = ({children}) => {
  const [selected, setSelected] = useState<Array<ID>>([])
  const [itemIdForUpdate, setItemIdForUpdate] = useState<ID>(undefined)
  const [modalType, setModalType] = useState<GrupoModalType>(undefined)
  const data = useQueryResponseData()
  const disabled = useMemo(() => calculatedGroupingIsDisabled(false, data), [data])
  const isAllSelected = useMemo(() => calculateIsAllDataSelected(data, selected), [data, selected])

  return (
    <ListViewContext.Provider value={{
      selected,
      onSelect: (id) => groupingOnSelect(id, selected, setSelected),
      onSelectAll: () => groupingOnSelectAll(isAllSelected, setSelected, data),
      clearSelected: () => setSelected([]),
      isAllSelected, disabled, itemIdForUpdate, setItemIdForUpdate,
      modalType,
      setModalType,
      openCreateModal: () => {
        setItemIdForUpdate(null)
        setModalType('form')
      },
      openEditModal: (id) => {
        setItemIdForUpdate(id)
        setModalType('form')
      },
      openMembersModal: (id) => {
        setItemIdForUpdate(id)
        setModalType('members')
      },
      closeModal: () => {
        setItemIdForUpdate(undefined)
        setModalType(undefined)
      },
    }}>
      {children}
    </ListViewContext.Provider>
  )
}

const useListView = () => useContext(ListViewContext)
export {ListViewProvider, useListView}
