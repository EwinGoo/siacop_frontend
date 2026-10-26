import {useCallback, useState} from 'react'
import {PermisoPDFData} from '../core/_models'

const usePermisoPDFModal = () => {
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [currentPDFData, setCurrentPDFData] = useState<PermisoPDFData | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const [modalTitle, setModalTitle] = useState('Permiso')

  const handlePreparePDF = useCallback((title = 'Permiso') => {
    setModalTitle(title)
    setCurrentPDFData(null)
    setIsPreparing(true)
    setShowPDFModal(true)
  }, [])

  const handleShowPDF = useCallback((pdfData: PermisoPDFData) => {
    setModalTitle(pdfData.title || 'Permiso')
    setCurrentPDFData(pdfData)
    setIsPreparing(false)
    setShowPDFModal(true)
  }, [])

  const handleCancelPDF = useCallback(() => {
    setIsPreparing(false)
    setShowPDFModal(false)
    setTimeout(() => setCurrentPDFData(null), 300)
  }, [])

  const handleClosePDFModal = useCallback(() => {
    setIsPreparing(false)
    setShowPDFModal(false)
    setTimeout(() => setCurrentPDFData(null), 300)
  }, [])

  return {
    handlePreparePDF,
    handleShowPDF,
    handleCancelPDF,
    pdfModalProps: {
      isOpen: showPDFModal,
      onClose: handleClosePDFModal,
      isPreparing,
      pdfBlob: currentPDFData?.blob || null,
      filename: currentPDFData?.filename || '',
      title: currentPDFData?.title || modalTitle,
    },
  }
}

export {usePermisoPDFModal}
