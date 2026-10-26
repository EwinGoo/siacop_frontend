import {getLocalDate} from 'src/app/hooks/useDateFormatter'
import {ReportModalForm} from './ReportModalForm'
import {useFormik} from 'formik'
import {useQuery} from 'react-query'
import {generarReporteGeneralComision, getTiposPermiso} from '../core/_requests'
import {reportValidationSchema} from './schema/reportValidationSchema'
import {ComisionPDFData} from '../core/_models'
import {showToast} from 'src/app/utils/toastHelper'

type Props = {
  onClose: () => void
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: ComisionPDFData) => void
  onCancelPDF: () => void
}

export const ReportModalFormWrapper = ({
  onClose,
  onPreparePDF,
  onShowPDF,
  onCancelPDF,
}: Props) => {
  const formik = useFormik({
    validationSchema: reportValidationSchema,
    initialValues: {
      fechaInicio: getLocalDate(),
      fechaFin: getLocalDate(),
      estado: 'TODO',
      tipoComision: 'TODO',
    },
    onSubmit: async (values, helpers) => {
      try {
        onClose()
        onPreparePDF('Reporte de permisos')
        const pdfData = await generarReporteGeneralComision({
          fechaInicio: formatDate(values.fechaInicio),
          fechaFin: formatDate(values.fechaFin),
          estado: values.estado,
          tipoComision: values.tipoComision,
        })

        onShowPDF(pdfData)
      } catch (error: any) {
        onCancelPDF()
        showToast({
          message: error?.message || 'No se pudo generar el reporte. Intente más tarde.',
          type: 'error',
        })
      } finally {
        helpers.setSubmitting(false)
      }
    },
  })

  const {data: tiposPermiso = []} = useQuery('comision-tipos-permiso', getTiposPermiso, {
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  })

  return <ReportModalForm formik={formik} onClose={onClose} tiposPermiso={tiposPermiso} />
}

function formatDate(date: any): string {
  if (Array.isArray(date)) {
    const d = date[0]
    return d?.toISOString().split('T')[0] || ''
  }

  if (date instanceof Date) {
    return date.toISOString().split('T')[0]
  }

  return date
}
