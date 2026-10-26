import {useEffect, useMemo, useState} from 'react'
import {createPortal} from 'react-dom'
import {useSearchParams} from 'react-router-dom'
import {KTCard} from 'src/_metronic/helpers'
import PDFModal from '../../comision/comision-list/pdf-modal/PDFModal'
import {SelectField} from 'src/app/modules/components/SelectField'
import {StatusBadge} from '../components/StatusBadge'
import {EmptyState} from '../components/EmptyState'
import {
  PlanillaMensualPDFData,
  ProcesoPlanilla,
  ReporteResultadosDiariosParams,
  ResultadoDiario,
  ResultadoDiarioDetalle,
} from '../core/_models'
import {
  generarReporteResultadosDiarios,
  getDetalleResultadoDiario,
  getProcesosPlanilla,
  getResultadosDiarios,
} from '../core/_requests'
import {ReportModal} from './report-modal/ReportModal'

const ESTADO_DIA_OPTIONS = [
  {value: '', label: 'Todos los estados'},
  {value: 'PRESENTE', label: 'PRESENTE'},
  {value: 'ATRASO', label: 'ATRASO'},
  {value: 'FALTA', label: 'FALTA'},
  {value: 'ABANDONO', label: 'ABANDONO'},
  {value: 'OBSERVADO', label: 'OBSERVADO'},
  {value: 'JUSTIFICADO', label: 'JUSTIFICADO'},
  {value: 'NO_LABORABLE', label: 'NO_LABORABLE'},
  {value: 'SIN_HORARIO', label: 'SIN_HORARIO'},
]

const formatList = (items?: Array<string | null | undefined>) =>
  (items || []).filter(Boolean).join(', ') || '-'

const MODAL_FADE_DURATION_MS = 200

const isGuardiaHorario = (justificativo?: string | null, horario?: string | null) =>
  (justificativo || '').toUpperCase() === 'GUARDIA' ||
  ['MANANA', 'TARDE', 'NOCHE'].includes((horario || '').toUpperCase())

const renderHorario = (
  horario?: string | null,
  nombreHorarioTipo?: string | null,
  idHorarioTipo?: number | null,
  justificativo?: string | null
) => {
  const horarioBase =
    horario || nombreHorarioTipo || (idHorarioTipo ? `Horario ${idHorarioTipo}` : '-')

  if (isGuardiaHorario(justificativo, horario)) {
    const contexto = nombreHorarioTipo || 'SEGURIDAD'
    const turno = horario || 'TURNO'
    return (
      <div className='d-flex flex-column gap-1'>
        <span className='fw-bold'>{contexto}</span>
        <div>
          <span className='badge badge-light-warning'>{turno}</span>
        </div>
      </div>
    )
  }

  return horarioBase
}

const ResultadosDiariosPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [idProceso, setIdProceso] = useState(searchParams.get('proceso') || '')
  const [estadoDia, setEstadoDia] = useState(searchParams.get('estado_dia') || '')
  const [search, setSearch] = useState(searchParams.get('search') || '8360936')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<ResultadoDiario[]>([])
  const [detalle, setDetalle] = useState<ResultadoDiarioDetalle | null>(null)
  const [detalleVisible, setDetalleVisible] = useState(false)
  const [procesos, setProcesos] = useState<ProcesoPlanilla[]>([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [currentPDFData, setCurrentPDFData] = useState<PlanillaMensualPDFData | null>(null)
  const [isPreparingPdf, setIsPreparingPdf] = useState(false)

  const canLoad = useMemo(() => Number(idProceso) > 0, [idProceso])
  const procesoSeleccionado = useMemo(
    () => procesos.find((proceso) => String(proceso.id_proceso) === idProceso) || null,
    [procesos, idProceso]
  )
  const procesoOptions = useMemo(
    () => [
      {value: '', label: 'Seleccione un proceso'},
      ...procesos.map((proceso) => ({
        value: String(proceso.id_proceso),
        label: `#${proceso.id_proceso} - ${proceso.fecha_inicio || '-'} a ${
          proceso.fecha_fin || '-'
        }${proceso.estado_proceso ? ` (${proceso.estado_proceso})` : ''}`,
      })),
    ],
    [procesos]
  )

  const filterBridge = useMemo(
    () => ({
      values: {
        idProceso,
        estadoDia,
      },
      setFieldValue: (field: string, value: string) => {
        if (field === 'idProceso') {
          setIdProceso(value)
        }
        if (field === 'estadoDia') {
          setEstadoDia(value)
        }
      },
      setFieldTouched: () => undefined,
      touched: {},
    }),
    [estadoDia, idProceso]
  )

  const cargar = async () => {
    if (!canLoad) {
      setRows([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getResultadosDiarios(Number(idProceso), {
        estado_dia: estadoDia || undefined,
        search: search || undefined,
      })
      setRows(data.data || [])
      const next = new URLSearchParams(searchParams)
      next.set('proceso', idProceso)
      estadoDia ? next.set('estado_dia', estadoDia) : next.delete('estado_dia')
      search ? next.set('search', search) : next.delete('search')
      setSearchParams(next)
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'No se pudo cargar resultados diarios.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const cargarProcesos = async () => {
      try {
        const data = await getProcesosPlanilla(1, 100)
        setProcesos(data.data || [])
      } catch (err) {
        console.error('No se pudo cargar el listado de procesos.', err)
      }
    }

    void cargarProcesos()
  }, [])

  useEffect(() => {
    if (canLoad) {
      void cargar()
    }
  }, [])

  useEffect(() => {
    if (!detalle) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDetalle()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [detalle])

  const verDetalle = async (row: ResultadoDiario) => {
    if (
      !canLoad ||
      !row.id_persona ||
      !row.fecha ||
      (row.estado_dia || '').toUpperCase() === 'NO_LABORABLE'
    ) {
      return
    }

    try {
      const data = await getDetalleResultadoDiario(
        Number(idProceso),
        row.id_persona,
        row.fecha,
        row.id_asignacion_administrativo
      )
      setDetalle(data)
      window.setTimeout(() => setDetalleVisible(true), 10)
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'No se pudo cargar el detalle diario.'
      )
    }
  }

  const closeDetalle = () => {
    setDetalleVisible(false)
    window.setTimeout(() => setDetalle(null), MODAL_FADE_DURATION_MS)
  }

  const handleShowPDF = (params: ReporteResultadosDiariosParams) => {
    if (!canLoad) {
      return
    }

    setCurrentPDFData(null)
    setIsPreparingPdf(true)
    setShowPDFModal(true)

    void (async () => {
      try {
        const pdfData = await generarReporteResultadosDiarios(Number(idProceso), params)
        setCurrentPDFData(pdfData)
      } catch (err: any) {
        setShowPDFModal(false)
        setError(err?.message || 'No se pudo generar el reporte PDF.')
      } finally {
        setIsPreparingPdf(false)
      }
    })()
  }

  const handleClosePDFModal = () => {
    setIsPreparingPdf(false)
    setShowPDFModal(false)
    setCurrentPDFData(null)
  }

  return (
    <>
      <KTCard className='mb-7'>
        <div className='card-header'>
          <div className='card-title d-flex flex-column'>
            <h3 className='fw-bold m-0'>Resultados diarios</h3>
            <span className='text-muted mt-1'>
              Auditoría de asistencia por persona, fecha, horario y puntos de marcado utilizados.
            </span>
          </div>
        </div>
        <div className='card-body'>
          <div className='row g-4 align-items-end'>
            <div className='col-12 col-md-3'>
              <label className='form-label fw-semibold'>Proceso</label>
              <SelectField
                field={{name: 'idProceso', value: idProceso}}
                form={filterBridge}
                options={procesoOptions}
                placeholder='Seleccione un proceso'
                isFieldValid
              />
            </div>
            <div className='col-12 col-md-3'>
              <label className='form-label fw-semibold'>Estado día</label>
              <SelectField
                field={{name: 'estadoDia', value: estadoDia}}
                form={filterBridge}
                options={ESTADO_DIA_OPTIONS}
                placeholder='Seleccione un estado'
                isFieldValid
              />
            </div>
            <div className='col-12 col-md-4'>
              <label className='form-label fw-semibold'>Buscar persona</label>
              <input
                type='text'
                className='form-control'
                placeholder='Nombre o CI'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void cargar()
                  }
                }}
              />
            </div>
            <div className='col-12 col-md-2 d-flex gap-2'>
              <button
                type='button'
                className='btn btn-primary flex-grow-1'
                onClick={() => void cargar()}
              >
                Buscar
              </button>
            </div>
            <div className='col-12 d-flex justify-content-end'>
              <button
                type='button'
                className='btn btn-light-warning'
                onClick={() => setShowReportModal(true)}
                disabled={!canLoad}
              >
                <i className='bi bi-file-earmark-pdf me-2'></i>
                Generar reporte PDF
              </button>
            </div>
          </div>

          {error && <div className='alert alert-danger mt-6 mb-0'>{error}</div>}
        </div>
      </KTCard>

      {rows.length > 0 && (
        <div className='row g-5 mb-7'>
          <div className='col-12 col-md-3'>
            <div className='card card-flush h-100'>
              <div className='card-body'>
                <div className='text-gray-500 fs-7 text-uppercase fw-bold mb-2'>
                  Registros diarios
                </div>
                <div className='fs-1 fw-bolder text-gray-900'>{rows.length}</div>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-3'>
            <div className='card card-flush h-100'>
              <div className='card-body'>
                <div className='text-gray-500 fs-7 text-uppercase fw-bold mb-2'>
                  Atrasos detectados
                </div>
                <div className='fs-1 fw-bolder text-warning'>
                  {
                    rows.filter((row) =>
                      ['ATRASO', 'OBSERVADO'].includes((row.estado_dia || '').toUpperCase())
                    ).length
                  }
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-3'>
            <div className='card card-flush h-100'>
              <div className='card-body'>
                <div className='text-gray-500 fs-7 text-uppercase fw-bold mb-2'>
                  Faltas y abandonos
                </div>
                <div className='fs-1 fw-bolder text-danger'>
                  {
                    rows.filter((row) =>
                      ['FALTA', 'ABANDONO', 'SIN_MARCACION'].includes(
                        (row.estado_dia || '').toUpperCase()
                      )
                    ).length
                  }
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-3'>
            <div className='card card-flush h-100'>
              <div className='card-body'>
                <div className='text-gray-500 fs-7 text-uppercase fw-bold mb-2'>
                  Minutos de atraso
                </div>
                <div className='fs-1 fw-bolder text-primary'>
                  {rows.reduce(
                    (sum, row) =>
                      sum + (row.minutos_atraso_oficial ?? row.minutos_atraso_calculado ?? 0),
                    0
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <KTCard className='mb-7'>
        <div className='card-body'>
          {!canLoad ? (
            <EmptyState
              title='Selecciona un proceso'
              description='Ingresa el ID del proceso para revisar el resultado diario.'
            />
          ) : loading ? (
            <div className='text-muted'>Cargando resultados diarios...</div>
          ) : rows.length === 0 ? (
            <EmptyState
              title='Sin resultados diarios'
              description='No hay registros para los filtros seleccionados.'
            />
          ) : (
            <div className='table-responsive'>
              <table className='table align-middle table-row-dashed fs-6 gy-4'>
                <thead>
                  <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                    <th>Persona</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Horario</th>
                    <th>Marcaciones</th>
                    <th>Atraso</th>
                    <th>Sanción</th>
                    <th className='text-end'>Acción</th>
                  </tr>
                </thead>
                <tbody className='fw-semibold text-gray-700'>
                  {rows.map((row, index) => (
                    <tr
                      key={`${row.id_persona}-${row.id_asignacion_administrativo || 0}-${
                        row.fecha
                      }-${index}`}
                    >
                      <td>
                        <div className='d-flex flex-column'>
                          <span className='fw-bold'>
                            {row.persona?.nombre_completo || `Persona ${row.id_persona}`}
                          </span>
                          <span className='text-muted fs-7'>
                            {row.persona?.ci ||
                              row.persona?.user_id_biometrico_principal ||
                              `ID ${row.id_persona}`}
                          </span>
                        </div>
                      </td>
                      <td>{row.fecha}</td>
                      <td>
                        <div className='d-flex flex-column gap-1'>
                          <div>
                            <StatusBadge value={row.estado_dia} />
                          </div>
                          {row.justificativo_principal ? (
                            <div>
                              <span className='badge badge-light-info'>
                                {row.justificativo_principal}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        {renderHorario(
                          row.tipo_horario,
                          row.nombre_horario_tipo,
                          row.id_horario_tipo,
                          row.justificativo_principal
                        )}
                      </td>
                      <td>
                        {row.cantidad_marcaciones_validas ?? 0} /{' '}
                        {row.cantidad_marcaciones_esperadas ?? 0}
                      </td>
                      <td>{row.minutos_atraso_oficial ?? row.minutos_atraso_calculado ?? 0} min</td>
                      <td>{row.dias_descuento_oficial ?? row.dias_descuento_calculado ?? 0}</td>
                      <td className='text-end'>
                        {(row.estado_dia || '').toUpperCase() === 'NO_LABORABLE' ? (
                          <span className='text-muted fs-7'>Sin detalle</span>
                        ) : (
                          <button
                            type='button'
                            className='btn btn-sm btn-light-primary'
                            onClick={() => void verDetalle(row)}
                          >
                            Ver detalle
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </KTCard>

      {detalle &&
        createPortal(
          <>
            <div
              className={`modal fade d-block${detalleVisible ? ' show' : ''}`}
              role='dialog'
              tabIndex={-1}
              aria-modal='true'
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                opacity: detalleVisible ? 1 : 0,
                transition: `opacity ${MODAL_FADE_DURATION_MS}ms ease`,
                zIndex: 2055,
              }}
            >
              <div className='modal-dialog modal-dialog-centered modal-xl'>
                <div
                  className='modal-content'
                  style={{
                    transform: detalleVisible ? 'translateY(0)' : 'translateY(12px)',
                    opacity: detalleVisible ? 1 : 0.98,
                    transition: `opacity ${MODAL_FADE_DURATION_MS}ms ease, transform ${MODAL_FADE_DURATION_MS}ms ease`,
                  }}
                >
                  <div className='modal-header'>
                    <div className='d-flex flex-column'>
                      <h3 className='fw-bold m-0'>Detalle diario</h3>
                      <span className='text-muted mt-1'>
                        {detalle.persona?.nombre_completo || `Persona ${detalle.id_persona}`} -{' '}
                        {detalle.fecha}
                      </span>
                    </div>
                    <button
                      type='button'
                      className='btn btn-sm btn-icon btn-active-light-primary'
                      onClick={closeDetalle}
                    >
                      <i className='ki-duotone ki-cross fs-1'>
                        <span className='path1' />
                        <span className='path2' />
                      </i>
                    </button>
                  </div>
                  <div className='modal-body'>
                    <div className='row g-5 mb-7'>
                      <div className='col-12 col-md-3'>
                        <div className='card card-flush border h-100'>
                          <div className='card-body'>
                            <div className='text-gray-600 fs-7 text-uppercase mb-2'>
                              Estado del día
                            </div>
                            <div className='d-flex flex-column gap-2'>
                              <div>
                                <StatusBadge value={detalle.estado_dia} />
                              </div>
                              {detalle.justificativo_principal ? (
                                <div>
                                  <span className='badge badge-light-info'>
                                    {detalle.justificativo_principal}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='col-12 col-md-3'>
                        <div className='card card-flush border h-100'>
                          <div className='card-body'>
                            <div className='text-gray-600 fs-7 text-uppercase mb-2'>
                              Horario aplicado
                            </div>
                            <div className='fw-bold fs-5'>
                              {renderHorario(
                                detalle.tipo_horario,
                                detalle.nombre_horario_tipo,
                                detalle.id_horario_tipo,
                                detalle.justificativo_principal
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='col-12 col-md-3'>
                        <div className='card card-flush border h-100'>
                          <div className='card-body'>
                            <div className='text-gray-600 fs-7 text-uppercase mb-2'>
                              Atraso sancionable
                            </div>
                            <div className='fw-bold fs-5'>
                              {detalle.minutos_atraso_oficial ??
                                detalle.minutos_atraso_calculado ??
                                0}{' '}
                              min
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='col-12 col-md-3'>
                        <div className='card card-flush border h-100'>
                          <div className='card-body'>
                            <div className='text-gray-600 fs-7 text-uppercase mb-2'>
                              Marcaciones válidas
                            </div>
                            <div className='fw-bold fs-5'>
                              {detalle.cantidad_marcaciones_validas ?? 0} /{' '}
                              {detalle.cantidad_marcaciones_esperadas ?? 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='alert alert-light-info border border-info border-dashed mb-7'>
                      <span className='fw-semibold'>Observación del día:</span>{' '}
                      {detalle.observacion || 'Sin observación.'}
                    </div>

                    <div className='mb-8'>
                      <h4 className='fw-bold mb-4'>Puntos evaluados</h4>
                      {detalle.puntos && detalle.puntos.length > 0 ? (
                        <div className='table-responsive'>
                          <table className='table align-middle table-row-bordered fs-6 gy-3'>
                            <thead>
                              <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                                <th>Orden</th>
                                <th>Punto</th>
                                <th>Hora esperada</th>
                                <th>Hora marcada</th>
                                <th>Estado</th>
                                <th>Fecha hora</th>
                                <th>Desfase</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detalle.puntos.map((punto, index) => (
                                <tr key={`${punto.codigo_punto || punto.nombre_punto}-${index}`}>
                                  <td>{punto.orden}</td>
                                  <td>
                                    <div className='d-flex flex-column'>
                                      <span className='fw-bold'>{punto.nombre_punto}</span>
                                      <span className='text-muted fs-7'>
                                        {punto.codigo_punto || '-'}
                                      </span>
                                    </div>
                                  </td>
                                  <td>{punto.hora_esperada || '-'}</td>
                                  <td>{punto.hora_marcada || punto.justificativo_punto || '-'}</td>
                                  <td>
                                    <StatusBadge value={punto.tipo_resultado} />
                                  </td>
                                  <td>{punto.fecha_hora_marcacion || '-'}</td>
                                  <td>{punto.minutos_desfase ?? 0} min</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <EmptyState
                          title='Sin puntos de marcado'
                          description='El detalle no devolvió puntos de marcado para este día.'
                        />
                      )}
                    </div>

                    <div className='row g-7 mb-8'>
                      <div className='col-12 col-lg-6'>
                        <div className='card card-flush border h-100'>
                          <div className='card-header'>
                            <div className='card-title'>
                              <h4 className='fw-bold m-0'>Marcaciones del día</h4>
                            </div>
                          </div>
                          <div className='card-body pt-4'>
                            {detalle.detalle_json?.marcaciones &&
                            detalle.detalle_json.marcaciones.length > 0 ? (
                              <div className='table-responsive'>
                                <table className='table align-middle table-row-dashed fs-7 gy-3 mb-0'>
                                  <thead>
                                    <tr className='text-start text-muted fw-bold fs-8 text-uppercase gs-0'>
                                      <th>ID</th>
                                      <th>Fecha hora</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detalle.detalle_json.marcaciones.map((marcacion, index) => (
                                      <tr key={`${marcacion.id_marcacion || 'm'}-${index}`}>
                                        <td>{marcacion.id_marcacion || '-'}</td>
                                        <td>{marcacion.fecha_hora_marcacion || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className='text-muted'>
                                Sin marcaciones crudas para este día.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='col-12 col-lg-6'>
                        <div className='card card-flush border h-100'>
                          <div className='card-header'>
                            <div className='card-title'>
                              <h4 className='fw-bold m-0'>Marcaciones sobrantes</h4>
                            </div>
                          </div>
                          <div className='card-body pt-4'>
                            {detalle.detalle_json?.marcaciones_sobrantes &&
                            detalle.detalle_json.marcaciones_sobrantes.length > 0 ? (
                              <div className='table-responsive'>
                                <table className='table align-middle table-row-dashed fs-7 gy-3 mb-0'>
                                  <thead>
                                    <tr className='text-start text-muted fw-bold fs-8 text-uppercase gs-0'>
                                      <th>ID</th>
                                      <th>Fecha hora</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detalle.detalle_json.marcaciones_sobrantes.map(
                                      (marcacion, index) => (
                                        <tr key={`${marcacion.id_marcacion || 's'}-${index}`}>
                                          <td>{marcacion.id_marcacion || '-'}</td>
                                          <td>{marcacion.fecha_hora_marcacion || '-'}</td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className='text-muted'>No hubo marcaciones sobrantes.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='row g-7'>
                      <div className='col-12 col-lg-6'>
                        <div className='card card-flush border h-100'>
                          <div className='card-header'>
                            <div className='card-title'>
                              <h4 className='fw-bold m-0'>Contexto del cálculo</h4>
                            </div>
                          </div>
                          <div className='card-body pt-4'>
                            <div className='mb-4'>
                              <div className='text-gray-600 fs-7 text-uppercase mb-1'>
                                Justificativo
                              </div>
                              <div className='fw-semibold'>
                                {detalle.detalle_json?.justificativo?.codigo || 'Sin justificativo'}
                              </div>
                              <div className='text-muted fs-7'>
                                {detalle.detalle_json?.justificativo?.observacion || '-'}
                              </div>
                            </div>
                            <div className='mb-4'>
                              <div className='text-gray-600 fs-7 text-uppercase mb-1'>Guardias</div>
                              <div className='fw-semibold'>
                                {formatList(
                                  detalle.detalle_json?.guardias?.map(
                                    (guardia) =>
                                      `${guardia.nombre_turno || 'Turno'} ${
                                        guardia.hora_inicio || '-'
                                      } - ${guardia.hora_fin || '-'}`
                                  )
                                )}
                              </div>
                            </div>
                            <div>
                              <div className='text-gray-600 fs-7 text-uppercase mb-1'>
                                No descontable
                              </div>
                              <div className='fw-semibold'>
                                {detalle.detalle_json?.es_no_descontable ? 'Sí' : 'No'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='col-12 col-lg-6'>
                        <div className='card card-flush border h-100'>
                          <div className='card-header'>
                            <div className='card-title'>
                              <h4 className='fw-bold m-0'>Reemplazos titular</h4>
                            </div>
                          </div>
                          <div className='card-body pt-4'>
                            {detalle.detalle_json?.reemplazos_titular &&
                            detalle.detalle_json.reemplazos_titular.length > 0 ? (
                              <div className='table-responsive'>
                                <table className='table align-middle table-row-dashed fs-7 gy-3 mb-0'>
                                  <thead>
                                    <tr className='text-start text-muted fw-bold fs-8 text-uppercase gs-0'>
                                      <th>ID</th>
                                      <th>Fecha</th>
                                      <th>Horario</th>
                                      <th>Reemplazo</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detalle.detalle_json.reemplazos_titular.map(
                                      (reemplazo, index) => (
                                        <tr
                                          key={`${reemplazo.id_guardia_reemplazo || 'r'}-${index}`}
                                        >
                                          <td>{reemplazo.id_guardia_reemplazo || '-'}</td>
                                          <td>{reemplazo.fecha || '-'}</td>
                                          <td>{`${reemplazo.hora_inicio || '-'} - ${
                                            reemplazo.hora_fin || '-'
                                          }`}</td>
                                          <td>
                                            <div className='d-flex flex-column'>
                                              <span className='fw-semibold'>
                                                {reemplazo.nombre_completo_reemplazo ||
                                                  `Persona ${
                                                    reemplazo.id_persona_reemplazo || '-'
                                                  }`}
                                              </span>
                                              <span className='text-muted fs-8'>
                                                {reemplazo.ci_reemplazo ||
                                                  reemplazo.user_id_biometrico_reemplazo ||
                                                  `ID ${reemplazo.id_persona_reemplazo || '-'}`}
                                              </span>
                                            </div>
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className='text-muted'>
                                Sin reemplazos de titular para este día.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='modal-footer'>
                    <button type='button' className='btn btn-light' onClick={closeDetalle}>
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal-backdrop fade${detalleVisible ? ' show' : ''}`}
              onClick={closeDetalle}
              style={{
                opacity: detalleVisible ? 0.35 : 0,
                transition: `opacity ${MODAL_FADE_DURATION_MS}ms ease`,
                zIndex: 2050,
              }}
            />
          </>,
          document.body
        )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        proceso={procesoSeleccionado}
        searchInicial={search}
        estadoDiaInicial={estadoDia}
        onShowPDF={handleShowPDF}
      />

      <PDFModal
        isOpen={showPDFModal}
        onClose={handleClosePDFModal}
        isPreparing={isPreparingPdf}
        pdfBlob={currentPDFData?.blob || null}
        filename={currentPDFData?.filename || 'REPORTE_RESULTADOS_DIARIOS.pdf'}
        title={currentPDFData?.title || 'Reporte de resultados diarios'}
      />
    </>
  )
}

export default ResultadosDiariosPage
