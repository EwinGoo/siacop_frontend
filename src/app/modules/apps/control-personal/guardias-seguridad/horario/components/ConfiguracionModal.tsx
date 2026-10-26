import {useState} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import {KTIcon} from 'src/_metronic/helpers'
import {saveConfiguracion} from '../core/_requests'
import {ConfiguracionCiclo} from '../core/_models'
import {GuardiaModalShell} from '../../grupos/grupo-list/components/GuardiaModalShell'
import {showToast} from 'src/app/utils/toastHelper'

type Props = {
  configuracion: ConfiguracionCiclo | null
  onClose: () => void
  onSaved: (cfg: ConfiguracionCiclo) => void
}

const schema = Yup.object({
  fecha_inicio_ciclo: Yup.string().required('La fecha es obligatoria'),
  descripcion: Yup.string().max(255).nullable(),
})

const ConfiguracionModal = ({configuracion, onClose, onSaved}: Props) => {
  const [loading, setLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({})

  const formik = useFormik({
    initialValues: {
      fecha_inicio_ciclo: configuracion?.fecha_inicio_ciclo || '',
      descripcion: configuracion?.descripcion || '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setLoading(true)
      setApiErrors({})
      try {
        const saved = await saveConfiguracion(values)
        await Swal.fire({icon: 'success', title: 'Configuración guardada', timer: 1500, showConfirmButton: false})
        onSaved(saved)
      } catch (e: any) {
        const backendErrors = e?.response?.data?.data
        if (backendErrors && typeof backendErrors === 'object') {
          setApiErrors(backendErrors)
        }
        showToast({
          message: e?.response?.data?.message || 'No se pudo guardar la configuración',
          type: 'error',
        })
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <GuardiaModalShell
      title='Configurar ciclo de rotación'
      subtitle='Ajusta la fecha base desde la cual se calcula el horario semanal de guardias.'
      headerIcon={<KTIcon iconName='calendar' className='fs-1 guardia-modal-icon' />}
      variant='horario'
      headerStyle={{background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)'}}
      titleClassName='text-white'
      subtitleClassName='text-white opacity-75 fs-7'
      closeButtonClassName='btn-light-primary'
      closeIconClassName='text-primary'
      iconBoxStyle={{
        background: 'rgba(255, 255, 255, 0.16)',
        border: '1px solid rgba(255, 255, 255, 0.24)',
      }}
      onClose={onClose}
      size='md'
    >
              <div className='notice d-flex bg-light-warning rounded border-warning border border-dashed p-4 mb-6'>
                <KTIcon iconName='information-5' className='fs-2tx text-warning me-3' />
                <div>
                  <div className='fw-bolder'>Fecha de inicio del ciclo</div>
                  <div className='text-muted fs-7'>
                    Debe ser un <strong>lunes</strong>. Esta fecha define cuándo empieza el Ciclo 1, Semana 1.
                    Todos los horarios semanales se calculan a partir de aquí.
                  </div>
                </div>
              </div>
              <form onSubmit={formik.handleSubmit} noValidate>
                <div className='fv-row mb-6'>
                  <label className='required fw-bold fs-6 mb-2'>Fecha inicio Ciclo 1 (debe ser lunes)</label>
                  <input
                    type='date'
                    className={`form-control form-control-solid ${
                      (formik.touched.fecha_inicio_ciclo && formik.errors.fecha_inicio_ciclo) || apiErrors.fecha_inicio_ciclo
                        ? 'is-invalid'
                        : ''
                    }`}
                    {...formik.getFieldProps('fecha_inicio_ciclo')}
                    onChange={(e) => {
                      formik.handleChange(e)
                      if (apiErrors.fecha_inicio_ciclo) {
                        setApiErrors((prev) => ({...prev, fecha_inicio_ciclo: ''}))
                      }
                    }}
                  />
                  {formik.touched.fecha_inicio_ciclo && formik.errors.fecha_inicio_ciclo ? (
                    <div className='text-danger fs-7'>{formik.errors.fecha_inicio_ciclo}</div>
                  ) : apiErrors.fecha_inicio_ciclo ? (
                    <div className='text-danger fs-7'>{apiErrors.fecha_inicio_ciclo}</div>
                  ) : null}
                </div>
                <div className='fv-row mb-6'>
                  <label className='fw-bold fs-6 mb-2'>Descripción (opcional)</label>
                  <input
                    type='text'
                    className='form-control form-control-solid'
                    placeholder='Ej: Inicio de rotación 2026...'
                    {...formik.getFieldProps('descripcion')}
                  />
                </div>
                <div className='text-end'>
                  <button type='button' className='btn btn-light me-3' onClick={onClose}>
                    <KTIcon iconName='cross' className='fs-4 me-1' />
                    Cancelar
                  </button>
                  <button type='submit' className='btn btn-primary' disabled={loading}>
                    {loading ? (
                      <><span className='spinner-border spinner-border-sm me-2'></span>Guardando...</>
                    ) : (
                      <>
                        <KTIcon iconName='check' className='fs-4 me-1' />
                        Guardar configuración
                      </>
                    )}
                  </button>
                </div>
              </form>
    </GuardiaModalShell>
  )
}

export {ConfiguracionModal}
