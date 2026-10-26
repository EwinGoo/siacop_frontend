import {useEffect, useState} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useListView} from '../core/ListViewProvider'
import {useQueryResponse} from '../core/QueryResponseProvider'
import {createGrupo, getGrupoById, updateGrupo} from '../core/_requests'
import {Grupo, initialGrupo} from '../core/_models'
import {GuardiaModalShell} from '../components/GuardiaModalShell'
import {showToast} from 'src/app/utils/toastHelper'
import {KTIcon} from 'src/_metronic/helpers'

const schema = Yup.object({
  nombre: Yup.string().min(2).max(100).required('El nombre es obligatorio'),
  descripcion: Yup.string().max(255).nullable(),
  orden: Yup.number().oneOf([1, 2, 3], 'La posición debe ser 1, 2 o 3').required('La posición es obligatoria'),
})

const EditModal = () => {
  const {itemIdForUpdate, closeModal} = useListView()
  const {refetch} = useQueryResponse()
  const [loading, setLoading] = useState(false)
  const [loadingGrupo, setLoadingGrupo] = useState(false)
  const [grupo, setGrupo] = useState<Grupo>(initialGrupo)

  useEffect(() => {
    if (itemIdForUpdate && itemIdForUpdate !== null) {
      setLoadingGrupo(true)
      getGrupoById(itemIdForUpdate).then((data) => {
        if (data) setGrupo(data)
      }).finally(() => setLoadingGrupo(false))
    } else {
      setGrupo(initialGrupo)
      setLoadingGrupo(false)
    }
  }, [itemIdForUpdate])

  const formik = useFormik({
    initialValues: grupo,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        if (values.id_guardia_grupo) {
          await updateGrupo(values)
          showToast({message: 'Grupo actualizado correctamente', type: 'success'})
        } else {
          await createGrupo(values)
          showToast({message: 'Grupo creado correctamente', type: 'success'})
        }
        refetch()
        closeModal()
      } catch (error: any) {
        showToast({
          message: error?.response?.data?.message || 'No se pudo guardar el grupo',
          type: 'error',
        })
      } finally {
        setLoading(false)
      }
    },
  })

  const isEdit = !!grupo.id_guardia_grupo

  return (
    <GuardiaModalShell
      title={isEdit ? `Editar grupo: ${grupo.nombre}` : 'Nuevo grupo de guardias'}
      subtitle='Configura nombre, orden de rotación y descripción del grupo.'
      headerIcon={<KTIcon iconName='people' className='fs-1 guardia-modal-icon' />}
      variant='grupo'
      headerStyle={{background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)'}}
      titleClassName='text-white'
      subtitleClassName='text-white opacity-75 fs-7'
      closeButtonClassName='btn-light-success'
      closeIconClassName='text-success'
      iconBoxStyle={{
        background: 'rgba(255, 255, 255, 0.16)',
        border: '1px solid rgba(255, 255, 255, 0.24)',
      }}
      onClose={closeModal}
      size='md'
    >
      {loadingGrupo ? (
        <div className='d-flex flex-column align-items-center justify-content-center py-15'>
          <span className='spinner-border text-primary mb-4'></span>
          <span className='text-muted fw-semibold'>Cargando datos del grupo...</span>
        </div>
      ) : (
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className='row g-5'>
          <div className='col-12'>
            <label className='required fw-bold fs-6 mb-2'>Nombre del grupo</label>
            <input
              type='text'
              className={`form-control form-control-solid ${
                formik.touched.nombre && formik.errors.nombre ? 'is-invalid' : ''
              }`}
              placeholder='Ej: Grupo A'
              {...formik.getFieldProps('nombre')}
            />
            {formik.touched.nombre && formik.errors.nombre ? (
              <div className='text-danger fs-7 mt-1'>{formik.errors.nombre}</div>
            ) : null}
          </div>

          <div className='col-md-4'>
            <label className='required fw-bold fs-6 mb-2'>Posición de rotación</label>
            <select
              className={`form-select form-select-solid ${
                formik.touched.orden && formik.errors.orden ? 'is-invalid' : ''
              }`}
              value={formik.values.orden ?? 1}
              onChange={(e) => formik.setFieldValue('orden', Number(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
            {formik.touched.orden && formik.errors.orden ? (
              <div className='text-danger fs-7 mt-1'>{formik.errors.orden}</div>
            ) : null}
          </div>

          <div className='col-md-8'>
            <label className='fw-bold fs-6 mb-2'>Descripción</label>
            <textarea
              className='form-control form-control-solid'
              rows={4}
              placeholder='Descripción breve del grupo'
              {...formik.getFieldProps('descripcion')}
            />
          </div>
        </div>

        <div className='separator separator-dashed my-7'></div>

        <div className='d-flex justify-content-end gap-3'>
          <button type='button' className='btn btn-light' onClick={closeModal}>
            <KTIcon iconName='cross' className='fs-4 me-1' />
            Cancelar
          </button>
          <button type='submit' className='btn btn-primary' disabled={loading}>
            {loading ? (
              <>
                <span className='spinner-border spinner-border-sm me-2'></span>
                Guardando...
              </>
            ) : isEdit ? (
              <>
                <KTIcon iconName='pencil' className='fs-4 me-1' />
                Guardar cambios
              </>
            ) : (
              <>
                <KTIcon iconName='plus' className='fs-4 me-1' />
                Crear grupo
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
