import {useState, useCallback} from 'react'
import {useQuery, useQueryClient} from 'react-query'
import Swal from 'sweetalert2'
import {KTCard, KTCardBody, KTIcon, QUERIES} from 'src/_metronic/helpers'
import {getHorarioSemana, generarSemana} from './core/_requests'
import {AsignacionDia, ConfiguracionCiclo, HorarioBusquedaTarget} from './core/_models'
import {WeekNavigator} from './components/WeekNavigator'
import {HorarioCalendario} from './components/HorarioCalendario'
import {HorarioTabla} from './components/HorarioTabla'
import {ConfiguracionModal} from './components/ConfiguracionModal'
import {AsignacionModal} from './components/AsignacionModal'
import {BuscarGuardiaModal} from './components/BuscarGuardiaModal'
import {usePermissions} from 'src/app/modules/auth/hooks/usePermissions'

const getLunesActual = (): string => {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  hoy.setDate(hoy.getDate() + diff)
  return hoy.toISOString().slice(0, 10)
}

const addWeeks = (fecha: string, n: number): string => {
  const d = new Date(fecha + 'T12:00:00')
  d.setDate(d.getDate() + n * 7)
  return d.toISOString().slice(0, 10)
}

const getLunesDeFecha = (fecha: string): string => {
  const dia = new Date(fecha + 'T12:00:00')
  const dayOfWeek = dia.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  dia.setDate(dia.getDate() + diff)
  return dia.toISOString().slice(0, 10)
}

type Vista = 'calendario' | 'tabla'

