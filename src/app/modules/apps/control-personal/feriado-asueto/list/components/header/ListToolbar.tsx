import {useEffect, useState} from 'react'
import {KTIcon} from '../../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import Button from 'react-bootstrap/Button'

type Props = {
  isMobileCompact?: boolean
}

const ListToolbar = ({isMobileCompact = false}: Props) => {
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
      <Button
        variant='primary'
        className='d-inline-flex align-items-center justify-content-center flex-shrink-0'
        onClick={openAddModal}
        title='Agregar nuevo'
        style={{width: '44px', minWidth: '44px', height: '44px', padding: 0}}
      >
        <KTIcon iconName='plus' className='fs-2 p-0' />
      </Button>
    )
  }

  if (isMobileViewport) {
    return (
      <div className='w-100'>
        <Button
          variant='primary'
          className='w-100 d-inline-flex align-items-center justify-content-center'
          onClick={openAddModal}
          style={{height: '44px'}}
        >
          <KTIcon iconName='plus' className='fs-2' />
          Agregar Nuevo
        </Button>
      </div>
    )
  }

  return (
    <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
      {/* <ListFilter /> */}

      {/* begin::Export */}
      {/* <button type='button' className='btn btn-light-primary me-3'>
        <KTIcon iconName='exit-up' className='fs-2' />
        Export
      </button> */}
      {/* end::Export */}

      {/* begin::Add user */}
      {/* <button type='button' className='btn btn-primary' onClick={openAddUserModal}>
        <KTIcon iconName='plus' className='fs-2' />
        Agrega Persona
      </button> */}

      <Button variant='primary' onClick={openAddModal}>
        <KTIcon iconName='plus' className='fs-2' />
        Agregar Nuevo
      </Button>
      {/* end::Add user */}
    </div>
  )
}

export {ListToolbar}
