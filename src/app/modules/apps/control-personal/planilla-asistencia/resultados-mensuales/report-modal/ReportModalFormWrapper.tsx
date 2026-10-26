import {useFormik} from 'formik'
import {showToast} from 'src/app/utils/toastHelper'
import {ProcesoPlanilla, ReportePlanillaMensualParams} from '../../core/_models'
import {ReportModalForm} from './ReportModalForm'

type Props = {
  proceso: ProcesoPlanilla | null
  searchInicial?: string
  onClose: () => void
  onShowPDF: (params: ReportePlanillaMensualParams) => Promise<void> | void
}

export const ReportModalFormWrapper = ({proceso, searchInicial = '', onClose, onShowPDF}: Props) => {
  const formik = useFormik<ReportePlanillaMensualParams>({
    initialValues: {
      filtroReporte: 'TODOS',
      search: searchInicial,
    },
    onSubmit: async (values, helpers) => {
      if (!proceso?.id_proceso) {
        showToast({
          type: 'error',
          message: 'Debes seleccionar un proceso válido antes de generar el reporte.',
        })
        helpers.setSubmitting(false)
        return
      }

      try {
        await onShowPDF(values)
        onClose()
      } catch (error: any) {
        showToast({
          type: 'error',
          message: error?.message || 'No se pudo generar el reporte mensual.',
        })
      } finally {
        helpers.setSubmitting(false)
      }
    },
  })

  return <ReportModalForm formik={formik} proceso={proceso} onClose={onClose} />
}