const HorarioPage = () => {
  const {guardiaSeguridad} = usePermissions()
  const queryClient = useQueryClient()
  const [fechaInicio, setFechaInicio] = useState<string>(getLunesActual)
  const [vista, setVista] = useState<Vista>('calendario')
  const [showCalendarInfo, setShowCalendarInfo] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [asignacionModal, setAsignacionModal] = useState<{fecha: string; asignacion?: AsignacionDia} | null>(null)
  const [showBuscarModal, setShowBuscarModal] = useState(false)
  const [focusTarget, setFocusTarget] = useState<HorarioBusquedaTarget | null>(null)
  const [generando, setGenerando] = useState(false)

  const queryKey = `${QUERIES.GUARDIA_HORARIO}-${fechaInicio}`

  const {data: horario, isLoading, refetch} = useQuery(
    queryKey,
    () => getHorarioSemana(fechaInicio),
    {cacheTime: 0, refetchOnWindowFocus: false}
  )

  const handleGenerarSemana = async () => {
    if (!horario?.configuracion) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin configuración',
        text: 'Configure primero la fecha de inicio del ciclo de rotación.',
      })
      return
    }

    const result = await Swal.fire({
      title: '¿Generar horario de la semana?',
      html: `Se crearán automáticamente las asignaciones <strong>Lunes a Viernes</strong> basadas en la rotación del ciclo.<br><br>
             Las asignaciones manuales y de emergencia existentes <strong>no serán afectadas</strong>.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) return
    setGenerando(true)
    try {
      const res = await generarSemana(fechaInicio)
      await Swal.fire({
        icon: 'success',
        title: 'Horario generado',
        text: `Se crearon ${res.asignaciones_creadas} asignaciones.`,
        timer: 2500,
        showConfirmButton: false,
      })
      refetch()
    } catch (e: any) {
      Swal.fire({icon: 'error', title: 'Error', text: e?.response?.data?.message || 'No se pudo generar el horario'})
    } finally {
      setGenerando(false)
    }
  }

  const handleAsignacionSaved = useCallback(() => {
    setAsignacionModal(null)
    refetch()
  }, [refetch])

  const handleConfigSaved = useCallback((cfg: ConfiguracionCiclo) => {
    setShowConfigModal(false)
    refetch()
  }, [refetch])

  return (
    <>
      <KTCard>
        {/* Toolbar */}
        <div className='card-header border-0 pt-6'>
          <div className='card-title'>
            <h3 className='fw-bolder'>
              <KTIcon iconName='calendar' className='fs-2 me-2 text-primary' />
              Horario Semanal de Guardias
            </h3>
          </div>
          <div className='card-toolbar d-flex gap-2'>
            {/* Selector de vista */}
            <div className='btn-group'>
                <button
                  className={`btn btn-sm ${vista === 'calendario' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setVista('calendario')}
                >
                <KTIcon iconName='calendar-2' className='fs-4 me-1' />
                Calendario
              </button>
              <button
                className={`btn btn-sm ${vista === 'tabla' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setVista('tabla')}
                title='Vista tabla'
              >
                <KTIcon iconName='abstract-14' className='fs-4 me-1' />
                Tabla
              </button>
            </div>

            <button
              className='btn btn-light-primary btn-sm'
              onClick={() => setShowBuscarModal(true)}
              title='Buscar guardia en la semana'
              disabled={isLoading || !horario}
            >
              <KTIcon iconName='magnifier' className='fs-4 me-1' />
              Buscar guardia
            </button>

            {guardiaSeguridad.canManage && (
              <>
                <button
                  className='btn btn-light-success btn-sm'
                  onClick={handleGenerarSemana}
                  disabled={generando || isLoading}
                  title='Generar asignaciones Lun-Vie basadas en rotación'
                >
                  {generando ? (
                    <><span className='spinner-border spinner-border-sm me-2'></span>Generando...</>
                  ) : (
                    <><KTIcon iconName='arrows-circle' className='fs-4 me-1' />Generar semana</>
                  )}
                </button>
                <button
                  className='btn btn-light-info btn-sm'
                  onClick={() => setShowConfigModal(true)}
                  title='Configurar fecha de inicio del ciclo'
                >
                  <KTIcon iconName='setting-2' className='fs-4 me-1' />
                  Configurar ciclo
                </button>
              </>
            )}
          </div>
        </div>

        <KTCardBody className='py-4'>
          {/* Navegador de semanas */}
          <WeekNavigator
            fechaInicio={fechaInicio}
            onPrev={() => setFechaInicio(addWeeks(fechaInicio, -1))}
            onNext={() => setFechaInicio(addWeeks(fechaInicio, 1))}
            onHoy={() => setFechaInicio(getLunesActual())}
            onSelectDate={(fecha) => fecha && setFechaInicio(getLunesDeFecha(fecha))}
            posicionCiclo={horario?.semana?.posicion_ciclo ?? null}
            numeroCiclo={horario?.semana?.numero_ciclo ?? null}
            showInfoToggle={vista === 'calendario'}
            infoOpen={showCalendarInfo}
            onToggleInfo={() => setShowCalendarInfo((prev) => !prev)}
          />

          {/* Sin configuración */}
          {!isLoading && !horario?.configuracion && (
            <div className='notice d-flex bg-light-warning rounded border-warning border border-dashed p-4 mb-5'>
              <KTIcon iconName='information-5' className='fs-2tx text-warning me-3' />
              <div>
                <div className='fw-bolder'>Ciclo de rotación no configurado</div>
                <div className='text-muted'>
                  Configure la fecha de inicio del ciclo para que el sistema calcule automáticamente los turnos semanales.
                  {guardiaSeguridad.canManage && (
                    <button className='btn btn-link btn-sm p-0 ms-2' onClick={() => setShowConfigModal(true)}>
                      Configurar ahora →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Leyenda de turnos */}
          {vista === 'calendario' && horario && (
            <div
              style={{
                display: 'grid',
                gridTemplateRows: showCalendarInfo ? '1fr' : '0fr',
                opacity: showCalendarInfo ? 1 : 0,
                transition: 'grid-template-rows 180ms ease, opacity 180ms ease',
              }}
              className='mb-5'
            >
              <div style={{overflow: 'hidden'}}>
                <div className='rounded border border-dashed border-gray-300 bg-light p-4 mt-1'>
                  <div className='d-flex flex-wrap gap-3'>
                    {horario.turnos.map((t) => (
                      <div
                        key={t.id_guardia_turno}
                        className='d-flex align-items-center gap-2 px-3 py-2 rounded'
                        style={{background: t.color + '15', border: `1px solid ${t.color}40`}}
                      >
                        <span className='bullet bullet-dot' style={{background: t.color}}></span>
                        <span className='fw-bold fs-7 text-uppercase' style={{color: t.color}}>
                          {t.nombre}
                        </span>
                        <span className='text-muted fs-8'>
                          {t.hora_inicio.slice(0,5)}-{t.hora_fin.slice(0,5)}
                        </span>
                      </div>
                    ))}
                    <div className='d-flex align-items-center gap-1 px-2 py-1 rounded bg-white border fs-8 text-muted'>
                      <span className='badge badge-light-danger me-1 py-1'>EMG</span>= Emergencia
                      <span className='badge badge-light-warning ms-2 me-1 py-1'>MAN</span>= Manual
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido */}
          {isLoading ? (
            <div className='d-flex justify-content-center align-items-center py-15'>
              <span className='spinner-border text-primary' style={{width: '3rem', height: '3rem'}}></span>
            </div>
          ) : !horario ? (
            <div className='text-center text-muted py-15'>Error al cargar el horario</div>
          ) : vista === 'calendario' ? (
            <HorarioCalendario
              horario={horario}
              canManage={guardiaSeguridad.canManage}
              focusTarget={focusTarget}
              onEditAsignacion={(fecha, asig) => setAsignacionModal({fecha, asignacion: asig})}
            />
          ) : (
            <HorarioTabla horario={horario} focusTarget={focusTarget} />
          )}
        </KTCardBody>
      </KTCard>

      {/* Modal configuración ciclo */}
      {showConfigModal && (
        <ConfiguracionModal
          configuracion={horario?.configuracion ?? null}
          onClose={() => setShowConfigModal(false)}
          onSaved={handleConfigSaved}
        />
      )}

      {showBuscarModal && horario && (
        <BuscarGuardiaModal
          horario={horario}
          onClose={() => setShowBuscarModal(false)}
          onFound={(target) => {
            setFocusTarget({...target})
            setShowBuscarModal(false)
          }}
        />
      )}

      {/* Modal asignación individual */}
      {asignacionModal && horario && (
        <AsignacionModal
          fecha={asignacionModal.fecha}
          asignacion={asignacionModal.asignacion}
          turnos={horario.turnos}
          grupos={horario.grupos}
          onClose={() => setAsignacionModal(null)}
          onSaved={handleAsignacionSaved}
        />
      )}
    </>
  )
}

export {HorarioPage}
