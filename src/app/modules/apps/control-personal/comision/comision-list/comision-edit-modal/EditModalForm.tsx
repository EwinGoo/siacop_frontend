import {FC, useState, useMemo} from 'react'
import clsx from 'clsx'
import {useFormik} from 'formik'
import {toast} from 'react-toastify'
import {ID, isNotEmpty} from 'src/_metronic/helpers'
import {initialComision, Comision} from '../core/_models'
import {useListView} from '../core/ListViewProvider'
import {createComision, getPersonaAutocomplete, updateComision} from '../core/_requests'
import {useQueryResponse} from '../core/QueryResponseProvider'
import {editComisionSchema} from './schemas/editComisionSchema'
import {SelectPickerField} from './components/SelectPickerField'
import {DatePickerField} from 'src/app/modules/components/DatePickerField'
import {ValidationError} from 'src/app/utils/httpErrors'
import {ListLoading} from 'src/app/modules/components/loading/ListLoading'
import {FormActions} from 'src/app/modules/components/FormActions'
import AsyncSelectField from './components/AsyncSelectField'
import {useApiFieldErrors} from 'src/app/hooks/useApiFieldErrors'
import {useAuth} from 'src/app/modules/auth'
import {canManageComisiones} from 'src/app/modules/auth/core/roles/roleDefinitions'
import {SelectField} from 'src/app/modules/components/SelectField'
import {formatUtils} from 'src/app/utils/formatUtils'

type Props = {
  isLoading: boolean
  comision: Comision
  onClose: () => void
  tipoPermiso?: any // El objeto completo del tipo de permiso
  sucursalesCajaSalud?: any[] // Sucursales disponibles para caja de salud
}

