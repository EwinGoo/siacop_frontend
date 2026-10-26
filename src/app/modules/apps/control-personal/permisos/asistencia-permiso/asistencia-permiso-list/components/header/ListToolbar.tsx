import {useEffect, useState} from 'react'
import {useQueryClient, useMutation} from 'react-query'
import {KTIcon, QUERIES} from 'src/_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {ListFilter} from './ListFilter'
import Button from 'react-bootstrap/Button'
import {toast} from 'react-toastify'
import Tooltip from '@mui/material/Tooltip'
import Swal from 'sweetalert2'
import {useQueryResponse} from '../../core/QueryResponseProvider'
import {aprobarComisiones} from '../../core/_requests'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {initialQueryState} from 'src/_metronic/helpers'
import {showAlert} from 'src/app/utils/swalHelpers.ts'
import {useAuth} from 'src/app/modules/auth'
import { canManageComisiones } from 'src/app/modules/auth/core/roles/roleDefinitions'

const textApproveHTML = `
  Esta acción cambiará el estado de 
  <span class="badge badge-light-info">RECEPCIONADO</span> a 
  <span class="badge badge-light-success">APROBADO</span>
`

const ListToolbar = () => {
  const {setItemIdForUpdate, setIsShow, setAccion} = useListView()
  const queryClient = useQueryClient()
  const {query} = useQueryResponse()
  const {updateState} = useQueryRequest()
  const {currentUser} = useAuth()
  const canManage = currentUser?.groups ? canManageComisiones(currentUser.groups) : false
  const [showSecondaryActions, setShowSecondaryActions] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 992 : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth < 992)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const openAddModal = async () => {
    if (!currentUser) {
      await showAlert({
        title: 'Error',
        text: 'Debes iniciar sesión para realizar esta acción',
        icon: 'error',
      })
      return
    }
    const isDocente = currentUser.personal?.tipo_personal === 'DOCENTE'
    const hasActiveAsignacion = currentUser.active_asignacion?.active

    // Permitir acceso si tiene asignación activa O es docente
    if (hasActiveAsignacion || isDocente) {
      setItemIdForUpdate(null)
      setAccion('editar')
      setIsShow(true)
    } else {
      await showAlert({
        title: 'Sin asignación activa',
        text:
          currentUser.active_asignacion?.message ||
          'No cumples con los requisitos para esta acción',
        icon: 'info',
      })
    }
  }
  const openReportModal = () => {
    setAccion('report')
    setIsShow(true)
  }

  const approveItem = useMutation(() => aprobarComisiones(), {
    onSuccess: (data) => {
      // data es la respuesta del backend: { status, error, message, data }
      queryClient.invalidateQueries([`${QUERIES.ASISTENCIAS_PERMISO_LIST}-${query}`])
      updateState({filter: undefined, ...initialQueryState})

      console.log(data?.message)

      toast.success(data?.message || 'Permisos aprobados correctamente', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    },
    onError: (error) => {
      throw error
      // toast.error('Ocurrió un error al aprobar las comisiones')
    },
  })

  const handleApprove = async () => {
    try {
      const result = await Swal.fire({
        title: '¿Aprobar permisos?',
        html: textApproveHTML,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '<i class="bi bi-check me-2"></i>Sí, aprobar',
        cancelButtonText: '<i class="bi bi-x me-2"></i>Cancelar',
        reverseButtons: true,
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger',
        },
      })

      if (result.isConfirmed) {
        await approveItem.mutateAsync()
      }
    } catch (error) {
      toast.error('Error al aprobar los permisos')
    }
  }

  const renderSecondaryActions = () => (
    <>
      {canManage && (
        <>
          <Button
            className='btn btn-light-warning d-flex align-items-center justify-content-center'
            onClick={openReportModal}
          >
            <i className='bi bi-file-earmark-text me-2'></i>
            Generar Reporte
          </Button>

          <Tooltip title='Aprobar todos los permisos recepcionados' arrow placement='top'>
            <Button
              className='btn btn-light-success d-flex align-items-center justify-content-center'
              onClick={handleApprove}
            >
              <KTIcon iconName='check' className='fs-2 me-1' />
              Aprobar
            </Button>
          </Tooltip>
        </>
      )}

      <div>
        <ListFilter />
      </div>
    </>
  )

  if (isMobileViewport) {
    return (
      <div className='d-flex flex-column gap-3 w-100'>
        <div className='d-flex align-items-center justify-content-between gap-3 w-100'>
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

          <Button
            variant='primary'
            className='flex-grow-1 d-inline-flex align-items-center justify-content-center'
            onClick={openAddModal}
            style={{height: '44px'}}
          >
            <KTIcon iconName='plus' className='fs-2' />
            Agregar Permiso
          </Button>
        </div>

        {showSecondaryActions ? (
          <div className='d-grid gap-2 w-100'>{renderSecondaryActions()}</div>
        ) : null}
      </div>
    )
  }

  return (
    <div className='row g-2'>
      {canManage && (
        <>
          <div className='col-12 col-md-auto'>
            <Button className='btn-light-warning w-100' onClick={openReportModal}>
              <i className='bi bi-file-earmark-text me-2'></i>
              Generar Reporte
            </Button>
          </div>

          <div className='col-6 col-md-auto'>
            <Tooltip title='Aprobar todos los permisos recepcionados' arrow placement='top'>
              <Button className='btn-light-success w-100' onClick={handleApprove}>
                <KTIcon iconName='check' className='fs-2 me-1' />
                Aprobar
              </Button>
            </Tooltip>
          </div>
        </>
      )}

      <div className='col-6 col-md-auto text-end'>
        <ListFilter />
      </div>

      <div className='col-12 col-md-auto'>
        <Button variant='primary' className='w-100' onClick={openAddModal}>
          <KTIcon iconName='plus' className='fs-2' />
          Agregar Permiso
        </Button>
      </div>
    </div>
  )
}

export {ListToolbar}
