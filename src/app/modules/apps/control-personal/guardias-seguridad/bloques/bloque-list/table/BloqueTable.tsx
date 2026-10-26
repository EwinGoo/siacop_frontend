import {useMemo} from 'react'
import {useTable, ColumnInstance, Row} from 'react-table'
import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
import {useListView} from '../core/ListViewProvider'
import {Bloque} from '../core/_models'
import {ListPagination} from '../components/pagination/ListPagination'
import {KTCardBody, KTIcon} from '../../../../../../../../_metronic/helpers'
import Swal from 'sweetalert2'
import {deleteBloque} from '../core/_requests'
import {useQueryResponse} from '../core/QueryResponseProvider'
import {usePermissions} from 'src/app/modules/auth/hooks/usePermissions'

const BloqueTable = () => {
  const bloques = useQueryResponseData() as Bloque[]
  const isLoading = useQueryResponseLoading()
  const {setItemIdForUpdate} = useListView()
  const {refetch} = useQueryResponse()
  const {guardiaSeguridad} = usePermissions()

  const handleDelete = async (bloque: Bloque) => {
    const result = await Swal.fire({
      title: '¿Eliminar bloque?',
      text: `Se eliminará "${bloque.nombre}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f1416c',
    })
    if (result.isConfirmed) {
      await deleteBloque(bloque.id_guardia_bloque)
      refetch()
    }
  }

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table className='table align-middle table-row-dashed fs-6 gy-5 dataTable'>
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              <th className='min-w-125px'>Nombre</th>
              <th className='min-w-200px'>Descripción</th>
              <th className='min-w-100px text-end'>Acciones</th>
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold'>
            {isLoading ? (
              <tr>
                <td colSpan={3} className='text-center py-10'>
                  <span className='spinner-border text-primary'></span>
                </td>
              </tr>
            ) : bloques.length === 0 ? (
              <tr>
                <td colSpan={3} className='text-center text-muted py-10'>
                  No se encontraron bloques
                </td>
              </tr>
            ) : (
              bloques.map((bloque) => (
                <tr key={bloque.id_guardia_bloque}>
                  <td>
                    <div className='d-flex align-items-center'>
                      <span className='badge badge-light-primary me-3'>
                        <KTIcon iconName='geolocation' className='fs-3' />
                      </span>
                      <span className='text-dark fw-bolder'>{bloque.nombre}</span>
                    </div>
                  </td>
                  <td className='text-muted'>{bloque.descripcion || '—'}</td>
                  <td className='text-end'>
                    {guardiaSeguridad.canManage && (
                      <>
                        <button
                          className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
                          title='Editar'
                          onClick={() => setItemIdForUpdate(bloque.id_guardia_bloque)}
                        >
                          <KTIcon iconName='pencil' className='fs-3' />
                        </button>
                        <button
                          className='btn btn-icon btn-bg-light btn-active-color-danger btn-sm'
                          title='Eliminar'
                          onClick={() => handleDelete(bloque)}
                        >
                          <KTIcon iconName='trash' className='fs-3' />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ListPagination />
    </KTCardBody>
  )
}

export {BloqueTable}
