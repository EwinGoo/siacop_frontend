import {FormEvent, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {KTCard} from 'src/_metronic/helpers'
import {StatusBadge} from '../components/StatusBadge'
import {EmptyState} from '../components/EmptyState'
import {ProcesoPlanilla, ProcesoPlanillaDetalle} from '../core/_models'
import {
  createProcesoPlanilla,
  ejecutarProcesoPlanilla,
  getDetalleProcesoPlanilla,
  getProcesosPlanilla,
} from '../core/_requests'
import useDateFormatter from 'src/app/hooks/useDateFormatter'

const ProcesosPage = () => {
  const navigate = useNavigate()
  const [fechaInicio, setFechaInicio] = useState('2026-05-21')
  const [fechaFin, setFechaFin] = useState('2026-06-20')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [executingId, setExecutingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [procesos, setProcesos] = useState<ProcesoPlanilla[]>([])
  const [detalle, setDetalle] = useState<ProcesoPlanillaDetalle | null>(null)
  const {formatShortDate} = useDateFormatter()

  const cargar = async () => {
    setLoading(true)
    try {
      const response = await getProcesosPlanilla()
      setProcesos(response.data || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo cargar procesos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargar()
  }, [])

  const onCreate = async (event: FormEvent) => {
    event.preventDefault()
    if (!fechaInicio || !fechaFin) {
      setError('Debes definir fecha inicio y fecha fin.')
      return
    }

    setCreating(true)
    setError(null)
    try {
      await createProcesoPlanilla({fecha_inicio: fechaInicio, fecha_fin: fechaFin})
      setFechaInicio('')
      setFechaFin('')
      await cargar()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo crear el proceso.')
    } finally {
      setCreating(false)
    }
  }

  const onEjecutar = async (idProceso: number) => {
    setExecutingId(idProceso)
    setError(null)
    try {
      await ejecutarProcesoPlanilla(idProceso)
      await cargar()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo ejecutar el proceso.')
    } finally {
      setExecutingId(null)
    }
  }

  const onVerDetalle = async (idProceso: number) => {
    setError(null)
    try {
      const response = await getDetalleProcesoPlanilla(idProceso)
      setDetalle(response)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo obtener el detalle.')
    }
  }

  return (
    <>
      <div className='row g-5 mb-7'>
        <div className='col-12 col-md-4'>
          <div className='card card-flush h-100'>
            <div className='card-body'>
              <div className='text-gray-500 fs-7 text-uppercase fw-bold mb-2'>
                Procesos registrados
              </div>
              <div className='fs-1 fw-bolder text-gray-900'>{procesos.length}</div>
            </div>
          </div>
        </div>
        <div className='col-12 col-md-4'>
          <div className='card card-flush h-100'>
            <div className='card-body'>
              <div className='text-gray-500 fs-7 text-uppercase fw-bold mb-2'>
                Procesos completados
              </div>
              <div className='fs-1 fw-bolder text-success'>
                {
                  procesos.filter(
                    (item) => (item.estado_proceso || '').toUpperCase() === 'COMPLETADO'
                  ).length
                }
              </div>
            </div>
          </div>
        </div>
        <div className='col-12 col-md-4'>
          <div className='card card-flush h-100'>
            <div className='card-body'>
              <div className='text-gray-500 fs-7 text-uppercase fw-bold mb-2'>
                Procesos observables
              </div>
              <div className='fs-1 fw-bolder text-primary'>
                {
                  procesos.filter((item) =>
                    ['COMPLETADO', 'PROCESANDO', 'ERROR'].includes(
                      (item.estado_proceso || '').toUpperCase()
                    )
                  ).length
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <KTCard className='mb-7'>
        <div className='card-header'>
          <div className='card-title d-flex flex-column'>
            <h3 className='fw-bold m-0'>Crear proceso de planilla</h3>
            <span className='text-muted mt-1'>
              Define el rango mensual y genera el snapshot del cálculo
            </span>
          </div>
        </div>
        <div className='card-body'>
          <form className='row g-5 align-items-end' onSubmit={onCreate}>
            <div className='col-12 col-md-4'>
              <label className='form-label fw-semibold'>Fecha inicio</label>
              <input
                type='date'
                className='form-control'
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className='col-12 col-md-4'>
              <label className='form-label fw-semibold'>Fecha fin</label>
              <input
                type='date'
                className='form-control'
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className='col-12 col-md-4 d-flex gap-2'>
              <button type='submit' className='btn btn-primary flex-grow-1' disabled={creating}>
                {creating ? 'Creando...' : 'Crear proceso'}
              </button>
              <button type='button' className='btn btn-light-primary' onClick={() => void cargar()}>
                Recargar
              </button>
            </div>
          </form>
          {error && <div className='alert alert-danger mt-6 mb-0'>{error}</div>}
        </div>
      </KTCard>

      <KTCard className='mb-7'>
        <div className='card-header'>
          <div className='card-title d-flex flex-column'>
            <h3 className='fw-bold m-0'>Procesos registrados</h3>
            <span className='text-muted mt-1'>
              Desde aquí puedes ejecutar, auditar y abrir los resultados
            </span>
          </div>
        </div>
        <div className='card-body'>
          {loading ? (
            <div className='text-muted'>Cargando procesos...</div>
          ) : procesos.length === 0 ? (
            <EmptyState
              title='Sin procesos creados'
              description='Primero crea un proceso mensual para luego ejecutarlo.'
            />
          ) : (
            <div className='table-responsive'>
              <table className='table align-middle table-row-dashed fs-6 gy-4'>
                <thead>
                  <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                    <th>ID</th>
                    <th>Periodo</th>
                    <th>Estado</th>
                    <th>Totales</th>
                    <th>Fechas proceso</th>
                    <th className='text-end'>Acciones</th>
                  </tr>
                </thead>
                <tbody className='fw-semibold text-gray-700'>
                  {procesos.map((item) => (
                    <tr key={item.id_proceso}>
                      <td>{item.id_proceso}</td>
                      <td>
                        {item.fecha_inicio ? formatShortDate(item.fecha_inicio) : '-'}
                        {item.fecha_fin ? <> al {formatShortDate(item.fecha_fin)}</> : ''}
                      </td>
                      <td>
                        <StatusBadge value={item.estado_proceso} />
                      </td>
                      <td>
                        <div>Funcionarios: {item.total_funcionarios ?? 0}</div>
                        <div className='text-muted fs-7'>
                          Marcaciones: {item.total_marcaciones ?? 0}
                        </div>
                      </td>
                      <td>
                        <div>Inicio: {item.fecha_inicio_proceso || '-'}</div>
                        <div className='text-muted fs-7'>Fin: {item.fecha_fin_proceso || '-'}</div>
                      </td>
                      <td className='text-end'>
                        <div className='d-flex justify-content-end flex-wrap gap-2'>
                          <button
                            type='button'
                            className='btn btn-sm btn-light-primary'
                            onClick={() => void onVerDetalle(item.id_proceso)}
                          >
                            Detalle
                          </button>
                          <button
                            type='button'
                            className='btn btn-sm btn-primary'
                            disabled={executingId === item.id_proceso}
                            onClick={() => void onEjecutar(item.id_proceso)}
                          >
                            {executingId === item.id_proceso ? 'Ejecutando...' : 'Ejecutar'}
                          </button>
                          <button
                            type='button'
                            className='btn btn-sm btn-light-success'
                            onClick={() =>
                              navigate(
                                `/apps/planilla-asistencia/resultados-diarios?proceso=${item.id_proceso}`
                              )
                            }
                          >
                            Diario
                          </button>
                          <button
                            type='button'
                            className='btn btn-sm btn-light-info'
                            onClick={() =>
                              navigate(
                                `/apps/planilla-asistencia/resultados-mensuales?proceso=${item.id_proceso}`
                              )
                            }
                          >
                            Mensual
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </KTCard>

      {detalle && (
        <KTCard>
          <div className='card-header'>
            <div className='card-title d-flex flex-column'>
              <h3 className='fw-bold m-0'>Detalle del proceso #{detalle.id_proceso}</h3>
              <span className='text-muted mt-1'>
                {detalle.fecha_inicio} al {detalle.fecha_fin}
              </span>
            </div>
          </div>
          <div className='card-body'>
            <div className='row g-5'>
              <div className='col-md-4'>
                <div className='text-gray-600 fs-7 text-uppercase mb-1'>Estado</div>
                <StatusBadge value={detalle.estado_proceso} />
              </div>
              <div className='col-md-4'>
                <div className='text-gray-600 fs-7 text-uppercase mb-1'>Funcionarios</div>
                <div className='fw-bold fs-4'>{detalle.total_funcionarios ?? 0}</div>
              </div>
              <div className='col-md-4'>
                <div className='text-gray-600 fs-7 text-uppercase mb-1'>Marcaciones</div>
                <div className='fw-bold fs-4'>{detalle.total_marcaciones ?? 0}</div>
              </div>
            </div>
            <div className='separator my-7' />
            <div className='row g-5'>
              <div className='col-md-4'>
                <div className='text-gray-600 fs-7 text-uppercase mb-1'>Días procesables</div>
                <div className='fw-bold fs-4'>{detalle.total_dias ?? 0}</div>
              </div>
              <div className='col-md-4'>
                <div className='text-gray-600 fs-7 text-uppercase mb-1'>Inicio ejecución</div>
                <div className='fw-bold fs-6'>{detalle.fecha_inicio_proceso || '-'}</div>
              </div>
              <div className='col-md-4'>
                <div className='text-gray-600 fs-7 text-uppercase mb-1'>Fin ejecución</div>
                <div className='fw-bold fs-6'>{detalle.fecha_fin_proceso || '-'}</div>
              </div>
            </div>
            {detalle.mensaje_error && (
              <div className='alert alert-warning mt-6 mb-0'>{detalle.mensaje_error}</div>
            )}
          </div>
        </KTCard>
      )}
    </>
  )
}

export default ProcesosPage
