/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC, useEffect} from 'react'
import {useMutation, useQueryClient} from 'react-query'
import {MenuComponent} from '../../../../../../../../_metronic/assets/ts/components'
import {KTIcon, QUERIES} from '../../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'
import {
  anularDeclaratoriaComision,
  deleteDeclaratoriaComision,
  imprimirDeclaratoriaComision,
} from '../../core/_requests'
import {showConfirmDialog} from 'src/app/utils/swalHelpers.ts'
import {showToast} from 'src/app/utils/toastHelper'
import {PDFData} from './_columns'

interface ActionsProps {
  declaratoria: any
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: PDFData) => void
  onCancelPDF: () => void
  onShowData: (declaratoria: any) => void
  onSetLoading: (declaratoriaId: string, isLoading: boolean) => void
  isLoading: boolean
}

const ActionsCell: FC<ActionsProps> = ({
  declaratoria,
  onPreparePDF,
  onShowPDF,
  onCancelPDF,
  onShowData,
  onSetLoading,
  isLoading,
}) => {
  const {setItemIdForUpdate, setIsShow} = useListView()
  const {query} = useQueryResponse()
  const queryClient = useQueryClient()

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const openEditModal = async () => {
    setItemIdForUpdate(declaratoria.id_declaratoria_comision)
    setIsShow(true)
  }

  const deleteItem = useMutation(
    () => deleteDeclaratoriaComision(declaratoria.id_declaratoria_comision),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([`${QUERIES.DECLARATORIA_COMISION_LIST}-${query}`])
        showToast({
          message: 'Declaratoria comisión eliminada correctamente',
          type: 'success',
        })
      },
      onError: (error: any) => {
        showToast({
          message: error.response?.data?.message || 'Error al eliminar la declaratoria comisión',
          type: 'error',
        })
      },
    }
  )

  const anularItem = useMutation(
    () => anularDeclaratoriaComision(declaratoria.id_declaratoria_comision),
    {
      onSuccess: (response) => {
        // Axios retorna un objeto con { data, status, headers, ... }
        const {message} = response.data

        showToast({
          message: message || 'Declaratoria comisión anulada correctamente',
          type: 'success',
        })

        queryClient.invalidateQueries([`${QUERIES.DECLARATORIA_COMISION_LIST}-${query}`])
      },
      onError: (error: any) => {
        showToast({
          message: error.response?.data?.message || 'Error al anular la declaratoria comisión',
          type: 'error',
        })
      },
    }
  )

  const printMutation = useMutation(() => imprimirDeclaratoriaComision(declaratoria.hash), {
    onMutate: () => {
      onPreparePDF('Declaratoria de Comision')
      onSetLoading(declaratoria.id_declaratoria_comision, true)
    },
    onSuccess: (response) => {
      onSetLoading(declaratoria.id_declaratoria_comision, false)
      onShowPDF({
        base64: response.pdf_base64,
        filename: response.filename,
        declaratoria: declaratoria,
      })

      // Si el estado era GENERADO, actualizar la lista
      if (declaratoria.estado === 'GENERADO') {
        queryClient.invalidateQueries([`${QUERIES.DECLARATORIA_COMISION_LIST}-${query}`])
        showToast({
          message: 'Declaratoria emitida correctamente',
          type: 'success',
        })
      }
    },
    onError: (error: any) => {
      onSetLoading(declaratoria.id_declaratoria_comision, false)
      onCancelPDF()
      showToast({
        message: error.response?.data?.message || error.message || 'Error al generar el PDF',
        type: 'error',
      })
    },
  })

  const handlePrintConfirm = async () => {
    try {
      if (declaratoria.estado === 'GENERADO') {
        const result = await showConfirmDialog({
          title: '¿Está seguro?',
          html: '<div>Una vez que imprima, la comisión <strong>no podrá ser modificada</strong> y se marcará como </div><span class="badge badge-light-success fs-5 mt-3">EMITIDO</span>',
          icon: 'warning',
          confirmButtonText: 'Sí, imprimir',
        })

        if (!result?.isConfirmed) {
          return
        }
      }

      printMutation.mutate()
    } catch (error) {
      showToast({message: 'Error al procesar la impresión', type: 'error'})
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

  const handleAnular = async () => {
    try {
      const result = await showConfirmDialog({
        title: '¿Deseas anular este registro?',
        text: 'Esta acción dejará el registro sin efecto y no podrás revertirla.',
        icon: 'warning',
        confirmButtonText: 'Sí, anular',
      })

      if (result.isConfirmed) {
        await anularItem.mutateAsync()
      }
    } catch (error) {
      // Error is already handled in onError
    }
  }

  const handleShowData = () => {
    onShowData(declaratoria)
  }

  return (
    <>
      <a
        href='#'
        className='btn btn-outline btn-outline-primary btn-sm'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        Acciones
        <KTIcon iconName='down' className='fs-5 m-0' />
      </a>

      {/* begin::Menu */}
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-150px py-4'
        data-kt-menu='true'
      >
        {/* Imprimir action */}
        <div className='menu-item px-3'>
          <a
            href='#'
            className='menu-link px-3'
            onClick={handlePrintConfirm}
            style={{opacity: isLoading ? 0.6 : 1}}
          >
            {isLoading ? (
              <>
                <div className='spinner-border spinner-border-sm me-2' role='status'>
                  <span className='visually-hidden'>Cargando...</span>
                </div>
                Generando...
              </>
            ) : (
              <>
                <i className='las la-print fs-5 me-2'></i> Imprimir
              </>
            )}
          </a>
        </div>

        {/* Ver datos action */}
        <div className='menu-item px-3'>
          <a href='#' className='menu-link px-3' onClick={handleShowData}>
            <i className='las la-eye fs-5 me-2'></i> Ver datos
          </a>
        </div>

        {/* Edit action */}
        {declaratoria.estado === 'GENERADO' && (
          <div className='menu-item px-3'>
            <a className='menu-link px-3' onClick={openEditModal}>
              <i className='las la-edit fs-5 me-2'></i> Editar
            </a>
          </div>
        )}

        {/* Edit action */}
        {declaratoria.estado === 'EMITIDO' && (
          <div className='menu-item px-3'>
            <a className='menu-link px-3' onClick={handleAnular}>
              <i className='las la-ban fs-5 me-2'></i> Anular
            </a>
          </div>
        )}

        {/* Delete action */}
        {declaratoria.estado === 'GENERADO' && (
          <div className='menu-item px-3'>
            <a className='menu-link px-3' onClick={handleDelete}>
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
