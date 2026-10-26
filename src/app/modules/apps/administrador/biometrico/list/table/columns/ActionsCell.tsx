import {FC, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {useMutation, useQueryClient} from 'react-query'
import {MenuComponent} from '../../../../../../../../_metronic/assets/ts/components'
import {ID, KTIcon, QUERIES} from '../../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'
import {
  deleteDispositivoBiometrico,
  syncBiometricoMarcaciones,
  syncBiometricoUsuarios,
  testDeviceConnection,
  testDeviceVoice,
} from '../../core/_requests'
import {showToast} from 'src/app/utils/toastHelper'
import {showConfirmDialog} from 'src/app/utils/swalHelpers.ts'
import Swal from 'sweetalert2'

type Props = {
  id: ID
}

const ActionsCell: FC<Props> = ({id}) => {
  const navigate = useNavigate()
  const {setItemIdForUpdate, setIsShow} = useListView()
  const {query} = useQueryResponse()
  const queryClient = useQueryClient()

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const openEditModal = () => {
    setItemIdForUpdate(id)
    setIsShow(true)
  }

  const deleteItem = useMutation(() => deleteDispositivoBiometrico(id), {
    onSuccess: () => {
      queryClient.invalidateQueries([`${QUERIES.DISPOSITIVOS_BIOMETRICOS_LIST}-${query}`])
      showToast({message: 'Dispositivo biométrico eliminado correctamente', type: 'success'})
    },
    onError: (error: any) => {
      showToast({
        message: error.response?.data?.message || 'Error al eliminar el dispositivo biométrico',
        type: 'error',
      })
    },
  })

  const handleDelete = async () => {
    const result = await showConfirmDialog({
      title: '¿Estás seguro?',
      text: '¡Esta acción eliminará permanentemente el dispositivo biométrico!',
      icon: 'warning',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })
    if (result.isConfirmed) {
      await deleteItem.mutateAsync()
    }
  }

  const invalidateList = () =>
    queryClient.invalidateQueries([`${QUERIES.DISPOSITIVOS_BIOMETRICOS_LIST}-${query}`])

  const handlePing = async () => {
    try {
      const response = await testDeviceConnection(id)
      showToast({
        type: response?.status === 'pass' ? 'success' : 'warning',
        message: response?.message || 'Prueba de conexión ejecutada.',
      })
      invalidateList()
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error?.response?.data?.message || 'No se pudo probar la conexión del biométrico.',
      })
    }
  }

  const handleSonar = async () => {
    try {
      const response = await testDeviceVoice(id, {voice_index: 10})
      showToast({
        type: response?.status === 'success' ? 'success' : 'warning',
        message: response?.message || 'Prueba de sonido ejecutada.',
      })
      invalidateList()
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error?.response?.data?.message || 'No se pudo ejecutar la prueba de sonido.',
      })
    }
  }

  const handleSyncUsuarios = async () => {
    try {
      const response = await syncBiometricoUsuarios(id)
      showToast({
        type: 'success',
        message: `Usuarios sincronizados. Recibidos: ${response.total_recibidos}, insertados: ${response.insertados}, actualizados: ${response.actualizados}.`,
      })
      invalidateList()
    } catch (error: any) {
      showToast({
        type: 'error',
        message:
          error?.response?.data?.message || 'No se pudo sincronizar usuarios del biométrico.',
      })
    }
  }

  const handleSyncMarcaciones = async () => {
    const today = new Date().toISOString().slice(0, 10)
    const {value, isConfirmed} = await Swal.fire({
      title: 'Sincronizar marcaciones',
      html: `
        <div class="text-start">
          <label class="form-label">Fecha desde</label>
          <input id="fecha_desde_sync" type="date" class="swal2-input" value="${today}" style="display:block;width:100%;margin:0 0 12px 0;">
          <label class="form-label">Fecha hasta</label>
          <input id="fecha_hasta_sync" type="date" class="swal2-input" value="${today}" style="display:block;width:100%;margin:0;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Sincronizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const fechaDesde =
          (document.getElementById('fecha_desde_sync') as HTMLInputElement | null)?.value || ''
        const fechaHasta =
          (document.getElementById('fecha_hasta_sync') as HTMLInputElement | null)?.value || ''
        if (!fechaDesde || !fechaHasta) {
          Swal.showValidationMessage('Debe completar ambas fechas.')
          return
        }
        return {fechaDesde, fechaHasta}
      },
    })

    if (!isConfirmed || !value) {
      return
    }

    try {
      const response = await syncBiometricoMarcaciones(id, {
        fecha_desde: value.fechaDesde,
        fecha_hasta: value.fechaHasta,
      })
      showToast({
        type: 'success',
        message: `Marcaciones sincronizadas. Raw insertadas: ${response.raw_insertadas}, normalizadas: ${response.normalizadas_insertadas}.`,
      })
      invalidateList()
    } catch (error: any) {
      showToast({
        type: 'error',
        message:
          error?.response?.data?.message || 'No se pudo sincronizar marcaciones del biométrico.',
      })
    }
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

      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-175px py-4'
        data-kt-menu='true'
      >
        <div className='menu-item px-3'>
          <a className='menu-link px-3' onClick={openEditModal}>
            <i className='las la-edit fs-5 me-2' />
            Editar dispositivo
          </a>
        </div>

        <div className='menu-item px-3'>
          <a className='menu-link px-3' onClick={handlePing}>
            <i className='las la-satellite-dish fs-5 me-2' />
            Probar conexión
          </a>
        </div>

        <div className='menu-item px-3'>
          <a className='menu-link px-3' onClick={handleSonar}>
            <i className='las la-volume-up fs-5 me-2' />
            Hacer sonar
          </a>
        </div>

        <div className='menu-item px-3'>
          <a className='menu-link px-3' onClick={handleSyncUsuarios}>
            <i className='las la-users-cog fs-5 me-2' />
            Sync usuarios
          </a>
        </div>

        <div className='menu-item px-3'>
          <a className='menu-link px-3' onClick={handleSyncMarcaciones}>
            <i className='las la-clock fs-5 me-2' />
            Sync marcaciones
          </a>
        </div>

        <div className='menu-item px-3'>
          <a
            className='menu-link px-3'
            onClick={() => navigate(`/apps/biometricos/${id}/administrar`)}
          >
            <i className='las la-cog fs-5 me-2' />
            Administrar
          </a>
        </div>

        <div className='menu-item px-3'>
          <a className='menu-link px-3 text-danger' onClick={handleDelete}>
            <i className='las la-trash-alt fs-5 me-2' />
            Eliminar
          </a>
        </div>
      </div>
    </>
  )
}

export {ActionsCell}
