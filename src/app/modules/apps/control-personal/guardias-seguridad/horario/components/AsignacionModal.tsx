import {useEffect, useState} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import axios from 'axios'
import Tooltip from '@mui/material/Tooltip'
import axiosClient from 'src/app/services/axiosClient'
import {KTIcon} from 'src/_metronic/helpers'
import {API_ROUTES} from 'src/app/config/apiRoutes'
import {showToast} from 'src/app/utils/toastHelper'
import {TurnoInfo, AsignacionDia, GrupoInfo} from '../core/_models'
import {getBloquesDropdown} from '../../bloques/bloque-list/core/_requests'
import {Bloque} from '../../bloques/bloque-list/core/_models'
import {GuardiaModalShell} from '../../grupos/grupo-list/components/GuardiaModalShell'

type Props = {
  fecha: string
  asignacion?: AsignacionDia
  turnos: TurnoInfo[]
  grupos: GrupoInfo[]
  onClose: () => void
  onSaved: () => void
}

const schema = Yup.object({
  id_persona: Yup.number().required('Seleccione un guardia').moreThan(0, 'Seleccione un guardia'),
  id_guardia_turno: Yup.number().required('Seleccione un turno').moreThan(0, 'Seleccione un turno'),
  id_guardia_bloque: Yup.number().nullable(),
  tipo_origen: Yup.string().oneOf(['MANUAL', 'EMERGENCIA']).required(),
  observacion: Yup.string().max(500).nullable(),
})

const AsignacionModal = ({fecha, asignacion, turnos, grupos, onClose, onSaved}: Props) => {
  const fechaObj = new Date(fecha + 'T12:00:00')
  const diaSemana = fechaObj.getDay()
  const esFinDeSemana = diaSemana === 0 || diaSemana === 6
  const tipoOrigenDefault = esFinDeSemana ? 'MANUAL' : 'EMERGENCIA'
  const esEdicion = !!asignacion?.id_guardia_asignacion
  const esEmergenciaEditable = !esFinDeSemana && asignacion?.tipo_origen === 'EMERGENCIA'
  const esReemplazoDesdeTitular = !esFinDeSemana && !!asignacion && asignacion.tipo_origen !== 'EMERGENCIA'
  const esModalReemplazo = esEmergenciaEditable || esReemplazoDesdeTitular
  const esEdicionReal = esFinDeSemana ? esEdicion : esEmergenciaEditable
  const titularYaCubierto = !!asignacion?.reemplazo_activo && !esEmergenciaEditable
  const titularNombre = esReemplazoDesdeTitular
    ? `${asignacion?.paterno ?? ''} ${asignacion?.materno ?? ''} ${asignacion?.nombre_persona ?? ''}`.replace(/\s+/g, ' ').trim()
    : `${asignacion?.titular_paterno ?? ''} ${asignacion?.titular_materno ?? ''} ${asignacion?.titular_nombre_persona ?? asignacion?.titular_nombre ?? ''}`.replace(/\s+/g, ' ').trim()
  const grupoTitular = asignacion?.nombre_grupo || grupos.find((grupo) => grupo.id_guardia_grupo === asignacion?.id_guardia_grupo)?.nombre
  const nombreReemplazoActivo = `${asignacion?.reemplazo_paterno ?? ''} ${asignacion?.reemplazo_materno ?? ''} ${asignacion?.reemplazo_nombre_persona ?? asignacion?.reemplazo_nombre ?? ''}`.replace(/\s+/g, ' ').trim()
  const BASE_ASIG = `${API_ROUTES.GUARDIAS}/asignaciones`

  const [loading, setLoading] = useState(false)
  const [bloques, setBloques] = useState<Bloque[]>([])
  const [searchPersona, setSearchPersona] = useState(
    esReemplazoDesdeTitular ? '' : asignacion ? `${asignacion.paterno} ${asignacion.nombre_persona} - CI: ${asignacion.ci}` : ''
  )
  const [personasEncontradas, setPersonasEncontradas] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [personaSeleccionada, setPersonaSeleccionada] = useState<any | null>(
    esReemplazoDesdeTitular
      ? null
      : asignacion
        ? {id: asignacion.id_persona, nombre: asignacion.nombre_persona, ci: asignacion.ci}
        : null
  )

  useEffect(() => {
    getBloquesDropdown().then(setBloques)
  }, [])

  const formik = useFormik({
    initialValues: {
      id_persona: esReemplazoDesdeTitular ? 0 : asignacion?.id_persona || 0,
      id_guardia_turno: asignacion?.id_guardia_turno || (turnos[0]?.id_guardia_turno || 0),
      id_guardia_bloque: esReemplazoDesdeTitular ? asignacion?.id_guardia_bloque || null : asignacion?.id_guardia_bloque || null,
      id_guardia_grupo: esReemplazoDesdeTitular ? asignacion?.id_guardia_grupo || null : asignacion?.id_guardia_grupo || null,
      tipo_origen: esFinDeSemana ? (asignacion?.tipo_origen || tipoOrigenDefault) : 'EMERGENCIA',
      observacion: esReemplazoDesdeTitular ? '' : asignacion?.observacion || '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setLoading(true)
      setSearchError(null)
      try {
        if (titularYaCubierto) {
          const message = `Este guardia ya tiene reemplazo activo${nombreReemplazoActivo ? `: ${nombreReemplazoActivo}` : ''}. Edítelo o quítelo antes de registrar otro.`
          setSearchError(message)
          formik.setErrors({id_persona: message})
          return
        }

        const payload: Record<string, any> = {...values, fecha}

        if (esReemplazoDesdeTitular) {
          payload.id_persona_titular = asignacion?.id_persona
          payload.id_guardia_asignacion_titular = asignacion?.id_guardia_asignacion
          payload.id_guardia_turno = asignacion?.id_guardia_turno
          payload.id_guardia_bloque = values.id_guardia_bloque ?? asignacion?.id_guardia_bloque ?? null
          payload.id_guardia_grupo = asignacion?.id_guardia_grupo ?? null
        }

        if (esEdicionReal) {
          await axios.put(`${BASE_ASIG}/${asignacion!.id_guardia_asignacion}`, payload)
        } else {
          await axios.post(BASE_ASIG, payload)
        }
        showToast({
          type: 'success',
          message: esModalReemplazo
            ? (esEdicionReal ? 'Reemplazo actualizado correctamente' : 'Reemplazo registrado correctamente')
            : esEdicionReal
              ? 'Asignación actualizada correctamente'
              : 'Guardia asignado correctamente',
        })
        onSaved()
      } catch (e: any) {
        const responseData = e?.response?.data
        const validationErrors = responseData?.data && typeof responseData.data === 'object' ? responseData.data : null
        const message = responseData?.message || 'No se pudo guardar'

        if (validationErrors) {
          const nextErrors: Record<string, string> = {}

          Object.entries(validationErrors).forEach(([key, value]) => {
            const text = String(value)
            if (key === 'id_persona_titular' || key === 'id_persona') {
              setSearchError(text)
              nextErrors.id_persona = text
              return
            }
            nextErrors[key] = text
          })

          formik.setErrors(nextErrors)
        } else {
          formik.setErrors({})
        }

        if (!validationErrors?.id_persona_titular && !validationErrors?.id_persona) {
          showToast({type: 'error', message})
        }
      } finally {
        setLoading(false)
      }
    },
  })

  // Autocomplete persona
  useEffect(() => {
    if (personaSeleccionada || !searchPersona || searchPersona.length < 3) {
      setPersonasEncontradas([])
      return
    }
    const timer = setTimeout(async () => {
      setBuscando(true)
      try {
        const res = await axiosClient.get(`${API_ROUTES.GUARDIAS}/grupos/autocompletar-guardias`, {
          params: {termino: searchPersona, limit: 10},
        })
        setPersonasEncontradas(res.data?.data || [])
      } catch {
        setPersonasEncontradas([])
      } finally {
        setBuscando(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchPersona, personaSeleccionada])

  const handleSelectPersona = (p: any) => {
    setSearchError(null)
    setPersonaSeleccionada(p)
    setSearchPersona(p.nombre_completo || `${p.paterno} ${p.nombre} — CI: ${p.ci}`)
    setPersonasEncontradas([])
    formik.setFieldValue('id_persona', p.id)
    if (!esModalReemplazo) {
      formik.setFieldValue('id_guardia_bloque', p.id_guardia_bloque ? Number(p.id_guardia_bloque) : null)
      formik.setFieldValue('id_guardia_grupo', p.id_guardia_grupo ? Number(p.id_guardia_grupo) : null)
    }
  }

  const handleDeleteAsignacion = async () => {
    if (!esEdicion) return
    const result = await Swal.fire({
      title: esModalReemplazo ? '¿Quitar reemplazo?' : '¿Quitar asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f1416c',
    })
    if (result.isConfirmed) {
      await axios.delete(`${BASE_ASIG}/${asignacion!.id_guardia_asignacion}`)
      showToast({
        type: 'success',
        message: esModalReemplazo
          ? 'Reemplazo eliminado correctamente'
          : 'Asignación eliminada correctamente',
      })
      onSaved()
    }
  }

  const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <GuardiaModalShell
      title={
        esModalReemplazo
          ? esEdicionReal
            ? 'Editar reemplazo de emergencia'
            : 'Registrar reemplazo de emergencia'
          : esEdicionReal
            ? 'Editar asignación de guardia'
            : esFinDeSemana
              ? 'Asignar guardia'
              : 'Cambio de emergencia'
      }
      subtitle='Registra o ajusta la asignación diaria dentro del horario semanal de guardias.'
      headerIcon={<KTIcon iconName='calendar' className='fs-1 guardia-modal-icon' />}
      variant={esFinDeSemana ? 'warning' : 'danger'}
      headerStyle={{
        background: esFinDeSemana
          ? 'linear-gradient(135deg, #f59f00 0%, #f08c00 100%)'
          : 'linear-gradient(135deg, #f03e3e 0%, #e03131 100%)',
      }}
      titleClassName='text-white'
      subtitleClassName='text-white opacity-75 fs-7'
      closeButtonClassName={esFinDeSemana ? 'btn-light-warning' : 'btn-light-danger'}
      closeIconClassName={esFinDeSemana ? 'text-warning' : 'text-danger'}
      iconBoxStyle={{
        background: 'rgba(255, 255, 255, 0.16)',
        border: '1px solid rgba(255, 255, 255, 0.24)',
      }}
      onClose={onClose}
      size='md'
    >
              {/* Fecha */}
              <div className='d-flex align-items-center bg-light rounded p-3 mb-5'>
                <KTIcon iconName='calendar' className='fs-2 text-primary me-3' />
                <div>
                  <div className='fw-bolder text-dark text-capitalize'>{fechaFormateada}</div>
                  <span className={`badge ${esFinDeSemana ? 'badge-light-warning' : 'badge-light-danger'}`}>
                    {esFinDeSemana ? 'Fin de semana — Asignación manual' : 'Día laborable — Emergencia'}
                  </span>
                </div>
              </div>

            <form onSubmit={formik.handleSubmit} noValidate>
                {esModalReemplazo && asignacion && (
                  <div className='bg-light-danger bg-opacity-10 border border-danger border-dashed rounded p-4 mb-5'>
                  <div className='d-flex align-items-start justify-content-between gap-3'>
                      <div>
                        <div className='d-flex align-items-center gap-2 mb-2'>
                          <span className='badge badge-light-danger'>Titular a cubrir</span>
                          {grupoTitular ? <span className='badge badge-light-primary'>{grupoTitular}</span> : null}
                          {titularYaCubierto ? <span className='badge badge-light-warning'>Ya cubierto</span> : null}
                        </div>
                        <div className='fw-bolder text-dark fs-5'>{titularNombre || 'Guardia titular'}</div>
                        <div className='text-muted fs-7 mt-1'>
                          {titularYaCubierto
                            ? `Este guardia ya está cubierto${nombreReemplazoActivo ? ` por ${nombreReemplazoActivo}` : ''}. Para cambiarlo, edita o quita el reemplazo actual.`
                            : 'Cubra este turno con otro guardia disponible. El titular seguirá visible en la semana y el reemplazo quedará marcado aparte.'}
                        </div>
                      </div>
                      <Tooltip title='El reemplazante cubrirá exactamente este turno del titular.' arrow>
                        <div className='badge badge-light-danger d-flex align-items-center gap-1 py-2 px-3'>
                          <KTIcon iconName='arrows-loop' className='fs-6 text-danger' />
                          {asignacion.nombre_turno}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                )}

                {/* Buscar guardia */}
                <div className='fv-row mb-5'>
                  <label className='required fw-bold fs-6 mb-2'>{esModalReemplazo ? 'Guardia reemplazante' : 'Guardia'}</label>
                  <div className='position-relative w-100'>
                    <div
                      className='position-absolute top-0 bottom-0 d-flex align-items-center text-muted'
                      style={{left: '14px', zIndex: 2}}
                    >
                      <KTIcon iconName='magnifier' className='fs-3 text-muted' />
                    </div>
                    <input
                      type='text'
                      className={`form-control form-control-solid ps-12 ${formik.touched.id_persona && formik.errors.id_persona ? 'is-invalid' : ''}`}
                      placeholder={esModalReemplazo ? 'Buscar reemplazante por nombre o CI...' : 'Buscar por nombre o CI...'}
                      value={searchPersona}
                      disabled={titularYaCubierto}
                      onChange={(e) => {
                        setSearchError(null)
                        setSearchPersona(e.target.value)
                        setPersonaSeleccionada(null)
                        formik.setFieldValue('id_persona', 0)
                      }}
                    />
                    {buscando && (
                      <span className='spinner-border spinner-border-sm position-absolute top-50 end-0 translate-middle-y me-4'></span>
                    )}
                    {personaSeleccionada && (
                      <button
                        type='button'
                        className='btn btn-icon btn-sm btn-active-color-danger position-absolute'
                        style={{top: '4px', right: '4px'}}
                        onClick={() => {setSearchError(null); setPersonaSeleccionada(null); setSearchPersona(''); formik.setFieldValue('id_persona', 0)}}
                      >
                        <KTIcon iconName='cross' className='fs-4' />
                      </button>
                    )}
                    {personasEncontradas.length > 0 && (
                      <div
                        className='card shadow position-absolute start-0 end-0 mt-1'
                        style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}
                      >
                        <div className='card-body p-2'>
                          {personasEncontradas.map((p) => (
                            <div
                              key={p.id}
                              className='d-flex align-items-center p-2 rounded cursor-pointer hover-bg-light'
                              style={{cursor: 'pointer'}}
                              onClick={() => handleSelectPersona(p)}
                            >
                              <div className='symbol symbol-30px me-3'>
                                <span className='symbol-label bg-primary text-white fs-8 fw-bold'>
                                  {p.nombre?.charAt(0)}{p.paterno?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className='fw-bold fs-7'>{p.nombre_completo || `${p.paterno} ${p.materno} ${p.nombre}`}</div>
                                <div className='text-muted fs-8'>
                                  CI: {p.ci}{p.nombre_bloque ? ` | Bloque: ${p.nombre_bloque}` : ''}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!buscando && searchPersona.trim().length >= 3 && personasEncontradas.length === 0 && !personaSeleccionada && (
                      <div
                        className='card shadow position-absolute start-0 end-0 mt-1'
                        style={{zIndex: 1000}}
                      >
                        <div className='card-body p-4 text-center'>
                          <div className='text-muted fs-7 fw-semibold'>Guardia no encontrado</div>
                          <div className='text-gray-500 fs-8 mt-1'>
                            Verifica el nombre o CI, y que tenga horario SEGURIDAD activo.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {formik.touched.id_persona && formik.errors.id_persona && (
                    <div className='text-danger fs-7'>{formik.errors.id_persona}</div>
                  )}
                  {!formik.errors.id_persona && searchError && (
                    <div className='text-danger fs-7'>{searchError}</div>
                  )}
                </div>

                <div className='row g-3 mb-5'>
                  {/* Turno */}
                  <div className='col-md-6'>
                    <label className='required fw-bold fs-6 mb-2'>Turno</label>
                    <select
                      className='form-select form-select-solid'
                      disabled={esModalReemplazo}
                      {...formik.getFieldProps('id_guardia_turno')}
                    >
                      <option value={0}>Seleccionar turno...</option>
                      {turnos.map((t) => (
                        <option key={t.id_guardia_turno} value={t.id_guardia_turno}>
                          {t.nombre} ({t.hora_inicio.slice(0,5)}–{t.hora_fin.slice(0,5)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bloque */}
                  <div className='col-md-6'>
                    <label className='fw-bold fs-6 mb-2'>Bloque / Área</label>
                    <select
                      className='form-select form-select-solid'
                      value={formik.values.id_guardia_bloque ?? ''}
                      onChange={(e) => formik.setFieldValue('id_guardia_bloque', e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value=''>Sin bloque</option>
                      {bloques.map((b) => (
                        <option key={b.id_guardia_bloque as number} value={b.id_guardia_bloque as number}>{b.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Observación */}
                <div className='fv-row mb-6'>
                  <label className='fw-bold fs-6 mb-2'>
                    Observación {!esFinDeSemana && <span className='text-danger fs-8'>(requerida para emergencias)</span>}
                  </label>
                  <textarea
                    className='form-control form-control-solid'
                    rows={2}
                    placeholder={esFinDeSemana ? 'Opcional...' : 'Motivo del cambio de emergencia...'}
                    {...formik.getFieldProps('observacion')}
                  />
                </div>

                <div className='d-flex justify-content-between'>
                  {esEdicionReal && (
                    <button type='button' className='btn btn-light-danger btn-sm' onClick={handleDeleteAsignacion}>
                      <KTIcon iconName='trash' className='fs-4 me-1' />
                      {esModalReemplazo ? 'Quitar reemplazo' : 'Quitar asignación'}
                    </button>
                  )}
                  <div className='ms-auto d-flex gap-2'>
                    <button type='button' className='btn btn-light' onClick={onClose}>
                      <KTIcon iconName='cross' className='fs-4 me-1' />
                      Cancelar
                    </button>
                    <button type='submit' className='btn btn-primary' disabled={loading || !formik.isValid || titularYaCubierto}>
                      {loading ? (
                        <><span className='spinner-border spinner-border-sm me-2'></span>Guardando...</>
                      ) : (
                        <>
                          <KTIcon iconName='check' className='fs-4 me-1' />
                          {esModalReemplazo ? (esEdicionReal ? 'Guardar reemplazo' : 'Registrar reemplazo') : 'Guardar'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
    </GuardiaModalShell>
  )
}

export {AsignacionModal}
