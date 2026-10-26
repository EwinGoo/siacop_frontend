import {useFormik} from 'formik'
import {showToast} from 'src/app/utils/toastHelper'
import {ProcesoPlanilla, ReporteResultadosDiariosParams} from '../../core/_models'
import {ReportModalForm} from './ReportModalForm'

type Props = {
  proceso: ProcesoPlanilla | null
  searchInicial?: string
  estadoDiaInicial?: string
  onClose: () => void
  onShowPDF: (params: ReporteResultadosDiariosParams) => Promise<void> | void
}

export const ReportModalFormWrapper = ({
  proceso,
  searchInicial = '',
  estadoDiaInicial = '',
  onClose,
  onShowPDF,
}: Props) => {
  const formik = useFormik<ReporteResultadosDiariosParams>({
    initialValues: {
      filtroReporte: 'TODOS',
      search: searchInicial,
      estadoDia: estadoDiaInicial,
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
          message: error?.message || 'No se pudo generar el reporte diario.',
        })
      } finally {
        helpers.setSubmitting(false)
      }
    },
  })

  return <ReportModalForm formik={formik} proceso={proceso} onClose={onClose} />
}
