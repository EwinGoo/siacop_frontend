import {FC, useState, useEffect} from 'react'
import {useFormik} from 'formik'
import {toast} from 'react-toastify'

import {isNotEmpty} from 'src/_metronic/helpers'

import {useListView} from '../core/ListViewProvider'
import {useQueryResponse} from '../core/QueryResponseProvider'

import {initialAsistenciaPermiso as initialData, AsistenciaPermiso} from '../core/_models'
import {TipoPermiso} from '../../../tipos-permisos/list/core/_models'

import {
  createAsistenciaPermiso,
  getPersonaAutocomplete,
  updateAsistenciaPermiso,
} from '../core/_requests'

import {asistenciaPermisoSchema} from '../../schemas/asistenciaPermisoSchema'

import {SelectField} from 'src/app/modules/components/SelectField'
import {ValidationError} from 'src/app/utils/httpErrors'
import {useApiFieldErrors} from 'src/app/hooks/useApiFieldErrors'
import {FormActions} from 'src/app/modules/components/FormActions'
import {DatePickerField} from 'src/app/modules/components/DatePickerField'
import AsyncSelectField from '../../../../comision/comision-list/comision-edit-modal/components/AsyncSelectField'
import {useAuth} from 'src/app/modules/auth'
import {ListLoading} from 'src/app/modules/components/loading/ListLoading'
import {canManageComisiones} from 'src/app/modules/auth/core/roles/roleDefinitions'

type Props = {
  isAsistenciaPermisoLoading: boolean
  asistenciaPermiso: AsistenciaPermiso
  tiposPermisos: TipoPermiso[]
  onClose: () => void
}

interface OptionType {
  value: number
  label: string
  tipo_personal?: string
}

