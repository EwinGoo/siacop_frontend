import {useEffect, useState} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import {useListView} from '../core/ListViewProvider'
import {useQueryResponse} from '../core/QueryResponseProvider'
import {createBloque, updateBloque, getBloqueById} from '../core/_requests'
import {Bloque, initialBloque} from '../core/_models'
import {KTIcon} from '../../../../../../../../_metronic/helpers'
import {GuardiaModalShell} from '../../../grupos/grupo-list/components/GuardiaModalShell'

const schema = Yup.object({
  nombre: Yup.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres').required('El nombre es obligatorio'),
  descripcion: Yup.string().max(255, 'Máximo 255 caracteres').nullable(),
})

const EditModal = () => {
  const {itemIdForUpdate, setItemIdForUpdate} = useListView()
  const {refetch} = useQueryResponse()
  const [loading, setLoading] = useState(false)
  const [loadingBloque, setLoadingBloque] = useState(false)
  const [bloque, setBloque] = useState<Bloque>(initialBloque)

  useEffect(() => {
    if (itemIdForUpdate && itemIdForUpdate !== null) {
      setLoadingBloque(true)
      getBloqueById(itemIdForUpdate).then((data) => {
        if (data) setBloque(data)
      }).finally(() => setLoadingBloque(false))
    } else {
      setBloque(initialBloque)
      setLoadingBloque(false)
    }
  }, [itemIdForUpdate])

  const formik = useFormik({
    initialValues: bloque,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        if (values.id_guardia_bloque) {
          await updateBloque(values)
        } else {
          await createBloque(values)
        }
        await Swal.fire({
          icon: 'success',
          title: values.id_guardia_bloque ? 'Bloque actualizado' : 'Bloque creado',
          timer: 1500,
          showConfirmButton: false,
        })
        refetch()
        setItemIdForUpdate(undefined)
      } catch {
        Swal.fire({icon: 'error', title: 'Error', text: 'No se pudo guardar el bloque'})
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <GuardiaModalShell
      title={bloque.id_guardia_bloque ? 'Editar bloque o área' : 'Nuevo bloque o área'}
      subtitle='Define las áreas o bloques usados en las asignaciones de guardias.'
      headerIcon={<KTIcon iconName='geolocation' className='fs-1 guardia-modal-icon' />}
      variant='bloque'
      headerStyle={{background: 'linear-gradient(135deg, #12b886 0%, #0ca678 100%)'}}
      titleClassName='text-white'
      subtitleClassName='text-white opacity-75 fs-7'
      closeButtonClassName='btn-light-success'
      closeIconClassName='text-success'
      iconBoxStyle={{
        background: 'rgba(255, 255, 255, 0.16)',
        border: '1px solid rgba(255, 255, 255, 0.24)',
      }}
      onClose={() => setItemIdForUpdate(undefined)}
      size='md'
    >
      {loadingBloque ? (
        <div className='d-flex flex-column align-items-center justify-content-center py-15'>
          <span className='spinner-border text-primary mb-4'></span>
          <span className='text-muted fw-semibold'>Cargando datos del bloque...</span>
        </div>
      ) : (
        <form onSubmit={formik.handleSubmit} noValidate>
                {/* Nombre */}
                <div className='fv-row mb-7'>
                  <label className='required fw-bold fs-6 mb-2'>Nombre del Bloque</label>
                  <input
                    type='text'
                    className={`form-control form-control-solid mb-3 mb-lg-0 ${
                      formik.touched.nombre && formik.errors.nombre ? 'is-invalid' : ''
                    }`}
                    placeholder='Ej: Bloque B, Emblemático...'
                    {...formik.getFieldProps('nombre')}
                  />
                  {formik.touched.nombre && formik.errors.nombre && (
                    <div className='fv-plugins-message-container'>
                      <span role='alert' className='text-danger'>{formik.errors.nombre}</span>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div className='fv-row mb-7'>
                  <label className='fw-bold fs-6 mb-2'>Descripción</label>
                  <textarea
                    className='form-control form-control-solid'
                    rows={3}
                    placeholder='Descripción opcional del bloque/área...'
                    {...formik.getFieldProps('descripcion')}
                  />
                </div>

                <div className='text-end pt-5'>
                  <button
                    type='button'
                    className='btn btn-light me-3'
                    onClick={() => setItemIdForUpdate(undefined)}
                  >
                    <KTIcon iconName='cross' className='fs-4 me-1' />
                    Cancelar
                  </button>
                  <button type='submit' className='btn btn-primary' disabled={loading}>
                    {loading ? (
                      <span className='indicator-progress' style={{display: 'block'}}>
                        Guardando...
                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                      </span>
                    ) : (
                      <>
                        <KTIcon iconName='check' className='fs-4 me-1' />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
        </form>
      )}
    </GuardiaModalShell>
  )
}

export {EditModal}
