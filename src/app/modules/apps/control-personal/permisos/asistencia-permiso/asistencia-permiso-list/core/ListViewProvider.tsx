import {FC, useState, createContext, useContext, useMemo} from 'react'
import {
  ID,
  calculatedGroupingIsDisabled,
  calculateIsAllDataSelected,
  groupingOnSelect,
  WithChildren,
} from 'src/_metronic/helpers'
import {useQueryResponse, useQueryResponseData} from './QueryResponseProvider'
import {ListViewContextProps, initialListView} from './_models'

const ListViewContext = createContext<ListViewContextProps>(initialListView)

const ListViewProvider: FC<WithChildren> = ({children}) => {
  const [selected, setSelected] = useState<Array<ID>>(initialListView.selected)
  const [itemIdForUpdate, setItemIdForUpdate] = useState<ID>(initialListView.itemIdForUpdate)
  const [isShow, setIsShow] = useState<boolean>(initialListView.isShow)
  const [accion, setAccion] = useState<
    'editar' | 'aprobar' | 'observar' | 'report' | 'ver' | undefined
  >(undefined)

  const {isLoading} = useQueryResponse()
  const data = useQueryResponseData()
  const disabled = useMemo(() => calculatedGroupingIsDisabled(isLoading, data), [isLoading, data])
  const isAllSelected = useMemo(() => calculateIsAllDataSelected(data, selected), [data, selected])

  return (
    <ListViewContext.Provider
      value={{
        selected,
        itemIdForUpdate,
        setItemIdForUpdate,
        disabled,
        isAllSelected,
        onSelect: (id: ID) => {
          groupingOnSelect(id, selected, setSelected)
        },
        onSelectAll: () => {
          if (isAllSelected) {
            setSelected([])
            return
          }
          if (!data || !data.length) {
            return
          }
          setSelected(data.filter((item) => item.id_asistencia_permiso).map((item) => item.id_asistencia_permiso))
        },
        clearSelected: () => {
          setSelected([])
        },
        isShow,
        setIsShow,
        accion,
        setAccion,
      }}
    >
      {children}
    </ListViewContext.Provider>
  )
}

const useListView = () => useContext(ListViewContext)

export {ListViewProvider, useListView}
