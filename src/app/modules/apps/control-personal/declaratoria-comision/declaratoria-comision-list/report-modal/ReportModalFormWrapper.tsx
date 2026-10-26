import {useFormik} from 'formik'
import {getLocalDate} from 'src/app/hooks/useDateFormatter'
import {showToast} from 'src/app/utils/toastHelper'
import {DeclaratoriaComisionPDFData} from '../core/_models'
import {generarReporteGeneralDeclaratoriaComision} from '../core/_requests'
import {ReportModalForm} from './ReportModalForm'
import {reportValidationSchema} from './schema/reportValidationSchema'

type Props = {
  onClose: () => void
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: DeclaratoriaComisionPDFData) => void
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
      tipoViatico: 'TODO',
    },
    onSubmit: async (values, helpers) => {
      try {
        onClose()
        onPreparePDF('Reporte de declaratorias en comision')
        const pdfData = await generarReporteGeneralDeclaratoriaComision({
          fechaInicio: formatDate(values.fechaInicio),
          fechaFin: formatDate(values.fechaFin),
          estado: values.estado,
          tipoViatico: values.tipoViatico,
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

  return <ReportModalForm formik={formik} onClose={onClose} />
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
