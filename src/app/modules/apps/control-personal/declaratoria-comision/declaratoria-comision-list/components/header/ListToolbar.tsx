import {useEffect, useState} from 'react'
import {KTIcon} from '../../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import Button from 'react-bootstrap/Button'

type Props = {
  isMobileCompact?: boolean
  onOpenReport: () => void
}

const ListToolbar = ({isMobileCompact = false, onOpenReport}: Props) => {
  const {setItemIdForUpdate, setIsShow} = useListView()
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 992 : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth < 992)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const openAddModal = () => {
    setItemIdForUpdate(null)
    setIsShow(true)
  }

  if (isMobileCompact) {
    return (
      <div className='d-flex align-items-center gap-2'>
        <Button
          variant='light-warning'
          className='d-inline-flex align-items-center justify-content-center flex-shrink-0'
          onClick={onOpenReport}
          title='Generar reporte'
          style={{width: '44px', minWidth: '44px', height: '44px', padding: 0}}
        >
          <i className='bi bi-file-earmark-pdf fs-2'></i>
        </Button>
        <Button
          variant='primary'
          className='d-inline-flex align-items-center justify-content-center flex-shrink-0'
          onClick={openAddModal}
          title='Agregar comisión'
          style={{width: '44px', minWidth: '44px', height: '44px', padding: 0}}
        >
          <KTIcon iconName='plus' className='fs-2 p-0' />
        </Button>
      </div>
    )
  }

  if (isMobileViewport) {
    return (
      <div className='d-flex align-items-center gap-2 w-100'>
        <Button
          variant='light-warning'
          className='d-inline-flex align-items-center justify-content-center'
          onClick={onOpenReport}
          style={{height: '44px'}}
        >
          <i className='bi bi-file-earmark-pdf fs-2 me-2'></i>
          Reporte
        </Button>
        <Button
          variant='primary'
          className='flex-grow-1 d-inline-flex align-items-center justify-content-center'
          onClick={openAddModal}
          style={{height: '44px'}}
        >
          <KTIcon iconName='plus' className='fs-2' />
          Agregar Comisión
        </Button>
      </div>
    )
  }

  return (
    <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
      <Button className='btn-light-warning me-3' onClick={onOpenReport}>
        <i className='bi bi-file-earmark-pdf fs-2 me-2'></i>
        Generar reporte
      </Button>
      <Button variant='primary' onClick={openAddModal}>
        <KTIcon iconName='plus' className='fs-2' />
        Agregar Comisión
      </Button>
    </div>
  )
}

export {ListToolbar}