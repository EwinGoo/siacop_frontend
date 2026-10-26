import {FC, useEffect} from 'react'
import {useFormik} from 'formik'
import {getComisionById, procesarEstadoComision} from '../core/_requests'
import {useQuery, useQueryClient} from 'react-query'
import {QUERIES} from '../../../../../../../_metronic/helpers'
import * as Yup from 'yup'
import {Button, Modal} from 'react-bootstrap'
import {toast} from 'react-toastify'
import Swal from 'sweetalert2'
import {useListView} from '../core/ListViewProvider'
import {EstadoBadge} from '../table/components/EstadoBadge'
import {ProcesarComisionParams} from '../core/_models'
import {useQueryResponse} from '../core/QueryResponseProvider'

type Props = {
  id: number | undefined
  descripcion: string
  show: boolean
  onClose: () => void
  onSuccess: () => void
  observarComision: (id: number, observacion: string) => Promise<void>
}

const ObservarSchema = Yup.object().shape({
  observacion: Yup.string()
    .min(5, 'Debe tener al menos 5 caracteres')
    .max(500, 'Máximo 500 caracteres')
    .required('La observación es obligatoria'),
})

export const ObservarModal = () => {
  //   const queryClient = useQueryClient() // ✅
  const {refetch} = useQueryResponse() // ✅
  const {accion, isShow, itemIdForUpdate, setIsShow, setAccion} = useListView()

  const {
    isLoading,
    data: comision,
    error,
  } = useQuery(
    `${QUERIES.COMISIONES_LIST}-observar-${itemIdForUpdate}`,
    () => getComisionById(itemIdForUpdate),
    {
      enabled: !!itemIdForUpdate && isShow,
      cacheTime: 0,
      retry: 1,
      onError: (error) => {
        console.error(error)
        toast.error('Error al cargar la comisión para observar.', {
          position: 'top-right',
          autoClose: 5000,
        })
        handleClose()
      },
    }
  )
  const descripcion = ''
  const show = isShow && accion === 'observar'

  const handleClose = () => {
    setIsShow(false)
    setAccion(undefined)
  }

  const formik = useFormik<ProcesarComisionParams>({
    initialValues: {
      code: null,
      action: 'observe',
      observacion: comision?.observacion || '',
    },
    enableReinitialize: true,
    validationSchema: ObservarSchema,
    onSubmit: async (values, {setSubmitting}) => {
      setSubmitting(true)
      try {
        await procesarEstadoComision({...values, code: comision?.id_comision})

        // await queryClient.invalidateQueries(QUERIES.COMISIONES_LIST)
        await refetch()
        toast.success('Observación enviada correctamente')
        // onSuccess()
        handleClose()
      } catch (error: any) {
        Swal.fire('Error', error.message || 'Error al enviar la observación', 'error')
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    if (show) {
      formik.resetForm()
    }
  }, [comision, show])

  if (!(isShow && accion === 'observar')) {
    return null
  }

  return (
    <Modal show={isShow} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Observar Comisión</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {comision && (
          <>
            <div className='bg-primary bg-opacity-10 p-4 rounded mb-4'>
              <h6 className='text-primary mb-3 fw-semibold'>
                <i className='bi bi-geo-alt me-2'></i>
                Detalles de la comisión
              </h6>
              <p className='mb-1'>
                <strong>Codigo:</strong> {comision.id_temporal || 'N/D'}
              </p>
              <p className='mb-1'>
                <strong>Generado por:</strong> {comision.nombre_generador || 'N/D'}
              </p>
              <p className='mb-1'>
                <strong>Fecha:</strong> {comision.fecha_comision || 'N/D'}
              </p>
              <div className='separator separator-dashed border-secondary my-1'></div>
              <p className='mb-0'>
                <strong>Estado:</strong>{' '}
                <EstadoBadge estado={comision.estado_boleta_comision ?? 'GENERADO'} />
              </p>
            </div>
          </>
        )}

        <form onSubmit={formik.handleSubmit} id='form-observar'>
          <div className='mb-3'>
            <label htmlFor='observacion' className='form-label'>
              Observación <span className='text-danger'>*</span>
            </label>
            <textarea
              id='observacion'
              rows={4}
              className={`form-control ${
                formik.touched.observacion && formik.errors.observacion ? 'is-invalid' : ''
              }`}
              {...formik.getFieldProps('observacion')}
              disabled={formik.isSubmitting}
            />
            {formik.touched.observacion && formik.errors.observacion && (
              <div className='invalid-feedback'>{formik.errors.observacion}</div>
            )}
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose} disabled={formik.isSubmitting}>
          Cancelar
        </Button>
        <Button type='submit' form='form-observar' variant='primary' disabled={formik.isSubmitting}>
          {formik.isSubmitting ? 'Enviando...' : 'Enviar Observación'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
