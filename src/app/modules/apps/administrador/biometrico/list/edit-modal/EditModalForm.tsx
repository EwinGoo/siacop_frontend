import {ChangeEvent, FC, FocusEvent, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import {isNotEmpty} from 'src/_metronic/helpers'
import {initialDispositivoBiometrico, DispositivoBiometrico} from '../core/_models'
import clsx from 'clsx'
import {useListView} from '../core/ListViewProvider'
import {createDispositivoBiometrico, updateDispositivoBiometrico} from '../core/_requests'
import {useQueryResponse} from '../core/QueryResponseProvider'
import Swal from 'sweetalert2'
import {toast} from 'react-toastify'
import {useApiFieldErrors} from 'src/app/hooks/useApiFieldErrors'
import {FormActions} from 'src/app/modules/components/FormActions'
import {ListLoading} from 'src/app/modules/components/loading/ListLoading'

// Schema de validación
const dispositivoBiometricoSchema = Yup.object().shape({
  nombre_dispositivo: Yup.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres')
    .required('El nombre del dispositivo es obligatorio'),
  direccion_ip: Yup.string().max(255, 'La dirección IP no puede exceder los 255 caracteres').nullable(),
  direccion_ip_privada: Yup.string()
    .matches(
      /^$|^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      'Debe proporcionar una IP privada válida'
    )
    .max(45, 'La IP privada no puede exceder los 45 caracteres')
    .nullable(),
  direccion_ip_dns: Yup.string().max(255, 'El DNS no puede exceder los 255 caracteres').nullable(),
  puerto: Yup.number()
    .integer('El puerto debe ser un número entero')
    .min(1, 'El puerto debe ser mayor a 0')
    .max(65535, 'El puerto no puede ser mayor a 65535')
    .required('El puerto es obligatorio'),
  serial: Yup.string()
    .max(50, 'El serial no puede exceder los 50 caracteres')
    .required('El número de serie es obligatorio'),
  ubicacion: Yup.string()
    .max(1000, 'La ubicación no puede exceder los 1000 caracteres')
    .nullable(),
  ubicacion_descripcion: Yup.string()
    .max(100, 'La descripción de ubicación no puede exceder los 100 caracteres')
    .nullable(),
  modelo: Yup.string()
    .max(100, 'El modelo no puede exceder los 100 caracteres')
    .nullable(),
  firmware: Yup.string()
    .max(100, 'El firmware no puede exceder los 100 caracteres')
    .nullable(),
  mac_address: Yup.string().max(17, 'La MAC no puede exceder los 17 caracteres').nullable(),
  clave_comunicacion: Yup.string().max(100, 'La clave no puede exceder los 100 caracteres').nullable(),
  adms_key: Yup.string().max(255, 'La ADMS key no puede exceder los 255 caracteres').nullable(),
  metodo_ingesta_marcacion: Yup.string().oneOf(['ADMS', 'TCP_PULL', 'MIXTO']).required(),
  fuente_principal_marcacion: Yup.string().oneOf(['ADMS', 'TCP_PULL']).required(),
  platform: Yup.string()
    .max(50, 'La plataforma no puede exceder los 50 caracteres')
    .nullable(),
})

type Props = {
  isLoading: boolean
  dispositivoBiometrico: DispositivoBiometrico
  onClose: () => void
}

const EditModalForm: FC<Props> = ({dispositivoBiometrico, isLoading, onClose}) => {
  const {setItemIdForUpdate} = useListView()
  const {refetch} = useQueryResponse()
  const {apiErrors, setApiErrors, getFieldError, clearFieldError} = useApiFieldErrors()

  const [dispositivoBiometricoForEdit] = useState<DispositivoBiometrico>({
    ...dispositivoBiometrico,
    nombre_dispositivo: dispositivoBiometrico.nombre_dispositivo || initialDispositivoBiometrico.nombre_dispositivo,
    direccion_ip: dispositivoBiometrico.direccion_ip || initialDispositivoBiometrico.direccion_ip,
    direccion_ip_privada: dispositivoBiometrico.direccion_ip_privada || initialDispositivoBiometrico.direccion_ip_privada,
    direccion_ip_dns: dispositivoBiometrico.direccion_ip_dns || initialDispositivoBiometrico.direccion_ip_dns,
    puerto: dispositivoBiometrico.puerto || initialDispositivoBiometrico.puerto,
    serial: dispositivoBiometrico.serial || initialDispositivoBiometrico.serial,
    ubicacion: dispositivoBiometrico.ubicacion || initialDispositivoBiometrico.ubicacion,
    ubicacion_descripcion: dispositivoBiometrico.ubicacion_descripcion || initialDispositivoBiometrico.ubicacion_descripcion,
    modelo: dispositivoBiometrico.modelo || initialDispositivoBiometrico.modelo,
    firmware: dispositivoBiometrico.firmware || initialDispositivoBiometrico.firmware,
    mac_address: dispositivoBiometrico.mac_address || initialDispositivoBiometrico.mac_address,
    clave_comunicacion: dispositivoBiometrico.clave_comunicacion || initialDispositivoBiometrico.clave_comunicacion,
    adms_key: dispositivoBiometrico.adms_key || initialDispositivoBiometrico.adms_key,
    metodo_ingesta_marcacion:
      dispositivoBiometrico.metodo_ingesta_marcacion || initialDispositivoBiometrico.metodo_ingesta_marcacion,
    fuente_principal_marcacion:
      dispositivoBiometrico.fuente_principal_marcacion || initialDispositivoBiometrico.fuente_principal_marcacion,
    permite_consulta_bajo_demanda:
      dispositivoBiometrico.permite_consulta_bajo_demanda ?? initialDispositivoBiometrico.permite_consulta_bajo_demanda,
    job_nocturno_habilitado:
      dispositivoBiometrico.job_nocturno_habilitado ?? initialDispositivoBiometrico.job_nocturno_habilitado,
    platform: dispositivoBiometrico.platform || initialDispositivoBiometrico.platform,
  })

  const cancel = (withRefresh?: boolean) => {
    if (withRefresh) {
      refetch()
    }
    setItemIdForUpdate(undefined)
  }

  const formik = useFormik({
    initialValues: dispositivoBiometricoForEdit,
    validationSchema: dispositivoBiometricoSchema,
    onSubmit: async (values, {setSubmitting}) => {
      setSubmitting(true)
      setApiErrors({})
      try {
        if (isNotEmpty(values.id_biometrico)) {
          await updateDispositivoBiometrico(values)
          toast.success('Dispositivo biométrico actualizado correctamente', {
            position: 'top-right',
            autoClose: 5000,
          })
        } else {
          await createDispositivoBiometrico(values)
          toast.success('Dispositivo biométrico creado correctamente', {
            position: 'top-right',
            autoClose: 5000,
          })
        }
        cancel(true)
        onClose()
      } catch (error: any) {
        console.error(error)
        const backendValidationErrors =
          error.response?.data?.validation_errors ||
          error.response?.data?.data ||
          null

        if (error.response?.status === 422 && backendValidationErrors) {
          setApiErrors(backendValidationErrors)
          toast.error('Revisa los campos marcados en el formulario.', {
            position: 'top-right',
            autoClose: 4000,
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

  const resolveFieldError = (fieldName: string) => getFieldError(formik.errors, fieldName)

  const shouldShowFieldError = (fieldName: string) => {
    return Boolean(resolveFieldError(fieldName)) && (
      Boolean(formik.touched[fieldName]) ||
      Boolean(apiErrors[fieldName]) ||
      formik.submitCount > 0
    )
  }

  const isFieldValid = (fieldName: string) => {
    return !shouldShowFieldError(fieldName)
  }

  const getManagedFieldProps = (fieldName: keyof DispositivoBiometrico) => {
    const baseProps = formik.getFieldProps(fieldName)

    return {
      ...baseProps,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        clearFieldError(String(fieldName))
        baseProps.onChange(event)
      },
      onBlur: (event: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        baseProps.onBlur(event)
      },
    }
  }

  return (
    <>
      <form id='kt_modal_add_dispositivo_biometrico_form' className='form' onSubmit={formik.handleSubmit}>
        <div className='d-flex flex-column me-n7 pe-7 pt-5'>
          
          {/* Nombre del Dispositivo */}
          <div className='fv-row mb-7 px-1'>
            <label className='required fw-bold fs-6 mb-2'>Nombre del Dispositivo</label>
            <input
              {...getManagedFieldProps('nombre_dispositivo')}
              className={clsx('form-control form-control-solid', {
                'is-invalid': !isFieldValid('nombre_dispositivo'),
                'is-valid': Boolean(formik.touched.nombre_dispositivo) && isFieldValid('nombre_dispositivo'),
              })}
              disabled={formik.isSubmitting}
              placeholder='Ingrese el nombre del dispositivo'
            />
            {shouldShowFieldError('nombre_dispositivo') && (
              <div className='fv-plugins-message-container'>
                <span role='alert'>{resolveFieldError('nombre_dispositivo')}</span>
              </div>
            )}
          </div>

          {/* Dirección IP, DNS y Puerto */}
          <div className='row mb-7 px-1'>
            <div className='col-md-4 fv-row'>
              <label className='fw-bold fs-6 mb-2'>IP privada</label>
              <input
                {...getManagedFieldProps('direccion_ip_privada')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('direccion_ip_privada'),
                  'is-valid': Boolean(formik.touched.direccion_ip_privada) && isFieldValid('direccion_ip_privada'),
                })}
                disabled={formik.isSubmitting}
                placeholder='192.168.1.100'
              />
              {shouldShowFieldError('direccion_ip_privada') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('direccion_ip_privada')}</span>
                </div>
              )}
            </div>
            <div className='col-md-4 fv-row'>
              <label className='fw-bold fs-6 mb-2'>DNS o IP pública</label>
              <input
                {...getManagedFieldProps('direccion_ip_dns')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('direccion_ip_dns'),
                  'is-valid': Boolean(formik.touched.direccion_ip_dns) && isFieldValid('direccion_ip_dns'),
                })}
                disabled={formik.isSubmitting}
                placeholder='biometrico.upea.bo'
              />
              {shouldShowFieldError('direccion_ip_dns') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('direccion_ip_dns')}</span>
                </div>
              )}
            </div>
            <div className='col-md-4 fv-row'>
              <label className='fw-bold fs-6 mb-2'>Dirección principal mostrada</label>
              <input
                {...getManagedFieldProps('direccion_ip')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('direccion_ip'),
                  'is-valid': Boolean(formik.touched.direccion_ip) && isFieldValid('direccion_ip'),
                })}
                disabled={formik.isSubmitting}
                placeholder='IP o DNS preferido'
              />
              {shouldShowFieldError('direccion_ip') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('direccion_ip')}</span>
                </div>
              )}
            </div>
          </div>

          <div className='row mb-7 px-1'>
            <div className='col-md-4 fv-row'>
              <label className='required fw-bold fs-6 mb-2'>Puerto</label>
              <input
                type='number'
                {...getManagedFieldProps('puerto')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('puerto'),
                  'is-valid': Boolean(formik.touched.puerto) && isFieldValid('puerto'),
                })}
                disabled={formik.isSubmitting}
                placeholder='4370'
              />
              {shouldShowFieldError('puerto') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('puerto')}</span>
                </div>
              )}
            </div>
            <div className='col-md-4 fv-row'>
              <label className='fw-bold fs-6 mb-2'>Clave de comunicación</label>
              <input
                {...getManagedFieldProps('clave_comunicacion')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('clave_comunicacion'),
                  'is-valid': Boolean(formik.touched.clave_comunicacion) && isFieldValid('clave_comunicacion'),
                })}
                disabled={formik.isSubmitting}
                placeholder='0'
              />
              {shouldShowFieldError('clave_comunicacion') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('clave_comunicacion')}</span>
                </div>
              )}
            </div>
            <div className='col-md-4 fv-row'>
              <label className='fw-bold fs-6 mb-2'>ADMS Key</label>
              <input
                {...getManagedFieldProps('adms_key')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('adms_key'),
                  'is-valid': Boolean(formik.touched.adms_key) && isFieldValid('adms_key'),
                })}
                disabled={formik.isSubmitting}
                placeholder='Token ADMS opcional'
              />
              {shouldShowFieldError('adms_key') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('adms_key')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Serial */}
          <div className='fv-row mb-7 px-1'>
            <label className='required fw-bold fs-6 mb-2'>Número de Serie</label>
            <input
              {...getManagedFieldProps('serial')}
              className={clsx('form-control form-control-solid', {
                'is-invalid': !isFieldValid('serial'),
                'is-valid': Boolean(formik.touched.serial) && isFieldValid('serial'),
              })}
              disabled={formik.isSubmitting}
              placeholder='Ingrese el número de serie del dispositivo'
            />
            {shouldShowFieldError('serial') && (
              <div className='fv-plugins-message-container'>
                <span role='alert'>{resolveFieldError('serial')}</span>
              </div>
            )}
          </div>

          {/* Ubicación y Descripción */}
          <div className='row mb-7 px-1'>
            <div className='col-md-6 fv-row'>
              <label className='fw-bold fs-6 mb-2'>Ubicación</label>
              <input
                {...getManagedFieldProps('ubicacion')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('ubicacion'),
                  'is-valid': Boolean(formik.touched.ubicacion) && isFieldValid('ubicacion'),
                })}
                disabled={formik.isSubmitting}
                placeholder='Ubicación del dispositivo'
              />
              {shouldShowFieldError('ubicacion') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('ubicacion')}</span>
                </div>
              )}
            </div>
            <div className='col-md-6 fv-row'>
              <label className='fw-bold fs-6 mb-2'>Descripción de Ubicación</label>
              <input
                {...getManagedFieldProps('ubicacion_descripcion')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('ubicacion_descripcion'),
                  'is-valid': Boolean(formik.touched.ubicacion_descripcion) && isFieldValid('ubicacion_descripcion'),
                })}
                disabled={formik.isSubmitting}
                placeholder='Descripción de la ubicación'
              />
              {shouldShowFieldError('ubicacion_descripcion') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('ubicacion_descripcion')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Modelo, Firmware y Plataforma */}
          <div className='row mb-7 px-1'>
            <div className='col-md-4 fv-row'>
              <label className='fw-bold fs-6 mb-2'>Modelo</label>
              <input
                {...getManagedFieldProps('modelo')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('modelo'),
                  'is-valid': Boolean(formik.touched.modelo) && isFieldValid('modelo'),
                })}
                disabled={formik.isSubmitting}
                placeholder='Modelo del dispositivo'
              />
              {shouldShowFieldError('modelo') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('modelo')}</span>
                </div>
              )}
            </div>
            <div className='col-md-4 fv-row'>
              <label className='fw-bold fs-6 mb-2'>Firmware</label>
              <input
                {...getManagedFieldProps('firmware')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('firmware'),
                  'is-valid': Boolean(formik.touched.firmware) && isFieldValid('firmware'),
                })}
                disabled={formik.isSubmitting}
                placeholder='Versión del firmware'
              />
              {shouldShowFieldError('firmware') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('firmware')}</span>
                </div>
              )}
            </div>
            <div className='col-md-4 fv-row'>
              <label className='fw-bold fs-6 mb-2'>MAC Address</label>
              <input
                {...getManagedFieldProps('mac_address')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('mac_address'),
                  'is-valid': Boolean(formik.touched.mac_address) && isFieldValid('mac_address'),
                })}
                disabled={formik.isSubmitting}
                placeholder='AA:BB:CC:DD:EE:FF'
              />
              {shouldShowFieldError('mac_address') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('mac_address')}</span>
                </div>
              )}
            </div>
          </div>

          <div className='row mb-7 px-1'>
            <div className='col-md-4 fv-row'>
              <label className='fw-bold fs-6 mb-2'>Plataforma</label>
              <input
                {...getManagedFieldProps('platform')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('platform'),
                  'is-valid': Boolean(formik.touched.platform) && isFieldValid('platform'),
                })}
                disabled={formik.isSubmitting}
                placeholder='Plataforma del dispositivo'
              />
              {shouldShowFieldError('platform') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('platform')}</span>
                </div>
              )}
            </div>
            <div className='col-md-4 fv-row'>
              <label className='required fw-bold fs-6 mb-2'>Método de ingesta</label>
              <select
                {...getManagedFieldProps('metodo_ingesta_marcacion')}
                className='form-select form-select-solid'
                disabled={formik.isSubmitting}
              >
                <option value='ADMS'>ADMS</option>
                <option value='TCP_PULL'>TCP Pull</option>
                <option value='MIXTO'>Mixto</option>
              </select>
              {shouldShowFieldError('metodo_ingesta_marcacion') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('metodo_ingesta_marcacion')}</span>
                </div>
              )}
            </div>
            <div className='col-md-4 fv-row'>
              <label className='required fw-bold fs-6 mb-2'>Fuente principal</label>
              <select
                {...getManagedFieldProps('fuente_principal_marcacion')}
                className='form-select form-select-solid'
                disabled={formik.isSubmitting}
              >
                <option value='ADMS'>ADMS</option>
                <option value='TCP_PULL'>TCP Pull</option>
              </select>
              {shouldShowFieldError('fuente_principal_marcacion') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{resolveFieldError('fuente_principal_marcacion')}</span>
                </div>
              )}
            </div>
          </div>

          <div className='row mb-7 px-1'>
            <div className='col-md-6 fv-row'>
              <label className='form-label fw-bold fs-6 mb-3'>Consulta bajo demanda</label>
              <div className='form-check form-switch form-check-custom form-check-solid'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  checked={(formik.values.permite_consulta_bajo_demanda ?? 1) === 1}
                  onChange={(e) => {
                    clearFieldError('permite_consulta_bajo_demanda')
                    formik.setFieldValue('permite_consulta_bajo_demanda', e.target.checked ? 1 : 0)
                  }}
                  disabled={formik.isSubmitting}
                />
                <label className='form-check-label text-muted ms-3'>
                  Permitir consulta puntual de marcaciones cuando falten datos
                </label>
              </div>
            </div>
            <div className='col-md-6 fv-row'>
              <label className='form-label fw-bold fs-6 mb-3'>Job nocturno</label>
              <div className='form-check form-switch form-check-custom form-check-solid'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  checked={(formik.values.job_nocturno_habilitado ?? 1) === 1}
                  onChange={(e) => {
                    clearFieldError('job_nocturno_habilitado')
                    formik.setFieldValue('job_nocturno_habilitado', e.target.checked ? 1 : 0)
                  }}
                  disabled={formik.isSubmitting}
                />
                <label className='form-check-label text-muted ms-3'>
                  Incluir este biométrico en la sincronización nocturna
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <FormActions
          onClose={onClose}
          isSubmitting={formik.isSubmitting}
          isValid={formik.isValid}
          isEdit={!!dispositivoBiometrico.id_biometrico}
        />
      </form>
      {(formik.isSubmitting || isLoading) && <ListLoading />}
    </>
  )
}

export {EditModalForm}
