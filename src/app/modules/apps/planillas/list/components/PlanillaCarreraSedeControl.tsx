import { useCallback, useEffect, useMemo, useState } from 'react'
import { KTCard } from 'src/_metronic/helpers'
import { showAxiosError } from 'src/app/utils/showAxiosErrorToast'
import { showToast } from 'src/app/utils/toastHelper'
import {
  getCarrerasPlanilla,
  getPlanillas,
  updateCarreraEstado,
  updateCarrerasFechas,
} from '../core/_requests'
import { PlanillaCarrera, PlanillaModulo, PlanillaResumen } from '../core/_models'
import { PlanillaCarrerasTable } from './PlanillaCarrerasTable'
import { PlanillaDateToolbar } from './PlanillaDateToolbar'
import { PlanillaListView } from './PlanillaListView'
import { PlanillaCarreraTotals, PlanillaMetrics } from './PlanillaMetrics'
import { PlanillaSearchHeader } from './PlanillaSearchHeader'
import {
  EstadoFiltro,
  esPlanillaAprobada,
  estadosCarrera,
  moduleLabel,
  toNumber,
} from './planillaControlHelpers'

type Props = {
  modulo: PlanillaModulo
}

export const PlanillaCarreraSedeControl = ({ modulo }: Props) => {
  const [planillas, setPlanillas] = useState<PlanillaResumen[]>([])
  const [selectedPlanillaId, setSelectedPlanillaId] = useState<number | null>(null)
  const [carreras, setCarreras] = useState<PlanillaCarrera[]>([])
  const [selectedCarreras, setSelectedCarreras] = useState<number[]>([])
  const [searchPlanilla, setSearchPlanilla] = useState('')
  const [searchCarrera, setSearchCarrera] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('TODOS')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [loadingPlanillas, setLoadingPlanillas] = useState(false)
  const [loadingCarreras, setLoadingCarreras] = useState(false)
  const [savingDates, setSavingDates] = useState(false)

  const selectedPlanilla = useMemo(
    () => planillas.find((planilla) => planilla.id_planilla === selectedPlanillaId) || null,
    [planillas, selectedPlanillaId]
  )
  const readOnlyPlanilla = selectedPlanilla ? esPlanillaAprobada(selectedPlanilla) : false

  const filteredPlanillas = useMemo(() => {
    const term = searchPlanilla.trim().toLowerCase()
    if (!term) return planillas

    return planillas.filter((planilla) =>
      `#${planilla.id_planilla} ${planilla.tipo_planilla} ${planilla.mes_gestion} ${planilla.estado_planilla}`
        .toLowerCase()
        .includes(term)
    )
  }, [planillas, searchPlanilla])

  const filteredCarreras = useMemo(() => {
    const term = searchCarrera.trim().toLowerCase()

    return carreras.filter((carrera) => {
      const matchesTerm =
        !term ||
        `${carrera.nombre_completo_carrera} ${carrera.nombre_sede} ${carrera.llenado_asistencia_estado}`
          .toLowerCase()
          .includes(term)
      const matchesState = estadoFiltro === 'TODOS' || carrera.llenado_asistencia_estado === estadoFiltro

      return matchesTerm && matchesState
    })
  }, [carreras, estadoFiltro, searchCarrera])

  const totals = useMemo<PlanillaCarreraTotals>(() => {
    return carreras.reduce(
      (acc, carrera) => {
        acc.asignaciones += toNumber(carrera.numero_asignaciones)
        acc.horasAsignadas += toNumber(carrera.horas_asignadas)
        acc.horasTrabajadas += toNumber(carrera.horas_trabajadas)
        acc[carrera.llenado_asistencia_estado.toLowerCase() as 'pendiente' | 'enviado' | 'aprobado'] += 1
        return acc
      },
      {
        pendiente: 0,
        enviado: 0,
        aprobado: 0,
        asignaciones: 0,
        horasAsignadas: 0,
        horasTrabajadas: 0,
      }
    )
  }, [carreras])

  const loadPlanillas = useCallback(async () => {
    setLoadingPlanillas(true)
    try {
      const response = await getPlanillas(modulo)
      setPlanillas(response)
      setSelectedPlanillaId(null)
    } catch (error) {
      showAxiosError(error)
    } finally {
      setLoadingPlanillas(false)
    }
  }, [modulo])

  const loadCarreras = useCallback(async (idPlanilla: number) => {
    setLoadingCarreras(true)
    try {
      const response = await getCarrerasPlanilla(modulo, idPlanilla)
      setCarreras(response.carreras)
      setSelectedCarreras([])
      setFechaInicio(response.planilla.fecha_inicio_llenado_asistencia || '')
      setFechaFin(response.planilla.fecha_fin_llenado_asistencia || '')
    } catch (error) {
      showAxiosError(error)
    } finally {
      setLoadingCarreras(false)
    }
  }, [modulo])

  useEffect(() => {
    loadPlanillas()
  }, [loadPlanillas])

  useEffect(() => {
    if (selectedPlanillaId) {
      loadCarreras(selectedPlanillaId)
    } else {
      setCarreras([])
      setSelectedCarreras([])
      setSearchCarrera('')
      setEstadoFiltro('TODOS')
    }
  }, [loadCarreras, selectedPlanillaId])

  const openPlanilla = (idPlanilla: number) => {
    setSelectedPlanillaId(idPlanilla)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleCarrera = (idCarreraSede: number) => {
    setSelectedCarreras((current) =>
      current.includes(idCarreraSede)
        ? current.filter((id) => id !== idCarreraSede)
        : [...current, idCarreraSede]
    )
  }

  const toggleVisible = () => {
    const visibleIds = filteredCarreras.map((carrera) => Number(carrera.id_carrera_sede))
    const allVisibleSelected = visibleIds.every((id) => selectedCarreras.includes(id))

    setSelectedCarreras((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    )
  }

  const reloadSelectedPlanilla = async (idPlanilla: number) => {
    await loadCarreras(idPlanilla)
    await loadPlanillas()
    setSelectedPlanillaId(idPlanilla)
  }

  const handleUpdateDates = async () => {
    if (readOnlyPlanilla) {
      showToast({ type: 'warning', message: 'No se puede modificar una planilla APROBADA' })
      return
    }

    if (!selectedPlanillaId || selectedCarreras.length === 0) {
      showToast({ type: 'warning', message: 'Seleccione al menos una carrera' })
      return
    }

    if (!fechaInicio || !fechaFin) {
      showToast({ type: 'warning', message: 'Ingrese fecha inicio y fecha fin' })
      return
    }

    if (fechaInicio > fechaFin) {
      showToast({ type: 'warning', message: 'La fecha inicio no puede ser mayor a la fecha fin' })
      return
    }

    setSavingDates(true)
    try {
      const response = await updateCarrerasFechas(
        modulo,
        selectedPlanillaId,
        selectedCarreras,
        fechaInicio,
        fechaFin
      )
      showToast({ type: 'success', message: response.message || 'Fechas actualizadas' })
      await reloadSelectedPlanilla(selectedPlanillaId)
    } catch (error) {
      showAxiosError(error)
    } finally {
      setSavingDates(false)
    }
  }

  const handleStateChange = async (carrera: PlanillaCarrera, estadoDestino: PlanillaCarrera['llenado_asistencia_estado']) => {
    if (readOnlyPlanilla) {
      showToast({ type: 'warning', message: 'No se puede modificar una planilla APROBADA' })
      return
    }

    if (!selectedPlanillaId) return
    if (estadoDestino === carrera.llenado_asistencia_estado) return
    if (!estadosCarrera.includes(estadoDestino)) return

    try {
      const response = await updateCarreraEstado(
        modulo,
        selectedPlanillaId,
        Number(carrera.id_carrera_sede),
        estadoDestino
      )
      showToast({ type: 'success', message: response.message || 'Estado actualizado' })
      await reloadSelectedPlanilla(selectedPlanillaId)
    } catch (error) {
      showAxiosError(error, { useSwal: true })
    }
  }

  const allVisibleSelected =
    filteredCarreras.length > 0 &&
    filteredCarreras.every((carrera) => selectedCarreras.includes(Number(carrera.id_carrera_sede)))

  if (!selectedPlanilla) {
    return (
      <PlanillaListView
        planillas={filteredPlanillas}
        search={searchPlanilla}
        loading={loadingPlanillas}
        onSearch={setSearchPlanilla}
        onOpen={openPlanilla}
        onReload={loadPlanillas}
      />
    )
  }

  return (
    <KTCard>
      <PlanillaSearchHeader
        search={searchCarrera}
        placeholder='Buscar carrera o sede'
        onSearch={setSearchCarrera}
        onReload={() => loadCarreras(selectedPlanilla.id_planilla)}
      >
        <div className='d-flex flex-column align-items-start'>
          <span className='fw-bold fs-3'>
            {selectedPlanilla.tipo_planilla} {selectedPlanilla.mes_gestion}
          </span>
        </div>
      </PlanillaSearchHeader>

      <div className='card-body py-5'>
        {readOnlyPlanilla && (
          <div className='alert alert-primary d-flex align-items-center p-5 mb-5'>
            <div>
              <div className='fw-bold'>Planilla aprobada</div>
              <div className='text-muted'>
                La habilitación de carreras y fechas queda disponible solo para consulta.
              </div>
            </div>
          </div>
        )}
        <PlanillaMetrics carrerasCount={carreras.length} totals={totals} />
        {!readOnlyPlanilla && (
          <PlanillaDateToolbar
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            savingDates={savingDates}
            selectedCount={selectedCarreras.length}
            estadoFiltro={estadoFiltro}
            onFechaInicioChange={setFechaInicio}
            onFechaFinChange={setFechaFin}
            onEstadoFiltroChange={setEstadoFiltro}
            onUpdateDates={handleUpdateDates}
          />
        )}
        <PlanillaCarrerasTable
          carreras={filteredCarreras}
          loading={loadingCarreras}
          selectedCarreras={selectedCarreras}
          allVisibleSelected={allVisibleSelected}
          onToggleCarrera={toggleCarrera}
          onToggleVisible={toggleVisible}
          onStateChange={handleStateChange}
          readOnly={readOnlyPlanilla}
        />
      </div>
    </KTCard>
  )
}
