import {useEffect, useState} from 'react'
import Tooltip from '@mui/material/Tooltip'
import {KTIcon} from 'src/_metronic/helpers'
import axiosClient from 'src/app/services/axiosClient'
import {API_ROUTES} from 'src/app/config/apiRoutes'
import {showToast} from 'src/app/utils/toastHelper'
import {showConfirmDialog} from 'src/app/utils/swalHelpers.ts'
import {GuardiaModalShell} from '../components/GuardiaModalShell'
import {useListView} from '../core/ListViewProvider'
import {useQueryResponse} from '../core/QueryResponseProvider'
import {Grupo, GrupoMiembro} from '../core/_models'
import {actualizarMiembro, agregarMiembro, eliminarMiembro, getGrupoById} from '../core/_requests'
import {Bloque} from '../../../bloques/bloque-list/core/_models'
import {getBloquesDropdown} from '../../../bloques/bloque-list/core/_requests'

const MembersModal = () => {
  const {itemIdForUpdate, closeModal} = useListView()
  const {refetch} = useQueryResponse()
  const [grupo, setGrupo] = useState<Grupo | null>(null)
  const [loadingGrupo, setLoadingGrupo] = useState(false)
  const [bloques, setBloques] = useState<Bloque[]>([])
  const [searchPersona, setSearchPersona] = useState('')
  const [personasEncontradas, setPersonasEncontradas] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)
  const [guardiaEnProceso, setGuardiaEnProceso] = useState<any | null>(null)
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<number | null>(null)
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    getBloquesDropdown().then(setBloques)
  }, [])

  useEffect(() => {
    if (!itemIdForUpdate) return
    setLoadingGrupo(true)
    getGrupoById(itemIdForUpdate)
      .then((data) => setGrupo(data || null))
      .finally(() => setLoadingGrupo(false))
  }, [itemIdForUpdate])

  useEffect(() => {
    if (procesando || !searchPersona || searchPersona.trim().length < 3) {
      setPersonasEncontradas([])
      return
    }

    const timer = window.setTimeout(async () => {
      setBuscando(true)
      try {
        const response = await axiosClient.get(`${API_ROUTES.GUARDIAS}/grupos/autocompletar-guardias`, {
          params: {termino: searchPersona.trim(), limit: 10},
        })
        setPersonasEncontradas(response.data?.data || [])
      } catch {
        setPersonasEncontradas([])
      } finally {
        setBuscando(false)
      }
    }, 450)

    return () => window.clearTimeout(timer)
  }, [searchPersona])

  const reloadGrupo = async () => {
    if (!itemIdForUpdate) return
    const refreshed = await getGrupoById(itemIdForUpdate)
    setGrupo(refreshed || null)
    refetch()
  }

  const handleAgregarMiembro = async (persona: any) => {
    if (!grupo?.id_guardia_grupo || procesando) return
    setProcesando(true)
    try {
      await agregarMiembro(grupo.id_guardia_grupo as number, persona.id, bloqueSeleccionado)
      setSearchPersona('')
      setPersonasEncontradas([])
      setGuardiaEnProceso(null)
      setBloqueSeleccionado(null)
      await reloadGrupo()
      showToast({
        message: `${persona.nombre_completo || `${persona.paterno} ${persona.nombre}`} agregado al grupo`,
        type: 'success',
      })
    } catch (error: any) {
      showToast({
        message: error?.response?.data?.message || 'No se pudo agregar el guardia',
        type: 'error',
      })
      setGuardiaEnProceso(null)
    } finally {
      setProcesando(false)
    }
  }

  const handleSeleccionarPersona = async (persona: any) => {
    if (procesando) return
    setGuardiaEnProceso(persona)
    setSearchPersona('')
    setPersonasEncontradas([])
    await handleAgregarMiembro(persona)
  }

  const handleEliminarMiembro = async (miembro: GrupoMiembro) => {
    if (!grupo?.id_guardia_grupo || !miembro.id_guardia_grupo_miembro) return

    const result = await showConfirmDialog({
      title: '¿Quitar guardia del grupo?',
      text: miembro.nombre_completo || `${miembro.paterno || ''} ${miembro.nombre || ''}`.trim(),
      icon: 'warning',
      confirmButtonText: 'Sí, quitar',
      cancelButtonColor: '#6c757d',
    })

    if (!result.isConfirmed) return

    try {
      await eliminarMiembro(grupo.id_guardia_grupo as number, miembro.id_guardia_grupo_miembro as number)
      await reloadGrupo()
      showToast({
        message: `${miembro.nombre_completo || 'Guardia'} quitado del grupo`,
        type: 'success',
      })
    } catch (error: any) {
      showToast({
        message: error?.response?.data?.message || 'No se pudo quitar el guardia',
        type: 'error',
      })
    }
  }

  const handleCambiarBloqueMiembro = async (miembro: GrupoMiembro, idBloque: number | null) => {
    if (!grupo?.id_guardia_grupo || !miembro.id_guardia_grupo_miembro) return

    try {
      await actualizarMiembro(grupo.id_guardia_grupo as number, miembro.id_guardia_grupo_miembro as number, idBloque)
      await reloadGrupo()
      showToast({
        message: idBloque ? 'Bloque por defecto actualizado' : 'Bloque por defecto removido',
        type: 'success',
      })
    } catch (error: any) {
      showToast({
        message: error?.response?.data?.message || 'No se pudo actualizar el bloque',
        type: 'error',
      })
    }
  }

  return (
    <GuardiaModalShell
      title={grupo?.nombre ? `Miembros de ${grupo.nombre}` : 'Miembros del grupo'}
      subtitle='Busca solo personal con horario SEGURIDAD activo y administra sus bloques por defecto.'
      headerIcon={<KTIcon iconName='people' className='fs-1 guardia-modal-icon' />}
      variant='grupo'
      headerStyle={{background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)'}}
      titleClassName='text-white'
      subtitleClassName='text-white opacity-75 fs-7'
      closeButtonClassName='btn-light-success'
      closeIconClassName='text-success'
      iconBoxStyle={{
        background: 'rgba(255, 255, 255, 0.16)',
        border: '1px solid rgba(255, 255, 255, 0.24)',
      }}
      onClose={closeModal}
      size='xl'
    >
      {loadingGrupo ? (
        <div className='d-flex flex-column align-items-center justify-content-center py-15'>
          <span className='spinner-border text-primary mb-4'></span>
          <span className='text-muted fw-semibold'>Cargando miembros del grupo...</span>
        </div>
      ) : (
      <>
      <div className='card card-bordered mb-7 border border-success border-opacity-75'>
        <div className='card-body p-5'>
          <div className='row g-4 align-items-end'>
            <div className='col-lg-6 position-relative'>
              <label className='fw-bold fs-6 mb-2 d-flex align-items-center gap-2'>
                Buscar guardia
                <Tooltip title='Busca por nombre o CI y solo muestra guardias activos con horario SEGURIDAD.' arrow placement='top'>
                  <span className='text-muted d-inline-flex'>
                    <KTIcon iconName='information-5' className='fs-5' />
                  </span>
                </Tooltip>
              </label>
              <div className='position-relative'>
                <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-4 mt-4' />
                <input
                  type='text'
                  className='form-control form-control-solid ps-12'
                  placeholder='Escribe nombre o CI...'
                  value={searchPersona}
                  onChange={(e) => {
                    setSearchPersona(e.target.value)
                    setGuardiaEnProceso(null)
                  }}
                  disabled={procesando}
                />
                {buscando ? (
                  <span className='spinner-border spinner-border-sm position-absolute top-50 end-0 translate-middle-y me-4'></span>
                ) : null}
              </div>
              {personasEncontradas.length > 0 ? (
                <div className='card shadow-sm position-absolute w-100 mt-2' style={{zIndex: 20}}>
                  <div className='card-body p-2'>
                    {personasEncontradas.map((persona) => (
                      <button
                        key={persona.id}
                        type='button'
                        className='btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-3 mb-2'
                        onClick={() => handleSeleccionarPersona(persona)}
                        disabled={procesando}
                      >
                        <span className='symbol symbol-35px'>
                          <span className='symbol-label bg-primary text-white fw-bold'>
                            {persona.nombre?.charAt(0)}
                            {persona.paterno?.charAt(0)}
                          </span>
                        </span>
                        <span className='d-flex flex-column'>
                          <span className='fw-bold text-dark'>{persona.nombre_completo}</span>
                          <span className='text-muted fs-8'>
                            CI: {persona.ci} | Cargo: {persona.codigo_cargo || 'S/N'}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : !buscando && searchPersona.trim().length >= 3 ? (
                <div className='card shadow-sm position-absolute w-100 mt-2' style={{zIndex: 20}}>
                  <div className='card-body p-4 text-center'>
                    <div className='text-muted fs-7 fw-semibold'>Guardia no encontrado</div>
                    <div className='text-gray-500 fs-8 mt-1'>
                      Verifica el nombre o CI, y que tenga horario SEGURIDAD activo.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className='col-lg-4'>
              <label className='fw-bold fs-6 mb-2'>Bloque por defecto</label>
              <select
                className='form-select form-select-solid'
                value={bloqueSeleccionado ?? ''}
                onChange={(e) => setBloqueSeleccionado(e.target.value ? Number(e.target.value) : null)}
              >
                <option value=''>Sin bloque por defecto</option>
                {bloques.map((bloque) => (
                  <option key={bloque.id_guardia_bloque as number} value={bloque.id_guardia_bloque as number}>
                    {bloque.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className='col-lg-2'>
              <div className='d-flex align-items-center justify-content-lg-end h-100'>
                <span className='badge badge-light-primary fs-7 px-4 py-3 text-center'>
                  {(grupo?.miembros || []).length} guardias
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='table-responsive'>
        <table className='table align-middle table-row-dashed gy-4'>
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              <th>Guardia</th>
              <th>CI</th>
              <th>Bloque por defecto</th>
              <th className='text-end'>Acciones</th>
            </tr>
          </thead>
          <tbody className='fw-semibold text-gray-700'>
            {!grupo?.miembros?.length ? (
              <tr>
                <td colSpan={4} className='text-center text-muted py-10'>
                  No hay guardias asignados a este grupo.
                </td>
              </tr>
            ) : null}
            {grupo?.miembros?.map((miembro) => (
                <tr key={miembro.id_guardia_grupo_miembro}>
                  <td>
                    <div className='d-flex align-items-center gap-3'>
                      <span className='symbol symbol-40px'>
                        <span className='symbol-label bg-light-primary text-primary fw-bold'>
                          {miembro.nombre?.charAt(0)}
                          {miembro.paterno?.charAt(0)}
                        </span>
                      </span>
                      <div className='d-flex flex-column'>
                        <span className='fw-bold text-dark'>{miembro.nombre_completo}</span>
                        <span className='text-muted fs-8'>{miembro.nombre_bloque || 'Sin bloque asignado'}</span>
                      </div>
                    </div>
                  </td>
                  <td>{miembro.ci || '—'}</td>
                  <td style={{minWidth: '220px'}}>
                    <select
                      className='form-select form-select-solid form-select-sm'
                      value={miembro.id_guardia_bloque ?? ''}
                      onChange={(e) =>
                        handleCambiarBloqueMiembro(miembro, e.target.value ? Number(e.target.value) : null)
                      }
                    >
                      <option value=''>Sin bloque</option>
                      {bloques.map((bloque) => (
                        <option key={bloque.id_guardia_bloque as number} value={bloque.id_guardia_bloque as number}>
                          {bloque.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className='text-end'>
                    <Tooltip title='Quitar guardia del grupo' arrow placement='top'>
                      <button
                        type='button'
                        className='btn btn-icon btn-light-danger btn-sm'
                        onClick={() => handleEliminarMiembro(miembro)}
                      >
                        <KTIcon iconName='trash' className='fs-3' />
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            {guardiaEnProceso ? (
              <tr className='bg-light-primary'>
                <td>
                  <div className='d-flex align-items-center gap-3'>
                    <span className='symbol symbol-40px'>
                      <span className='symbol-label bg-primary text-white fw-bold'>
                        {guardiaEnProceso.nombre?.charAt(0)}
                        {guardiaEnProceso.paterno?.charAt(0)}
                      </span>
                    </span>
                    <div className='d-flex flex-column'>
                      <span className='fw-bold text-dark'>{guardiaEnProceso.nombre_completo}</span>
                      <span className='text-muted fs-8'>Agregando guardia al grupo...</span>
                    </div>
                  </div>
                </td>
                <td>{guardiaEnProceso.ci || '—'}</td>
                <td>
                  <div className='placeholder-glow mb-0'>
                    <span className='placeholder col-8 rounded-pill py-3'></span>
                  </div>
                </td>
                <td className='text-end'>
                  <div className='d-inline-flex align-items-center gap-2 text-primary fs-8 fw-bold'>
                    <span className='spinner-border spinner-border-sm'></span>
                    Guardando
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      </>
      )}
    </GuardiaModalShell>
  )
}

export {MembersModal}
