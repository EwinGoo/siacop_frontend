import {ListViewProvider} from './core/ListViewProvider'
import {QueryRequestProvider} from './core/QueryRequestProvider'
import {QueryResponseProvider} from './core/QueryResponseProvider'
import {ListHeader} from './components/header/ListHeader'
import {AsistenciaPermisoTable} from './table/AsistenciaPermisoTable'
import {EditModal} from './asistencia-permiso-edit-modal/EditModal'
import {KTCard} from '../../../../../../../_metronic/helpers'
import { ObservarModal } from './asistencia-permiso-observar-modal/ObservarModal'
import { ReportModal } from './comision-report-modal/ReportModal'
import {ViewModal} from './asistencia-permiso-view-modal/ViewModal'
import {usePermisoPDFModal} from './hooks/usePermisoPDFModal'
import PDFModal from '../../../comision/comision-list/pdf-modal/PDFModal'

const AsistenciaPermisoList = () => {
  const {handlePreparePDF, handleShowPDF, handleCancelPDF, pdfModalProps} = usePermisoPDFModal()

  return (
    <>
      <KTCard>
        <ListHeader />
        <AsistenciaPermisoTable
          onPreparePDF={handlePreparePDF}
          onShowPDF={handleShowPDF}
          onCancelPDF={handleCancelPDF}
        />
      </KTCard>
      <EditModal />
      <ObservarModal />
      <ReportModal
        onPreparePDF={handlePreparePDF}
        onShowPDF={handleShowPDF}
        onCancelPDF={handleCancelPDF}
      />
      <ViewModal />
      <PDFModal {...pdfModalProps} />

    </>
  )
}

const AsistenciaPermisoListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <AsistenciaPermisoList />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {AsistenciaPermisoListWrapper}
