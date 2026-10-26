import {FC, useState, createContext, useContext, useMemo, useEffect} from 'react'
import {
  ID,
  calculatedGroupingIsDisabled,
  calculateIsAllDataSelected,
  groupingOnSelect,
  groupingOnSelectAll,
  WithChildren,
} from 'src/_metronic/helpers'
import {useQueryResponse, useQueryResponseData} from './QueryResponseProvider'
import {ListViewContextProps, initialListView} from './_models'

const ListViewContext = createContext<ListViewContextProps>(initialListView)
const getIsMobileViewport = () => (typeof window !== 'undefined' ? window.innerWidth < 992 : false)

const ListViewProvider: FC<WithChildren> = ({children}) => {
  const [selected, setSelected] = useState<Array<ID>>(initialListView.selected)
  const [itemIdForUpdate, setItemIdForUpdate] = useState<ID>(initialListView.itemIdForUpdate)
  const [isShow, setIsShow] = useState<boolean>(initialListView.isShow)
  const [accion, setAccion] = useState<
    'editar' | 'aprobar' | 'observar' | 'report' | 'ver' | undefined
  >(undefined)
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(getIsMobileViewport)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() =>
    getIsMobileViewport() ? 'cards' : 'table'
  )

  const {isLoading} = useQueryResponse()
  const data = useQueryResponseData()
  const disabled = useMemo(() => calculatedGroupingIsDisabled(isLoading, data), [isLoading, data])
  const isAllSelected = useMemo(() => calculateIsAllDataSelected(data, selected), [data, selected])

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(getIsMobileViewport())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
          setSelected(data.filter((item) => item.id_comision).map((item) => item.id_comision))
        },
        clearSelected: () => {
          setSelected([])
        },
        isShow,
        setIsShow,
        accion,
        setAccion,
        viewMode,
        setViewMode,
        isMobileViewport,
      }}
    >
      {children}
    </ListViewContext.Provider>
  )
}

const useListView = () => useContext(ListViewContext)

export {ListViewProvider, useListView}
