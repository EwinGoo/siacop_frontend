import {FormikProps} from 'formik'
import {SelectField} from 'src/app/modules/components/SelectField'
import {TipoPermiso} from '../../../tipos-permisos/list/core/_models'
import {DatePickerField} from 'src/app/modules/components/DatePickerField'

export const ReportModalForm = ({
  formik,
  onClose,
  tiposPermisos,
}: {
  formik: FormikProps<any>
  onClose: () => void
  tiposPermisos: TipoPermiso[]
}) => {
  const getFieldError = (fieldName: string) => {
    return formik.errors[fieldName]
  }
  const isFieldValid = (fieldName: string) => {
    return !(formik.touched[fieldName] && getFieldError(fieldName))
  }

  const tipoOptions = [
    {value: 'TODO', label: 'Todo'},
    {value: 'LICENCIAS', label: 'LICENCIAS ESPECIALES'},
    {value: 'DAF', label: 'DAF'},
    ...tiposPermisos
      .sort((a, b) => (a.nombre === 'Baja Médica' ? -1 : b.nombre === 'Baja Médica' ? 1 : 0))
      .map((tipo) => ({
        value: tipo.id_tipo_permiso!.toString(),
        label: tipo.nombre,
      })),
  ]
  const handleChange = (fieldName: string) => (value: any) => {
    formik.setFieldValue(fieldName, value)
    // clearFieldError(fieldName)
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className='modal-body py-0'>
        <div className='row mb-4'>
          <p className='text-muted mb-4'>
            Seleccione el rango de fechas para generar el reporte de permisos.
          </p>
          <div className='col-md-6'>
            <label className='form-label fw-semibold'>📅 Fecha de inicio</label>
            <DatePickerField
              field={formik.getFieldProps('fechaInicio')}
              form={formik}
              isFieldValid={isFieldValid('fechaInicio')}
              isSubmitting={formik.isSubmitting}
              onChange={handleChange('fechaInicio')}
              onBlur={() => formik.setFieldTouched('fechaInicio', true)}
            />
            {!isFieldValid('fechaInicio') && (
              <div className='fv-plugins-message-container'>
                <span role='alert'>{formik.errors.fechaInicio as string}</span>
              </div>
            )}
          </div>
          <div className='col-md-6'>
            <label className='form-label fw-semibold'>📅 Fecha de fin</label>
            <DatePickerField
              field={formik.getFieldProps('fechaFin')}
              form={formik}
              isFieldValid={isFieldValid('fechaFin')}
              isSubmitting={formik.isSubmitting}
              onChange={handleChange('fechaFin')}
              onBlur={() => formik.setFieldTouched('fechaFin', true)}
            />
            {!isFieldValid('fechaFin') && (
              <div className='fv-plugins-message-container'>
                <span role='alert'>{formik.errors.fechaFin as string}</span>
              </div>
            )}
          </div>
          {/* <div className='col-md-6 mb-4 mt-4'>
            <label className='form-label fw-semibold'>📝 Estado</label>
            <SelectField
              field={formik.getFieldProps('estado')}
              form={formik}
              isFieldValid={isFieldValid('estado')}
              isSubmitting={formik.isSubmitting}
              options={estadoOptions}
              placeholder='Seleccione estado'
            />
          </div> */}

          <div className='col-md-6 mb-4 mt-4'>
            <label className='form-label fw-semibold'>Tipo de Permiso</label>
            <SelectField
              field={formik.getFieldProps('tipoPermiso')}
              form={formik}
              isFieldValid={isFieldValid('tipoPermiso')}
              isSubmitting={formik.isSubmitting}
              options={tipoOptions}
              placeholder='Seleccione tipo'
            />
          </div>
        </div>
      </div>

      <div className='modal-footer'>
        <button type='button' className='btn btn-light' onClick={onClose}>
          <i className='bi bi-x-circle me-2'></i> Cancelar
        </button>
        <button type='submit' className='btn btn-primary' disabled={formik.isSubmitting}>
          {formik.isSubmitting ? (
            <>
              <span className='spinner-border spinner-border-sm me-2' />
              Generando...
            </>
          ) : (
            <>
              <i className='bi bi-file-earmark-bar-graph me-2'></i> Generar Reporte
            </>
          )}
        </button>
      </div>
    </form>
  )
}
