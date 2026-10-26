import {useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {KTIcon} from 'src/_metronic/helpers'
import {
  getBiometricoEventos,
  getBiometricoUsuariosLocales,
  getDeviceTime,
  getDispositivoBiometricoById,
  syncDeviceTime,
  testDeviceConnection,
  testDeviceVoice,
  syncBiometricoMarcaciones,
  syncBiometricoUsuarios,
  downloadBiometricoMarcacionesDat,
} from '../list/core/_requests'
import {
  BiometricoDispositivoUsuario,
  BiometricoEvento,
  DeviceTimeResponse,
  DispositivoBiometrico,
} from '../list/core/_models'
import {showToast} from 'src/app/utils/toastHelper'

const BiometricoAdminPage = () => {
  const {id} = useParams<{id: string}>()
  const navigate = useNavigate()

  const [device, setDevice] = useState<DispositivoBiometrico | null>(null)
  const [usuariosLocales, setUsuariosLocales] = useState<BiometricoDispositivoUsuario[]>([])
  const [eventos, setEventos] = useState<BiometricoEvento[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingUsuarios, setSyncingUsuarios] = useState(false)
  const [syncingMarcaciones, setSyncingMarcaciones] = useState(false)
  const [pinging, setPinging] = useState(false)
  const [sounding, setSounding] = useState(false)
  const [loadingDeviceTime, setLoadingDeviceTime] = useState(false)
  const [syncingDeviceTime, setSyncingDeviceTime] = useState(false)
  const [downloadingDat, setDownloadingDat] = useState(false)
  const [deviceTimeInfo, setDeviceTimeInfo] = useState<DeviceTimeResponse | null>(null)
  const [fechaDesde, setFechaDesde] = useState(today())
  const [fechaHasta, setFechaHasta] = useState(today())

  // Al montar: cargar datos del dispositivo y recursos de operación SIACOP
  useEffect(() => {
    const init = async () => {
      const [deviceResult] = await Promise.allSettled([getDispositivoBiometricoById(Number(id))])

      setDevice(deviceResult.status === 'fulfilled' ? deviceResult.value ?? null : null)
      if (id) {
        try {
          const localUsers = await getBiometricoUsuariosLocales(Number(id))
          setUsuariosLocales(localUsers.usuarios ?? [])
        } catch (error) {
          setUsuariosLocales([])
        }
        try {
          const eventosResponse = await getBiometricoEventos(Number(id), 20)
          setEventos(eventosResponse.items ?? [])
        } catch (error) {
          setEventos([])
        }
      }
      setLoading(false)
    }
    init()
  }, [id])

  const recargarDispositivo = async () => {
    if (!id) return
    const refreshed = await getDispositivoBiometricoById(Number(id))
    setDevice(refreshed ?? null)
  }

  const recargarUsuariosLocales = async () => {
    if (!id) return
    const response = await getBiometricoUsuariosLocales(Number(id))
    setUsuariosLocales(response.usuarios ?? [])
  }

  const recargarEventos = async () => {
    if (!id) return
    const response = await getBiometricoEventos(Number(id), 20)
    setEventos(response.items ?? [])
  }

  const handleSyncUsuarios = async () => {
    if (!id) return

    setSyncingUsuarios(true)
    try {
      const response = await syncBiometricoUsuarios(Number(id))
      await Promise.all([recargarDispositivo(), recargarUsuariosLocales(), recargarEventos()])
      showToast({
        type: 'success',
        message: `Usuarios sincronizados. Recibidos: ${response.total_recibidos}, insertados: ${response.insertados}, actualizados: ${response.actualizados}.`,
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        message:
          error?.response?.data?.message || 'No se pudo sincronizar usuarios desde el biométrico.',
      })
    } finally {
      setSyncingUsuarios(false)
    }
  }

  const handleSyncMarcaciones = async () => {
    if (!id) return

    setSyncingMarcaciones(true)
    try {
      const response = await syncBiometricoMarcaciones(Number(id), {
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
      })
      await Promise.all([recargarDispositivo(), recargarEventos()])
      showToast({
        type: 'success',
        message: `Marcaciones sincronizadas. Raw insertadas: ${response.raw_insertadas}, normalizadas: ${response.normalizadas_insertadas}.`,
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        message:
          error?.response?.data?.message ||
          'No se pudo sincronizar marcaciones desde el biométrico.',
      })
    } finally {
      setSyncingMarcaciones(false)
    }
  }

  const handlePing = async () => {
    if (!id) return

    setPinging(true)
    try {
      const response = await testDeviceConnection(Number(id))
      await Promise.all([recargarDispositivo(), recargarEventos()])
      showToast({
        type: response?.status === 'pass' ? 'success' : 'warning',
        message: response?.message || 'Prueba de conexión ejecutada.',
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error?.response?.data?.message || 'No se pudo probar la conexión del biométrico.',
      })
    } finally {
      setPinging(false)
    }
  }

  const handleSonar = async () => {
    if (!id) return

    setSounding(true)
    try {
      const response = await testDeviceVoice(Number(id), {voice_index: 10})
      await Promise.all([recargarDispositivo(), recargarEventos()])
      showToast({
        type: response?.status === 'success' ? 'success' : 'warning',
        message: response?.message || 'Prueba de sonido ejecutada.',
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error?.response?.data?.message || 'No se pudo ejecutar la prueba de sonido.',
      })
    } finally {
      setSounding(false)
    }
  }

  const handleConsultarHora = async () => {
    if (!id) return

    setLoadingDeviceTime(true)
    try {
      const response = await getDeviceTime(Number(id))
      setDeviceTimeInfo(response ?? null)
      await Promise.all([recargarDispositivo(), recargarEventos()])
      showToast({
        type: 'success',
        message: response?.message || 'Hora del dispositivo obtenida.',
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error?.response?.data?.message || 'No se pudo consultar la hora del biométrico.',
      })
    } finally {
      setLoadingDeviceTime(false)
    }
  }

  const handleDescargarDat = async () => {
    if (!id) return

    setDownloadingDat(true)
    try {
      const response = await downloadBiometricoMarcacionesDat(Number(id))
      const url = window.URL.createObjectURL(response.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = response.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      await Promise.all([recargarDispositivo(), recargarEventos()])
      showToast({
        type: 'success',
        message: `Archivo DAT descargado: ${response.filename}`,
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        message:
          error?.response?.data?.message ||
          'No se pudo descargar el archivo DAT de marcaciones del biométrico.',
      })
    } finally {
      setDownloadingDat(false)
    }
  }

  const handleSincronizarHora = async () => {
    if (!id) return

    const confirmado = window.confirm(
      'Se sincronizará la hora del biométrico con la hora actual del servidor. ¿Deseas continuar?'
    )

    if (!confirmado) return

    setSyncingDeviceTime(true)
    try {
      const response = await syncDeviceTime(Number(id))
      const currentTime = await getDeviceTime(Number(id))
      setDeviceTimeInfo(currentTime ?? null)
      await Promise.all([recargarDispositivo(), recargarEventos()])
      showToast({
        type: 'success',
        message: response?.message || 'Hora del dispositivo sincronizada correctamente.',
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error?.response?.data?.message || 'No se pudo sincronizar la hora del biométrico.',
      })
    } finally {
      setSyncingDeviceTime(false)
    }
  }

  if (loading) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{minHeight: '300px'}}
      >
        <div className='spinner-border text-primary' role='status' />
      </div>
    )
  }

  if (!device) {
    return (
      <div className='card'>
        <div className='card-body text-center py-15'>
          <KTIcon iconName='cross-circle' className='fs-2x text-danger mb-4' />
          <h4 className='text-danger'>Dispositivo no encontrado</h4>
          <button
            className='btn btn-light mt-4'
            onClick={() => navigate('/apps/biometricos/listar')}
          >
            <i className='bi bi-arrow-left me-2' />
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  const usuariosActivos = usuariosLocales.filter(
    (usuario) => Number(usuario.activo ?? 1) === 1
  ).length
  const usuariosAdmins = usuariosLocales.filter(
    (usuario) => Number(usuario.privilegio ?? 0) > 0
  ).length
  const usuariosPendientes = usuariosLocales.filter((usuario) => !usuario.id_persona).length
  const usuariosSincronizados = usuariosLocales.filter(
    (usuario) => Number(usuario.sincronizado ?? 0) === 1
  ).length
  const eventosError = eventos.filter(
    (evento) => resolveEventTone(evento.nivel) === 'danger'
  ).length
  const eventosWarning = eventos.filter(
    (evento) => resolveEventTone(evento.nivel) === 'warning'
  ).length
  const eventosExito = eventos.filter(
    (evento) => (evento.estado || '').toUpperCase() === 'EXITO'
  ).length
  const ultimoEventoCritico = eventos.find((evento) =>
    ['danger', 'warning'].includes(resolveEventTone(evento.nivel))
  )
  const healthTone = resolveDeviceHealthTone(device, eventos)
  const healthLabel = resolveDeviceHealthLabel(device, eventos)

  return (
    <>
      {/* Header con info del dispositivo */}
      <div className='card mb-6'>
        <div className='card-body py-4'>
          <div className='d-flex align-items-center justify-content-between flex-wrap gap-3'>
            <div className='d-flex align-items-center gap-4'>
              <button
                className='btn btn-icon btn-light btn-sm'
                onClick={() => navigate('/apps/biometricos/listar')}
                title='Volver al listado'
              >
                <i className='bi bi-arrow-left fs-4' />
              </button>
              <div className='symbol symbol-50px'>
                <div className='symbol-label bg-light-primary'>
                  <KTIcon iconName='fingerprint-scanning' className='fs-2 text-primary' />
                </div>
              </div>
              <div>
                <h3 className='mb-0 fw-bold'>{device.nombre_dispositivo}</h3>
                <div className='text-muted fs-7'>
                  {device.direccion_ip}:{device.puerto}
                  {device.ubicacion && <span className='ms-3'>· {device.ubicacion}</span>}
                </div>
              </div>
            </div>

            <div className='d-flex align-items-center gap-3'>
              <span className='badge badge-lg badge-light-primary'>
                <i className='bi bi-diagram-3 me-1' />
                Microservicio TCP
              </span>
              <span className='badge badge-lg badge-light-success'>
                <i className='bi bi-shield-check me-1' />
                Sin login legacy
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='row g-5 mb-6'>
        <div className='col-12 col-sm-6 col-xl-3'>
          <AdminMetricCard
            title='Usuarios activos'
            value={usuariosActivos}
            subtitle={`${usuariosAdmins} con privilegios en el equipo`}
            tone='primary'
            icon='people'
          />
        </div>
        <div className='col-12 col-sm-6 col-xl-3'>
          <AdminMetricCard
            title='Pendientes'
            value={usuariosPendientes}
            subtitle='usuarios sin vínculo con id_persona'
            tone={usuariosPendientes > 0 ? 'warning' : 'success'}
            icon='information-4'
          />
        </div>
        <div className='col-12 col-sm-6 col-xl-3'>
          <AdminMetricCard
            title='Eventos críticos'
            value={eventosError + eventosWarning}
            subtitle={`${eventosError} error, ${eventosWarning} warning`}
            tone={eventosError > 0 ? 'danger' : eventosWarning > 0 ? 'warning' : 'success'}
            icon='shield-cross'
          />
        </div>
        <div className='col-12 col-sm-6 col-xl-3'>
          <AdminMetricCard
            title='Salud operativa'
            value={healthLabel}
            subtitle={`Éxitos recientes: ${eventosExito} · sincronizados: ${usuariosSincronizados}`}
            tone={healthTone}
            icon='pulse'
          />
        </div>
      </div>

      <div className='card mb-6 border border-dashed border-primary bg-light-primary'>
        <div className='card-header border-0 pt-5'>
          <div>
            <h3 className='card-title fw-bold text-primary'>Operación SIACOP</h3>
            <div className='text-muted fs-7'>
              Flujo seguro para usuarios, marcaciones bajo demanda y job nocturno.
            </div>
          </div>
        </div>
        <div className='card-body pt-2'>
          <div className='row g-5 mb-6'>
            <div className='col-md-3'>
              <div className='p-4 rounded bg-white h-100'>
                <div className='text-muted fs-8 mb-1'>Fuente principal</div>
                <div className='fw-bold fs-4'>
                  {device.estado_sincronizacion?.fuente_principal ||
                    device.fuente_principal_marcacion ||
                    '-'}
                </div>
              </div>
            </div>
            <div className='col-md-3'>
              <div className='p-4 rounded bg-white h-100'>
                <div className='text-muted fs-8 mb-1'>Método de ingesta</div>
                <div className='fw-bold fs-4'>
                  {device.estado_sincronizacion?.metodo_ingesta ||
                    device.metodo_ingesta_marcacion ||
                    '-'}
                </div>
              </div>
            </div>
            <div className='col-md-3'>
              <div className='p-4 rounded bg-white h-100'>
                <div className='text-muted fs-8 mb-1'>Sync usuarios</div>
                <div className='fw-semibold'>
                  {formatDate(device.ultima_sincronizacion_usuarios)}
                </div>
              </div>
            </div>
            <div className='col-md-3'>
              <div className='p-4 rounded bg-white h-100'>
                <div className='text-muted fs-8 mb-1'>Sync marcaciones</div>
                <div className='fw-semibold'>
                  {formatDate(device.ultima_sincronizacion_marcaciones)}
                </div>
              </div>
            </div>
          </div>

          <div className='d-flex flex-wrap gap-3 mb-5'>
            <span
              className={`badge badge-light-${
                device.estado_sincronizacion?.consulta_bajo_demanda_habilitada
                  ? 'success'
                  : 'secondary'
              }`}
            >
              Consulta bajo demanda{' '}
              {device.estado_sincronizacion?.consulta_bajo_demanda_habilitada
                ? 'habilitada'
                : 'deshabilitada'}
            </span>
            <span
              className={`badge badge-light-${
                device.estado_sincronizacion?.job_nocturno_habilitado ? 'success' : 'secondary'
              }`}
            >
              Job nocturno{' '}
              {device.estado_sincronizacion?.job_nocturno_habilitado
                ? 'habilitado'
                : 'deshabilitado'}
            </span>
            <span
              className={`badge badge-light-${
                device.estado_sincronizacion?.usa_adms_como_principal ? 'primary' : 'warning'
              }`}
            >
              {device.estado_sincronizacion?.usa_adms_como_principal
                ? 'ADMS principal'
                : 'TCP principal'}
            </span>
            {device.estado_sincronizacion?.usa_tcp_pull_como_respaldo && (
              <span className='badge badge-light-info'>TCP pull como respaldo</span>
            )}
          </div>

          {/* <div className='alert alert-light-warning border border-dashed border-warning mb-6'>
            <div className='fw-bold mb-2'>Eventos operativos a vigilar</div>
            <div className='row g-3 fs-7 text-gray-700'>
              <div className='col-md-4'>
                Clave de comunicación incorrecta: el ping o la sincronización fallarán al abrir
                conexión TCP.
              </div>
              <div className='col-md-4'>
                IP o DNS incorrecto: el equipo no responderá y quedará sin sincronización reciente.
              </div>
              <div className='col-md-4'>
                Usuario editado en biométrico: ejecutar sincronización manual de usuarios para
                refrescar rol, nombre, password o tarjeta.
              </div>
              <div className='col-md-4'>
                Marcación faltante en pantalla: usar consulta bajo demanda si el equipo trabaja por
                TCP o mixto.
              </div>
              <div className='col-md-4'>
                ADMS inestable: usar `MIXTO` y dejar TCP como respaldo operativo.
              </div>
              <div className='col-md-4'>
                Usuario sin `id_persona`: queda pendiente de conciliación hasta resolver CI o
                relación biométrica.
              </div>
            </div>
          </div> */}

          {/* <div className='alert alert-light-primary border border-dashed border-primary mb-6'>
            <div className='fw-bold mb-2'>Modo de administración vigente</div>
            <div className='fs-7 text-gray-700'>
              La administración del biométrico ya no depende de autenticación directa contra el
              equipo ni de que SIACOP comparta la misma red. La operación oficial debe resolverse
              mediante el microservicio biométrico por TCP/VPN para pruebas de conexión,
              sincronización de usuarios, consulta de marcaciones y monitoreo.
            </div>
          </div> */}

          {/* <div className='row g-5 mb-6'>
            <div className='col-lg-7'>
              <div className='card border-0 bg-white shadow-sm h-100'>
                <div className='card-body'>
                  <div className='d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4'>
                    <div>
                      <div className='text-muted fs-8 text-uppercase fw-bold'>Radar operativo</div>
                      <div className='fs-4 fw-bold text-gray-900'>
                        Lectura rápida del biométrico
                      </div>
                    </div>
                    <span className={`badge badge-light-${healthTone}`}>{healthLabel}</span>
                  </div>

                  <div className='row g-4'>
                    <div className='col-md-6'>
                      <div className='rounded border border-gray-200 p-4 h-100'>
                        <div className='text-muted fs-8 mb-1'>Ruta principal de marcación</div>
                        <div className='fw-bold fs-5 text-gray-900 mb-2'>
                          {device.fuente_principal_marcacion === 'ADMS'
                            ? 'Push ADMS hacia SIACOP'
                            : 'Consulta TCP Pull'}
                        </div>
                        <div className='text-gray-700 fs-7'>
                          {device.fuente_principal_marcacion === 'ADMS'
                            ? 'La marcación debería llegar automáticamente y TCP queda como respaldo si el dispositivo es mixto.'
                            : 'SIACOP puede consultar el equipo cuando falte una marcación o durante la sincronización nocturna.'}
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='rounded border border-gray-200 p-4 h-100'>
                        <div className='text-muted fs-8 mb-1'>Próxima acción recomendada</div>
                        <div className='fw-bold fs-5 text-gray-900 mb-2'>
                          {usuariosPendientes > 0
                            ? 'Conciliar usuarios pendientes'
                            : eventosError > 0
                            ? 'Revisar errores recientes'
                            : !device.ultima_sincronizacion_usuarios
                            ? 'Ejecutar sync inicial de usuarios'
                            : 'Monitoreo normal'}
                        </div>
                        <div className='text-gray-700 fs-7'>
                          {usuariosPendientes > 0
                            ? 'Hay registros sin id_persona; conviene resolverlos antes de depender del fallback por persona.'
                            : eventosError > 0
                            ? 'El historial reporta fallos operativos; revisar IP, DNS, puerto o clave de comunicación.'
                            : !device.ultima_sincronizacion_usuarios
                            ? 'Todavía no existe padrón local para saber qué personas pertenecen a este equipo.'
                            : 'El dispositivo ya tiene estructura mínima para operar con SIACOP.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-lg-5'>
              <div className='card border-0 bg-gray-100 h-100'>
                <div className='card-body'>
                  <div className='text-muted fs-8 text-uppercase fw-bold mb-1'>Última alerta</div>
                  <div className='fs-4 fw-bold text-gray-900 mb-4'>
                    {ultimoEventoCritico
                      ? ultimoEventoCritico.tipo_evento
                      : 'Sin alertas recientes'}
                  </div>

                  {ultimoEventoCritico ? (
                    <>
                      <div className='d-flex flex-wrap gap-2 mb-3'>
                        <span
                          className={`badge badge-light-${resolveEventTone(
                            ultimoEventoCritico.nivel
                          )}`}
                        >
                          {ultimoEventoCritico.nivel}
                        </span>
                        <span className='badge badge-light-dark'>
                          {ultimoEventoCritico.estado || 'SIN ESTADO'}
                        </span>
                        <span className='badge badge-light-info'>
                          {formatDate(ultimoEventoCritico.created_at)}
                        </span>
                      </div>
                      <div className='text-gray-700 fs-7 mb-4'>
                        {ultimoEventoCritico.descripcion ||
                          'Evento crítico sin descripción adicional.'}
                      </div>
                    </>
                  ) : (
                    <div className='text-gray-700 fs-7 mb-4'>
                      No se registran warnings ni errores en el historial operativo reciente de este
                      equipo.
                    </div>
                  )}

                  <div className='separator my-4' />

                  <div className='row g-3'>
                    <div className='col-6'>
                      <div className='rounded bg-white p-3 text-center'>
                        <div className='fw-bolder fs-2 text-danger'>{eventosError}</div>
                        <div className='text-muted fs-8'>Errores</div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='rounded bg-white p-3 text-center'>
                        <div className='fw-bolder fs-2 text-warning'>{eventosWarning}</div>
                        <div className='text-muted fs-8'>Warnings</div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='rounded bg-white p-3 text-center'>
                        <div className='fw-bolder fs-2 text-success'>{eventosExito}</div>
                        <div className='text-muted fs-8'>Éxitos</div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='rounded bg-white p-3 text-center'>
                        <div className='fw-bolder fs-2 text-primary'>{usuariosLocales.length}</div>
                        <div className='text-muted fs-8'>Usuarios cacheados</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          <div className='row g-6'>
            <div className='col-lg-5'>
              <div className='card card-flush h-100'>
                <div className='card-header pt-5'>
                  <div>
                    <h4 className='mb-1'>Usuarios del biométrico</h4>
                    <div className='text-muted fs-7'>
                      Sincroniza el padrón del equipo hacia SIACOP.
                    </div>
                  </div>
                </div>
                <div className='card-body pt-2'>
                  <div className='d-flex align-items-center justify-content-between mb-4'>
                    <div>
                      <div className='fw-bold fs-3'>{usuariosLocales.length}</div>
                      <div className='text-muted fs-8'>usuarios locales sincronizados</div>
                    </div>
                    <button
                      className='btn btn-primary'
                      onClick={handleSyncUsuarios}
                      disabled={syncingUsuarios}
                    >
                      {syncingUsuarios ? (
                        <span className='spinner-border spinner-border-sm me-2' />
                      ) : (
                        <i className='bi bi-arrow-repeat me-2' />
                      )}
                      Sincronizar usuarios
                    </button>
                  </div>
                  <div className='table-responsive'>
                    <table className='table table-row-dashed align-middle gs-0 gy-3 mb-0'>
                      <thead>
                        <tr className='fw-bold text-muted'>
                          <th>Usuario</th>
                          <th>Persona</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuariosLocales.slice(0, 6).map((usuario) => (
                          <tr
                            key={String(
                              usuario.id_biometrico_dispositivo_usuario ?? usuario.user_id
                            )}
                          >
                            <td>
                              <div className='fw-bold text-gray-800'>
                                {usuario.nombre_en_dispositivo || usuario.user_id || '-'}
                              </div>
                              <div className='text-muted fs-8'>
                                {usuario.user_id || usuario.user_id_biometrico || '-'}
                              </div>
                            </td>
                            <td>
                              {usuario.id_persona ? (
                                `ID ${usuario.id_persona}`
                              ) : (
                                <span className='text-warning'>Pendiente</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge badge-light-${
                                  usuario.id_persona ? 'success' : 'warning'
                                }`}
                              >
                                {usuario.id_persona ? 'Vinculado' : 'Conciliar'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {usuariosLocales.length === 0 && (
                          <tr>
                            <td colSpan={3} className='text-center text-muted py-6'>
                              Aún no hay usuarios sincronizados en la tabla local.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-lg-7'>
              <div className='card card-flush h-100'>
                <div className='card-header pt-5'>
                  <div>
                    <h4 className='mb-1'>Marcaciones por rango</h4>
                    <div className='text-muted fs-7'>
                      Consulta manual por biométrico para soporte, conciliación y pruebas.
                    </div>
                  </div>
                </div>
                <div className='card-body pt-2'>
                  <div className='row g-4 align-items-end'>
                    <div className='col-md-3'>
                      <label className='form-label fw-semibold'>Fecha desde</label>
                      <input
                        type='date'
                        className='form-control form-control-solid'
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                      />
                    </div>
                    <div className='col-md-3'>
                      <label className='form-label fw-semibold'>Fecha hasta</label>
                      <input
                        type='date'
                        className='form-control form-control-solid'
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                      />
                    </div>
                    <div className='col-md-3'>
                      <button
                        className='btn btn-light-primary w-100 mb-3'
                        onClick={handlePing}
                        disabled={pinging}
                      >
                        {pinging ? (
                          <span className='spinner-border spinner-border-sm me-2' />
                        ) : (
                          <i className='bi bi-broadcast-pin me-2' />
                        )}
                        Probar conexión
                      </button>
                    </div>
                    <div className='col-md-3'>
                      <button
                        className='btn btn-light-info w-100 mb-3'
                        onClick={handleSonar}
                        disabled={sounding}
                      >
                        {sounding ? (
                          <span className='spinner-border spinner-border-sm me-2' />
                        ) : (
                          <i className='bi bi-volume-up me-2' />
                        )}
                        Hacer sonar
                      </button>
                    </div>
                    <div className='col-md-4'>
                      <button
                        className='btn btn-light-dark w-100'
                        onClick={handleConsultarHora}
                        disabled={loadingDeviceTime}
                      >
                        {loadingDeviceTime ? (
                          <span className='spinner-border spinner-border-sm me-2' />
                        ) : (
                          <i className='bi bi-clock-history me-2' />
                        )}
                        Ver hora del dispositivo
                      </button>
                    </div>
                    <div className='col-md-4'>
                      <button
                        className='btn btn-light-danger w-100'
                        onClick={handleSincronizarHora}
                        disabled={syncingDeviceTime}
                      >
                        {syncingDeviceTime ? (
                          <span className='spinner-border spinner-border-sm me-2' />
                        ) : (
                          <i className='bi bi-clock me-2' />
                        )}
                        Sincronizar hora
                      </button>
                    </div>
                    <div className='col-md-4'>
                      <button
                        className='btn btn-warning w-100'
                        onClick={handleSyncMarcaciones}
                        disabled={syncingMarcaciones}
                      >
                        {syncingMarcaciones ? (
                          <span className='spinner-border spinner-border-sm me-2' />
                        ) : (
                          <i className='bi bi-cloud-download me-2' />
                        )}
                        Sincronizar marcaciones
                      </button>
                    </div>
                    <div className='col-md-4'>
                      <button
                        className='btn btn-light-success w-100'
                        onClick={handleDescargarDat}
                        disabled={downloadingDat}
                      >
                        {downloadingDat ? (
                          <span className='spinner-border spinner-border-sm me-2' />
                        ) : (
                          <i className='bi bi-file-earmark-arrow-down me-2' />
                        )}
                        Descargar ATTLOG .dat
                      </button>
                    </div>
                  </div>

                  {deviceTimeInfo && (
                    <>
                      <div className='separator my-6' />
                      <div
                        className={`rounded border p-4 bg-light-${
                          Math.abs(Number(deviceTimeInfo.diff_minutes ?? 0)) >= 2
                            ? 'danger'
                            : 'success'
                        } border-${
                          Math.abs(Number(deviceTimeInfo.diff_minutes ?? 0)) >= 2
                            ? 'danger'
                            : 'success'
                        }`}
                      >
                        <div className='d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3'>
                          <div>
                            <div className='text-muted fs-8 text-uppercase fw-bold'>
                              Hora consultada del biométrico
                            </div>
                            <div className='fw-bold fs-5 text-gray-900'>
                              {deviceTimeInfo.serial_detectado || device.serial || '-'}
                            </div>
                          </div>
                          <span
                            className={`badge badge-light-${
                              Math.abs(Number(deviceTimeInfo.diff_minutes ?? 0)) >= 2
                                ? 'danger'
                                : 'success'
                            }`}
                          >
                            Desfase {formatDiffMinutes(deviceTimeInfo.diff_minutes)}
                          </span>
                        </div>
                        <div className='row g-4'>
                          <div className='col-md-4'>
                            <div className='text-muted fs-8 mb-1'>Hora del dispositivo</div>
                            <div className='fw-semibold'>
                              {formatDate(deviceTimeInfo.device_time || null)}
                            </div>
                          </div>
                          <div className='col-md-4'>
                            <div className='text-muted fs-8 mb-1'>Hora del servidor</div>
                            <div className='fw-semibold'>
                              {formatDate(deviceTimeInfo.server_time || null)}
                            </div>
                          </div>
                          <div className='col-md-4'>
                            <div className='text-muted fs-8 mb-1'>IP usada</div>
                            <div className='fw-semibold'>{deviceTimeInfo.ip || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className='separator my-6' />
                  <div className='row g-4'>
                    <div className='col-md-4'>
                      <div className='text-muted fs-8 mb-1'>Última marcación consolidada</div>
                      <div className='fw-semibold'>
                        {formatDate(device.ultima_fecha_marcacion_sync)}
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div className='text-muted fs-8 mb-1'>Conexión TCP</div>
                      <div className='fw-semibold'>
                        {device.direccion_ip_privada || device.direccion_ip || '-'}:
                        {device.puerto || '-'}
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div className='text-muted fs-8 mb-1'>Clave comunicación</div>
                      <div className='fw-semibold'>{device.clave_comunicacion || '0'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='card card-flush mt-6'>
            <div className='card-header pt-5'>
              <div>
                <h4 className='mb-1'>Eventos recientes del biométrico</h4>
                <div className='text-muted fs-7'>
                  Historial operativo para soporte, auditoría y diagnóstico rápido.
                </div>
              </div>
            </div>
            <div className='card-body pt-2'>
              <div className='table-responsive'>
                <table className='table table-row-dashed align-middle gs-0 gy-3 mb-0'>
                  <thead>
                    <tr className='fw-bold text-muted'>
                      <th>Fecha</th>
                      <th>Evento</th>
                      <th>Nivel</th>
                      <th>Origen</th>
                      <th>Estado</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventos.map((evento) => (
                      <tr key={evento.id}>
                        <td className='text-nowrap'>{formatDate(evento.created_at)}</td>
                        <td className='fw-semibold'>{evento.tipo_evento}</td>
                        <td>
                          <span className={`badge badge-light-${resolveEventTone(evento.nivel)}`}>
                            {evento.nivel}
                          </span>
                        </td>
                        <td>{evento.origen || '-'}</td>
                        <td>{evento.estado || '-'}</td>
                        <td className='text-gray-700'>{evento.descripcion || '-'}</td>
                      </tr>
                    ))}
                    {eventos.length === 0 && (
                      <tr>
                        <td colSpan={6} className='text-center text-muted py-6'>
                          Aún no hay eventos registrados para este biométrico.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className='card'>
        <div className='card-header border-0 pt-5'>
          <div>
            <h4 className='mb-1'>Administración centralizada</h4>
            <div className='text-muted fs-7'>
              La gestión del dispositivo debe hacerse mediante el microservicio biométrico y la
              información sincronizada en SIACOP.
            </div>
          </div>
        </div>
        <div className='card-body pt-4'>
          <div className='row g-5'>
            <div className='col-lg-4'>
              <div className='rounded border border-gray-300 p-5 h-100'>
                <div className='d-flex align-items-center gap-3 mb-3'>
                  <KTIcon iconName='security-user' className='fs-2 text-primary' />
                  <div className='fw-bold fs-5 text-gray-900'>Sin autenticación local</div>
                </div>
                <div className='text-gray-700 fs-7'>
                  Ya no se requiere usuario ni contraseña del equipo para operar desde SIACOP. La
                  conectividad y ejecución deben delegarse al servicio biométrico oficial.
                </div>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='rounded border border-gray-300 p-5 h-100'>
                <div className='d-flex align-items-center gap-3 mb-3'>
                  <KTIcon iconName='abstract-39' className='fs-2 text-success' />
                  <div className='fw-bold fs-5 text-gray-900'>Operación por TCP/VPN</div>
                </div>
                <div className='text-gray-700 fs-7'>
                  El microservicio biométrico abre la conexión TCP con el reloj desde la red donde
                  sí existe visibilidad, evitando depender de la red local del navegador o del
                  backend principal.
                </div>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='rounded border border-gray-300 p-5 h-100'>
                <div className='d-flex align-items-center gap-3 mb-3'>
                  <KTIcon iconName='chart-line' className='fs-2 text-warning' />
                  <div className='fw-bold fs-5 text-gray-900'>Siguiente evolución</div>
                </div>
                <div className='text-gray-700 fs-7'>
                  El camino correcto es ampliar capacidades remotas seguras del microservicio para
                  snapshot técnico, más comandos y administración controlada sin volver al flujo
                  legacy.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  )
}

const today = () => new Date().toISOString().slice(0, 10)

const AdminMetricCard = ({
  title,
  value,
  subtitle,
  tone,
  icon,
}: {
  title: string
  value: string | number
  subtitle: string
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dark'
  icon: string
}) => (
  <div className={`card border-0 shadow-sm bg-light-${tone} h-100`}>
    <div className='card-body d-flex align-items-center gap-4'>
      <div className={`symbol symbol-55px`}>
        <div className={`symbol-label bg-${tone}`}>
          <KTIcon iconName={icon} className='fs-2 text-white' />
        </div>
      </div>
      <div className='flex-grow-1 min-w-0'>
        <div
          className={`text-${
            tone === 'warning' ? 'gray-800' : tone
          } fw-bold fs-8 text-uppercase mb-1`}
        >
          {title}
        </div>
        <div className='fw-bolder fs-2 text-gray-900 text-truncate'>{value}</div>
        <div className='text-muted fs-8'>{subtitle}</div>
      </div>
    </div>
  </div>
)

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin registro'
  return value.replace('T', ' ').slice(0, 19)
}

const formatDiffMinutes = (value?: number | null) => {
  const diff = Number(value ?? 0)
  const abs = Math.abs(diff)
  const prefix = diff > 0 ? '+' : diff < 0 ? '-' : ''
  return `${prefix}${abs.toFixed(2)} min`
}

const resolveEventTone = (nivel?: string | null) => {
  if (nivel === 'error') return 'danger'
  if (nivel === 'warning') return 'warning'
  if (nivel === 'debug') return 'dark'
  return 'success'
}

const resolveDeviceHealthTone = (device: DispositivoBiometrico, eventos: BiometricoEvento[]) => {
  if (eventos.some((evento) => resolveEventTone(evento.nivel) === 'danger')) return 'danger'
  if (device.estado === 'mantenimiento') return 'warning'
  if (device.estado === 'inactivo') return 'dark'
  if (eventos.some((evento) => resolveEventTone(evento.nivel) === 'warning')) return 'warning'
  if (device.ultima_sincronizacion_marcaciones || device.ultima_sincronizacion_usuarios)
    return 'success'
  return 'primary'
}

const resolveDeviceHealthLabel = (device: DispositivoBiometrico, eventos: BiometricoEvento[]) => {
  const tone = resolveDeviceHealthTone(device, eventos)
  if (tone === 'danger') return 'Atención'
  if (tone === 'warning') return 'Observado'
  if (tone === 'dark') return 'Inactivo'
  if (tone === 'success') return 'Estable'
  return 'Inicial'
}

export {BiometricoAdminPage}
export default BiometricoAdminPage
