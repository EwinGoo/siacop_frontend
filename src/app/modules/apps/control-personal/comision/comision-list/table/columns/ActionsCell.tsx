/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC, useEffect, useState} from 'react'
import {useMutation, useQueryClient} from 'react-query'
import {MenuComponent} from 'src/_metronic/assets/ts/components'
import {ID, KTIcon, QUERIES} from 'src/_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'
import {
  deleteComision,
  imprimirComisionFormulario,
  procesarEstadoComision,
} from '../../core/_requests'
import {toast} from 'react-toastify'
import {showToast} from 'src/app/utils/toastHelper'
import {showConfirmDialog} from 'src/app/utils/swalHelpers.ts'
import {getPermisosComision} from 'src/app/modules/auth/core/permissions'
import {useAuth} from 'src/app/modules/auth'
import {canManageComisiones} from 'src/app/modules/auth/core/roles/roleDefinitions'
import {ComisionPDFData} from '../../core/_models'

type Props = {
  id: ID
  estado?: 'GENERADO' | 'ENVIADO' | 'RECEPCIONADO' | 'APROBADO' | 'OBSERVADO' // Add estado prop for comision-specific actions
  hash?: string
  carnet?: string | null
  tipo?: string
  buttonLabel?: string
  buttonClassName?: string
  inlinePrimaryActions?: boolean
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: ComisionPDFData) => void
  onCancelPDF: () => void
}

