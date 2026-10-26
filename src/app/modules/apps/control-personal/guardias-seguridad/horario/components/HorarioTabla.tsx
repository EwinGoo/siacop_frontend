import {Fragment, useEffect, useMemo, useRef, useState} from 'react'
import Tooltip from '@mui/material/Tooltip'
import {HorarioSemanalResponse, GrupoInfo, TurnoInfo, AsignacionDia, HorarioBusquedaTarget} from '../core/_models'
import {KTIcon} from 'src/_metronic/helpers'

type Props = {
  horario: HorarioSemanalResponse
  focusTarget?: HorarioBusquedaTarget | null
}

const DIAS_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const COLLAPSE_ANIMATION_MS = 240

const getTurnoRotacion = (
  grupo: GrupoInfo,
  turnos: TurnoInfo[],
  posicionCiclo: number | null
): TurnoInfo | undefined => {
  if (!turnos.length) return undefined
  const turnoIdx = posicionCiclo ? (grupo.orden - 1 + posicionCiclo - 1) % turnos.length : 0
  return turnos[turnoIdx]
}

const getNombrePersona = (persona: {
  paterno?: string
  materno?: string
  nombre?: string
}) => `${persona.paterno ?? ''} ${persona.materno ?? ''} ${persona.nombre ?? ''}`.replace(/\s+/g, ' ').trim()

const buildAsignacionBadge = (asig: AsignacionDia) => {
  const esEmg = asig.tipo_origen === 'EMERGENCIA'
  const esMan = asig.tipo_origen === 'MANUAL'
  const esReemplazo = esEmg && !!asig.id_persona_titular
  const titularCubierto = !esReemplazo && !!asig.reemplazo_activo
  const nombreTitular = `${asig.titular_paterno ?? ''} ${asig.titular_materno ?? ''} ${asig.titular_nombre_persona ?? asig.titular_nombre ?? ''}`.replace(/\s+/g, ' ').trim()
  const nombreReemplazo = `${asig.reemplazo_paterno ?? ''} ${asig.reemplazo_materno ?? ''} ${asig.reemplazo_nombre_persona ?? asig.reemplazo_nombre ?? ''}`.replace(/\s+/g, ' ').trim()

  const badge = (
    <span
      className='badge'
      style={{
        background: esReemplazo ? '#fff5f8' : titularCubierto ? '#fff8dd' : asig.color_turno + '22',
        color: esReemplazo ? '#f1416c' : titularCubierto ? '#f6b100' : asig.color_turno,
        border: esReemplazo
          ? '1px solid rgba(241, 65, 108, 0.45)'
          : titularCubierto
            ? '1px solid rgba(246, 177, 0, 0.45)'
            : esEmg
              ? '1px solid #f1416c'
              : esMan
                ? '1px dashed #ffc700'
                : `1px solid ${asig.color_turno}`,
      }}
      title={`${asig.nombre_turno} ${asig.nombre_bloque ? '· ' + asig.nombre_bloque : ''}`}
    >
      {titularCubierto ? 'CBR' : esReemplazo ? 'RPL' : esEmg ? '⚡' : esMan ? '✋' : '✓'}
      {asig.nombre_bloque ? <span className='ms-1 fs-9 fw-normal'>{asig.nombre_bloque}</span> : null}
    </span>
  )

  if (esReemplazo) {
    return (
      <Tooltip key={asig.id_guardia_asignacion} title={`Reemplazo de ${nombreTitular || 'guardia titular'}`} arrow>
        <span>{badge}</span>
      </Tooltip>
    )
  }

  if (titularCubierto) {
    return (
      <Tooltip key={asig.id_guardia_asignacion} title={`Cubierto por ${nombreReemplazo || 'otro guardia'}`} arrow>
        <span>{badge}</span>
      </Tooltip>
    )
  }

  return <span key={asig.id_guardia_asignacion}>{badge}</span>
}

