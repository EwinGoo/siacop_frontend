import {useQueryClient, useMutation} from 'react-query'
import {QUERIES, initialQueryState} from '../../../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'
import {aprobarSelectedPermisos} from '../../core/_requests'
import Tooltip from '@mui/material/Tooltip'
import {showAxiosError} from 'src/app/utils/showAxiosErrorToast'
import {toast} from 'react-toastify'
import {useQueryRequest} from '../../core/QueryRequestProvider'

const ListGrouping = () => {
  const {selected, clearSelected} = useListView()
  const {updateState} = useQueryRequest()
  const queryClient = useQueryClient()
  const {query} = useQueryResponse()

  const aprobarSelectedItems = useMutation(
    () => aprobarSelectedPermisos(selected.map((id) => Number(id))),
    {
      // onMutate: async () => {},
      onError: (error, variables, context) => {
        showAxiosError(error, {useSwal: true})
      },
      onSuccess: async (res) => {
        try {
          await queryClient.invalidateQueries(`${QUERIES.ASISTENCIAS_PERMISO_LIST}-${query}`)
          toast.success(`${selected.length} permisos aprobados correctamente`)
          clearSelected()
          updateState({filter: undefined, ...initialQueryState})
        } catch (error) {
          console.error('Error al actualizar datos:', error)
        }
      },
    }
  )

  return (
    <div className='d-flex justify-content-end align-items-center'>
      <div className='fw-bolder me-5'>
        <span className='me-2'>{selected.length}</span> Seleccionados
      </div>

      {/* Botón cancelar */}

      <Tooltip
        title='Cancelar'
        arrow
        slotProps={{
          tooltip: {
            sx: {
              fontSize: 11,
            },
          },
        }}
      >
        <button
          type='button'
          className='btn btn-danger me-2 rounded-circle px-4 py-2'
          onClick={() => clearSelected()}
          disabled={aprobarSelectedItems.isLoading || selected.length === 0}
        >
          x
        </button>
      </Tooltip>
      <button
        type='button'
        className='btn btn-success'
        onClick={async () => {
          try {
            await aprobarSelectedItems.mutateAsync()
          } catch (error) {
            // El error ya es manejado por onError, pero aquí lo atrapamos para que React no se queje
            console.warn('Error ya manejado internamente:', error)
          }
        }}
        disabled={aprobarSelectedItems.isLoading || selected.length === 0}
      >
        {aprobarSelectedItems.isLoading ? (
          <span className='indicator-progress' style={{display: 'block'}}>
            Procesando... <span className='spinner-border spinner-border-sm align-middle ms-2' />
          </span>
        ) : (
          <>
            <i className='bi bi-check-circle me-2'></i>
            Aprobar Seleccionados
          </>
        )}
      </button>
    </div>
  )
}

export {ListGrouping}
