import {useEffect, useMemo, useState} from 'react'
import {KTCard} from 'src/_metronic/helpers'
import {EmptyState} from '../components/EmptyState'
import {StatusBadge} from '../components/StatusBadge'
import {MarcacionNormalizada, PaginationPayload} from '../core/_models'
import {getMarcaciones} from '../core/_requests'

type TabKey = 'marcaciones' | 'pendientes'

type Filters = {
  user_id_biometrico: string
  fecha_desde: string
  fecha_hasta: string
}

const PAGE_SIZE = 25

const today = () => new Date().toISOString().slice(0, 10)

const MarcacionesTiempoRealPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('marcaciones')
  const [filters, setFilters] = useState<Filters>({user_id_biometrico: '', fecha_desde: today(), fecha_hasta: today()})
  const [marcaciones, setMarcaciones] = useState<MarcacionNormalizada[]>([])
  const [pendientes, setPendientes] = useState<MarcacionNormalizada[]>([])
  const [pagination, setPagination] = useState<PaginationPayload>({page: 1, total: 0, items_per_page: PAGE_SIZE})
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPages = useMemo(() => {
    const total = Number(pagination.total || 0)
    const perPage = Number(pagination.items_per_page || PAGE_SIZE)
    return Math.max(1, Math.ceil(total / perPage))
  }, [pagination])

  const setField = (field: keyof Filters, value: string) => {
    setFilters((current) => ({...current, [field]: value}))
  }

  const cargar = async (nextPage = page, tab = activeTab) => {
    setLoading(true)
    setError(null)

    try {
      const params = {
        user_id_biometrico: filters.user_id_biometrico || undefined,
        fecha_desde: filters.fecha_desde || undefined,
        fecha_hasta: filters.fecha_hasta || undefined,
      }

      if (tab === 'marcaciones') {
        const response = await getMarcaciones(nextPage, PAGE_SIZE, {
          ...params,
          tipo_origen: 'PUSH',
        })
        setMarcaciones(response.data || [])
        setPagination(response.pagination || {page: nextPage, total: 0, items_per_page: PAGE_SIZE})
      } else {
        const response = await getMarcaciones(nextPage, PAGE_SIZE, {
          ...params,
          tipo_origen: 'PUSH',
          estado_procesamiento: 'PENDIENTE',
        })
        setPendientes(response.data || [])
        setPagination(response.pagination || {page: nextPage, total: 0, items_per_page: PAGE_SIZE})
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'No se pudieron cargar las marcaciones.')
    } finally {
      setLoading(false)
    }
  }

  const cambiarTab = (tab: TabKey) => {
    setActiveTab(tab)
    setPage(1)
    void cargar(1, tab)
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

  useEffect(() => {
    const cargarInicial = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getMarcaciones(1, PAGE_SIZE, {
          fecha_desde: today(),
          fecha_hasta: today(),
          tipo_origen: 'PUSH',
        })
        setMarcaciones(response.data || [])
        setPagination(response.pagination || {page: 1, total: 0, items_per_page: PAGE_SIZE})
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'No se pudieron cargar las marcaciones.')
      } finally {
        setLoading(false)
      }
    }

    void cargarInicial()
  }, [])

  return (
    <>
      <KTCard className='mb-5'>
        <div className='card-body py-5'>
          <div className='d-flex flex-column flex-lg-row justify-content-between gap-4'>
            <div>
              <h3 className='fw-bold text-gray-900 mb-1'>Marcaciones en tiempo real</h3>
              <div className='text-muted fs-7'>Auditoría operativa de marcas recibidas desde biométricos push.</div>
            </div>
            <button type='button' className='btn btn-sm btn-light-primary align-self-lg-start' onClick={() => void cargar()} disabled={loading}>
              {loading ? <span className='spinner-border spinner-border-sm me-2' /> : <i className='bi bi-arrow-clockwise me-2' />}
              Actualizar
            </button>
          </div>
        </div>
      </KTCard>

      <KTCard className='mb-5'>
        <div className='card-body'>
          <div className='row g-4 align-items-end'>
            <div className='col-12 col-md-3'>
              <label className='form-label fw-semibold'>Desde</label>
              <input type='date' className='form-control' value={filters.fecha_desde} onChange={(e) => setField('fecha_desde', e.target.value)} />
            </div>
            <div className='col-12 col-md-3'>
              <label className='form-label fw-semibold'>Hasta</label>
              <input type='date' className='form-control' value={filters.fecha_hasta} onChange={(e) => setField('fecha_hasta', e.target.value)} />
            </div>
            <div className='col-12 col-md-4'>
              <label className='form-label fw-semibold'>Código biométrico</label>
              <input
                type='text'
                className='form-control'
                placeholder='CI o código del biométrico'
                value={filters.user_id_biometrico}
                onChange={(e) => setField('user_id_biometrico', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    buscar()
                  }
                }}
              />
            </div>
            <div className='col-12 col-md-2'>
              <button type='button' className='btn btn-primary w-100' onClick={buscar} disabled={loading}>
                Buscar
              </button>
            </div>
          </div>
          {error && <div className='alert alert-danger mt-5 mb-0'>{error}</div>}
        </div>
      </KTCard>

      <KTCard>
        <div className='card-header border-0 pt-4'>
          <div className='card-toolbar w-100'>
            <ul className='nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-6 fw-bold w-100'>
              <li className='nav-item'>
                <button type='button' className={`nav-link text-active-primary me-6 ${activeTab === 'marcaciones' ? 'active' : ''}`} onClick={() => cambiarTab('marcaciones')}>
                  <i className='bi bi-broadcast-pin me-2' /> Marcaciones
                </button>
              </li>
              <li className='nav-item'>
                <button type='button' className={`nav-link text-active-primary me-6 ${activeTab === 'pendientes' ? 'active' : ''}`} onClick={() => cambiarTab('pendientes')}>
                  <i className='bi bi-exclamation-circle me-2' /> Pendientes
                </button>
              </li>
              <li className='nav-item ms-auto d-flex align-items-center text-muted fs-7'>
                Total: {pagination.total || 0}
              </li>
            </ul>
          </div>
        </div>
        <div className='card-body pt-2'>
          {loading ? (
            <div className='text-muted'>Cargando marcaciones...</div>
          ) : activeTab === 'marcaciones' ? (
            marcaciones.length === 0 ? (
              <EmptyState title='Sin marcaciones' description='No hay registros para los filtros seleccionados.' />
            ) : (
              <div className='table-responsive'>
                <table className='table align-middle table-row-dashed fs-6 gy-4'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                      <th>Fecha hora</th>
                      <th>Persona</th>
                      <th>Código</th>
                      <th>Dispositivo</th>
                      <th>Marcación</th>
                      <th>Verificación</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody className='fw-semibold text-gray-700'>
                    {marcaciones.map((row) => (
                      <tr key={row.id_marcacion}>
                        <td>{row.fecha_hora_marcacion || '-'}</td>
                        <td>{row.id_persona ? `ID ${row.id_persona}` : 'Sin persona'}</td>
                        <td>{row.user_id_biometrico || '-'}</td>
                        <td>
                          <div className='d-flex flex-column'>
                            <span>{row.serial_dispositivo || '-'}</span>
                            <span className='text-muted fs-8'>Equipo {row.id_biometrico_dispositivo || '-'}</span>
                          </div>
                        </td>
                        <td><StatusBadge value={row.estado_marcacion || '-'} /></td>
                        <td>{row.tipo_verificacion || '-'}</td>
                        <td><StatusBadge value={row.estado_procesamiento || '-'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : pendientes.length === 0 ? (
            <EmptyState title='Sin pendientes' description='No hay marcas push pendientes de vincular para los filtros seleccionados.' />
          ) : (
            <div className='table-responsive'>
              <table className='table align-middle table-row-dashed fs-6 gy-4'>
                <thead>
                  <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                    <th>Recepción</th>
                    <th>Fecha hora marca</th>
                    <th>Código</th>
                    <th>Dispositivo</th>
                    <th>Marcación</th>
                    <th>Verificación</th>
                    <th>Procesamiento</th>
                  </tr>
                </thead>
                <tbody className='fw-semibold text-gray-700'>
                  {pendientes.map((row) => (
                    <tr key={row.id_marcacion}>
                      <td>{row.fecha_recepcion || row.fecha_importacion || '-'}</td>
                      <td>{row.fecha_hora_marcacion || '-'}</td>
                      <td>{row.user_id_biometrico || '-'}</td>
                      <td>
                        <div className='d-flex flex-column'>
                          <span>{row.serial_dispositivo || '-'}</span>
                          <span className='text-muted fs-8'>{row.ip_origen || 'Sin IP'}</span>
                        </div>
                      </td>
                      <td><StatusBadge value={row.estado_marcacion || '-'} /></td>
                      <td>{row.tipo_verificacion || '-'}</td>
                      <td><StatusBadge value={row.estado_procesamiento || '-'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className='d-flex justify-content-between align-items-center pt-4'>
            <span className='text-muted fs-7'>Página {page} de {totalPages}</span>
            <div className='d-flex gap-2'>
              <button type='button' className='btn btn-sm btn-light' onClick={() => cambiarPagina(page - 1)} disabled={loading || page <= 1}>
                Anterior
              </button>
              <button type='button' className='btn btn-sm btn-light' onClick={() => cambiarPagina(page + 1)} disabled={loading || page >= totalPages}>
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </KTCard>
    </>
  )
}

export default MarcacionesTiempoRealPage
