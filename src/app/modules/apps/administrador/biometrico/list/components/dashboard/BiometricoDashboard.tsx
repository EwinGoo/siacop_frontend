import {FC, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Swal from 'sweetalert2'
import {useQueryClient} from 'react-query'
import {KTIcon, QUERIES} from 'src/_metronic/helpers'
import {showToast} from 'src/app/utils/toastHelper'
import {useListView} from '../../core/ListViewProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'
import {DispositivoBiometrico} from '../../core/_models'
import {
  syncBiometricoMarcaciones,
  syncBiometricoUsuarios,
  testDeviceConnection,
  testDeviceVoice,
} from '../../core/_requests'

type Props = {
  dispositivos: DispositivoBiometrico[]
}

const BiometricoSummaryStrip: FC<Props> = ({dispositivos}) => {
  const summary = buildSummary(dispositivos)

  return (
    <div className='row g-3 mb-6'>
      {/* <CompactSummaryCard
        title='Total'
        value={summary.total}
        tone='primary'
        icon='fingerprint-scanning'
      />
      <CompactSummaryCard
        title='Activos'
        value={summary.activos}
        tone='success'
        icon='check-circle'
      />
      <CompactSummaryCard
        title='Usuarios'
        value={summary.totalUsuarios}
        tone='info'
        icon='people'
      />
      <CompactSummaryCard
        title='ADMS'
        value={summary.admsPrincipal}
        tone='primary'
        icon='arrow-up-refraction'
      />
      <CompactSummaryCard
        title='TCP Pull'
        value={summary.tcpPrincipal}
        tone='warning'
        icon='abstract-39'
      />
      <CompactSummaryCard
        title='Sin sync'
        value={summary.pendientesSync}
        tone='danger'
        icon='information-4'
      /> */}
    </div>
  )
}

const BiometricoDashboard: FC<Props> = ({dispositivos}) => {
  return (
    <div className='px-7 pb-7'>
      <div className='row g-6'>
        {dispositivos.map((dispositivo) => (
          <div
            key={String(dispositivo.id_biometrico ?? dispositivo.serial)}
            className='col-12 col-md-6 col-xxl-4'
          >
            <BiometricoCard dispositivo={dispositivo} />
          </div>
        ))}
      </div>
    </div>
  )
}

const CompactSummaryCard: FC<{
  title: string
  value: number
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dark'
  icon: string
}> = ({title, value, tone, icon}) => (
  <div className='col-6 col-md-4 col-xl-2'>
    <div className={`card h-100 border border-2 border-${resolveBorderTone(tone)}`}>
      <div className='card-body py-4 px-4'>
        <div className='d-flex align-items-center justify-content-between gap-3'>
          <div>
            <div
              className={`text-${
                tone === 'warning' ? 'gray-800' : tone
              } fw-bold fs-8 text-uppercase mb-1`}
            >
              {title}
            </div>
            <div className='fw-bolder fs-2 text-gray-900'>{value}</div>
          </div>
          <div className={`symbol symbol-40px`}>
            <div
              className={`symbol-label bg-light-${resolveBgTone(
                tone
              )} border border-${resolveBorderTone(tone)}`}
            >
              <KTIcon
                iconName={icon}
                className={`fs-3 text-${tone === 'warning' ? 'warning' : tone}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const BiometricoCard: FC<{dispositivo: DispositivoBiometrico}> = ({dispositivo}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {query} = useQueryResponse()
  const {setItemIdForUpdate, setIsShow} = useListView()
  const [accionEnCurso, setAccionEnCurso] = useState<
    'ping' | 'sonar' | 'usuarios' | 'marcaciones' | null
  >(null)

  const invalidateList = () =>
    queryClient.invalidateQueries([`${QUERIES.DISPOSITIVOS_BIOMETRICOS_LIST}-${query}`])

  const ejecutarAccion = async (
    accion: 'ping' | 'sonar' | 'usuarios' | 'marcaciones',
    callback: () => Promise<void>
  ) => {
    if (accionEnCurso) return
    setAccionEnCurso(accion)
    try {
      await callback()
    } finally {
      setAccionEnCurso(null)
    }
  }

  const handlePing = async () => {
    await ejecutarAccion('ping', async () => {
      try {
        const response = await testDeviceConnection(dispositivo.id_biometrico)
        showToast({
          type: response?.status === 'pass' ? 'success' : 'warning',
          message: response?.message || 'Prueba de conexión ejecutada.',
        })
        invalidateList()
      } catch (error: any) {
        showToast({
          type: 'error',
          message:
            error?.response?.data?.message || 'No se pudo probar la conexión del biométrico.',
        })
      }
    })
  }

  const handleSonar = async () => {
    await ejecutarAccion('sonar', async () => {
      try {
        const response = await testDeviceVoice(dispositivo.id_biometrico, {voice_index: 10})
        showToast({
          type: response?.status === 'success' ? 'success' : 'warning',
          message: response?.message || 'Prueba de sonido ejecutada.',
        })
        invalidateList()
      } catch (error: any) {
        showToast({
          type: 'error',
          message: error?.response?.data?.message || 'No se pudo ejecutar la prueba de sonido.',
        })
      }
    })
  }

  const handleSyncUsuarios = async () => {
    await ejecutarAccion('usuarios', async () => {
      try {
        const response = await syncBiometricoUsuarios(dispositivo.id_biometrico)
        showToast({
          type: 'success',
          message: `Usuarios sincronizados. Recibidos: ${response.total_recibidos}, insertados: ${response.insertados}, actualizados: ${response.actualizados}.`,
        })
        invalidateList()
      } catch (error: any) {
        showToast({
          type: 'error',
          message: error?.response?.data?.message || 'No se pudo sincronizar usuarios.',
        })
      }
    })
  }

  const handleSyncMarcaciones = async () => {
    const today = new Date().toISOString().slice(0, 11)
    const {value, isConfirmed} = await Swal.fire({
      title: 'Sincronizar marcaciones',
      html: `
        <div class="text-start">
          <label class="form-label">Fecha desde</label>
          <input id="fecha_desde_sync_card" type="date" class="swal2-input" value="${today}" style="display:block;width:100%;margin:0 0 12px 0;">
          <label class="form-label">Fecha hasta</label>
          <input id="fecha_hasta_sync_card" type="date" class="swal2-input" value="${today}" style="display:block;width:100%;margin:0;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Sincronizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const fechaDesde =
          (document.getElementById('fecha_desde_sync_card') as HTMLInputElement | null)?.value || ''
        const fechaHasta =
          (document.getElementById('fecha_hasta_sync_card') as HTMLInputElement | null)?.value || ''
        if (!fechaDesde || !fechaHasta) {
          Swal.showValidationMessage('Debe completar ambas fechas.')
          return
        }
        return {fechaDesde, fechaHasta}
      },
    })

    if (!isConfirmed || !value) return

    await ejecutarAccion('marcaciones', async () => {
      try {
        const response = await syncBiometricoMarcaciones(dispositivo.id_biometrico, {
          fecha_desde: value.fechaDesde,
          fecha_hasta: value.fechaHasta,
        })
        showToast({
          type: 'success',
          message: `Marcaciones sincronizadas. Raw insertadas: ${response.raw_insertadas}, normalizadas: ${response.normalizadas_insertadas}.`,
        })
        invalidateList()
      } catch (error: any) {
        showToast({
          type: 'error',
          message: error?.response?.data?.message || 'No se pudo sincronizar marcaciones.',
        })
      }
    })
  }

  const openEdit = () => {
    setItemIdForUpdate(dispositivo.id_biometrico || null)
    setIsShow(true)
  }

  const tone = resolveStatusTone(dispositivo)
  const cardTone = resolveCardBorderTone(dispositivo)
  const accionesBloqueadas = accionEnCurso !== null

  return (
    <div className={`card card-flush h-100 border border-2 border-${cardTone}`}>
      <div className='card-header pt-6'>
        <div className='d-flex flex-column'>
          <div className='d-flex align-items-center gap-2 flex-wrap mb-2'>
            <span className={`badge badge-light-${tone}`}>{resolveStatusLabel(dispositivo)}</span>
            <span
              className={`badge badge-light-${
                dispositivo.fuente_principal_marcacion === 'ADMS' ? 'primary' : 'warning'
              }`}
            >
              Principal {dispositivo.fuente_principal_marcacion || 'TCP_PULL'}
            </span>
            <span className='badge badge-light-info'>
              {dispositivo.metodo_ingesta_marcacion || 'TCP_PULL'}
            </span>
          </div>
          <div className='fw-bolder fs-4 text-gray-900'>
            {dispositivo.nombre_dispositivo || 'Biométrico'}
          </div>
          <div className='text-muted fs-7'>Serial {dispositivo.serial || '-'}</div>
        </div>
      </div>
      <div className='card-body pt-2 d-flex flex-column'>
        <div className='d-flex align-items-center gap-4 mb-5'>
          <div className={`symbol symbol-60px`}>
            <div className={`symbol-label bg-light-${tone} border border-${cardTone}`}>
              <KTIcon iconName='fingerprint-scanning' className={`fs-2 text-${tone}`} />
            </div>
          </div>
          <div className='flex-grow-1'>
            <div className='fw-semibold text-gray-900'>
              {dispositivo.direccion_ip || 'Sin dirección principal'}
            </div>
            <div className='text-muted fs-8'>
              Puerto {dispositivo.puerto || '-'}
              {dispositivo.ubicacion ? ` · ${dispositivo.ubicacion}` : ''}
            </div>
            {dispositivo.direccion_ip_dns && (
              <div className='text-muted fs-8'>DNS {dispositivo.direccion_ip_dns}</div>
            )}
          </div>
        </div>

        <div className='row g-4 mb-5'>
          <Metric
            label='Usuarios'
            value={String(dispositivo.total_usuarios ?? 0)}
            icon='people'
            tone='primary'
          />
          <Metric
            label='Admins'
            value={String(dispositivo.total_usuarios_admin ?? 0)}
            icon='shield-tick'
            tone='info'
          />
          <Metric
            label='Sync usuarios'
            value={formatDate(dispositivo.ultima_sincronizacion_usuarios)}
            icon='arrows-loop'
            tone='success'
          />
          <Metric
            label='Pendientes'
            value={String(dispositivo.total_usuarios_sin_persona ?? 0)}
            icon='information-4'
            tone={Number(dispositivo.total_usuarios_sin_persona ?? 0) > 0 ? 'warning' : 'success'}
          />
          <Metric
            label='Sync marcaciones'
            value={formatDate(dispositivo.ultima_sincronizacion_marcaciones)}
            icon='clock'
            tone='warning'
          />
          <Metric
            label='Bajo demanda'
            value={dispositivo.permite_consulta_bajo_demanda === 1 ? 'Sí' : 'No'}
            icon='abstract-39'
            tone='dark'
          />
        </div>

        <div className='d-flex flex-wrap gap-2 mb-5'>
          <span
            className={`badge badge-light-${
              dispositivo.job_nocturno_habilitado === 1 ? 'success' : 'secondary'
            }`}
          >
            Job nocturno {dispositivo.job_nocturno_habilitado === 1 ? 'sí' : 'no'}
          </span>
          {dispositivo.estado_sincronizacion?.usa_tcp_pull_como_respaldo && (
            <span className='badge badge-light-info'>TCP respaldo</span>
          )}
          {dispositivo.mac_address && (
            <span className='badge badge-light-dark'>MAC {dispositivo.mac_address}</span>
          )}
        </div>

        <div className='separator my-4' />

        <div className='mt-auto'>
          <div className='d-flex gap-2 mb-2'>
            <button
              className='btn btn-sm btn-primary flex-grow-1'
              onClick={() => navigate(`/apps/biometricos/${dispositivo.id_biometrico}/administrar`)}
            >
              <i className='bi bi-sliders me-2' />
              Administrar
            </button>
            <button className='btn btn-sm btn-light flex-shrink-0' onClick={openEdit}>
              <i className='bi bi-pencil me-0' />
            </button>
          </div>
          <div className='d-flex flex-wrap gap-2'>
            <button
              className='btn btn-sm btn-light-primary'
              onClick={handlePing}
              disabled={accionesBloqueadas}
            >
              {accionEnCurso === 'ping' ? (
                <span className='spinner-border spinner-border-sm me-2' />
              ) : (
                <i className='bi bi-broadcast-pin me-2' />
              )}
              {accionEnCurso === 'ping' ? 'Probando...' : 'Ping'}
            </button>
            <button
              className='btn btn-sm btn-light-info'
              onClick={handleSonar}
              disabled={accionesBloqueadas}
            >
              {accionEnCurso === 'sonar' ? (
                <span className='spinner-border spinner-border-sm me-2' />
              ) : (
                <i className='bi bi-volume-up me-2' />
              )}
              {accionEnCurso === 'sonar' ? 'Sonando...' : 'Sonar'}
            </button>
            <button
              className='btn btn-sm btn-light-success'
              onClick={handleSyncUsuarios}
              disabled={accionesBloqueadas}
            >
              {accionEnCurso === 'usuarios' ? (
                <span className='spinner-border spinner-border-sm me-2' />
              ) : (
                <i className='bi bi-people me-2' />
              )}
              {accionEnCurso === 'usuarios' ? 'Sincronizando...' : 'Usuarios'}
            </button>
            <button
              className='btn btn-sm btn-light-warning'
              onClick={handleSyncMarcaciones}
              disabled={accionesBloqueadas}
            >
              {accionEnCurso === 'marcaciones' ? (
                <span className='spinner-border spinner-border-sm me-2' />
              ) : (
                <i className='bi bi-clock-history me-2' />
              )}
              {accionEnCurso === 'marcaciones' ? 'Sincronizando...' : 'Marcaciones'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Metric: FC<{
  label: string
  value: string
  icon: string
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dark'
}> = ({label, value, icon, tone}) => (
  <div className='col-6'>
    <div className={`rounded border border-${resolveBorderTone(tone)} p-3 h-100`}>
      <div className='d-flex align-items-center gap-2 mb-1'>
        <KTIcon iconName={icon} className={`fs-5 text-${tone === 'warning' ? 'warning' : tone}`} />
        <div className='text-muted fs-8'>{label}</div>
      </div>
      <div className='fw-semibold fs-7 text-gray-900'>{value}</div>
    </div>
  </div>
)

const resolveStatusTone = (dispositivo: DispositivoBiometrico) => {
  if (dispositivo.estado === 'mantenimiento') return 'info'
  if (dispositivo.estado === 'inactivo') return 'danger'
  if (!dispositivo.ultima_sincronizacion) return 'warning'

  const diffMinutes =
    (Date.now() - new Date(dispositivo.ultima_sincronizacion).getTime()) / (1000 * 60)
  if (diffMinutes < 30) return 'success'
  if (diffMinutes < 60) return 'warning'
  return 'danger'
}

const resolveStatusLabel = (dispositivo: DispositivoBiometrico) => {
  if (dispositivo.estado === 'mantenimiento') return 'Mantenimiento'
  if (dispositivo.estado === 'inactivo') return 'Inactivo'
  if (!dispositivo.ultima_sincronizacion) return 'Sin reporte'

  const diffMinutes =
    (Date.now() - new Date(dispositivo.ultima_sincronizacion).getTime()) / (1000 * 60)
  if (diffMinutes < 30) return 'En línea'
  if (diffMinutes < 60) return 'Atrasado'
  return 'Sin reporte'
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin registro'
  return value.replace('T', ' ').slice(0, 16)
}

const resolveBorderTone = (
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dark'
) => {
  if (tone === 'dark') return 'gray-300'
  return tone
}

const resolveBgTone = (tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dark') => {
  if (tone === 'dark') return 'secondary'
  return tone
}

const resolveCardBorderTone = (dispositivo: DispositivoBiometrico) => {
  if (dispositivo.estado === 'mantenimiento') return 'warning'
  if (dispositivo.estado === 'inactivo') return 'gray-400'
  if (!dispositivo.ultima_sincronizacion_usuarios || !dispositivo.ultima_sincronizacion_marcaciones)
    return 'warning'
  return 'primary'
}

const buildSummary = (dispositivos: DispositivoBiometrico[]) => ({
  total: dispositivos.length,
  activos: dispositivos.filter((item) => item.estado === 'activo').length,
  totalUsuarios: dispositivos.reduce((acc, item) => acc + Number(item.total_usuarios ?? 0), 0),
  admsPrincipal: dispositivos.filter((item) => item.fuente_principal_marcacion === 'ADMS').length,
  tcpPrincipal: dispositivos.filter((item) => item.fuente_principal_marcacion === 'TCP_PULL')
    .length,
  mixtos: dispositivos.filter((item) => item.metodo_ingesta_marcacion === 'MIXTO').length,
  usuariosSincronizados: dispositivos.filter((item) => !!item.ultima_sincronizacion_usuarios)
    .length,
  pendientesSync: dispositivos.filter((item) => !item.ultima_sincronizacion_marcaciones).length,
  mantenimiento: dispositivos.filter((item) => item.estado === 'mantenimiento').length,
})

export {BiometricoDashboard, BiometricoSummaryStrip}
