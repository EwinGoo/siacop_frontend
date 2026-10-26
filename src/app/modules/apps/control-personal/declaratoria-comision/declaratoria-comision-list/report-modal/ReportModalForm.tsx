import {FormikProps} from 'formik'
import {DatePickerField} from 'src/app/modules/components/DatePickerField'
import {SelectField} from 'src/app/modules/components/SelectField'

const estadoOptions = [
  {value: 'TODO', label: 'Todos'},
  {value: 'GENERADO', label: 'Generado'},
  {value: 'EMITIDO', label: 'Emitido'},
  {value: 'ANULADO', label: 'Anulado'},
]

const tipoViaticoOptions = [
  {value: 'TODO', label: 'Todos'},
  {value: 'con_viatico', label: 'Con viático'},
  {value: 'sin_viatico', label: 'Sin viático'},
]

type Props = {
  formik: FormikProps<any>
  onClose: () => void
}

export const ReportModalForm = ({formik, onClose}: Props) => {
  const getFieldError = (fieldName: string) => formik.errors[fieldName]
  const isFieldValid = (fieldName: string) => !(formik.touched[fieldName] && getFieldError(fieldName))
  const handleChange = (fieldName: string) => (value: any) => formik.setFieldValue(fieldName, value)

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className='modal-body py-0'>
        <p className='text-muted mb-4'>Seleccione el rango y filtros para generar el reporte de declaratorias en comisión.</p>
        <div className='row g-4'>
          <div className='col-md-6'>
            <label className='form-label fw-semibold'>Fecha de inicio</label>
            <DatePickerField
              field={formik.getFieldProps('fechaInicio')}
              form={formik}
              isFieldValid={isFieldValid('fechaInicio')}
              isSubmitting={formik.isSubmitting}
              onChange={handleChange('fechaInicio')}
              onBlur={() => formik.setFieldTouched('fechaInicio', true)}
            />
            {!isFieldValid('fechaInicio') && (
              <div className='fv-plugins-message-container'><span role='alert'>{formik.errors.fechaInicio as string}</span></div>
            )}
          </div>
          <div className='col-md-6'>
            <label className='form-label fw-semibold'>Fecha de fin</label>
            <DatePickerField
              field={formik.getFieldProps('fechaFin')}
              form={formik}
              isFieldValid={isFieldValid('fechaFin')}
              isSubmitting={formik.isSubmitting}
              onChange={handleChange('fechaFin')}
              onBlur={() => formik.setFieldTouched('fechaFin', true)}
            />
            {!isFieldValid('fechaFin') && (
              <div className='fv-plugins-message-container'><span role='alert'>{formik.errors.fechaFin as string}</span></div>
            )}
          </div>
          <div className='col-md-6'>
            <label className='form-label fw-semibold'>Estado</label>
            <SelectField
              field={formik.getFieldProps('estado')}
              form={formik}
              isFieldValid={isFieldValid('estado')}
              isSubmitting={formik.isSubmitting}
              options={estadoOptions}
              placeholder='Seleccione estado'
            />
          </div>
          <div className='col-md-6'>
            <label className='form-label fw-semibold'>Tipo de viático</label>
            <SelectField
              field={formik.getFieldProps('tipoViatico')}
              form={formik}
              isFieldValid={isFieldValid('tipoViatico')}
              isSubmitting={formik.isSubmitting}
              options={tipoViaticoOptions}
              placeholder='Seleccione tipo'
            />
          </div>
        </div>
      </div>

      <div className='modal-footer'>
        <button type='button' className='btn btn-light' onClick={onClose} disabled={formik.isSubmitting}>
          <i className='bi bi-x-circle me-2'></i> Cancelar
        </button>
        <button type='submit' className='btn btn-primary' disabled={formik.isSubmitting}>
          {formik.isSubmitting ? (
            <><span className='spinner-border spinner-border-sm me-2' role='status'></span>Generando...</>
          ) : (
            <><i className='bi bi-file-earmark-pdf me-2'></i> Generar reporte</>
          )}
        </button>
      </div>
    </form>
  )
}