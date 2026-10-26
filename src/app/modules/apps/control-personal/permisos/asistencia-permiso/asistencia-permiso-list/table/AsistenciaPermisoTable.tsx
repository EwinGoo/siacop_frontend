import {useEffect, useMemo} from 'react'
import {useTable, ColumnInstance, Row} from 'react-table'
import {toast} from 'react-toastify'
import {CustomHeaderColumn} from './columns/CustomHeaderColumn'
import {CustomRow} from './columns/CustomRow'
import {useQueryResponseData, useQueryResponseLoading, useQueryResponseWarning} from '../core/QueryResponseProvider'
import {getColumns} from './columns/_columns' // Asegúrate de tener las columnas adecuadas para TipoPermiso
import {AsistenciaPermiso, PermisoPDFData} from '../core/_models'
import {ListPagination} from '../components/pagination/ListPagination'
import {KTCardBody} from '../../../../../../../../_metronic/helpers'
import {ListLoading} from 'src/app/modules/components/loading/ListLoading'
import { useAuth } from 'src/app/modules/auth'
import { canManageComisiones } from 'src/app/modules/auth/core/roles/roleDefinitions'
import useIsMobileViewport from 'src/app/hooks/useIsMobileViewport'
import {AsistenciaPermisoCards} from './AsistenciaPermisoCards'

type Props = {
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: PermisoPDFData) => void
  onCancelPDF: () => void
}

const AsistenciaPermisoTable = ({onPreparePDF, onShowPDF, onCancelPDF}: Props) => {
  const tiposPermiso = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const warning = useQueryResponseWarning()
  const data = useMemo(() => tiposPermiso, [tiposPermiso])

  useEffect(() => {
    if (warning) {
      toast.warning(warning, {
        position: 'top-right',
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
      })
    }
  }, [warning])
  const {currentUser} = useAuth()
  const canManage = currentUser?.groups ? canManageComisiones(currentUser.groups) : false
  const isMobileViewport = useIsMobileViewport()
  const columns = useMemo(
    () => getColumns({isAdmin: canManage, onPreparePDF, onShowPDF, onCancelPDF}),
    [canManage, onPreparePDF, onShowPDF, onCancelPDF]
  )

  const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable({
    columns,
    data,
  })

  return (
    <KTCardBody className='py-4 position-relative' style={{minHeight: '240px'}}>
      {isMobileViewport ? (
        <AsistenciaPermisoCards
          items={data}
          canManage={canManage}
          onPreparePDF={onPreparePDF}
          onShowPDF={onShowPDF}
          onCancelPDF={onCancelPDF}
        />
      ) : (
        <div className='table-responsive'>
          <table
            id='kt_table_hover'
            className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
            {...getTableProps()}
          >
            <thead>
              <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                {headers.map((column: ColumnInstance<AsistenciaPermiso>) => (
                  <CustomHeaderColumn key={column.id} column={column} />
                ))}
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
              {rows.length > 0 ? (
                rows.map((row: Row<AsistenciaPermiso>, i) => {
                  prepareRow(row)
                  return <CustomRow row={row} key={`row-${i}-${row.id}`} />
                })
              ) : (
                <tr>
                  <td colSpan={9}>
                    <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                      No se encontraron registros
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <ListPagination />
      {isLoading && (
        <ListLoading
          message={data.length ? 'Actualizando listado...' : 'Cargando listado de permisos...'}
        />
      )}
    </KTCardBody>
  )
}

export {AsistenciaPermisoTable}
