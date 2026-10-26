import {KTCardBody} from 'src/_metronic/helpers'
import {ListLoading} from 'src/app/modules/components/loading/ListLoading'
import {AsignacionAdministrativa, HorarioTipo} from '../core/_models'
import {ListPagination} from '../components/pagination/ListPagination'
import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
import useDateFormatter from 'src/app/hooks/useDateFormatter'

type Props = {
  horariosTipo: HorarioTipo[]
  onHorarioTipoChange: (item: AsignacionAdministrativa, value: string) => Promise<void>
  updatingHorarioId: number | null
}

const AsignacionesAdministrativasTable = ({
  horariosTipo,
  onHorarioTipoChange,
  updatingHorarioId,
}: Props) => {
  const items = useQueryResponseData()
  const loading = useQueryResponseLoading()
  const {formatShortDate} = useDateFormatter()

  const personaNombre = (item: AsignacionAdministrativa) =>
    [item.persona?.nombre, item.persona?.paterno, item.persona?.materno].filter(Boolean).join(' ')

  return (
    <KTCardBody className='py-4 position-relative'>
      <div className='table-responsive'>
        <table
          id='kt_table_hover'
          className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              <th>Persona</th>
              <th>CI</th>
              {/* <th>POA</th>
              <th>Tipo</th> */}
              <th>Cargo</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Horario</th>
              <th>Estado</th>
              <th className='text-end'>Acciones</th>
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold'>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id_asignacion_administrativo}>
                  <td>{personaNombre(item) || 'Sin datos'}</td>
                  <td>{item.persona?.ci || '-'}</td>
                  {/* <td>{item.id_poa}</td>
                  <td>{item.tipo_contratacion || '-'}</td> */}
                  <td>{item.nombre_cargo || item.codigo_cargo || '-'}</td>
                  <td>
                    {item.fecha_inicio_asignacion_administrativo
                      ? formatShortDate(item.fecha_inicio_asignacion_administrativo)
                      : '-'}
                  </td>
                  <td>
                    {item.fecha_fin_asignacion_administrativo
                      ? formatShortDate(item.fecha_fin_asignacion_administrativo)
                      : '-'}
                  </td>
                  <td>
                    {horariosTipo.find(
                      (horario) => horario.id_horario_tipo === Number(item.id_horario_tipo ?? 0)
                    )?.nombre_horario_tipo || '-'}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        item.estado_asignacion_administrativo
                          ? 'badge-light-success'
                          : 'badge-light-danger'
                      }`}
                    >
                      {item.estado_asignacion_administrativo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className='text-end' style={{whiteSpace: 'nowrap'}}>
                    <div className='d-flex justify-content-end gap-2 align-items-center flex-nowrap'>
                      <select
                        className='form-select form-select-sm'
                        style={{width: '180px'}}
                        value={String(item.id_horario_tipo ?? '')}
                        onChange={(event) => {
                          void onHorarioTipoChange(item, event.target.value)
                        }}
                        disabled={updatingHorarioId === Number(item.id_asignacion_administrativo)}
                      >
                        <option value=''>Sin horario</option>
                        {horariosTipo.map((horario) => (
                          <option key={horario.id_horario_tipo} value={horario.id_horario_tipo}>
                            {horario.nombre_horario_tipo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                    No se encontraron asignaciones administrativas
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ListPagination />
      {loading && <ListLoading />}
    </KTCardBody>
  )
}

export {AsignacionesAdministrativasTable}