const HorarioTabla = ({horario, focusTarget}: Props) => {
  const {grupos, turnos, dias, semana} = horario
  const [expandedGroups, setExpandedGroups] = useState<number[]>([])
  const [highlightedPersonaId, setHighlightedPersonaId] = useState<number | null>(null)
  const highlightedRowRef = useRef<HTMLTableRowElement | null>(null)

  const gruposConTurno = useMemo(() => {
    return [...grupos]
      .map((grupo) => ({
        ...grupo,
        turnoRotacion: getTurnoRotacion(grupo, turnos, semana.posicion_ciclo),
        miembrosOrdenados: [...grupo.miembros].sort((a, b) =>
          getNombrePersona(a).localeCompare(getNombrePersona(b), 'es')
        ),
      }))
      .sort((a, b) => {
        const aTurno = a.turnoRotacion?.id_guardia_turno ?? 999
        const bTurno = b.turnoRotacion?.id_guardia_turno ?? 999
        if (aTurno !== bTurno) return aTurno - bTurno
        return a.nombre.localeCompare(b.nombre, 'es')
      })
  }, [grupos, turnos, semana.posicion_ciclo])

  const toggleGrupo = (idGrupo: number) => {
    setExpandedGroups((prev) =>
      prev.includes(idGrupo) ? prev.filter((id) => id !== idGrupo) : [...prev, idGrupo]
    )
  }

  useEffect(() => {
    if (!focusTarget?.id_guardia_grupo || !focusTarget.id_persona) return

    setExpandedGroups((prev) =>
      prev.includes(focusTarget.id_guardia_grupo as number)
        ? prev
        : [...prev, focusTarget.id_guardia_grupo as number]
    )
    setHighlightedPersonaId(focusTarget.id_persona)

    const timer = window.setTimeout(() => setHighlightedPersonaId(null), 4200)
    return () => window.clearTimeout(timer)
  }, [focusTarget])

  useEffect(() => {
    if (!highlightedPersonaId) return

    const timer = window.setTimeout(() => {
      highlightedRowRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'})
    }, 180)

    return () => window.clearTimeout(timer)
  }, [highlightedPersonaId])

  const getResumenDiaGrupo = (grupo: GrupoInfo, fecha: string) => {
    const asignacionesDia = dias.find((dia) => dia.fecha === fecha)?.asignaciones ?? []
    const idsMiembros = new Set(grupo.miembros.map((miembro) => miembro.id_persona))
    const asignacionesGrupo = asignacionesDia.filter((asig) => idsMiembros.has(asig.id_persona))

    const reemplazos = asignacionesGrupo.filter(
      (asig) => asig.tipo_origen === 'EMERGENCIA' && !!asig.id_persona_titular
    ).length
    const cubiertos = asignacionesGrupo.filter(
      (asig) => asig.tipo_origen !== 'EMERGENCIA' && !!asig.reemplazo_activo
    ).length
    const manuales = asignacionesGrupo.filter((asig) => asig.tipo_origen === 'MANUAL').length

    return {
      total: asignacionesGrupo.length,
      reemplazos,
      cubiertos,
      manuales,
    }
  }

  return (
    <div className='table-responsive'>
      <table className='table table-row-bordered table-row-gray-100 align-middle fs-7 dataTable'>
        <thead>
          <tr className='text-uppercase fw-bolder text-muted fs-8 gs-0'>
            <th className='min-w-260px'>Grupo</th>
            <th className='min-w-120px'>Guardias</th>
            <th className='min-w-180px'>Turno semana</th>
            {DIAS_LABELS.map((d) => (
              <th key={d} className='text-center min-w-90px'>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gruposConTurno.length === 0 ? (
            <tr>
              <td colSpan={10} className='text-center text-muted py-8'>
                No hay grupos de guardias configurados
              </td>
            </tr>
          ) : (
            gruposConTurno.map((grupo) => {
              const open = expandedGroups.includes(grupo.id_guardia_grupo)
              const turnoColor = grupo.turnoRotacion?.color || '#3699ff'

              return (
                <Fragment key={grupo.id_guardia_grupo}>
                  <tr key={`grupo-${grupo.id_guardia_grupo}`} className={open ? 'bg-light-primary' : ''}>
                    <td>
                      <button
                        type='button'
                        className='btn btn-sm btn-flex btn-active-light-primary align-items-center gap-3 px-3 py-2 w-100 text-start'
                        onClick={() => toggleGrupo(grupo.id_guardia_grupo)}
                        aria-expanded={open}
                      >
                        <span
                          className='symbol symbol-35px'
                          style={{
                            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: `transform ${COLLAPSE_ANIMATION_MS}ms ease`,
                          }}
                        >
                          <span className='symbol-label bg-light-primary'>
                            <KTIcon iconName='right' className='fs-5 text-primary' />
                          </span>
                        </span>
                        <span className='d-flex flex-column'>
                          <span className='fw-bolder text-dark fs-6'>{grupo.nombre}</span>
                          <span className='text-muted fs-8'>
                            Posición de rotación {grupo.orden}
                          </span>
                        </span>
                      </button>
                    </td>

                    <td>
                      <div className='d-flex flex-column'>
                        <span className='fw-bolder text-dark'>{grupo.miembros.length}</span>
                        <span className='text-muted fs-8'>guardias</span>
                      </div>
                    </td>

                    <td>
                      {grupo.turnoRotacion ? (
                        <span
                          className='badge fs-7'
                          style={{
                            background: grupo.turnoRotacion.color + '22',
                            color: grupo.turnoRotacion.color,
                            border: `1px solid ${grupo.turnoRotacion.color}`,
                          }}
                        >
                          {grupo.turnoRotacion.nombre}
                          <span className='ms-1 fw-normal opacity-75 fs-8'>
                            {grupo.turnoRotacion.hora_inicio.slice(0, 5)}–
                            {grupo.turnoRotacion.hora_fin.slice(0, 5)}
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {dias.map((dia) => {
                      const resumen = getResumenDiaGrupo(grupo, dia.fecha)

                      return (
                        <td key={`${grupo.id_guardia_grupo}-${dia.fecha}`} className='text-center'>
                          {resumen.total === 0 ? (
                            <span className='text-muted fs-9'>—</span>
                          ) : (
                            <div className='d-flex flex-column align-items-center gap-1'>
                              <span
                                className='badge badge-light'
                                style={{
                                  color: turnoColor,
                                  border: `1px solid ${turnoColor}33`,
                                }}
                              >
                                {resumen.total}/{grupo.miembros.length}
                              </span>
                              <div className='d-flex justify-content-center flex-wrap gap-1'>
                                {resumen.cubiertos > 0 ? (
                                  <span className='badge badge-light-warning'>CBR {resumen.cubiertos}</span>
                                ) : null}
                                {resumen.reemplazos > 0 ? (
                                  <span className='badge badge-light-danger'>RPL {resumen.reemplazos}</span>
                                ) : null}
                                {resumen.manuales > 0 ? (
                                  <span className='badge badge-light-warning'>MAN {resumen.manuales}</span>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  <tr className='bg-light-primary bg-opacity-25'>
                    <td colSpan={10} className='p-0 border-0'>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateRows: open ? '1fr' : '0fr',
                          opacity: open ? 1 : 0,
                          transition: `grid-template-rows ${COLLAPSE_ANIMATION_MS}ms ease, opacity ${COLLAPSE_ANIMATION_MS}ms ease`,
                        }}
                      >
                        <div style={{overflow: 'hidden'}}>
                          <div className='p-5 border-top border-gray-200'>
                            <div className='d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4'>
                              <div>
                                <div className='fw-bolder text-dark fs-6'>Detalle del grupo</div>
                                <div className='text-muted fs-8'>
                                  Haz seguimiento por guardia sin saturar la tabla principal.
                                </div>
                              </div>
                              <span className='badge badge-light-primary'>
                                {grupo.miembros.length} guardias en {grupo.nombre}
                              </span>
                            </div>

                            <div className='table-responsive'>
                              <table className='table table-sm align-middle gs-0 gy-2 mb-0'>
                                <thead>
                                  <tr className='text-muted fw-bolder fs-8 text-uppercase'>
                                    <th className='min-w-240px'>Guardia</th>
                                    {DIAS_LABELS.map((label) => (
                                      <th key={`${grupo.id_guardia_grupo}-${label}`} className='text-center min-w-90px'>
                                        {label}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {grupo.miembrosOrdenados.map((miembro) => (
                                    <tr
                                      key={`${grupo.id_guardia_grupo}-${miembro.id_persona}`}
                                      ref={highlightedPersonaId === miembro.id_persona ? highlightedRowRef : null}
                                      style={
                                        highlightedPersonaId === miembro.id_persona
                                          ? {
                                              background: `${turnoColor}14`,
                                              outline: `1px solid ${turnoColor}55`,
                                              transition: 'background-color 180ms ease, outline-color 180ms ease',
                                            }
                                          : undefined
                                      }
                                    >
                                      <td>
                                        <div className='d-flex align-items-center'>
                                          <div className='symbol symbol-35px me-3'>
                                            <span
                                              className='symbol-label fw-bold fs-7'
                                              style={{background: turnoColor + '22', color: turnoColor}}
                                            >
                                              {miembro.nombre?.charAt(0)}
                                              {miembro.paterno?.charAt(0)}
                                            </span>
                                          </div>
                                          <div>
                                            <div className='fw-bolder text-dark'>
                                              {getNombrePersona(miembro)}
                                            </div>
                                            <div className='text-muted fs-8'>
                                              CI: {miembro.ci}
                                              {miembro.nombre_bloque ? ` · ${miembro.nombre_bloque}` : ''}
                                            </div>
                                          </div>
                                        </div>
                                      </td>

                                      {dias.map((dia) => {
                                        const asignacionesPersona = dia.asignaciones.filter(
                                          (asig) => asig.id_persona === miembro.id_persona
                                        )

                                        return (
                                          <td
                                            key={`${grupo.id_guardia_grupo}-${miembro.id_persona}-${dia.fecha}`}
                                            className='text-center'
                                          >
                                            {asignacionesPersona.length === 0 ? (
                                              <span className='text-muted fs-9'>—</span>
                                            ) : (
                                              <div className='d-flex flex-column align-items-center gap-1'>
                                                {asignacionesPersona.map((asig) => buildAsignacionBadge(asig))}
                                              </div>
                                            )}
                                          </td>
                                        )
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export {HorarioTabla}
