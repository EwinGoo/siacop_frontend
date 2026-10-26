import {useEffect, useMemo, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {KTCard} from 'src/_metronic/helpers'
import {SelectField} from 'src/app/modules/components/SelectField'
import PDFModal from '../../comision/comision-list/pdf-modal/PDFModal'
import {StatusBadge} from '../components/StatusBadge'
import {EmptyState} from '../components/EmptyState'
import {
  PlanillaMensualPDFData,
  ProcesoPlanilla,
  ResultadoMensual,
  ResultadoMensualDetalle,
} from '../core/_models'
import {
  generarReportePlanillaMensual,
  getDetalleResultadoMensual,
  getProcesosPlanilla,
  getResultadosMensuales,
} from '../core/_requests'
import {ReportModal} from './report-modal/ReportModal'

const ResultadosMensualesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [idProceso, setIdProceso] = useState(searchParams.get('proceso') || '')
  const [search, setSearch] = useState(searchParams.get('search') || '8360936')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<ResultadoMensual[]>([])
  const [detalle, setDetalle] = useState<ResultadoMensualDetalle | null>(null)
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
      },
      setFieldValue: (field: string, value: string) => {
        if (field === 'idProceso') {
          setIdProceso(value)
        }
      },
      setFieldTouched: () => undefined,
      touched: {},
    }),
    [idProceso]
  )

  const handleShowPDF = (params: {
    filtroReporte: 'TODOS' | 'CON_ATRASO' | 'CON_SANCION' | 'CON_ATRASO_O_SANCION'
    search?: string
  }) => {
    if (!canLoad) {
      return
    }

    setCurrentPDFData(null)
    setIsPreparingPdf(true)
    setShowPDFModal(true)

    void (async () => {
      try {
        const pdfData = await generarReportePlanillaMensual(Number(idProceso), params)
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

  const cargar = async () => {
    if (!canLoad) {
      setRows([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getResultadosMensuales(Number(idProceso), {
        search: search || undefined,
      })
      setRows(data.data || [])
      const next = new URLSearchParams(searchParams)
      next.set('proceso', idProceso)
      search ? next.set('search', search) : next.delete('search')
      setSearchParams(next)
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'No se pudo cargar resultados mensuales.'
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

  const verDetalle = async (row: ResultadoMensual) => {
    if (!canLoad || !row.id_persona) {
      return
    }

    try {
      const data = await getDetalleResultadoMensual(
        Number(idProceso),
        row.id_persona,
        row.id_asignacion_administrativo
      )
      setDetalle(data)
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'No se pudo cargar el detalle mensual.'
      )
    }
  }

  return (
    <>
      <KTCard className='mb-7'>
        <div className='card-header'>
          <div className='card-title d-flex flex-column'>
            <h3 className='fw-bold m-0'>Planilla mensual consolidada</h3>
            <span className='text-muted mt-1'>
              Vista final de atrasos, faltas, sanciones y justificativos por persona
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
            <div className='col-12 col-md-7'>
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

      <KTCard className='mb-7'>
        <div className='card-body'>
          {!canLoad ? (
            <EmptyState
              title='Selecciona un proceso'
              description='Ingresa el ID del proceso para ver la planilla mensual consolidada.'
            />
          ) : loading ? (
            <div className='text-muted'>Cargando planilla mensual...</div>
          ) : rows.length === 0 ? (
            <EmptyState
              title='Sin resultados mensuales'
              description='No hay registros para los filtros seleccionados.'
            />
          ) : (
            <div className='table-responsive'>
              <table className='table align-middle table-row-dashed fs-6 gy-4'>
                <thead>
                  <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                    <th>Persona</th>
                    <th>Cargo</th>
                    <th>Atraso calc.</th>
                    <th>Atraso oficial</th>
                    <th>Días sanción</th>
                    <th>Faltas</th>
                    <th>Justificativos</th>
                    <th>No desc.</th>
                    {/* <th className='text-end'>Acción</th> */}
                  </tr>
                </thead>
                <tbody className='fw-semibold text-gray-700'>
                  {rows.map((row, index) => (
                    <tr key={`${row.id_persona}-${row.id_asignacion_administrativo || 0}-${index}`}>
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
                      <td>{row.persona?.nombre_cargo || '-'}</td>
                      <td>{row.minutos_atraso_calculado ?? 0} min</td>
                      <td>{row.minutos_atraso_oficial ?? 0} min</td>
                      <td>{row.dias_descuento_oficial ?? row.dias_descuento_calculado ?? 0}</td>
                      <td>{row.dias_falta ?? 0}</td>
                      <td>
                        Trab.: {row.dias_trabajados ?? 0} / Just.: {row.dias_justificados ?? 0} /
                        Aband.: {row.dias_abandono ?? 0}
                      </td>
                      <td>
                        {row.estado_mensual ? (
                          <StatusBadge value={row.estado_mensual} />
                        ) : (
                          <span className='text-muted'>No</span>
                        )}
                      </td>
                      {/* <td className='text-end'>
                        <button
                          type='button'
                          className='btn btn-sm btn-light-primary'
                          onClick={() => void verDetalle(row)}
                        >
                          Ver detalle
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </KTCard>

      {rows.length > 0 && (
        <div className='row g-5 mb-7'>
          <div className='col-12 col-md-3'>
            <div className='card card-flush h-100'>
              <div className='card-body'>
                <div className='text-gray-500 fs-7 text-uppercase fw-bold mb-2'>
                  Personas listadas
                </div>
                <div className='fs-1 fw-bolder text-gray-900'>{rows.length}</div>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-3'>
            <div className='card card-flush h-100'>
              <div className='card-body'>
                <div className='text-gray-500 fs-7 text-uppercase fw-bold mb-2'>
                  Faltas acumuladas
                </div>
                <div className='fs-1 fw-bolder text-danger'>
                  {rows.reduce((sum, row) => sum + (row.dias_falta ?? 0), 0)}
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-3'>
            <div className='card card-flush h-100'>
              <div className='card-body'>
                <div className='text-gray-500 fs-7 text-uppercase fw-bold mb-2'>
                  Atraso oficial total
                </div>
                <div className='fs-1 fw-bolder text-warning'>
                  {rows.reduce((sum, row) => sum + (row.minutos_atraso_oficial ?? 0), 0)}
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-3'>
            <div className='card card-flush h-100'>
              <div className='card-body'>
                <div className='text-gray-500 fs-7 text-uppercase fw-bold mb-2'>
                  No descontables
                </div>
                <div className='fs-1 fw-bolder text-primary'>
                  {
                    rows.filter((row) => (row.estado_mensual || '').toUpperCase() === 'JUSTIFICADO')
                      .length
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {detalle && (
        <KTCard>
          <div className='card-header'>
            <div className='card-title d-flex flex-column'>
              <h3 className='fw-bold m-0'>Detalle mensual</h3>
              <span className='text-muted mt-1'>
                {detalle.persona?.nombre_completo || `Persona ${detalle.id_persona}`} -{' '}
                {detalle.persona?.ci || detalle.persona?.user_id_biometrico_principal || 'Sin CI'}
              </span>
            </div>
          </div>
          <div className='card-body'>
            <div className='row g-5'>
              <div className='col-md-3'>
                <div className='text-gray-600 fs-7 text-uppercase mb-1'>Atraso calculado</div>
                <div className='fw-bold fs-4'>{detalle.minutos_atraso_calculado ?? 0} min</div>
              </div>
              <div className='col-md-3'>
                <div className='text-gray-600 fs-7 text-uppercase mb-1'>Atraso oficial</div>
                <div className='fw-bold fs-4'>{detalle.minutos_atraso_oficial ?? 0} min</div>
              </div>
              <div className='col-md-3'>
                <div className='text-gray-600 fs-7 text-uppercase mb-1'>Días sanción oficiales</div>
                <div className='fw-bold fs-4'>{detalle.dias_descuento_oficial ?? 0}</div>
              </div>
              <div className='col-md-3'>
                <div className='text-gray-600 fs-7 text-uppercase mb-1'>Estado mensual</div>
                {detalle.estado_mensual ? (
                  <StatusBadge value={detalle.estado_mensual} />
                ) : (
                  <div className='fw-bold fs-4'>No</div>
                )}
              </div>
            </div>
            <div className='separator my-7' />
            <div className='row g-5'>
              <div className='col-md-2'>
                Trabajados: <span className='fw-bold'>{detalle.dias_trabajados ?? 0}</span>
              </div>
              <div className='col-md-2'>
                Justificados: <span className='fw-bold'>{detalle.dias_justificados ?? 0}</span>
              </div>
              <div className='col-md-2'>
                Faltas: <span className='fw-bold'>{detalle.dias_falta ?? 0}</span>
              </div>
              <div className='col-md-2'>
                Abandonos: <span className='fw-bold'>{detalle.dias_abandono ?? 0}</span>
              </div>
              <div className='col-md-4'>
                Observación: <span className='fw-bold'>{detalle.observacion || '-'}</span>
              </div>
            </div>
          </div>
        </KTCard>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        proceso={procesoSeleccionado}
        searchInicial={search}
        onShowPDF={handleShowPDF}
      />

      <PDFModal
        isOpen={showPDFModal}
        onClose={handleClosePDFModal}
        isPreparing={isPreparingPdf}
        pdfBlob={currentPDFData?.blob || null}
        filename={currentPDFData?.filename || 'REPORTE_PLANILLA_MENSUAL.pdf'}
        title={currentPDFData?.title || 'Reporte de planilla mensual'}
      />
    </>
  )
}

export default ResultadosMensualesPage
