import {useEffect, useState} from 'react'
import {toast} from 'react-toastify'
import {KTCard} from 'src/_metronic/helpers'
import {Tooltip} from 'bootstrap'
import {AsignacionAdministrativa, HorarioTipo} from './core/_models'
import {actualizarAsignacionAdministrativa, listarHorariosTipo} from './core/_requests'
import {ListHeader} from './components/header/ListHeader'
import {QueryRequestProvider} from './core/QueryRequestProvider'
import {QueryResponseProvider, useQueryResponse} from './core/QueryResponseProvider'
import {AsignacionesAdministrativasTable} from './table/AsignacionesAdministrativasTable'

const AsignacionesAdministrativasListInner = () => {
  const [horariosTipo, setHorariosTipo] = useState<HorarioTipo[]>([])
  const [updatingHorarioId, setUpdatingHorarioId] = useState<number | null>(null)
  const [horariosError, setHorariosError] = useState<string | null>(null)
  const {refetch} = useQueryResponse()

  useEffect(() => {
    const cargarHorarios = async () => {
      try {
        setHorariosError(null)
        const response = await listarHorariosTipo()
        setHorariosTipo(response)
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'No se pudieron cargar los tipos de horario.'
        setHorariosError(message)
        toast.error(message)
      }
    }

    void cargarHorarios()
  }, [])

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new Tooltip(tooltipTriggerEl)
    })
  }, [horariosTipo])

  const handleHorarioTipoChange = async (item: AsignacionAdministrativa, value: string) => {
    const id = Number(item.id_asignacion_administrativo)
    if (!id) {
      return
    }

    const horarioActual = item.id_horario_tipo ?? ''
    const horarioNuevo = value === '' ? null : Number(value)

    if ((horarioActual === '' ? null : Number(horarioActual)) === horarioNuevo) {
      return
    }

    setUpdatingHorarioId(id)
    try {
      await actualizarAsignacionAdministrativa(id, {
        id_horario_tipo: horarioNuevo,
      })
      await refetch()
      toast.success('Tipo de horario actualizado correctamente.')
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || 'No se pudo actualizar el tipo de horario.'
      )
    } finally {
      setUpdatingHorarioId(null)
    }
  }

  return (
    <KTCard>
      <ListHeader />
      {horariosError && <div className='alert alert-danger mx-9 mt-6 mb-0'>{horariosError}</div>}
      <AsignacionesAdministrativasTable
        horariosTipo={horariosTipo}
        onHorarioTipoChange={handleHorarioTipoChange}
        updatingHorarioId={updatingHorarioId}
      />
    </KTCard>
  )
}

const AsignacionesAdministrativasListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <AsignacionesAdministrativasListInner />
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {AsignacionesAdministrativasListWrapper}
