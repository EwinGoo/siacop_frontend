import {FormikProps} from 'formik'
import Flatpickr from 'react-flatpickr'
import Select from 'react-select'
import {Spanish} from 'flatpickr/dist/l10n/es'
import {SelectField} from 'src/app/modules/components/SelectField'
import {estadoOptions} from '../core/_models'
import {DatePickerField} from 'src/app/modules/components/DatePickerField'
import {TipoPermiso} from '../../../permisos/tipos-permisos/list/core/_models'
import {useEffect} from 'react'

const tipoComisionOptions = [
  {value: 'TODO', label: 'Todo'},
  {value: 'PERSONAL', label: 'Personal'},
  {value: 'TRANSPORTE', label: 'Transporte'},
]

export const ReportModalForm = ({
  formik,
  onClose,
  tiposPermiso,
}: {
  formik: FormikProps<any>
  onClose: () => void
  tiposPermiso: TipoPermiso[]
}) => {
  const getFieldError = (fieldName: string) => {
    // return formik.errors[fieldName] || backendErrors[fieldName]
    return formik.errors[fieldName]
  }
  const isFieldValid = (fieldName: string) => {
    return !(formik.touched[fieldName] && getFieldError(fieldName))
  }

  const handleChange = (fieldName: string) => (value: any) => {
    formik.setFieldValue(fieldName, value)
  }

  const tipoOptions = [
    {value: 'TODO', label: 'Todo'},
    {value: 'COMISIONES', label: 'COMISIONES'},
    {value: 'BAJA_MEDICA', label: 'BAJAS MEDICAS'},
    ...tiposPermiso.map((tipo) => ({
      value: tipo.id_tipo_permiso!.toString(),
      label: tipo.nombre,
    })),
  ]

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className='modal-body py-0'>
        <div className='row mb-4'>
          <p className='text-muted mb-4'>
            Seleccione el rango de fechas para generar el reporte de boletas recepcionadas.
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
            <label className='form-label fw-semibold'>🚗 Tipo de Comisión</label>
            <SelectField
              field={formik.getFieldProps('tipoComision')}
              form={formik}
              isFieldValid={isFieldValid('tipoComision')}
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
              <span className='spinner-border spinner-border-sm me-2' role='status'></span>
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
