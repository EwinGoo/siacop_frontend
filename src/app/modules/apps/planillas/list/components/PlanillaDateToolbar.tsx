import {useEffect} from 'react'
import clsx from 'clsx'
import Flatpickr from 'react-flatpickr'
import {Spanish} from 'flatpickr/dist/l10n/es'
import {useEffectiveTheme} from 'src/app/hooks/useEffectiveTheme'
import {EstadoFiltro} from './planillaControlHelpers'

type Props = {
  fechaInicio: string
  fechaFin: string
  savingDates: boolean
  selectedCount: number
  estadoFiltro: EstadoFiltro
  onFechaInicioChange: (value: string) => void
  onFechaFinChange: (value: string) => void
  onEstadoFiltroChange: (value: EstadoFiltro) => void
  onUpdateDates: () => void
}

const estados: EstadoFiltro[] = ['TODOS', 'PENDIENTE', 'ENVIADO', 'APROBADO']

export const PlanillaDateToolbar = ({
  fechaInicio,
  fechaFin,
  savingDates,
  selectedCount,
  estadoFiltro,
  onFechaInicioChange,
  onFechaFinChange,
  onEstadoFiltroChange,
  onUpdateDates,
}: Props) => {
  const {isDark} = useEffectiveTheme()

  const syncFlatpickrTheme = () => {
    setTimeout(() => {
      const calendars = document.querySelectorAll('.flatpickr-calendar')

      calendars.forEach((calendar) => {
        calendar.classList.toggle('flatpickr-dark', isDark)
      })
    }, 0)
  }

  useEffect(() => {
    syncFlatpickrTheme()
  }, [isDark])

  return (
    <div className='d-flex flex-column flex-lg-row align-items-lg-end gap-4 mb-5'>
      {/* Sección de fechas y botón */}
      <div className='d-flex flex-wrap align-items-end gap-3 flex-grow-1'>
        <div className='flex-grow-1 flex-sm-grow-0'>
          <label className='form-label fw-semibold'>Inicio de llenado</label>
          <Flatpickr
            className={clsx(
              'form-control form-control-sm form-control-solid',
              isDark && 'flatpickr-dark'
            )}
            value={fechaInicio}
            onChange={(_, dateStr) => onFechaInicioChange(dateStr)}
            options={{
              altInput: true,
              altFormat: 'd/m/Y',
              dateFormat: 'Y-m-d',
              locale: Spanish,
              monthSelectorType: 'static',
              onOpen: syncFlatpickrTheme,
              onReady: syncFlatpickrTheme,
            }}
            disabled={savingDates}
          />
        </div>

        <div className='flex-grow-1 flex-sm-grow-0'>
          <label className='form-label fw-semibold'>Fin de llenado</label>
          <Flatpickr
            className={clsx(
              'form-control form-control-sm form-control-solid',
              isDark && 'flatpickr-dark'
            )}
            value={fechaFin}
            onChange={(_, dateStr) => onFechaFinChange(dateStr)}
            options={{
              altInput: true,
              altFormat: 'd/m/Y',
              dateFormat: 'Y-m-d',
              locale: Spanish,
              monthSelectorType: 'static',
              onOpen: syncFlatpickrTheme,
              onReady: syncFlatpickrTheme,
            }}
            disabled={savingDates}
          />
        </div>

        <div className='w-100 w-sm-auto'>
          <button
            className='btn btn-sm btn-primary w-100 w-sm-auto'
            disabled={savingDates || selectedCount === 0}
            onClick={onUpdateDates}
          >
            Actualizar fechas ({selectedCount})
          </button>
        </div>
      </div>

      <div className='w-100 w-lg-auto'>
        <div
          className='btn-group btn-group-sm flex-wrap gap-1 w-100'
          role='group'
          aria-label='Filtro por estado'
        >
          {estados.map((estado) => (
            <button
              key={estado}
              type='button'
              className={`btn flex-grow-1 flex-sm-grow-0 ${
                estadoFiltro === estado ? 'btn-primary' : 'btn-light'
              }`}
              onClick={() => onEstadoFiltroChange(estado)}
              style={{minWidth: '80px'}}
            >
              {estado}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