const EditModalForm: FC<Props> = ({
  asistenciaPermiso,
  isAsistenciaPermisoLoading,
  tiposPermisos,
  onClose,
}) => {
  const {setItemIdForUpdate} = useListView()
  const {refetch} = useQueryResponse()
  const {currentUser} = useAuth()
  const canManage = currentUser?.groups ? canManageComisiones(currentUser.groups) : false

  const {setApiErrors, getFieldError, clearFieldError} = useApiFieldErrors()
  const [limiteDias, setLimiteDias] = useState<number | null>(null)

  const [asistenciaPermisoForEdit] = useState<AsistenciaPermiso>({
    ...asistenciaPermiso,
    id_persona: asistenciaPermiso.id_persona || initialData.id_persona,
    id_tipo_permiso: asistenciaPermiso.id_tipo_permiso || initialData.id_tipo_permiso,
    fecha_inicio_permiso:
      asistenciaPermiso.fecha_inicio_permiso || initialData.fecha_inicio_permiso,
    fecha_fin_permiso: asistenciaPermiso.fecha_fin_permiso || initialData.fecha_fin_permiso,
    detalle_permiso: asistenciaPermiso.detalle_permiso || initialData.detalle_permiso,
    estado_permiso: asistenciaPermiso.estado_permiso || initialData.estado_permiso,
    turno_permiso: asistenciaPermiso.turno_permiso || initialData.turno_permiso, // Nuevo campo
    tipo_personal: asistenciaPermiso.tipo_personal || currentUser?.personal?.tipo_personal,
  })

  const cancel = (withRefresh?: boolean) => {
    if (withRefresh) {
      refetch()
    }
    setItemIdForUpdate(undefined)
  }

  const formik = useFormik({
    initialValues: asistenciaPermisoForEdit,
    validationSchema: asistenciaPermisoSchema({
      isAdmin: canManage,
      limiteDias,
    }),
    onSubmit: async (values, {setSubmitting}) => {
      setSubmitting(true)
      setApiErrors({})
      try {
        if (isNotEmpty(values.id_asistencia_permiso)) {
          await updateAsistenciaPermiso(values)
          toast.success('Permiso actualizado correctamente', {
            position: 'top-right',
            autoClose: 5000,
          })
        } else {
          await createAsistenciaPermiso(values)
          toast.success('Permiso creado correctamente', {
            position: 'top-right',
            autoClose: 5000,
          })
        }
        cancel(true)
        onClose()
      } catch (error: any) {
        if (error instanceof ValidationError) {
          setApiErrors(error.validationErrors)
          toast.error(error.message)
        } else {
          toast.error('Error inesperado: ' + error.message)
        }
      } finally {
        setSubmitting(false)
      }
    },
  })

  // Verificar si el tipo seleccionado es cumpleaños
  const tipoSeleccionado = tiposPermisos.find(
    (tipo) => tipo.id_tipo_permiso?.toString() === formik.values.id_tipo_permiso?.toString()
  )
  const esCumpleanos =
    tipoSeleccionado?.nombre?.toLowerCase().includes('cumpleaños') ||
    tipoSeleccionado?.nombre?.toLowerCase().includes('cumpleanos')

  useEffect(() => {
    const idTipoPermiso = formik.values.id_tipo_permiso
    const setFieldValue = formik.setFieldValue

    const permiso = tiposPermisos.find(
      (tipo) => tipo.id_tipo_permiso?.toString() === idTipoPermiso?.toString()
    )
    if (permiso) {
      setLimiteDias(permiso.limite_dias ?? null)
    } else {
      setLimiteDias(null)
    }
    // Limpiar el campo turno si no es cumpleaños
    if (!esCumpleanos) {
      setFieldValue('turno_permiso', '')
    }
  }, [esCumpleanos, formik.values.id_tipo_permiso, tiposPermisos, formik.setFieldValue])

  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null)

  const fetchPersonaOptions = async (input: string): Promise<OptionType[]> => {
    const response = await getPersonaAutocomplete(input)
    return response.data.map((item) => ({
      value: item.id,
      label: item.texto,
      tipo_personal: item.tipo,
    }))
  }

  const shouldShowFieldError = (fieldName: string) => {
    return Boolean(getFieldError(formik.errors, fieldName)) && (
      Boolean(formik.touched[fieldName]) ||
      formik.submitCount > 0
    )
  }

  const isFieldValid = (fieldName: string) => {
    return !shouldShowFieldError(fieldName)
  }

  const handleChange = (fieldName: keyof AsistenciaPermiso) => (value: any) => {
    formik.setFieldValue(fieldName, value)
    clearFieldError(fieldName)
  }

  const turnoOptions = [
    {label: 'Mañana', value: 'MAÑANA'},
    {label: 'Tarde', value: 'TARDE'},
  ]

  const getFilteredTiposPermisos = () => {
    // Obtenemos el tipo del formulario (puede venir del usuario actual o de la persona buscada)
    const tipoPersonalActual = formik.values.tipo_personal

    if (tipoPersonalActual === 'DOCENTE') {
      // Si la persona seleccionada (o el solicitante) es DOCENTE, solo Baja Médica
      return tiposPermisos.filter(
        (tipo) => tipo.nombre?.toLowerCase() === 'Baja Médica'.toLowerCase()
      )
    }

    // Para ADMINISTRATIVO u otros, mostrar todos
    return tiposPermisos
  }

  // const getFilteredTiposPermisos = () => {
  //   // console.log(tiposPermisos);

  //   const isDocente = currentUser?.personal?.tipo_personal === 'DOCENTE'

  //   if (isDocente) {
  //     // Solo Baja Médica para docentes
  //     return tiposPermisos.filter(
  //       (tipo) => tipo.nombre?.toLowerCase() === 'Baja Médica'.toLowerCase()
  //     )
  //   }
  //   return tiposPermisos

  //   // Todos los tipos para otros usuarios, con Baja Médica primero
  //   // return tiposPermisos.sort((a, b) =>
  //   //   a.nombre === 'Baja Médica' ? -1 : b.nombre === 'Baja Médica' ? 1 : 0
  //   // )
  // }

  const handleChangeFechaInicio = (value: any) => {
    formik.setFieldValue('fecha_inicio_permiso', value)
    clearFieldError('fecha_inicio_permiso')

    // Si es cumpleaños, sincronizamos automáticamente la fecha fin
    if (esCumpleanos) {
      formik.setFieldValue('fecha_fin_permiso', value)
      clearFieldError('fecha_fin_permiso')
    }
  }

  // useEffect(()=>{
  //   console.log(formik.errors);

  // },[formik.errors])

  return (
    <>
      <form
        id='kt_modal_add_asistencia_permiso_form'
        className='form'
        onSubmit={formik.handleSubmit}
      >
        <div className='me-n7 pe-7 pt-5'>
          {canManage && (
            <div className='fv-row mb-7 px-1'>
              <label className='required fw-bold fs-6 mb-2'>Solicitante:</label>
              {asistenciaPermiso.id_asistencia_permiso ? (
                // Modo edición - mostrar campo readonly
                <input
                  type='text'
                  className='form-control form-control-solid'
                  readOnly
                  value={`${asistenciaPermiso.ci || ''} - ${
                    asistenciaPermiso.nombre_generador || ''
                  }`}
                />
              ) : (
                <AsyncSelectField
                  value={selectedOption}
                  onChange={(selected) => {
                    setSelectedOption(selected)
                    formik.setFieldValue('id_persona', selected?.value ?? '')
                    formik.setFieldValue('tipo_personal', selected?.tipo_personal ?? '')
                  }}
                  onBlur={() => formik.setFieldTouched('id_persona', true)}
                  fetchOptions={fetchPersonaOptions}
                  isInvalid={!isFieldValid('id_persona')}
                />
              )}
              {!isFieldValid('id_persona') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{getFieldError(formik.errors, 'id_persona')}</span>
                </div>
              )}
            </div>
          )}

          {/* Tipo de Permiso */}
          <div className='fv-row mb-7 px-1'>
            <label className='required fw-bold fs-6 mb-2'>Tipo de Permiso</label>
            <SelectField
              field={formik.getFieldProps('id_tipo_permiso')}
              form={formik}
              isFieldValid={isFieldValid('id_tipo_permiso')}
              clearFieldError={clearFieldError}
              isSubmitting={formik.isSubmitting}
              placeholder='Seleccione un tipo de permiso'
              options={getFilteredTiposPermisos().map((tipo) => ({
                label: tipo.nombre,
                value: tipo.id_tipo_permiso!.toString(),
              }))}
            />
            {!isFieldValid('id_tipo_permiso') && (
              <div className='fv-plugins-message-container'>
                <span role='alert'>{getFieldError(formik.errors, 'id_tipo_permiso')}</span>
              </div>
            )}
          </div>

          {/* Fechas con Flatpickr */}
          <div className='row mb-7'>
            {esCumpleanos ? (
              /* VISTA PARA CUMPLEAÑOS: Un solo campo que controla ambos */
              <div className='col-md-12 fv-row'>
                <label className='required fw-bold fs-6 mb-2'>Fecha del Cumpleaños</label>
                <DatePickerField
                  field={formik.getFieldProps('fecha_inicio_permiso')}
                  form={formik}
                  isFieldValid={isFieldValid('fecha_inicio_permiso')}
                  isSubmitting={formik.isSubmitting}
                  onChange={handleChangeFechaInicio} // Usamos la nueva función
                  onBlur={() => formik.setFieldTouched('fecha_inicio_permiso', true)}
                />
                {!isFieldValid('fecha_inicio_permiso') && (
                  <div className='fv-plugins-message-container'>
                    <span role='alert'>{getFieldError(formik.errors, 'fecha_inicio_permiso')}</span>
                  </div>
                )}
              </div>
            ) : (
              /* VISTA NORMAL: Dos campos */
              <>
                <div className='col-md-6 fv-row mb-7 mb-md-0'>
                  <label className='required fw-bold fs-6 mb-2'>Fecha Inicio</label>
                  <DatePickerField
                    field={formik.getFieldProps('fecha_inicio_permiso')}
                    form={formik}
                    isFieldValid={isFieldValid('fecha_inicio_permiso')}
                    isSubmitting={formik.isSubmitting}
                    onChange={handleChange('fecha_inicio_permiso')}
                    onBlur={() => formik.setFieldTouched('fecha_inicio_permiso', true)}
                  />
                  {!isFieldValid('fecha_inicio_permiso') && (
                    <div className='fv-plugins-message-container'>
                      <span role='alert'>
                        {getFieldError(formik.errors, 'fecha_inicio_permiso')}
                      </span>
                    </div>
                  )}
                </div>
                <div className='col-md-6 fv-row'>
                  <label className='required fw-bold fs-6 mb-2'>Fecha Fin</label>
                  <DatePickerField
                    field={formik.getFieldProps('fecha_fin_permiso')}
                    form={formik}
                    isFieldValid={isFieldValid('fecha_fin_permiso')}
                    isSubmitting={formik.isSubmitting}
                    onChange={handleChange('fecha_fin_permiso')}
                    onBlur={() => formik.setFieldTouched('fecha_fin_permiso', true)}
                  />
                  {!isFieldValid('fecha_fin_permiso') && (
                    <div className='fv-plugins-message-container'>
                      <span role='alert'>{getFieldError(formik.errors, 'fecha_fin_permiso')}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {/* Campo Turno - Solo visible para cumpleaños */}
          {esCumpleanos && (
            <div className='fv-row mb-7 px-1'>
              <label className=' fw-bold fs-6 mb-5'>
                Turno del Permiso
                <small className='text-muted d-block mt-1 required'>
                  Seleccione si tomará el permiso en la mañana o en la tarde
                </small>
              </label>
              <SelectField
                field={formik.getFieldProps('turno_permiso')}
                form={formik}
                isFieldValid={isFieldValid('turno_permiso')}
                clearFieldError={clearFieldError}
                isSubmitting={formik.isSubmitting}
                placeholder='Seleccione el turno'
                options={turnoOptions}
              />
              {!isFieldValid('turno_permiso') && (
                <div className='fv-plugins-message-container'>
                  <span role='alert'>{getFieldError(formik.errors, 'turno_permiso')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <FormActions
          onClose={onClose}
          isSubmitting={formik.isSubmitting}
          // isValid={formik.isValid}
          isValid={true}
          isEdit={!!asistenciaPermiso.id_asistencia_permiso}
        />
      </form>
      {(formik.isSubmitting || isAsistenciaPermisoLoading) && <ListLoading />}
    </>
  )
}

export {EditModalForm}
