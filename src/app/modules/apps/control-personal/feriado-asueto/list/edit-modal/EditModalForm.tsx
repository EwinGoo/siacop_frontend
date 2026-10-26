import {FC, useState, useEffect} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import {isNotEmpty, KTIcon} from '../../../../../../../_metronic/helpers'
import {initialFeriadoAsueto, FeriadoAsueto} from '../core/_models'
import clsx from 'clsx'
import {useListView} from '../core/ListViewProvider'
import {createFeriadoAsueto, updateFeriadoAsueto} from '../core/_requests'
import {useQueryResponse} from '../core/QueryResponseProvider'
import Swal from 'sweetalert2'
import {toast} from 'react-toastify'
import {DatePickerField} from 'src/app/modules/components/DatePickerField'
import {SelectField} from 'src/app/modules/components/SelectField'
import {useApiFieldErrors} from 'src/app/hooks/useApiFieldErrors'
import {FormActions} from 'src/app/modules/components/FormActions'
import {feriadoAsuetoSchema} from '../../schemas/feriadoAsuetoSchema'
import {ListLoading} from 'src/app/modules/components/loading/ListLoading'
import {ValidationError} from 'src/app/utils/httpErrors'

type Props = {
  isFeriadoAsuetoLoading: boolean
  feriadoAsueto: FeriadoAsueto
  onClose: () => void
}
const options = [
  {label: 'Asueto', value: 'ASUETO'},
  {label: 'Feriado', value: 'FERIADO'},
]

const optionsAplicado = [
  {label: 'Todos', value: 'TODOS'},
  {label: 'Masculino', value: 'MASCULINO'},
  {label: 'Femenino', value: 'FEMENINO'},
]

