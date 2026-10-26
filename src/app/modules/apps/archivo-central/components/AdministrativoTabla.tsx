import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CellProps, Column, useTable } from 'react-table'
import { KTIcon } from '../../../../../_metronic/helpers/components/KTIcon'
import { Administrativo, ModoArchivo } from '../core/types'
import { codigoArchivo } from '../core/presentation'

const alineacion = (id: string) =>
  id === 'acciones' ? 'text-end' : id === 'documentos' ? 'text-end d-none d-md-table-cell' : ''

export const AdministrativoTabla = ({
  personas,
  modo,
  volver,
  actualizando,
}: {
  personas: Administrativo[]
  modo: ModoArchivo
  volver: string
  actualizando: boolean
}) => {
  // Adaptación de UsersTable/UserInfoCell de Metronic: solo representa la página recibida.
  const columns = useMemo<Column<Administrativo>[]>(
    () => [
      {
        Header: 'Funcionario',
        accessor: 'nombre_completo',
        Cell: ({ row }: CellProps<Administrativo>) => {
          const persona = row.original
          const iniciales = persona.nombre_completo
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((parte) => parte[0])
            .join('')
          return (
            <div className='d-flex align-items-center'>
              <div
                className='symbol symbol-circle symbol-40px me-3 d-none d-sm-inline-flex'
                aria-hidden='true'
              >
                <span className='symbol-label bg-light-primary text-primary fw-bold fs-6'>
                  {iniciales}
                </span>
              </div>
              <div className='d-flex flex-column min-w-0'>
                <Link
                  to={String(persona.persona_id)}
                  state={{ volver }}
                  className='text-gray-800 text-hover-primary fw-semibold text-break'
                >
                  {persona.nombre_completo}
                </Link>
                <span className='text-muted fs-7'>
                  CI: {persona.ci} {persona.expedido}
                </span>
                <span className='text-muted fs-8 d-md-none'>
                  {persona.cantidad_documentos} documentos
                </span>
              </div>
            </div>
          )
        },
      },
      {
        Header: 'Expediente',
        accessor: 'codigo_archivo',
        Cell: ({ row }: CellProps<Administrativo>) => (
          <span
            className={`badge fw-semibold ${row.original.tiene_expediente ? 'badge-light-primary' : 'badge-light'
              }`}
          >
            {codigoArchivo(row.original.codigo_archivo)}
          </span>
        ),
      },
      {
        Header: 'Documentos',
        accessor: 'cantidad_documentos',
        id: 'documentos',
        Cell: ({ value }: CellProps<Administrativo, number>) => (
          <span className='fw-semibold text-gray-700'>{value}</span>
        ),
      },
      {
        Header: 'Acciones',
        id: 'acciones',
        Cell: ({ row }: CellProps<Administrativo>) => (
          <Link
            to={String(row.original.persona_id)}
            state={{ volver }}
            className='btn btn-sm btn-light-primary'
            aria-label={`${modo === 'auditoria' ? 'Revisar' : 'Abrir'} expediente de ${row.original.nombre_completo
              }`}
          >
            <span className='d-none d-lg-inline'>
              {modo === 'auditoria' ? 'Revisar' : 'Abrir'} expediente
            </span>
            <span className='d-lg-none'>Abrir</span>
          </Link>
        ),
      },
    ],
    [modo, volver]
  )
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable<Administrativo>({ columns, data: personas, getRowId: (row) => String(row.persona_id) })
  return (
    <div className='table-responsive' aria-busy={actualizando}>
      <table {...getTableProps()} className='table align-middle table-row-dashed fs-6 gy-4 mb-0'>
        <caption className='visually-hidden'>Administrativos y estado de su expediente</caption>
        <thead>
          {headerGroups.map((group) => (
            <tr
              {...group.getHeaderGroupProps()}
              key={group.id}
              className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'
            >
              {group.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  scope='col'
                  key={column.id}
                  className={alineacion(column.id)}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    key={cell.column.id}
                    className={alineacion(cell.column.id)}
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
