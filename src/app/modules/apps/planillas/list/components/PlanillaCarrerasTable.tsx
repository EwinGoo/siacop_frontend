import { EstadoBadge } from 'src/app/modules/components/EstadoBadge'
import { PlanillaCarrera } from '../core/_models'
import { estadosCarrera, formatNumber } from './planillaControlHelpers'
import useDateFormatter from 'src/app/hooks/useDateFormatter'

type Props = {
  carreras: PlanillaCarrera[]
  loading: boolean
  selectedCarreras: number[]
  allVisibleSelected: boolean
  onToggleCarrera: (idCarreraSede: number) => void
  onToggleVisible: () => void
  onStateChange: (carrera: PlanillaCarrera, estado: PlanillaCarrera['llenado_asistencia_estado']) => void
  readOnly?: boolean
}

export const PlanillaCarrerasTable = ({
  carreras,
  loading,
  selectedCarreras,
  allVisibleSelected,
  onToggleCarrera,
  onToggleVisible,
  onStateChange,
  readOnly = false,
}: Props) => {

  const { formatShortDate } = useDateFormatter()

  return (
    <div className='table-responsive'>
      <table className='table table-row-dashed table-row-gray-300 align-middle gy-4'>
        <thead>
          <tr className='fw-bold text-muted'>
            <th className='w-30px'>
              {!readOnly && (
                <input
                  className='form-check-input'
                  type='checkbox'
                  checked={allVisibleSelected}
                  onChange={onToggleVisible}
                />
              )}
            </th>
            <th>Carrera - Sede</th>
            <th>Estado</th>
            <th>Fechas</th>
            <th className='text-end'>Asign.</th>
            <th className='text-end'>Con nombr.</th>
            <th className='text-end'>Horas asign.</th>
            <th className='text-end'>Horas trab.</th>
            <th className='text-end'>Accion</th>
          </tr>
        </thead>
        <tbody>
          {carreras.map((carrera) => (
            <tr key={carrera.id_planilla_carrera_sede}>
              <td>
                {!readOnly && (
                  <input
                    className='form-check-input'
                    type='checkbox'
                    checked={selectedCarreras.includes(Number(carrera.id_carrera_sede))}
                    onChange={() => onToggleCarrera(Number(carrera.id_carrera_sede))}
                  />
                )}
              </td>
              <td>
                <div className='fw-bold text-gray-900'>{carrera.nombre_completo_carrera}</div>
                <div className='text-muted fs-7'>{carrera.nombre_sede}</div>
              </td>
              <td>
                <EstadoBadge estado={carrera.llenado_asistencia_estado} />
              </td>
              <td>
                <div className='text-gray-800 fs-7'>
                  {formatShortDate(carrera.llenado_asistencia_fecha_inicio) || 'Sin inicio'} a{' '}
                  {formatShortDate(carrera.llenado_asistencia_fecha_fin) || 'Sin fin'}
                </div>
              </td>
              <td className='text-end'>{formatNumber(carrera.numero_asignaciones)}</td>
              <td className='text-end'>{formatNumber(carrera.numero_asignaciones_con_nombramiento)}</td>
              <td className='text-end'>{formatNumber(carrera.horas_asignadas)}</td>
              <td className='text-end'>{formatNumber(carrera.horas_trabajadas)}</td>
              <td className='text-end'>
                {readOnly ? (
                  <span className='text-muted fs-7'>Solo lectura</span>
                ) : (
                  <select
                    className='form-select form-select-sm form-select-solid min-w-125px'
                    value={carrera.llenado_asistencia_estado}
                    onChange={(event) =>
                      onStateChange(
                        carrera,
                        event.target.value as PlanillaCarrera['llenado_asistencia_estado']
                      )
                    }
                  >
                    {estadosCarrera.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          ))}

          {!loading && carreras.length === 0 && (
            <tr>
              <td colSpan={9} className='text-center text-muted py-10'>
                No se encontraron carreras para la planilla seleccionada
              </td>
            </tr>
          )}

          {loading && (
            <tr>
              <td colSpan={9} className='text-center text-muted py-10'>
                Cargando carreras...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
