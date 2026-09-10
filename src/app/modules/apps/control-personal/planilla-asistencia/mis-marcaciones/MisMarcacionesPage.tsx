import {useEffect, useMemo, useState} from 'react'
import {PageTitle} from 'src/_metronic/layout/core'
import PDFModal from '../../comision/comision-list/pdf-modal/PDFModal'
import {KTCard} from 'src/_metronic/helpers'
import {useAuth} from 'src/app/modules/auth'
import {EmptyState} from '../components/EmptyState'
import {StatusBadge} from '../components/StatusBadge'
import {
  MarcacionNormalizada,
  MiMarcacionOficialDia,
  MisMarcacionesResponse,
  PaginationPayload,
  PlanillaMensualPDFData,
} from '../core/_models'
import {
  generarReporteMisMarcaciones,
  getMisMarcaciones,
  getMisMarcacionesEstadoSync,
  getMisMarcacionesResumenAtrasos,
  syncMisMarcacionesBiometrico,
} from '../core/_requests'

const PAGE_SIZE = 25
const formatDateInput = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getOperationalRange = () => {
  const today = new Date()
  const day = today.getDate()

  if (day >= 21) {
    const start = new Date(today.getFullYear(), today.getMonth(), 21)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 20)
    return {
      fechaDesde: formatDateInput(start),
      fechaHasta: formatDateInput(end),
    }
  }

  const start = new Date(today.getFullYear(), today.getMonth() - 1, 21)
  const end = new Date(today.getFullYear(), today.getMonth(), 20)
  return {
    fechaDesde: formatDateInput(start),
    fechaHasta: formatDateInput(end),
  }
}

const operationalRange = getOperationalRange()