const EditModalForm: FC<Props> = ({feriadoAsueto, isFeriadoAsuetoLoading, onClose}) => {
  const {setItemIdForUpdate} = useListView()
  const {refetch} = useQueryResponse()
  const {apiErrors, setApiErrors, getFieldError, clearFieldError} = useApiFieldErrors()

  const [feriadoAsuetoForEdit] = useState<FeriadoAsueto>({
    ...feriadoAsueto,
    nombre_evento: feriadoAsueto.nombre_evento || initialFeriadoAsueto.nombre_evento,
    tipo_evento: feriadoAsueto.tipo_evento || initialFeriadoAsueto.tipo_evento,
    fecha_evento: feriadoAsueto.fecha_evento || initialFeriadoAsueto.fecha_evento,
    fecha_inicio: feriadoAsueto.fecha_inicio || initialFeriadoAsueto.fecha_inicio,
    fecha_fin: feriadoAsueto.fecha_fin || initialFeriadoAsueto.fecha_fin,
    hora_inicio: feriadoAsueto.hora_inicio || initialFeriadoAsueto.hora_inicio,
    hora_fin: feriadoAsueto.hora_fin || initialFeriadoAsueto.hora_fin,
    aplicado_a: feriadoAsueto.aplicado_a || initialFeriadoAsueto.aplicado_a,
  })

  const cancel = (withRefresh?: boolean) => {
    if (withRefresh) {
      refetch()
    }
    setItemIdForUpdate(undefined)
  }

  const formik = useFormik({
    initialValues: feriadoAsuetoForEdit,
    validationSchema: feriadoAsuetoSchema,
    onSubmit: async (values, {setSubmitting}) => {
      setSubmitting(true)
      setApiErrors({})

      try {
        if (isNotEmpty(values.id_asistencia_feriado_asueto)) {
          await updateFeriadoAsueto(values)
          toast.success('Feriado/Asueto actualizado correctamente', {
            position: 'top-right',
            autoClose: 5000,
          })
        } else {
          await createFeriadoAsueto(values)
          toast.success('Feriado/Asueto creado correctamente', {
            position: 'top-right',
            autoClose: 5000,
          })
        }
        cancel(true)
        onClose()
      } catch (error: any) {
        console.error(error)
        if (error instanceof ValidationError) {
          setApiErrors(error.validationErrors)
          await Swal.fire({
            icon: 'error',
            title: 'Error de validación',
            html: Object.entries(error.validationErrors)
              .map(([field, message]) => `<li>${message}</li>`)
              .join(''),
          })
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Error al procesar la solicitud',
          })
        }
      } finally {
        setSubmitting(false)
      }
    },
  })

  const shouldShowFieldError = (fieldName: string) => {
    return Boolean(getFieldError(formik.errors, fieldName)) && (
      Boolean(formik.touched[fieldName]) ||
      Boolean(apiErrors[fieldName]) ||
      formik.submitCount > 0
    )
  }

  const isFieldValid = (fieldName: string) => {
    return !shouldShowFieldError(fieldName)
  }

  useEffect(() => {
    // Limpiar campos cuando cambia el tipo de evento
    if (formik.values.tipo_evento === 'ASUETO') {
      formik.setFieldValue('fecha_inicio', feriadoAsuetoForEdit.fecha_inicio)
      formik.setFieldValue('fecha_fin', feriadoAsuetoForEdit.fecha_fin)
    } else if (formik.values.tipo_evento === 'FERIADO') {
      formik.setFieldValue('fecha_evento', feriadoAsuetoForEdit.fecha_evento)
      formik.setFieldValue('hora_inicio', feriadoAsuetoForEdit.hora_inicio)
      formik.setFieldValue('hora_fin', feriadoAsuetoForEdit.hora_fin)
      formik.setFieldValue('aplicado_a', feriadoAsuetoForEdit.aplicado_a)
    }
  }, [formik.values.tipo_evento])

  const handleChange = (fieldName: keyof FeriadoAsueto) => (value: any) => {
    formik.setFieldValue(fieldName, value)
  }

  return (
    <>
      <form id='kt_modal_add_feriado_asueto_form' className='form' onSubmit={formik.handleSubmit}>
        <div className='d-flex flex-column me-n7 pe-7 pt-5'>
          {/* Nombre del Evento */}
          <div className='fv-row mb-7 px-1'>
            <label className='required fw-bold fs-6 mb-2'>Nombre del Evento</label>
            <input
              {...formik.getFieldProps('nombre_evento')}
              className={clsx('form-control form-control-solid', {
                'is-invalid': !isFieldValid('nombre_evento'),
                'is-valid': formik.touched.nombre_evento && isFieldValid('nombre_evento'),
              })}
              disabled={formik.isSubmitting}
            />
            {!isFieldValid('nombre_evento') && (
              <div className='fv-plugins-message-container'>
                <span role='alert'>{getFieldError(formik.errors, 'nombre_evento')}</span>
              </div>
            )}
          </div>

          {/* Tipo de Evento */}
          <div className='fv-row mb-7 px-1'>
            <label className='required fw-bold fs-6 mb-2'>Tipo de Evento</label>
            <SelectField
              field={formik.getFieldProps('tipo_evento')}
              form={formik}
              isFieldValid={isFieldValid('tipo_evento')}
              clearFieldError={clearFieldError}
              isSubmitting={formik.isSubmitting}
              placeholder='Seleccione un tipo de permiso'
              options={options}
            />
            {!isFieldValid('tipo_evento') && (
              <div className='fv-plugins-message-container'>
                <span role='alert'>{getFieldError(formik.errors, 'tipo_evento')}</span>
              </div>
            )}
          </div>

          {/* Campos para ASUETO */}
          {formik.values.tipo_evento === 'ASUETO' && (
            <>
              <div className='fv-row mb-7 px-1'>
                <label className='required fw-bold fs-6 mb-2'>Fecha del Evento</label>
                <DatePickerField
                  field={formik.getFieldProps('fecha_evento')}
                  form={formik}
                  isFieldValid={isFieldValid('fecha_evento')}
                  isSubmitting={formik.isSubmitting}
                  onChange={handleChange('fecha_evento')}
                  onBlur={() => formik.setFieldTouched('fecha_evento', true)}
                />
                {!isFieldValid('fecha_evento') && (
                  <div className='fv-plugins-message-container'>
                    <span role='alert'>{getFieldError(formik.errors, 'fecha_evento')}</span>
                  </div>
                )}
              </div>

              <div className='row px-1'>
                <div className='col-md-6 fv-row mb-7 mt-mb-0'>
                  <label className='required fw-bold fs-6 mb-2'>Hora Inicio</label>
                  <input
                    type='time'
                    {...formik.getFieldProps('hora_inicio')}
                    className={clsx('form-control form-control-solid', {
                      'is-invalid': !isFieldValid('hora_inicio'),
                      'is-valid': formik.touched.hora_inicio && isFieldValid('hora_inicio'),
                    })}
                    disabled={formik.isSubmitting}
                  />
                  {!isFieldValid('hora_inicio') && (
                    <div className='fv-plugins-message-container'>
                      <span role='alert'>{getFieldError(formik.errors, 'hora_inicio')}</span>
                    </div>
                  )}
                </div>
                <div className='col-md-6 fv-row  mb-7 mt-mb-0'>
                  <label className='required fw-bold fs-6 mb-2'>Hora Fin</label>
                  <input
                    type='time'
                    {...formik.getFieldProps('hora_fin')}
                    className={clsx('form-control form-control-solid', {
                      'is-invalid': !isFieldValid('hora_fin'),
                      'is-valid': formik.touched.hora_fin && isFieldValid('hora_fin'),
                    })}
                    disabled={formik.isSubmitting}
                  />
                  {!isFieldValid('hora_fin') && (
                    <div className='fv-plugins-message-container'>
                      <span role='alert'>{getFieldError(formik.errors, 'hora_fin')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className='fv-row mb-7 px-1'>
                <label className='required fw-bold fs-6 mb-2'>Aplicado a</label>
                <SelectField
                  field={formik.getFieldProps('aplicado_a')}
                  form={formik}
                  isFieldValid={isFieldValid('aplicado_a')}
                  clearFieldError={clearFieldError}
                  isSubmitting={formik.isSubmitting}
                  placeholder=''
                  options={optionsAplicado}
                />
                {!isFieldValid('aplicado_a') && (
                  <div className='fv-plugins-message-container'>
                    <span role='alert'>{getFieldError(formik.errors, 'aplicado_a')}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Campos para FERIADO */}
          {formik.values.tipo_evento === 'FERIADO' && (
            <div className='row mb-7'>
              <div className='col-md-6 fv-row'>
                <label className='required fw-bold fs-6 mb-2'>Fecha Inicio</label>
                <DatePickerField
                  field={formik.getFieldProps('fecha_inicio')}
                  form={formik}
                  isFieldValid={isFieldValid('fecha_inicio')}
                  isSubmitting={formik.isSubmitting}
                  onChange={handleChange('fecha_inicio')}
                  onBlur={() => formik.setFieldTouched('fecha_inicio', true)}
                />
                {!isFieldValid('fecha_inicio') && (
                  <div className='fv-plugins-message-container'>
                    <span role='alert'>{getFieldError(formik.errors, 'fecha_inicio')}</span>
                  </div>
                )}
              </div>
              <div className='col-md-6 fv-row'>
                <label className='required fw-bold fs-6 mb-2'>Fecha Fin</label>
                <DatePickerField
                  field={formik.getFieldProps('fecha_fin')}
                  form={formik}
                  isFieldValid={isFieldValid('fecha_fin')}
                  isSubmitting={formik.isSubmitting}
                  onChange={handleChange('fecha_fin')}
                  onBlur={() => formik.setFieldTouched('fecha_fin', true)}
                />
                {!isFieldValid('fecha_fin') && (
                  <div className='fv-plugins-message-container'>
                    <span role='alert'>{getFieldError(formik.errors, 'fecha_fin')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <FormActions
          onClose={onClose}
          isSubmitting={formik.isSubmitting}
          // isValid={formik.isValid}
          isValid={true}
          isEdit={!!feriadoAsueto.id_asistencia_feriado_asueto}
        />
      </form>
      {(formik.isSubmitting || isFeriadoAsuetoLoading) && <ListLoading />}
    </>
  )
}

export {EditModalForm}
