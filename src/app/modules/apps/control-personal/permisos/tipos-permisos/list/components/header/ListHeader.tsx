import {useEffect, useState} from 'react'
import {useListView} from '../../core/ListViewProvider'
import {ListToolbar} from './ListToolbar'
import {ListGrouping} from './ListGrouping'
import {ListSearchComponent} from './ListSearchComponent'

const ListHeader = () => {
  const {selected} = useListView()
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 992 : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth < 992)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isMobileViewport) {
    return (
      <div className='card-header border-0 pt-6 d-flex align-items-stretch gap-2'>
        <div className='flex-grow-1 min-w-0'>
          {selected.length > 0 ? (
            <ListGrouping />
          ) : (
            <div className='d-flex align-items-center gap-2 w-100'>
              <div className='flex-grow-1 min-w-0'>
                <ListSearchComponent />
              </div>
              <ListToolbar isMobileCompact />
            </div>
          )}
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
          <div className='card-toolbar ms-auto d-flex justify-content-end'>
            <ListToolbar />
          </div>
        </div>
      )}
    </div>
  )
}

export {ListHeader}
