import {FC} from 'react'
import {Button, Modal} from 'react-bootstrap'
import {useQuery} from 'react-query'
import {toast} from 'react-toastify'
import {QUERIES} from 'src/_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {getAsistenciaPermisoById} from '../core/_requests'
import {ViewModalContent} from './components/ViewModalContent'

const ViewModal: FC = () => {
  const {accion, isShow, itemIdForUpdate, setIsShow, setAccion, setItemIdForUpdate} = useListView()
  const show = isShow && accion === 'ver'

  const handleClose = () => {
    setIsShow(false)
    setAccion(undefined)
    setItemIdForUpdate(undefined)
  }

  const {data: permiso, isLoading} = useQuery(
    `${QUERIES.ASISTENCIAS_PERMISO_LIST}-view-${itemIdForUpdate}`,
    () => getAsistenciaPermisoById(itemIdForUpdate),
    {
      enabled: !!itemIdForUpdate && show,
      cacheTime: 0,
      retry: 1,
      onError: () => {
        toast.error('No se pudo cargar el detalle del permiso')
        handleClose()
      },
    }
  )

  if (!show) {
    return null
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size='lg'
      centered
      scrollable
      fullscreen='md-down'
      contentClassName='bg-white text-gray-900'
    >
      <Modal.Header closeButton className='bg-white border-bottom'>
        <Modal.Title className='d-flex flex-column'>
          <span className='d-flex align-items-center gap-2 fw-bolder text-gray-900'>
            <i className='bi bi-person-lines-fill fs-2 text-primary'></i>
            Permiso
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className='bg-white p-1'>
        {isLoading ? (
          <div className='d-flex flex-column align-items-center justify-content-center py-10'>
            <div className='spinner-border text-primary mb-4' role='status'>
              <span className='visually-hidden'>Cargando...</span>
            </div>
            <span className='text-muted fw-semibold'>Cargando informacion del permiso...</span>
          </div>
        ) : permiso ? (
          <ViewModalContent permiso={permiso} />
        ) : null}
      </Modal.Body>

      <Modal.Footer className='bg-white border-top'>
        <Button variant='light' onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export {ViewModal}