const ActionsCell: FC<Props> = ({
  id,
  estado,
  hash,
  carnet,
  tipo,
  buttonLabel = 'Acciones',
  buttonClassName = 'btn btn-outline btn-outline-primary btn-sm',
  inlinePrimaryActions = false,
  onPreparePDF,
  onShowPDF,
  onCancelPDF,
}) => {
  const {setAccion, setItemIdForUpdate, setIsShow} = useListView()
  const [isPrinting, setIsPrinting] = useState(false)
  const {currentUser} = useAuth()
  const canManage = currentUser?.groups ? canManageComisiones(currentUser.groups) : false
  // const canManageUsers = permissions.canManage // Para mostrar campo de solicitante
  // const canEditAdvanced = permissions.canEdit || permissions.canManage

  const {query} = useQueryResponse()
  const queryClient = useQueryClient()

  const permisos = getPermisosComision({
    estado: estado || 'GENERADO',
    puedeGestionar: canManage,
  })
  // console.log(currentUser?.groups)

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const openEditModal = async () => {
    setItemIdForUpdate(id)
    setAccion('editar')
    setIsShow(true)
  }

  const openObsertacionModal = async () => {
    setItemIdForUpdate(id)
    setAccion('observar')
    setIsShow(true)
  }

  const openViewModal = async () => {
    setItemIdForUpdate(id)
    setAccion('ver')
    setIsShow(true)
  }

  const receiveItem = useMutation(() => procesarEstadoComision({code: id, action: 'receive'}), {
    onSuccess: () => {
      queryClient.invalidateQueries([`${QUERIES.COMISIONES_LIST}-${query}`])
      showToast({
        // message: 'Comisión recepcionada correctamente',
        message: 'Registro recepcionado correctamente',
        type: 'success',
      })
    },
  })

  const approveItem = useMutation(() => procesarEstadoComision({code: id, action: 'approve'}), {
    onSuccess: () => {
      queryClient.invalidateQueries([`${QUERIES.COMISIONES_LIST}-${query}`])
      showToast({
        // message: 'Comisión aprobada correctamente',
        message: 'Registro aprobado correctamente',
        type: 'success',
      })
    },
  })

  const deleteItem = useMutation(() => deleteComision(id), {
    onSuccess: () => {
      queryClient.invalidateQueries([`${QUERIES.COMISIONES_LIST}-${query}`])
      showToast({
        // message: 'Comisión eliminada correctamente',
        message: 'Registro eliminado correctamente',
        type: 'success',
      })
    },
    onError: (error: any) => {
      showToast({
        message: error.response?.data?.message || 'Error al eliminar la comisión',
        type: 'error',
      })
    },
  })

  const sendItem = useMutation(() => procesarEstadoComision({code: id, action: 'send'}), {
    onSuccess: () => {
      queryClient.invalidateQueries([`${QUERIES.COMISIONES_LIST}-${query}`])
      // showToast({message: 'Comisión enviada correctamente', type: 'success'})
      showToast({message: 'Registro enviado correctamente', type: 'success'})
    },
    onError: () => {
      showToast({message: 'Error al enviar la comisión', type: 'error'})
    },
  })
  const handlePrintConfirm = async () => {
    let didOpenPdf = false

    try {
      if (!hash) {
        showToast({message: 'No se encontró el código del reporte', type: 'error'})
        return
      }

      if (estado !== 'GENERADO') {
        setIsPrinting(true)
        onPreparePDF(tipo === 'CAJA SALUD' ? 'Boleta de permiso' : 'Boleta de comisión')
        const pdfData = await imprimirComisionFormulario(hash, carnet)
        didOpenPdf = true
        onShowPDF(pdfData)
        return
      }

      // Si está en GENERADO, mostrar confirmación
      const result = await showConfirmDialog({
        title: '¿Está seguro?',
        html: `<div>Una vez que imprima, ${
          tipo == 'CAJA SALUD' ? 'el permiso' : 'la comisión'
        } <strong>no podrá ser modificado</strong> y se marcará como </div><span class="badge badge-light-warning fs-5 mt-3">ENVIADO</span>`,
        icon: 'warning',
        confirmButtonText: 'Sí, imprimir',
      })

      if (result.isConfirmed) {
        setIsPrinting(true)
        onPreparePDF(tipo === 'CAJA SALUD' ? 'Boleta de permiso' : 'Boleta de comisión')
        await sendItem.mutateAsync()
        const pdfData = await imprimirComisionFormulario(hash, carnet)
        didOpenPdf = true
        onShowPDF(pdfData)
      }
    } catch (error: any) {
      if (!didOpenPdf) {
        onCancelPDF()
      }
      showToast({
        message: error?.message || 'Datos personales no disponibles. Intente más tarde.',
        type: 'error',
      })
    } finally {
      setIsPrinting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const result = await showConfirmDialog({
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esta acción!',
        icon: 'warning',
        confirmButtonText: 'Sí, eliminar',
      })

      if (result.isConfirmed) {
        await deleteItem.mutateAsync()
      }
    } catch (error) {
      // Error is already handled in onError
    }
  }

  const handleApprove = async () => {
    try {
      const result = await showConfirmDialog({
        title: `¿Aprobar ${tipo === 'CAJA SALUD' ? 'el permiso' : 'la comisión'}?`,
        html: 'Esta acción cambiará el estado a <span class="badge badge-light-success">APROBADO</span>',
        icon: 'question',
        confirmButtonText: 'Sí, aprobar',
      })

      if (result.isConfirmed) {
        await approveItem.mutateAsync()
      }
    } catch (error) {}
  }
  const handleReceive = async () => {
    try {
      const result = await showConfirmDialog({
        title: '¿Recepcionar comisión?',
        html: 'Esta acción cambiará el estado a <span class="badge badge-light-info">RECEPCIONADO</span>',
        icon: 'question',
        confirmButtonText: 'Sí, continuar',
      })

      if (result.isConfirmed) {
        await receiveItem.mutateAsync()
      }
    } catch (error) {
      toast.error('Error al recepcionar la comisión')
    }
  }

  const viewAction = !inlinePrimaryActions ? (
    <div className='menu-item px-3'>
      <a href='#' className='menu-link px-3' onClick={openViewModal}>
        <i className='las la-eye fs-5 me-2'></i> Ver datos
      </a>
    </div>
  ) : null

  const printAction = !inlinePrimaryActions ? (
    <div className='menu-item px-3'>
      <a href='#' className='menu-link px-3' onClick={handlePrintConfirm}>
        {isPrinting ? (
          <>
            <span className='spinner-border spinner-border-sm me-2' role='status'></span>
            Generando...
          </>
        ) : (
          <>
            <i className='las la-print fs-5 me-2'></i> Imprimir
          </>
        )}
      </a>
    </div>
  ) : null

  return (
    <>
      {inlinePrimaryActions ? (
        <>
          <button
            type='button'
            className='btn btn-light-primary btn-sm flex-fill'
            onClick={openViewModal}
          >
            <i className='las la-eye fs-4 me-1'></i>
            Ver datos
          </button>
          <button
            type='button'
            className='btn btn-light-success btn-sm flex-fill'
            onClick={handlePrintConfirm}
          >
            {isPrinting ? (
              <>
                <span className='spinner-border spinner-border-sm me-1' role='status'></span>
                Generando...
              </>
            ) : (
              <>
                <i className='las la-print fs-4 me-1'></i>
                Imprimir
              </>
            )}
          </button>
        </>
      ) : null}

      <a
        href='#'
        className={buttonClassName}
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        {buttonLabel}
        <KTIcon iconName='down' className='fs-5 m-0' />
      </a>
      {/* begin::Menu */}
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-150px py-4'
        data-kt-menu='true'
      >
        {/* Imprimir action */}
        {viewAction}

        {printAction}

        {/* Edit action */}
        {permisos.puedeEditar && (
          <div className='menu-item px-3'>
            <a href='#' className='menu-link px-3' onClick={openEditModal}>
              <i className='las la-edit fs-5 me-2'></i> Editar
            </a>
          </div>
        )}
        {/* estado_boleta_comision: 'GENERADO' | 'ENVIADO' | 'RECEPCIONADO' | 'APROBADO' | 'OBSERVADO' */}

        {/* Approve action (only shown for PENDIENTE) */}
        {permisos.puedeAprobar && (
          <div className='menu-item px-3'>
            <a href='#' className='menu-link px-3' onClick={handleApprove}>
              <i className='las la-check-circle fs-5 me-2'></i> Aprobar
            </a>
          </div>
        )}

        {permisos.puedeRecepcionar && (
          <div className='menu-item px-3'>
            <a href='#' className='menu-link px-3' onClick={handleReceive}>
              <i className='las la-check-circle fs-5 me-2'></i> Recepcionar
            </a>
          </div>
        )}

        {/* Accion observar */}
        {permisos.puedeObservar && (
          <div className='menu-item px-3'>
            <a href='#' className='menu-link px-3' onClick={openObsertacionModal}>
              <i className='las la-info-circle fs-5 me-2'></i> Observar
            </a>
          </div>
        )}

        {/* Delete action */}
        {permisos.puedeEliminar && (
          <div className='menu-item px-3'>
            <a href='#' className='menu-link px-3' onClick={handleDelete}>
              <i className='las la-trash-alt fs-5 me-2'></i> Eliminar
            </a>
          </div>
        )}
      </div>
      {/* end::Menu */}
    </>
  )
}

export {ActionsCell}
