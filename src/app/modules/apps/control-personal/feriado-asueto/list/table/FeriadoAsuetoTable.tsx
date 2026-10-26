import { useMemo } from 'react'
import { useTable, ColumnInstance, Row } from 'react-table'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { useQueryResponseData, useQueryResponseLoading } from '../core/QueryResponseProvider'
import { Columns } from './columns/_columns'
import { FeriadoAsueto } from '../core/_models'
import { ListPagination } from '../components/pagination/ListPagination'
import { KTCardBody } from '../../../../../../../_metronic/helpers'
import { ListLoading } from 'src/app/modules/components/loading/ListLoading'
import useIsMobileViewport from 'src/app/hooks/useIsMobileViewport'
import {FeriadoAsuetoCards} from './FeriadoAsuetoCards'

const FeriadoAsuetoTable = () => {
  const feriadosAsuetos = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const data = useMemo(() => feriadosAsuetos, [feriadosAsuetos])
  const isMobileViewport = useIsMobileViewport()
  const columns = useMemo(() => Columns, [])

  const {
    getTableProps,
    getTableBodyProps,
    headers,
    rows,
    prepareRow
  } = useTable({
    columns,
    data,
  })

  return (
    <KTCardBody className='py-4'>
      {isMobileViewport ? (
        <FeriadoAsuetoCards items={data} />
      ) : (
        <div className='table-responsive'>
          <table
            id='kt_table_hover'
            className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
            {...getTableProps()}
          >
            <thead>
              <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                {headers.map((column: ColumnInstance<FeriadoAsueto>) => (
                  <CustomHeaderColumn key={column.id} column={column} />
                ))}
              </tr>
            </thead>
            <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
              {rows.length > 0 ? (
                rows.map((row: Row<FeriadoAsueto>, i) => {
                  prepareRow(row)
                  return <CustomRow row={row} key={`row-${i}-${row.id}`} />
                })
              ) : (
                <tr>
                  <td colSpan={headers.length}>
                    <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                      No se encontraron feriados o asuetos registrados
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

export { FeriadoAsuetoTable }
