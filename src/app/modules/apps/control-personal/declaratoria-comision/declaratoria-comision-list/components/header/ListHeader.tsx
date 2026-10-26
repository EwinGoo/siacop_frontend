import {useEffect, useState} from 'react'
import {ColumnVisibilitySelector} from 'src/app/components/ColumnVisibilitySelector'
import {useListView} from '../../core/ListViewProvider'
import {ListToolbar} from './ListToolbar'
import {ListGrouping} from './ListGrouping'
import {ListSearchComponent} from './ListSearchComponent'

type Props = {
  onOpenReport: () => void
}

const ListHeader = ({onOpenReport}: Props) => {
  const {selected} = useListView()
  const [showSecondaryActions, setShowSecondaryActions] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 992 : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth < 992)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const columnVisibilityConfig = (window as any).columnVisibilityConfig

  const columnSelector =
    columnVisibilityConfig ? (
      <ColumnVisibilitySelector
        columnConfig={columnVisibilityConfig.columnConfig}
        onToggleColumn={columnVisibilityConfig.toggleColumn}
        onShowAll={columnVisibilityConfig.showAllColumns}
        onHideAll={columnVisibilityConfig.hideAllOptionalColumns}
        onReset={columnVisibilityConfig.resetToDefaults}
      />
    ) : null

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

              {columnSelector ? (
                <button
                  type='button'
                  className={`btn btn-sm d-inline-flex align-items-center justify-content-center flex-shrink-0 ${
                    showSecondaryActions ? 'btn-primary' : 'btn-light'
                  }`}
                  onClick={() => setShowSecondaryActions((prev) => !prev)}
                  title='Mostrar acciones'
                  aria-expanded={showSecondaryActions}
                  style={{width: '44px', minWidth: '44px', height: '44px', padding: 0}}
                >
                  <i className={`bi ${showSecondaryActions ? 'bi-x-lg' : 'bi-list'} fs-2`}></i>
                </button>
              ) : null}

              <ListToolbar isMobileCompact onOpenReport={onOpenReport} />
            </div>
          )}

          {showSecondaryActions && columnSelector ? (
            <div
              className='position-absolute start-0 end-0 bg-body rounded shadow-sm border p-3 mt-2'
              style={{top: '100%', zIndex: 10}}
            >
              {columnSelector}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className='card-header border-0 pt-6 d-flex align-items-center gap-3'>
      {selected.length > 0 ? (
        <div className='card-toolbar w-100 justify-content-end'>
          <ListGrouping />
        </div>
      ) : (
        <div className='d-flex align-items-center gap-3 w-100 flex-wrap'>
          <div className='flex-grow-1 min-w-300px' style={{maxWidth: '640px'}}>
            <ListSearchComponent />
          </div>

          <div className='card-toolbar ms-auto d-flex align-items-center justify-content-end gap-3'>
            <div>{columnSelector}</div>
            <ListToolbar onOpenReport={onOpenReport} />
          </div>
        </div>
      )}
    </div>
  )
}

export {ListHeader}
