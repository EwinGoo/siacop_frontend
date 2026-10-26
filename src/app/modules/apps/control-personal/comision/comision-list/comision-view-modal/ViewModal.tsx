import {FC} from 'react'
import {Button, Modal} from 'react-bootstrap'
import {useQuery} from 'react-query'
import {toast} from 'react-toastify'
import {QUERIES} from 'src/_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {getComisionById} from '../core/_requests'
import {ViewModalContent} from './components/ViewModalContent'

const ViewModal: FC = () => {
  const {accion, isShow, itemIdForUpdate, setIsShow, setAccion, setItemIdForUpdate} = useListView()
  const show = isShow && accion === 'ver'

  const handleClose = () => {
    setIsShow(false)
    setAccion(undefined)
    setItemIdForUpdate(undefined)
  }

  const {data: comision, isLoading} = useQuery(
    `${QUERIES.COMISIONES_LIST}-view-${itemIdForUpdate}`,
    () => getComisionById(itemIdForUpdate),
    {
      enabled: !!itemIdForUpdate && show,
      cacheTime: 0,
      retry: 1,
      onError: () => {
        toast.error('No se pudo cargar el detalle de la comision')
        handleClose()
      },
    }
  )

  if (!show) {
    return null
  }

  const tipo = comision?.tipo_comision || 'COMISIÓN'
  const esPermisoSalud = tipo === 'CAJA SALUD' || tipo === 'FISIOTERAPIA'
  const titulo = esPermisoSalud ? 'Permiso' : 'Comisión'
  const icon = esPermisoSalud ? 'bi-heart-pulse' : 'bi-briefcase'

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
            <i className={`bi ${icon} fs-2 text-primary`}></i>
            {titulo}
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className='bg-white p-1'>
        {isLoading ? (
          <div className='d-flex flex-column align-items-center justify-content-center py-10'>
            <div className='spinner-border text-primary mb-4' role='status'>
              <span className='visually-hidden'>Cargando...</span>
            </div>
            <span className='text-muted fw-semibold'>Cargando informacion del registro...</span>
          </div>
        ) : comision ? (
          <ViewModalContent comision={comision} />
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
