import {useFormik} from 'formik'
import * as Yup from 'yup'
import axiosClient from 'src/app/services/axiosClient'
import {API_ROUTES} from 'src/app/config/apiRoutes'
import {ReportModalForm} from './ReportModalForm'
import {getLocalDate} from 'src/app/hooks/useDateFormatter'
import Swal from 'sweetalert2'

const validationSchema = Yup.object().shape({
  fecha_desde: Yup.mixed().required('La fecha de inicio es requerida'),
  fecha_hasta: Yup.mixed().required('La fecha de fin es requerida'),
})

function formatDate(date: any): string {
  if (Array.isArray(date)) {
    const d = date[0]
    return d?.toISOString().split('T')[0] || ''
  }
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]
  }
  return date || ''
}

type Props = {
  onClose: () => void
  onPdfReady: (url: string) => void
}

export const ReportModalFormWrapper = ({onClose, onPdfReady}: Props) => {
  const formik = useFormik({
    validationSchema,
    initialValues: {
      fecha_desde:     getLocalDate(),
      fecha_hasta:     getLocalDate(),
      estado_vacacion: 'TODAS',
      tipo_solicitud:  '',
      tipo_reporte:    'general', // 'general' | 'recepcion'
    },
    onSubmit: async (values, {setSubmitting}) => {
      try {
        const response = await axiosClient.post(
          API_ROUTES.REPORTES.VACACION.GENERAL,
          {
            fecha_desde:     formatDate(values.fecha_desde),
            fecha_hasta:     formatDate(values.fecha_hasta),
            estado_vacacion: values.estado_vacacion === 'TODAS' ? '' : values.estado_vacacion,
            tipo_solicitud:  values.tipo_solicitud,
            tipo_reporte:    values.tipo_reporte,
          },
          {responseType: 'blob'}
        )

        const blob    = new Blob([response.data], {type: 'application/pdf'})
        const blobUrl = URL.createObjectURL(blob)
        onPdfReady(blobUrl)
      } catch (error) {
        console.error('Error al generar el reporte:', error)
        Swal.fire({
          icon: 'error',
          title: 'No se pudo generar el reporte',
          text: 'Verifique los filtros seleccionados o intente nuevamente.',
          confirmButtonText: 'Aceptar',
        })
      } finally {
        setSubmitting(false)
      }
    },
  })

  return <ReportModalForm formik={formik} onClose={onClose} />
}
