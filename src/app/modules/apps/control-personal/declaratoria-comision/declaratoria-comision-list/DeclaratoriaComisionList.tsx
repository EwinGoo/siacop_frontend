import {ListViewProvider} from './core/ListViewProvider'
import {QueryRequestProvider} from './core/QueryRequestProvider'
import {QueryResponseProvider} from './core/QueryResponseProvider'
import {ListHeader} from './components/header/ListHeader'
import {DeclaratoriaComisionTable} from './table/DeclaratoriaComisionTable'
import {EditModal} from './form-edit-modal/EditModal'
import {useState} from 'react'
import {KTCard} from 'src/_metronic/helpers'
import {useModalManager} from './hooks/useModalManager'
import PDFModal from './pdf-modal/PDFModal'
import GeneralPDFModal from '../../comision/comision-list/pdf-modal/PDFModal'
import {ReportModal} from './report-modal/ReportModal'
import {DeclaratoriaComisionPDFData} from './core/_models'
import DataViewModal from './data-view-modal/DataViewModal'

const DeclaratoriaComisionList = () => {
  const [showReportModal, setShowReportModal] = useState(false)
  const [generalPDFData, setGeneralPDFData] = useState<DeclaratoriaComisionPDFData | null>(null)
  const [showGeneralPDFModal, setShowGeneralPDFModal] = useState(false)
  const [isPreparingGeneralPDF, setIsPreparingGeneralPDF] = useState(false)

  const handlePrepareGeneralPDF = (title = 'Reporte de declaratorias en comision') => {
    setGeneralPDFData(null)
    setIsPreparingGeneralPDF(true)
    setShowGeneralPDFModal(true)
  }

  const handleShowGeneralPDF = (pdfData: DeclaratoriaComisionPDFData) => {
    setGeneralPDFData(pdfData)
    setIsPreparingGeneralPDF(false)
    setShowGeneralPDFModal(true)
  }

  const handleCancelGeneralPDF = () => {
    setIsPreparingGeneralPDF(false)
    setShowGeneralPDFModal(false)
    setTimeout(() => setGeneralPDFData(null), 300)
  }

  const handleCloseGeneralPDF = () => {
    setIsPreparingGeneralPDF(false)
    setShowGeneralPDFModal(false)
    setTimeout(() => setGeneralPDFData(null), 300)
  }

  const {
    handlePreparePDF,
    handleShowPDF,
    handleCancelPDF,
    handleShowData,
    handleSetLoading,
    getLoadingState,
    pdfModalProps,
    dataModalProps
  } = useModalManager()

  return (
    <>
      <KTCard>
        <ListHeader onOpenReport={() => setShowReportModal(true)} />
        <DeclaratoriaComisionTable 
          onPreparePDF={handlePreparePDF}
          onShowPDF={handleShowPDF}
          onCancelPDF={handleCancelPDF}
          onShowData={handleShowData}
          onSetLoading={handleSetLoading}
          getLoadingState={getLoadingState}
        />
      </KTCard>
      
      {/* Modal de edición existente */}
      <EditModal />
      
      {/* Modales globales optimizados - Solo UNA instancia */}
      <PDFModal {...pdfModalProps} />
      <DataViewModal {...dataModalProps} />
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onPreparePDF={handlePrepareGeneralPDF}
        onShowPDF={handleShowGeneralPDF}
        onCancelPDF={handleCancelGeneralPDF}
      />
      <GeneralPDFModal
        isOpen={showGeneralPDFModal}
        onClose={handleCloseGeneralPDF}
        isPreparing={isPreparingGeneralPDF}
        pdfBlob={generalPDFData?.blob || null}
        filename={generalPDFData?.filename || 'REPORTE_DECLARATORIAS_COMISION.pdf'}
        title={generalPDFData?.title || 'Reporte de declaratorias en comisión'}
      />
    </>
  )
}

const DeclaratoriaComisionListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <DeclaratoriaComisionList />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {DeclaratoriaComisionListWrapper}
