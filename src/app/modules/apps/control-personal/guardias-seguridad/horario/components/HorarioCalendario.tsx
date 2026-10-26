import {useEffect, useMemo, useRef, useState} from 'react'
import Tooltip from '@mui/material/Tooltip'
import {HorarioSemanalResponse, TurnoInfo, GrupoInfo, AsignacionDia, HorarioBusquedaTarget} from '../core/_models'
import {KTIcon} from 'src/_metronic/helpers'

type Props = {
  horario: HorarioSemanalResponse
  onEditAsignacion?: (fecha: string, asignacion?: AsignacionDia) => void
  canManage: boolean
  focusTarget?: HorarioBusquedaTarget | null
}

const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const COLLAPSE_ANIMATION_MS = 220
const TAB_ANIMATION_MS = 140

const TurnoLabel = ({turno}: {turno: TurnoInfo}) => (
  <div
    className='d-flex flex-column align-items-center justify-content-center px-3 py-2 rounded mb-1'
    style={{background: turno.color + '22', borderLeft: `3px solid ${turno.color}`}}
  >
    <span className='fw-bolder fs-7' style={{color: turno.color}}>
      {turno.nombre}
    </span>
    <span className='text-muted fs-8'>
      {turno.hora_inicio.slice(0, 5)}-{turno.hora_fin.slice(0, 5)}
    </span>
  </div>
)

const GuardiaChip = ({
  asignacion,
  onEdit,
  canManage,
  highlighted,
}: {
  asignacion: AsignacionDia
  onEdit?: () => void
  canManage: boolean
  highlighted?: boolean
}) => {
  const nombre = `${asignacion.paterno} ${asignacion.nombre_persona}`
  const esEmergencia = asignacion.tipo_origen === 'EMERGENCIA'
  const esManual = asignacion.tipo_origen === 'MANUAL'
  const esReemplazo = esEmergencia && !!asignacion.id_persona_titular
  const nombreTitular = `${asignacion.titular_paterno ?? ''} ${asignacion.titular_materno ?? ''} ${asignacion.titular_nombre_persona ?? asignacion.titular_nombre ?? ''}`.replace(/\s+/g, ' ').trim()
  const titularCubierto = !esReemplazo && !!asignacion.reemplazo_activo
  const nombreReemplazo = `${asignacion.reemplazo_paterno ?? ''} ${asignacion.reemplazo_materno ?? ''} ${asignacion.reemplazo_nombre_persona ?? asignacion.reemplazo_nombre ?? ''}`.replace(/\s+/g, ' ').trim()

  const contenido = (
    <div
      className={`d-flex align-items-center justify-content-between rounded px-2 py-1 mb-1 ${
        canManage ? 'cursor-pointer hover-bg-light' : ''
      }`}
      style={{
        background: esReemplazo ? '#fff5f8' : '#f5f8fa',
        border: esReemplazo
          ? '1px solid rgba(241, 65, 108, 0.35)'
          : esEmergencia
            ? '1px solid #f1416c'
            : esManual
              ? '1px dashed #ffc700'
              : highlighted
                ? `1px solid ${asignacion.color_turno}`
                : 'none',
        boxShadow: highlighted ? `0 0 0 3px ${asignacion.color_turno}22` : 'none',
        transition: 'box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease',
      }}
      onClick={canManage ? onEdit : undefined}
    >
      <div className='d-flex align-items-center gap-2'>
        <div className='symbol symbol-25px'>
          <span
            className='symbol-label fs-9 fw-bold'
            style={{background: asignacion.color_turno + '33', color: asignacion.color_turno}}
          >
            {asignacion.paterno?.charAt(0)}
            {asignacion.nombre_persona?.charAt(0)}
          </span>
        </div>
        <div>
          <div className='fw-bold fs-8 text-dark lh-1'>{nombre}</div>
          {titularCubierto && (
            <div className='fs-9 text-warning d-flex align-items-center gap-1 mt-1'>
              Cubierto por {nombreReemplazo || 'otro guardia'}
            </div>
          )}
          {esReemplazo && (
            <div className='fs-9 text-danger d-flex align-items-center gap-1 mt-1'>
              <KTIcon iconName='arrows-loop' className='fs-8 text-danger' />
              Reemplaza a {nombreTitular || 'guardia titular'}
            </div>
          )}
          {asignacion.nombre_bloque && (
            <div className='text-muted fs-9'>
              <KTIcon iconName='geolocation' className='fs-9 me-1' />
              {asignacion.nombre_bloque}
            </div>
          )}
        </div>
      </div>
      {titularCubierto && <span className='badge badge-light-warning badge-sm py-1 px-2'>CBR</span>}
      {esReemplazo && <span className='badge badge-light-danger badge-sm py-1 px-2'>RPL</span>}
      {esEmergencia && !esReemplazo && <span className='badge badge-light-danger badge-sm py-1 px-2'>EMG</span>}
      {esManual && !esEmergencia && <span className='badge badge-light-warning badge-sm py-1 px-2'>MAN</span>}
    </div>
  )

  if (titularCubierto) {
    return (
      <Tooltip
        title={`Cubierto por ${nombreReemplazo || 'otro guardia'}. Haz clic para editar el reemplazo activo.`}
        arrow
      >
        <div>{contenido}</div>
      </Tooltip>
    )
  }

  if (esReemplazo) {
    return (
      <Tooltip title={`Reemplazo de ${nombreTitular || 'guardia titular'}`} arrow>
        <div>{contenido}</div>
      </Tooltip>
    )
  }

  return contenido
}

const HorarioCalendario = ({horario, onEditAsignacion, canManage, focusTarget}: Props) => {
  const {dias, turnos, grupos, semana} = horario
  const [expandedCards, setExpandedCards] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'laboral' | 'fin_semana'>('laboral')
  const [renderedTab, setRenderedTab] = useState<'laboral' | 'fin_semana'>('laboral')
  const [tabStage, setTabStage] = useState<'in' | 'out'>('in')
  const [highlightedAsignacionId, setHighlightedAsignacionId] = useState<number | null>(null)
  const highlightedCardRef = useRef<HTMLDivElement | null>(null)

  const rotacionSemana = useMemo(() => {
    if (!semana.posicion_ciclo || !grupos.length || !turnos.length) return {}
    const map: Record<number, GrupoInfo[]> = {}
    const totalTurnos = turnos.length
    grupos.forEach((grupo) => {
      const turnoIdx = ((grupo.orden - 1) + (semana.posicion_ciclo! - 1)) % totalTurnos
      const idTurno = turnos[turnoIdx].id_guardia_turno
      if (!map[idTurno]) {
        map[idTurno] = []
      }
      map[idTurno].push(grupo)
    })
    return map
  }, [grupos, turnos, semana.posicion_ciclo])

  const toggleCard = (key: string) => {
    setExpandedCards((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]))
  }

  useEffect(() => {
    if (activeTab === renderedTab) return

    setTabStage('out')

    const timer = window.setTimeout(() => {
      setRenderedTab(activeTab)
      setTabStage('in')
    }, TAB_ANIMATION_MS)

    return () => window.clearTimeout(timer)
  }, [activeTab, renderedTab])

  useEffect(() => {
    if (!focusTarget?.fecha || !focusTarget.id_persona) return

    const dia = dias.find((item) => item.fecha === focusTarget.fecha)
    if (!dia) return

    const asignacion = dia.asignaciones.find((item) => item.id_persona === focusTarget.id_persona)
    if (!asignacion) return

    setActiveTab(dia.es_fin_semana ? 'fin_semana' : 'laboral')

    if (focusTarget.id_guardia_grupo && focusTarget.id_guardia_turno) {
      const cardKey = `${focusTarget.fecha}-${focusTarget.id_guardia_turno}-${focusTarget.id_guardia_grupo}`
      setExpandedCards((prev) => (prev.includes(cardKey) ? prev : [...prev, cardKey]))
    }

    setHighlightedAsignacionId(asignacion.id_guardia_asignacion)
    const timer = window.setTimeout(() => setHighlightedAsignacionId(null), 4200)
    return () => window.clearTimeout(timer)
  }, [focusTarget, dias])

  useEffect(() => {
    if (!highlightedAsignacionId) return

    const timer = window.setTimeout(() => {
      highlightedCardRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'})
    }, 220)

    return () => window.clearTimeout(timer)
  }, [highlightedAsignacionId, renderedTab])

  const diasLaborales = dias.filter((dia) => !dia.es_fin_semana)
  const diasFinDeSemana = dias.filter((dia) => dia.es_fin_semana)
  const diasVisibles = renderedTab === 'laboral' ? diasLaborales : diasFinDeSemana

  const renderTabla = (diasTabla: typeof dias) => (
    <div className='table-responsive'>
      <table className='table table-bordered align-middle fs-7 mb-0' style={{minWidth: '760px'}}>
        <thead>
          <tr>
            <th className='w-120px bg-light text-center text-uppercase text-muted fw-bolder fs-8 py-3'>
              Turno
            </th>
            {diasTabla.map((dia, i) => {
              const fecha = new Date(dia.fecha + 'T12:00:00')
              const esHoy = dia.fecha === new Date().toISOString().slice(0, 10)
              return (
                <th
                  key={dia.fecha}
                  className={`text-center py-3 ${dia.es_fin_semana ? 'bg-light-warning' : 'bg-light'} ${esHoy ? 'border-primary' : ''}`}
                  style={esHoy ? {borderBottom: '3px solid #009ef7'} : {}}
                >
                  <div className={`fw-bolder fs-7 ${esHoy ? 'text-primary' : 'text-dark'}`}>
                    {DIAS_CORTOS[dias.findIndex((item) => item.fecha === dia.fecha)]}
                  </div>
                  <div className={`fs-8 ${esHoy ? 'text-primary' : 'text-muted'}`}>
                    {fecha.getDate()}/{fecha.getMonth() + 1}
                  </div>
                  {dia.es_fin_semana && <span className='badge badge-light-warning fs-9 mt-1'>Fin de semana</span>}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {turnos.map((turno) => (
            <tr key={turno.id_guardia_turno} style={{verticalAlign: 'top'}}>
              <td className='bg-light py-3 text-center'>
                <TurnoLabel turno={turno} />
              </td>

              {diasTabla.map((dia) => {
                const asignacionesDia = dia.asignaciones
                  .filter((a) => a.id_guardia_turno === turno.id_guardia_turno)
                  .sort((a, b) => {
                    const aPeso = a.reemplazo_activo ? 0 : a.tipo_origen === 'EMERGENCIA' && !!a.id_persona_titular ? 2 : 1
                    const bPeso = b.reemplazo_activo ? 0 : b.tipo_origen === 'EMERGENCIA' && !!b.id_persona_titular ? 2 : 1
                    return aPeso - bPeso
                  })

                const asignacionPorId = new Map(asignacionesDia.map((item) => [item.id_guardia_asignacion, item]))
                const gruposRotacion = !dia.es_fin_semana ? rotacionSemana[turno.id_guardia_turno] ?? [] : []

                const gruposEnCelda = (() => {
                  const groupsMap = new Map<
                    string,
                    {
                      key: string
                      nombre: string
                      cantidadEsperada?: number
                      asignaciones: AsignacionDia[]
                      color: string
                      esVirtual: boolean
                    }
                  >()

                  asignacionesDia.forEach((asig) => {
                    const grupoId = asig.id_guardia_grupo ? String(asig.id_guardia_grupo) : 'sin-grupo'
                    const key = `${dia.fecha}-${turno.id_guardia_turno}-${grupoId}`
                    const nombre = asig.nombre_grupo || 'Sin grupo'
                    const existing = groupsMap.get(key)

                    if (existing) {
                      existing.asignaciones.push(asig)
                      return
                    }

                    groupsMap.set(key, {
                      key,
                      nombre,
                      cantidadEsperada: gruposRotacion.find((grupo) => String(grupo.id_guardia_grupo) === grupoId)?.miembros.length,
                      asignaciones: [asig],
                      color: asig.color_turno || turno.color,
                      esVirtual: false,
                    })
                  })

                  if (!dia.es_fin_semana) {
                    gruposRotacion.forEach((grupoRotacion) => {
                      const key = `${dia.fecha}-${turno.id_guardia_turno}-${grupoRotacion.id_guardia_grupo}`
                      if (!groupsMap.has(key)) {
                        groupsMap.set(key, {
                          key,
                          nombre: grupoRotacion.nombre,
                          cantidadEsperada: grupoRotacion.miembros.length,
                          asignaciones: [],
                          color: turno.color,
                          esVirtual: true,
                        })
                      }
                    })
                  }

                  return Array.from(groupsMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
                })()

                return (
                  <td
                    key={dia.fecha}
                    className={`py-2 px-2 ${dia.es_fin_semana ? 'bg-light' : ''}`}
                    style={{minWidth: '180px', maxWidth: '260px'}}
                  >
                    <div className='d-flex flex-column gap-2'>
                      {gruposEnCelda.map((grupoCard) => {
                        const open = expandedCards.includes(grupoCard.key)
                        const resumenCubiertos = grupoCard.asignaciones.filter(
                          (asig) => asig.tipo_origen !== 'EMERGENCIA' && !!asig.reemplazo_activo
                        ).length
                        const resumenReemplazos = grupoCard.asignaciones.filter(
                          (asig) => asig.tipo_origen === 'EMERGENCIA' && !!asig.id_persona_titular
                        ).length

                        return (
                          <div
                            key={grupoCard.key}
                            className='rounded overflow-hidden bg-white'
                            style={{
                              border: open ? `1px solid ${grupoCard.color}` : '1px solid var(--bs-gray-300)',
                              boxShadow: open ? `0 0 0 3px ${grupoCard.color}18` : 'none',
                              transition: `border-color ${COLLAPSE_ANIMATION_MS}ms ease, box-shadow ${COLLAPSE_ANIMATION_MS}ms ease, background-color ${COLLAPSE_ANIMATION_MS}ms ease`,
                              background: open ? `${grupoCard.color}08` : '#ffffff',
                            }}
                          >
                            <button
                              type='button'
                              className='btn btn-sm btn-active-light-primary w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-0'
                              onClick={() => toggleCard(grupoCard.key)}
                            >
                              <div className='d-flex align-items-center gap-2 min-w-0'>
                                <span
                                  className='d-inline-flex align-items-center justify-content-center rounded-circle'
                                  style={{
                                    width: 24,
                                    height: 24,
                                    background: grupoCard.color + '22',
                                    color: grupoCard.color,
                                    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: `transform ${COLLAPSE_ANIMATION_MS}ms ease`,
                                  }}
                                >
                                  <KTIcon iconName='right' className='fs-6' />
                                </span>
                                <div className='min-w-0'>
                                  <div className='fw-bolder fs-8 text-dark text-truncate'>{grupoCard.nombre}</div>
                                  <div className='text-muted fs-9'>
                                    {grupoCard.asignaciones.length}
                                    {grupoCard.cantidadEsperada ? `/${grupoCard.cantidadEsperada}` : ''} guardias
                                  </div>
                                </div>
                              </div>
                              <div className='d-flex align-items-center gap-1 ms-2'>
                                {resumenCubiertos > 0 ? (
                                  <span className='badge badge-light-warning badge-sm'>CBR {resumenCubiertos}</span>
                                ) : null}
                                {resumenReemplazos > 0 ? (
                                  <span className='badge badge-light-danger badge-sm'>RPL {resumenReemplazos}</span>
                                ) : null}
                              </div>
                            </button>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateRows: open ? '1fr' : '0fr',
                                opacity: open ? 1 : 0,
                                transition: `grid-template-rows ${COLLAPSE_ANIMATION_MS}ms ease, opacity ${COLLAPSE_ANIMATION_MS}ms ease`,
                              }}
                            >
                              <div style={{overflow: 'hidden'}}>
                                <div className='px-3 pb-3 pt-1'>
                                  {grupoCard.esVirtual ? (
                                    <div className='text-muted fs-8 text-center py-3'>
                                      <div className='fw-bold'>{grupoCard.nombre}</div>
                                      <div className='fs-9'>
                                        {grupoCard.cantidadEsperada ?? 0} guardias esperados
                                      </div>
                                      <div className='text-warning fs-9 mt-1'>Sin generar</div>
                                    </div>
                                  ) : (
                                    <>
                                      {grupoCard.asignaciones.map((asig) => (
                                        <div
                                          key={asig.id_guardia_asignacion}
                                          ref={highlightedAsignacionId === asig.id_guardia_asignacion ? highlightedCardRef : null}
                                        >
                                          <GuardiaChip
                                            asignacion={asig}
                                            canManage={canManage}
                                            highlighted={highlightedAsignacionId === asig.id_guardia_asignacion}
                                            onEdit={() =>
                                              onEditAsignacion?.(
                                                dia.fecha,
                                                asig.id_guardia_asignacion_reemplazo_actual
                                                  ? asignacionPorId.get(asig.id_guardia_asignacion_reemplazo_actual)
                                                  : asig
                                              )
                                            }
                                          />
                                        </div>
                                      ))}

                                      {canManage && !dia.es_fin_semana && grupoCard.asignaciones.length > 0 && (
                                        <div className='text-muted fs-9 mt-2 text-center'>
                                          Haz clic en un guardia para registrar su reemplazo.
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {canManage && dia.es_fin_semana && (
                        <button
                          className='btn btn-sm btn-light-primary w-100 mt-1 py-1 fs-9'
                          onClick={() => onEditAsignacion?.(dia.fecha, undefined)}
                          title='Asignar guardia este día'
                        >
                          <KTIcon iconName='plus' className='fs-7 me-1' />
                          Asignar
                        </button>
                      )}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <div className='border-bottom border-gray-200 mb-0'>
        <ul className='nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-6 fw-bolder flex-nowrap'>
          <li className='nav-item'>
            <button
              type='button'
              className={`nav-link text-active-primary me-6 px-0 pb-3 pt-2 d-flex align-items-center gap-2 ${
                activeTab === 'laboral' ? 'active' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('laboral')}
            >
              <KTIcon
                iconName='calendar-2'
                className={`fs-3 ${activeTab === 'laboral' ? 'text-primary' : 'text-gray-400'}`}
              />
              <span>Lunes a viernes</span>
            </button>
          </li>
          <li className='nav-item'>
            <button
              type='button'
              className={`nav-link text-active-primary me-6 px-0 pb-3 pt-2 d-flex align-items-center gap-2 ${
                activeTab === 'fin_semana' ? 'active' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('fin_semana')}
            >
              <KTIcon
                iconName='calendar'
                className={`fs-3 ${activeTab === 'fin_semana' ? 'text-primary' : 'text-gray-400'}`}
              />
              <span>Fin de semana</span>
            </button>
          </li>
        </ul>
      </div>

      <div
        className='bg-white pt-4'
        style={{
          opacity: tabStage === 'in' ? 1 : 0,
          transform: tabStage === 'in' ? 'translateY(0)' : 'translateY(6px)',
          transition: `opacity ${TAB_ANIMATION_MS}ms ease, transform ${TAB_ANIMATION_MS}ms ease`,
        }}
      >
        {renderTabla(diasVisibles)}
      </div>

      {!diasVisibles.length && (
        <div className='text-center text-muted py-10'>No hay días disponibles en esta vista.</div>
      )}
    </div>
  )
}

export {HorarioCalendario}
