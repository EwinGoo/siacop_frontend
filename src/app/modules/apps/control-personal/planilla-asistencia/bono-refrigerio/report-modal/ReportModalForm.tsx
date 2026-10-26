import {FormikProps} from 'formik'
import {ProcesoPlanilla, ReporteBonoRefrigerioParams} from '../../core/_models'

type Props = {
  formik: FormikProps<ReporteBonoRefrigerioParams>
  proceso: ProcesoPlanilla | null
  onClose: () => void
}

const opcionesFiltro = [
  {value: 'TODOS', label: 'Todos los registros'},
  {value: 'SOLO_BENEFICIARIOS', label: 'Solo con días pagables'},
  {value: 'CON_ATRASO', label: 'Solo con atraso oficial'},
  {value: 'CON_SANCION', label: 'Solo con días de sanción'},
  {value: 'CON_ATRASO_O_SANCION', label: 'Con atraso o sanción'},
  {value: 'SOLO_OBSERVADOS', label: 'Solo observados'},
]

export const ReportModalForm = ({formik, proceso, onClose}: Props) => {
  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className='mb-5'>
        <div className='text-gray-700 fw-bold mb-1'>Proceso seleccionado</div>
        <div className='text-muted'>
          {proceso
            ? `#${proceso.id_proceso} - ${proceso.fecha_inicio || '-'} a ${proceso.fecha_fin || '-'}`
            : 'Sin proceso seleccionado'}
        </div>
      </div>

      <div className='mb-5'>
        <label className='form-label fw-semibold'>Filtro del reporte</label>
        <select
          className='form-select'
          name='filtroReporte'
          value={formik.values.filtroReporte}
          onChange={formik.handleChange}
        >
          {opcionesFiltro.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
      </div>

      <div className='mb-6'>
        <label className='form-label fw-semibold'>Buscar persona (opcional)</label>
        <input
          type='text'
          className='form-control'
          name='search'
          placeholder='Nombre o CI'
          value={formik.values.search || ''}
          onChange={formik.handleChange}
        />
      </div>

      <div className='d-flex justify-content-end gap-3'>
        <button type='button' className='btn btn-light' onClick={onClose} disabled={formik.isSubmitting}>
          Cancelar
        </button>
        <button type='submit' className='btn btn-primary' disabled={formik.isSubmitting || !proceso?.id_proceso}>
          {formik.isSubmitting ? 'Generando...' : 'Generar PDF'}
        </button>
      </div>
    </form>
  )
}