const EditModalForm: FC<Props> = ({
  comision,
  isLoading,
  onClose,
  tipoPermiso,
  sucursalesCajaSalud,
}) => {
  const {setItemIdForUpdate} = useListView()
  const {refetch} = useQueryResponse()
  const {apiErrors, setApiErrors, clearFieldError} = useApiFieldErrors()
  const {currentUser} = useAuth()
  const canManage = currentUser?.groups ? canManageComisiones(currentUser.groups) : false

  const [comisionForEdit] = useState<Comision>({
    ...comision,
    id_usuario_generador: comision.id_usuario_generador,
    descripcion_comision: comision.descripcion_comision || initialComision.descripcion_comision,
    recorrido_de: comision.recorrido_de || initialComision.recorrido_de,
    recorrido_a: comision.recorrido_a || initialComision.recorrido_a,
    fecha_comision: comision.fecha_comision || initialComision.fecha_comision,
    fecha_comision_fin: comision.fecha_comision_fin || initialComision.fecha_comision_fin,
    hora_salida: comision.hora_salida || initialComision.hora_salida,
    hora_retorno: comision.hora_retorno || initialComision.hora_retorno,
    id_tipo_permiso: comision.id_tipo_permiso || initialComision.id_tipo_permiso,
    estado_boleta_comision:
      comision.estado_boleta_comision || initialComision.estado_boleta_comision,
    id_caja_salud_sucursal: comision.id_caja_salud_sucursal || null,
  })

  const tipoActual = useMemo(() => {
    if (tipoPermiso?.nombre) {
      return tipoPermiso.nombre
    }
    if (comision.tipo_comision) {
      return comision.tipo_comision
    }
    return 'COMISIÓN' // Valor por defecto
  }, [tipoPermiso, comision.tipo_comision])

  const cancel = (withRefresh?: boolean) => {
    if (withRefresh) {
      refetch()
    }
    setItemIdForUpdate(undefined)
  }

  const formik = useFormik({
    initialValues: {
      ...comisionForEdit,
      tipo_comision: tipoActual,
      id_tipo_permiso: tipoPermiso?.id_tipo_permiso || comisionForEdit.id_tipo_permiso,
      fecha_comision_fin:
        tipoActual === 'FISIOTERAPIA' ? comisionForEdit.fecha_comision_fin : undefined,
      id_sucursal_caja_salud:
        tipoActual === 'CAJA SALUD' ? comisionForEdit.id_caja_salud_sucursal : null,
    },
    validationSchema: () =>
      editComisionSchema({
        isAdmin: canManage,
        tipoPermiso: tipoActual,
      }),
    onSubmit: async (values, {setSubmitting}) => {
      setSubmitting(true)
      setApiErrors({})

      try {
        // Asegurar que se envíen los valores correctos del tipo
        const dataToSend = {
          ...values,
          tipo_comision: tipoActual,
          id_tipo_permiso: tipoPermiso?.id_tipo_permiso || values.id_tipo_permiso,
          // Solo incluir sucursal si es tipo caja salud
          id_sucursal_caja_salud:
            tipoActual === 'CAJA SALUD' ? values.id_sucursal_caja_salud : null,
        }

        if (isNotEmpty(values.id_comision)) {
          await updateComision(dataToSend)
          toast.success('Registro actualizado correctamente')
        } else {
          await createComision(dataToSend)
          toast.success('Registro creado correctamente')
        }
        cancel(true)
        onClose()
      } catch (error: any) {
        if (error instanceof ValidationError) {
          setApiErrors(error.validationErrors)
          toast.error(error.message)
        } else {
          console.log(error)
          toast.error('Error inesperado: ' + error.message)
        }
      } finally {
        setSubmitting(false)
      }
    },
  })

  const getFieldError = (fieldName: string) => {
    return formik.errors[fieldName] || apiErrors[fieldName]
  }

  const shouldShowFieldError = (fieldName: string) => {
    return Boolean(getFieldError(fieldName)) && (
      Boolean(formik.touched[fieldName]) ||
      Boolean(apiErrors[fieldName]) ||
      formik.submitCount > 0
    )
  }

  const isFieldValid = (fieldName: string) => {
    return !shouldShowFieldError(fieldName)
  }

  interface OptionType {
    value: number
    label: string
    id_asignacion_administrativo?: ID
  }

  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null)

  const fetchPersonaOptions = async (input: string): Promise<OptionType[]> => {
    const response = await getPersonaAutocomplete(input)
    return response.sugerencias.map((item) => ({
      value: item.id,
      label: item.texto,
      id_asignacion_administrativo: item.id_asignacion_administrativo,
    }))
  }

  const handleChange = (fieldName: keyof Comision) => (value: any) => {
    formik.setFieldValue(fieldName, value)
    clearFieldError(fieldName)
  }

  // Funciones para determinar qué campos mostrar según el tipo
  const esTipoPesonalOTransporte = () => {
    return tipoActual === 'PERSONAL' || tipoActual === 'TRANSPORTE'
  }

  const esTipoCajaSalud = () => {
    return tipoActual === 'CAJA SALUD'
  }

  const esTipoFisioterapia = () => {
    return tipoActual === 'FISIOTERAPIA'
  }

  const mostrarRecorrido = () => {
    return esTipoPesonalOTransporte()
  }

  const mostrarFechaFin = () => {
    return esTipoFisioterapia()
  }

  const mostrarSucursalCajaSalud = () => {
    return esTipoCajaSalud() || esTipoFisioterapia()
  }

  // Funciones para obtener labels dinámicos
  const getLabelFecha = () => {
    if (esTipoCajaSalud()) return 'Fecha de atención'
    if (esTipoFisioterapia()) return 'Fecha inicio'
    return 'Fecha comisión'
  }

  const getLabelHoraSalida = () => {
    if (esTipoFisioterapia() || esTipoCajaSalud()) return 'Hora de llegada'
    return 'Hora de salida'
  }

  const getLabelHoraRetorno = () => {
    if (esTipoFisioterapia() || esTipoCajaSalud()) return 'Hora de salida'
    return 'Hora de retorno'
  }

  const getLabelDescripcion = () => {
    if (esTipoCajaSalud()) return 'Razón de atención'
    if (esTipoFisioterapia()) return 'Motivo de fisioterapia'
    return 'Motivo de la comisión'
  }

  const getPlaceholderDesde = () => {
    if (tipoActual === 'PERSONAL') {
      return 'Ej: Embleatico, Oficina central, etc.'
    }
    return 'Ej: Oficina central, Hospital, etc.'
  }

  const getPlaceholderHacia = () => {
    if (tipoActual === 'PERSONAL') {
      return 'Ej: Polideportivo, Postgrado, etc.'
    }
    return 'Ej: Viacha, Kallutaca, etc.'
  }

  return (
    <>
      <form id='kt_modal_add_comision_form' className='form' onSubmit={formik.handleSubmit}>
        <div className='d-flex flex-column scroll-y me-n7 pe-7 pt-5'>
          {/* Campo de solicitante solo si puede gestionar */}
          {canManage && (
            <div className='fv-row mb-7 px-1'>
              <label className='required fw-bold fs-6 mb-2'>Solicitante:</label>
              {comision.id_comision ? (
                <input
                  type='text'
                  className='form-control form-control-solid'
                  readOnly
                  value={`${comision.ci || ''} - ${comision.nombre_generador || ''}`}
                />
              ) : (
                <AsyncSelectField
                  value={selectedOption}
                  onChange={(selected) => {
                    setSelectedOption(selected)
                    formik.setFieldValue('id_usuario_generador', selected?.value ?? '')
                    formik.setFieldValue(
                      'id_asignacion_administrativo',
                      selected?.id_asignacion_administrativo ?? ''
                    )
                  }}
                  onBlur={() => formik.setFieldTouched('id_asignacion_administrativo', true)}
                  fetchOptions={fetchPersonaOptions}
                  isInvalid={!isFieldValid('id_asignacion_administrativo')}
                />
              )}
              {!isFieldValid('id_asignacion_administrativo') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{getFieldError('id_asignacion_administrativo')}</span>
                </div>
              )}
            </div>
          )}

          {/* Campos ocultos para el tipo */}
          <input type='hidden' name='tipo_comision' value={tipoActual} />
          <input type='hidden' name='id_tipo_permiso' value={tipoPermiso?.id_tipo_permiso || ''} />

          {/* Sucursal Caja Salud - Solo para tipo CAJA SALUD */}
          {mostrarSucursalCajaSalud() && sucursalesCajaSalud && (
            <div className='fv-row mb-7 px-1'>
              <label className='required fw-bold fs-6 mb-2'>Sucursal Caja de Salud</label>
              <SelectField
                field={formik.getFieldProps('id_caja_salud_sucursal')}
                form={formik}
                isFieldValid={isFieldValid('id_caja_salud_sucursal')}
                isSubmitting={formik.isSubmitting}
                options={formatUtils.cajaSaludSucursales(sucursalesCajaSalud)}
                placeholder='Seleccione tipo'
              />
              {!isFieldValid('id_caja_salud_sucursal') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{getFieldError('id_caja_salud_sucursal')}</span>
                </div>
              )}
            </div>
          )}

          {/* Control de fecha */}
          <div className='fv-row mb-7 px-1'>
            <label className='required fw-bold fs-6 mb-2'>{getLabelFecha()}</label>
            {canManage || mostrarFechaFin() ? (
              <DatePickerField
                field={formik.getFieldProps('fecha_comision')}
                form={formik}
                isFieldValid={isFieldValid('fecha_comision')}
                isSubmitting={formik.isSubmitting}
                onChange={handleChange('fecha_comision')}
                onBlur={() => formik.setFieldTouched('fecha_comision', true)}
              />
            ) : (
              <SelectPickerField
                field={formik.getFieldProps('fecha_comision')}
                form={formik}
                isFieldValid={isFieldValid('fecha_comision')}
                isSubmitting={formik.isSubmitting}
              />
            )}
            {!isFieldValid('fecha_comision') && (
              <div className='fv-plugins-message-container'>
                <span role='alert'>{getFieldError('fecha_comision')}</span>
              </div>
            )}
          </div>

          {/* Fecha fin - Solo para fisioterapia */}
          {mostrarFechaFin() && (
            <div className='fv-row mb-7 px-1'>
              <label className='required fw-bold fs-6 mb-2'>Fecha fin</label>
              {canManage || mostrarFechaFin() ? (
                <DatePickerField
                  field={formik.getFieldProps('fecha_comision_fin')}
                  form={formik}
                  isFieldValid={isFieldValid('fecha_comision_fin')}
                  isSubmitting={formik.isSubmitting}
                  onChange={handleChange('fecha_comision_fin')}
                  onBlur={() => formik.setFieldTouched('fecha_comision_fin', true)}
                />
              ) : (
                <SelectPickerField
                  field={formik.getFieldProps('fecha_comision_fin')}
                  form={formik}
                  isFieldValid={isFieldValid('fecha_comision_fin')}
                  isSubmitting={formik.isSubmitting}
                />
              )}
              {!isFieldValid('fecha_comision_fin') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{getFieldError('fecha_comision_fin')}</span>
                </div>
              )}
            </div>
          )}

          {/* Horarios */}
          <div className='row mb-7 px-1'>
            <div className='col-md-6 fv-row'>
              <label className='required fw-bold fs-6 mb-2'>{getLabelHoraSalida()}</label>
              <input
                type='time'
                {...formik.getFieldProps('hora_salida')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('hora_salida'),
                  'is-valid': formik.touched.hora_salida && isFieldValid('hora_salida'),
                })}
                disabled={formik.isSubmitting}
              />
              {!isFieldValid('hora_salida') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{getFieldError('hora_salida')}</span>
                </div>
              )}
            </div>
            <div className='col-md-6 fv-row'>
              <label className='required fw-bold fs-6 mb-2'>{getLabelHoraRetorno()}</label>
              <input
                type='time'
                {...formik.getFieldProps('hora_retorno')}
                className={clsx('form-control form-control-solid', {
                  'is-invalid': !isFieldValid('hora_retorno'),
                  'is-valid': formik.touched.hora_retorno && isFieldValid('hora_retorno'),
                })}
                disabled={formik.isSubmitting}
              />
              {!isFieldValid('hora_retorno') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{getFieldError('hora_retorno')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recorrido - Solo para COMISIÓN y TRANSPORTE */}
          {mostrarRecorrido() && (
            <div className='row mb-7 px-1'>
              <div className='col-md-6 fv-row'>
                <label className='required fw-bold fs-6 mb-2'>Punto de partida (Desde)</label>
                <input
                  {...formik.getFieldProps('recorrido_de')}
                  className={clsx('form-control form-control-solid', {
                    'is-invalid': !isFieldValid('recorrido_de'),
                    'is-valid': formik.touched.recorrido_de && isFieldValid('recorrido_de'),
                  })}
                  disabled={formik.isSubmitting}
                  placeholder={getPlaceholderDesde()}
                />
                {!isFieldValid('recorrido_de') && (
                  <div className='fv-plugins-message-container'>
                    <span role='alert'>{getFieldError('recorrido_de')}</span>
                  </div>
                )}
              </div>
              <div className='col-md-6 fv-row'>
                <label className='required fw-bold fs-6 mb-2'>Destino final (Hacia)</label>
                <input
                  {...formik.getFieldProps('recorrido_a')}
                  className={clsx('form-control form-control-solid', {
                    'is-invalid': !isFieldValid('recorrido_a'),
                    'is-valid': formik.touched.recorrido_a && isFieldValid('recorrido_a'),
                  })}
                  disabled={formik.isSubmitting}
                  placeholder={getPlaceholderHacia()}
                />
                {!isFieldValid('recorrido_a') && (
                  <div className='fv-plugins-message-container'>
                    <span role='alert'>{getFieldError('recorrido_a')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Descripción */}
          <div className='fv-row mb-7 px-1'>
            <label className='required fw-bold fs-6 mb-2'>{getLabelDescripcion()}</label>
            <textarea
              {...formik.getFieldProps('descripcion_comision')}
              className={clsx('form-control form-control-solid', {
                'is-invalid': !isFieldValid('descripcion_comision'),
                'is-valid':
                  formik.touched.descripcion_comision && isFieldValid('descripcion_comision'),
              })}
              rows={3}
              disabled={formik.isSubmitting}
              placeholder={
                esTipoCajaSalud()
                  ? 'Describa la razón de la atención médica...'
                  : esTipoFisioterapia()
                  ? 'Describa el motivo de la fisioterapia...'
                  : 'Describa el motivo de la comisión...'
              }
            />
            {!isFieldValid('descripcion_comision') && (
              <div className='fv-plugins-message-container'>
                <span role='alert'>{getFieldError('descripcion_comision')}</span>
              </div>
            )}
          </div>
        </div>

        <FormActions
          onClose={onClose}
          isSubmitting={formik.isSubmitting}
          isValid={true}
          isEdit={!!comision.id_comision}
        />
      </form>
      {(formik.isSubmitting || isLoading) && <ListLoading />}
    </>
  )
}

export {EditModalForm}
