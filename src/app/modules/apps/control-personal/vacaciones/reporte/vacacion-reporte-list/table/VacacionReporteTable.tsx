import {useMemo} from 'react'
import {useTable, ColumnInstance, Row} from 'react-table'
import {KTCardBody} from 'src/_metronic/helpers'
import {ListLoading} from 'src/app/modules/components/loading/ListLoading'
import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
import {Vacacion} from 'src/app/modules/apps/control-personal/vacaciones/core/_models'
import {Columns} from './columns/_columns'
import {CustomHeaderColumn} from './columns/CustomHeaderColumn'
import {CustomRow} from './columns/CustomRow'
import {ListPagination} from '../components/pagination/ListPagination'
import useIsMobileViewport from 'src/app/hooks/useIsMobileViewport'
import {VacacionReporteCards} from './VacacionReporteCards'

const VacacionReporteTable = () => {
  const vacaciones = useQueryResponseData()
  const isLoading  = useQueryResponseLoading()
  const data       = useMemo(() => vacaciones, [vacaciones])
  const isMobileViewport = useIsMobileViewport()
  const columns    = useMemo(() => Columns, [])

  const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable({
    columns,
    data,
  })

  return (
    <KTCardBody className='py-4'>
      {isMobileViewport ? (
        <VacacionReporteCards items={data} />
      ) : (
        <div className='table-responsive'>
          <table
            id='kt_table_vacaciones'
            className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer table_hover'
            {...getTableProps()}
          >
            <thead>
              <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0 align-top'>
                {headers.map((column: ColumnInstance<Vacacion>) => (
                  <CustomHeaderColumn key={column.id} column={column} />
                ))}
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
              {rows.length > 0 ? (
                rows.map((row: Row<Vacacion>, i) => {
                  prepareRow(row)
                  return <CustomRow row={row} key={`row-${i}-${row.id}`} />
                })
              ) : (
                <tr>
                  <td colSpan={headers.length}>
                    <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                      No se encontraron registros de vacaciones
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <ListPagination />
      {isLoading && <ListLoading />}
    </KTCardBody>
  )
}

export {VacacionReporteTable}
