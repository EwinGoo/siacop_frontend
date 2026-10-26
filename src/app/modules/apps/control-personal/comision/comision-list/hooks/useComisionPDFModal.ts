import {useCallback, useState} from 'react'
import {ComisionPDFData} from '../core/_models'

const useComisionPDFModal = () => {
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [currentPDFData, setCurrentPDFData] = useState<ComisionPDFData | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const [modalTitle, setModalTitle] = useState('Boleta de comisión')

  const handlePreparePDF = useCallback((title = 'Boleta de comisión') => {
    setModalTitle(title)
    setCurrentPDFData(null)
    setIsPreparing(true)
    setShowPDFModal(true)
  }, [])

  const handleShowPDF = useCallback((pdfData: ComisionPDFData) => {
    setModalTitle(pdfData.title || 'Boleta de comisión')
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

export {useComisionPDFModal}