const formatHora = (value?: string | null) => value || '-'
const formatFechaHora = (value?: string | null) => value?.slice(11, 19) || '-'
const formatFechaHoraCompleta = (value?: string | null) => {
  if (!value) {
    return 'Sin registro'
  }

  const normalizada = value.includes('T') ? value : value.replace(' ', 'T')
  const fecha = new Date(normalizada)
  if (Number.isNaN(fecha.getTime())) {
    return value
  }

  return fecha.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const MisMarcacionesPage = () => {
  const {currentUser} = useAuth()
  const [fechaDesde, setFechaDesde] = useState(operationalRange.fechaDesde)
  const [fechaHasta, setFechaHasta] = useState(operationalRange.fechaHasta)
  const [rows, setRows] = useState<MarcacionNormalizada[]>([])
  const [oficiales, setOficiales] = useState<MiMarcacionOficialDia[]>([])
  const [pagination, setPagination] = useState<PaginationPayload>({
    page: 1,
    total: 0,
    items_per_page: PAGE_SIZE,
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'historial' | 'horario'>('historial')
  const [pdfData, setPdfData] = useState<PlanillaMensualPDFData | null>(null)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [isPreparingPdf, setIsPreparingPdf] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [estadoSincronizacion, setEstadoSincronizacion] =
    useState<MisMarcacionesResponse['estado_sincronizacion']>(undefined)
  const [sincronizacionExterna, setSincronizacionExterna] =
    useState<MisMarcacionesResponse['sincronizacion_externa']>(undefined)
  const [resumenAtrasos, setResumenAtrasos] =
    useState<MisMarcacionesResponse['resumen_atrasos']>(undefined)

  const totalPages = useMemo(() => {
    const total = Number(pagination.total || 0)
    const perPage = Number(pagination.items_per_page || PAGE_SIZE)
    return Math.max(1, Math.ceil(total / perPage))
  }, [pagination])

  const resumen = useMemo(() => {
    const puntos = oficiales.flatMap((dia) => dia.puntos || [])
    const validas = puntos.filter((punto) => Boolean(punto.id_marcacion)).length
    const atrasos = puntos.filter((punto) => punto.estado_punto === 'ATRASO').length
    return {
      oficiales: validas,
      esperadas: puntos.length,
      atrasos,
      historial: rows.length,
    }
  }, [oficiales, rows])

  const cargarDatos = async (nextPage = page) => {
    const params = {
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    }

    const [response, estadoSync, resumenAtrasosData] = await Promise.all([
      getMisMarcaciones(nextPage, PAGE_SIZE, params),
      getMisMarcacionesEstadoSync(params),
      getMisMarcacionesResumenAtrasos(params),
    ])

    setRows(response.data || [])
    setOficiales(response.oficiales || [])
    setEstadoSincronizacion(estadoSync)
    setResumenAtrasos(resumenAtrasosData)
    setPagination(response.pagination || {page: nextPage, total: 0, items_per_page: PAGE_SIZE})
  }

  const cargar = async (nextPage = page) => {
    setLoading(true)
    setError(null)

    try {
      await cargarDatos(nextPage)
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'No se pudieron cargar sus marcaciones.'
      )
    } finally {
      setLoading(false)
    }
  }

  const actualizarDesdeBiometrico = async () => {
    setLoading(true)
    setError(null)

    try {
      const sync = await syncMisMarcacionesBiometrico({
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
      })
      setSincronizacionExterna(sync)
      await cargarDatos(page)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'No se pudieron sincronizar sus marcaciones desde el biométrico.'
      )
    } finally {
      setLoading(false)
    }
  }

  const buscar = () => {
    setPage(1)
    void cargar(1)
  }

  const cambiarPagina = (nextPage: number) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages)
    setPage(safePage)
    void cargar(safePage)
  }
  const generarReporte = async () => {
    setGeneratingPdf(true)
    setError(null)
    setPdfData(null)
    setIsPreparingPdf(true)
    setShowPDFModal(true)
    try {
      const tipo = activeTab === 'horario' ? 'HORARIO' : 'HISTORIAL'
      const response = await generarReporteMisMarcaciones(tipo, {
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
      })
      setPdfData(response)
    } catch (err: any) {
      setShowPDFModal(false)
      setError(err?.message || 'No se pudo generar el reporte PDF.')
    } finally {
      setIsPreparingPdf(false)
      setGeneratingPdf(false)
    }
  }

  const cerrarPDF = () => {
    setIsPreparingPdf(false)
    setShowPDFModal(false)
    setPdfData(null)
  }

  useEffect(() => {
    void cargar(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <PageTitle breadcrumbs={[]}>Mis marcaciones</PageTitle>

      <KTCard className='mb-5'>
        <div className='card-body py-5'>
          <div className='d-flex flex-column flex-lg-row justify-content-between gap-4'>
            <div>
              <h3 className='fw-bold text-gray-900 mb-1'>Mis marcaciones</h3>
              <div className='text-muted fs-7'>
                Consulta personal de marcas válidas por horario e historial biométrico.
              </div>
            </div>
            <div className='d-flex align-items-center justify-content-lg-end gap-3'>
              <button
                type='button'
                className='btn btn-sm btn-light-danger'
                onClick={() => void generarReporte()}
                disabled={generatingPdf}
                title='Generar PDF'
              >
                {generatingPdf ? (
                  <>
                    <span className='spinner-border spinner-border-sm' />{' '}
                  </>
                ) : (
                  <i className='bi bi-file-earmark-pdf' />
                )}
                Reporte PDF
              </button>
              <div className='text-lg-end'>
                <div className='fw-bold text-gray-900'>{currentUser?.first_name || 'Usuario'}</div>
                <div className='text-muted fs-8'>
                  {currentUser?.personal?.tipo_personal || 'Administrativo'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </KTCard>

      <KTCard className='mb-5'>
        <div className='card-body'>
          <div className='d-flex flex-column flex-lg-row justify-content-between gap-4'>
            <div>
              <div className='text-muted fs-7 text-uppercase fw-bold mb-2'>Atraso acumulado</div>
              <div className='fw-bold fs-1 text-gray-900'>
                {Number(resumenAtrasos?.minutos_atraso_acumulado || 0)} min
              </div>
              <div className='text-muted fs-7 mt-2'>
                Rango evaluado:{' '}
                <span className='fw-semibold text-gray-800'>
                  {resumenAtrasos?.rango?.fecha_desde || fechaDesde} a{' '}
                  {resumenAtrasos?.rango?.fecha_hasta || fechaHasta}
                </span>
              </div>
              <div className='text-muted fs-7'>
                Horario tipo:{' '}
                <span className='fw-semibold text-gray-800'>
                  {resumenAtrasos?.nombre_horario_tipo || 'Sin horario activo'}
                </span>
              </div>
              <div className='text-muted fs-7'>
                Tolerancia diaria entrada:{' '}
                <span className='fw-semibold text-gray-800'>
                  {Number(resumenAtrasos?.tolerancia_diaria_entrada_minutos || 0)} min
                </span>
              </div>
              {resumenAtrasos?.message && (
                <div className='text-warning fs-7 mt-3'>{resumenAtrasos.message}</div>
              )}
            </div>
            <div className='d-none d-lg-flex flex-wrap gap-3'>
              <div className='border rounded px-4 py-3 min-w-175px'>
                <div className='text-muted fs-8 text-uppercase fw-bold'>Días con atraso</div>
                <div className='fs-2 fw-bold text-gray-900'>
                  {resumenAtrasos?.dias_con_atraso ?? 0}
                </div>
              </div>
              <div className='border rounded px-4 py-3 min-w-175px'>
                <div className='text-muted fs-8 text-uppercase fw-bold'>Días laborables</div>
                <div className='fs-2 fw-bold text-gray-900'>
                  {resumenAtrasos?.dias_laborables_evaluados ?? 0}
                </div>
              </div>
              <div className='border rounded px-4 py-3 min-w-175px'>
                <div className='text-muted fs-8 text-uppercase fw-bold'>Entradas marcadas</div>
                <div className='fs-2 fw-bold text-gray-900'>
                  {resumenAtrasos?.dias_con_marcacion_entrada ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </KTCard>

      <KTCard className='mb-5'>
        <div className='card-body py-0 px-6'>
          <div className='d-flex flex-wrap align-items-stretch gap-4 gap-md-8 overflow-auto'>
            <button
              type='button'
              className={`btn btn-flush d-flex align-items-center rounded-0 px-0 py-3 border-bottom border-3 ${
                activeTab === 'historial' ? 'border-gray-900' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('historial')}
            >
              <span
                className={`fw-semibold fs-6 me-2 ${
                  activeTab === 'historial' ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                Historial de Marcaciones
              </span>
              <span className='badge badge-dark fw-bold'>{resumen.historial}</span>
            </button>
            {/* <button
              type='button'
              className={`btn btn-flush d-flex align-items-center rounded-0 px-0 py-3 border-bottom border-3 ${
                activeTab === 'horario' ? 'border-gray-900' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('horario')}
            >
              <span
                className={`fw-semibold fs-6 me-2 ${
                  activeTab === 'horario' ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                Marcaciones por horario
              </span>
              <span className='badge badge-light-success text-success fw-bold'>
                {resumen.oficiales}
              </span>
            </button>
            <div className='d-flex align-items-center py-3'>
              <span className='text-gray-600 fw-semibold fs-6 me-2'>Esperadas</span>
              <span className='badge badge-light-warning text-warning fw-bold'>
                {resumen.esperadas}
              </span>
            </div>
            <div className='d-flex align-items-center py-3'>
              <span className='text-gray-600 fw-semibold fs-6 me-2'>Atrasos</span>
              <span className='badge badge-light-danger text-danger fw-bold'>
                {resumen.atrasos}
              </span>
            </div> */}
          </div>
        </div>
      </KTCard>
      <KTCard className='mb-5'>
        <div className='card-body'>
          <div className='row g-4 align-items-end'>
            <div className='col-12 col-md-4'>
              <label className='form-label fw-semibold'>Desde</label>
              <input
                type='date'
                className='form-control'
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className='col-12 col-md-4'>
              <label className='form-label fw-semibold'>Hasta</label>
              <input
                type='date'
                className='form-control'
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <div className='col-12 col-md-4 d-flex gap-2'>
              <button
                type='button'
                className='btn btn-primary flex-grow-1'
                onClick={buscar}
                disabled={loading}
              >
                Buscar
              </button>
              <button
                type='button'
                className='btn btn-light-primary'
                onClick={() => void actualizarDesdeBiometrico()}
                disabled={loading}
                title='Actualizar marcaciones desde biométrico'
              >
                {loading ? (
                  <span className='spinner-border spinner-border-sm' />
                ) : (
                  <i className='bi bi-arrow-clockwise' />
                )}
              </button>
            </div>
          </div>
          {error && <div className='alert alert-danger mt-5 mb-0'>{error}</div>}
        </div>
      </KTCard>

      {/* <KTCard className='mb-5'>
        <div className='card-body'>
          <div className='d-flex flex-column flex-lg-row justify-content-between gap-4'>
            <div>
              <div className='text-muted fs-7 text-uppercase fw-bold mb-2'>
                Estado de sincronización biométrica
              </div>
              <div className='fw-semibold text-gray-900 mb-1'>
                Última sincronización registrada:{' '}
                <span className='text-primary'>
                  {formatFechaHoraCompleta(estadoSincronizacion?.ultima_sincronizacion_marcaciones)}
                </span>
              </div>
              <div className='text-muted fs-7'>
                Última fecha/hora cubierta por marcaciones traídas:{' '}
                <span className='fw-semibold text-gray-700'>
                  {formatFechaHoraCompleta(estadoSincronizacion?.ultima_fecha_marcacion_sync)}
                </span>
              </div>
              {estadoSincronizacion?.mensaje && (
                <div className='text-muted fs-7 mt-3'>{estadoSincronizacion.mensaje}</div>
              )}
            </div>
            <div className='d-flex flex-wrap gap-3'>
              <div className='border rounded px-4 py-3 min-w-175px'>
                <div className='text-muted fs-8 text-uppercase fw-bold'>Dispositivos evaluados</div>
                <div className='fs-2 fw-bold text-gray-900'>
                  {estadoSincronizacion?.total_dispositivos_evaluados ?? 0}
                </div>
              </div>
              <div className='border rounded px-4 py-3 min-w-175px'>
                <div className='text-muted fs-8 text-uppercase fw-bold'>Habilitados TCP</div>
                <div className='fs-2 fw-bold text-gray-900'>
                  {estadoSincronizacion?.total_dispositivos_habilitados_consulta ?? 0}
                </div>
              </div>
            </div>
          </div>

          {sincronizacionExterna?.message && (
            <div
              className={`alert mt-5 mb-0 ${
                sincronizacionExterna?.status === 'error' ? 'alert-warning' : 'alert-primary'
              }`}
            >
              <div className='fw-bold mb-1'>Sincronización externa</div>
              <div>{sincronizacionExterna.message}</div>
            </div>
          )}
        </div>
      </KTCard> */}

      <KTCard>
        <div className='card-body'>
          {activeTab === 'historial' ? (
            <>
              {loading ? (
                <div className='text-muted'>Cargando historial...</div>
              ) : rows.length === 0 ? (
                <EmptyState
                  title='Sin marcaciones'
                  description='No se encontraron marcas para el rango seleccionado.'
                />
              ) : (
                <div className='table-responsive'>
                  <table className='table align-middle table-row-dashed fs-6 gy-4'>
                    <thead>
                      <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Código biométrico</th>
                        {/* <th>Dispositivo</th> */}
                        {/* <th>Marcación</th> */}
                        {/* <th>Verificación</th>
                        <th>Origen</th> */}
                      </tr>
                    </thead>
                    <tbody className='fw-semibold text-gray-700'>
                      {rows.map((row) => (
                        <tr key={row.id_marcacion}>
                          <td>
                            {row.fecha_marcacion || row.fecha_hora_marcacion?.slice(0, 10) || '-'}
                          </td>
                          <td>
                            {row.hora_marcacion || row.fecha_hora_marcacion?.slice(11, 19) || '-'}
                          </td>
                          <td>{row.user_id_biometrico || '-'}</td>
                          {/* <td>{row.serial_dispositivo || '-'}</td> */}
                          {/* <td>
                            <StatusBadge value={row.estado_marcacion || '-'} />
                          </td> */}
                          {/* <td>{row.tipo_verificacion || '-'}</td>
                          <td>
                            <StatusBadge value={row.tipo_origen || '-'} />
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className='d-flex justify-content-between align-items-center pt-4'>
                <span className='text-muted fs-7'>
                  Página {page} de {totalPages}
                </span>
                <div className='d-flex gap-2'>
                  <button
                    type='button'
                    className='btn btn-sm btn-light'
                    onClick={() => cambiarPagina(page - 1)}
                    disabled={loading || page <= 1}
                  >
                    Anterior
                  </button>
                  <button
                    type='button'
                    className='btn btn-sm btn-light'
                    onClick={() => cambiarPagina(page + 1)}
                    disabled={loading || page >= totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {loading ? (
                <div className='text-muted'>Cargando marcaciones...</div>
              ) : oficiales.length === 0 ? (
                <EmptyState
                  title='Sin cálculo oficial'
                  description='Aún no existe resultado de planilla para el rango seleccionado.'
                />
              ) : (
                <div className='table-responsive'>
                  <table className='table align-middle table-row-dashed fs-6 gy-4'>
                    <thead>
                      <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                        <th>Fecha</th>
                        <th>Horario</th>
                        <th>Punto</th>
                        <th>Esperada</th>
                        <th>Marcada</th>
                        <th>Estado</th>
                        <th>Desfase</th>
                      </tr>
                    </thead>
                    <tbody className='fw-semibold text-gray-700'>
                      {oficiales.flatMap((dia) =>
                        dia.puntos.map((punto) => (
                          <tr key={`${dia.id_resultado_diario}-${punto.id_resultado_punto}`}>
                            <td>{dia.fecha || '-'}</td>
                            <td>{dia.nombre_horario_tipo || dia.tipo_horario || '-'}</td>
                            <td>{punto.nombre_punto || punto.codigo_punto || '-'}</td>
                            <td>{formatHora(punto.hora_esperada)}</td>
                            <td>
                              {punto.hora_marcada || formatFechaHora(punto.fecha_hora_marcacion)}
                            </td>
                            <td>
                              <StatusBadge value={punto.estado_punto || 'SIN_MARCACION'} />
                            </td>
                            <td>{Number(punto.minutos_desfase || 0)} min</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </KTCard>
      <PDFModal
        isOpen={showPDFModal}
        onClose={cerrarPDF}
        isPreparing={isPreparingPdf}
        pdfBlob={pdfData?.blob || null}
        filename={pdfData?.filename || 'MIS_MARCACIONES.pdf'}
        title={pdfData?.title || 'Reporte de marcaciones'}
      />
    </>
  )
}

export default MisMarcacionesPage
