import {useMemo, useState} from 'react'
import {KTIcon} from 'src/_metronic/helpers'
import {showToast} from 'src/app/utils/toastHelper'
import {GuardiaModalShell} from '../../grupos/grupo-list/components/GuardiaModalShell'
import {HorarioBusquedaTarget, HorarioSemanalResponse} from '../core/_models'

type Props = {
  horario: HorarioSemanalResponse
  onClose: () => void
  onFound: (target: HorarioBusquedaTarget) => void
}

const BuscarGuardiaModal = ({horario, onClose, onFound}: Props) => {
  const [fecha, setFecha] = useState(horario.dias[0]?.fecha ?? '')
  const [termino, setTermino] = useState('')
  const [error, setError] = useState('')

  const opcionesDias = useMemo(
    () =>
      horario.dias.map((dia) => ({
        value: dia.fecha,
        label: `${dia.dia_semana} ${new Date(dia.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}`,
      })),
    [horario.dias]
  )

  const handleBuscar = () => {
    setError('')
    const search = termino.trim().toLowerCase()

    if (!fecha) {
      setError('Seleccione un día.')
      return
    }

    if (search.length < 2) {
      setError('Escriba al menos 2 caracteres.')
      return
    }

    const dia = horario.dias.find((item) => item.fecha === fecha)
    if (!dia) {
      showToast({type: 'error', message: 'No se encontró el día seleccionado.'})
      return
    }

    const asignacion = dia.asignaciones.find((item) => {
      const nombre = `${item.paterno ?? ''} ${item.materno ?? ''} ${item.nombre_persona ?? ''}`.toLowerCase()
      const ci = String(item.ci ?? '').toLowerCase()
      return nombre.includes(search) || ci.includes(search)
    })

    if (!asignacion) {
      showToast({type: 'error', message: 'Guardia no encontrado para el día seleccionado.'})
      return
    }

    onFound({
      fecha: dia.fecha,
      id_persona: asignacion.id_persona,
      id_guardia_grupo: asignacion.id_guardia_grupo ?? null,
      id_guardia_turno: asignacion.id_guardia_turno ?? null,
    })
  }

  return (
    <GuardiaModalShell
      title='Buscar guardia'
      subtitle='Ubica rápido una asignación de la semana por día, nombre o CI.'
      headerIcon={<KTIcon iconName='magnifier' className='fs-1 guardia-modal-icon' />}
      variant='horario'
      headerStyle={{background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)'}}
      titleClassName='text-white'
      subtitleClassName='text-white opacity-75 fs-7'
      closeButtonClassName='btn-light-primary'
      closeIconClassName='text-primary'
      iconBoxStyle={{
        background: 'rgba(255, 255, 255, 0.16)',
        border: '1px solid rgba(255, 255, 255, 0.24)',
      }}
      onClose={onClose}
      size='md'
    >
      <div className='row g-5'>
        <div className='col-md-5'>
          <label className='required fw-bold fs-6 mb-2'>Día</label>
          <select
            className={`form-select form-select-solid ${error && !fecha ? 'is-invalid' : ''}`}
            value={fecha}
            onChange={(e) => {
              setFecha(e.target.value)
              setError('')
            }}
          >
            {opcionesDias.map((dia) => (
              <option key={dia.value} value={dia.value}>
                {dia.label}
              </option>
            ))}
          </select>
        </div>

        <div className='col-md-7'>
          <label className='required fw-bold fs-6 mb-2'>Nombre o CI</label>
          <input
            type='text'
            className={`form-control form-control-solid ${error && termino.trim().length < 2 ? 'is-invalid' : ''}`}
            placeholder='Ej: Quispe o 1234567'
            value={termino}
            onChange={(e) => {
              setTermino(e.target.value)
              setError('')
            }}
          />
        </div>
      </div>

      {error ? <div className='text-danger fs-7 mt-3'>{error}</div> : null}

      <div className='separator separator-dashed my-7'></div>

      <div className='d-flex justify-content-end gap-3'>
        <button type='button' className='btn btn-light' onClick={onClose}>
          <KTIcon iconName='cross' className='fs-4 me-1' />
          Cancelar
        </button>
        <button type='button' className='btn btn-primary' onClick={handleBuscar}>
          <KTIcon iconName='magnifier' className='fs-4 me-1' />
          Buscar
        </button>
      </div>
    </GuardiaModalShell>
  )
}

export {BuscarGuardiaModal}
