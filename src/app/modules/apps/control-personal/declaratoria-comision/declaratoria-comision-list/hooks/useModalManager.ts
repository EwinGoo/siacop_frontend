import { useState, useCallback } from 'react'

interface PDFData {
  base64: string;
  filename: string;
  declaratoria: any;
}

interface LoadingState {
  [key: string]: boolean;
}

export const useModalManager = () => {
  // Estados para modales globales
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)
  const [currentPDFData, setCurrentPDFData] = useState<PDFData | null>(null)
  const [currentDeclaratoria, setCurrentDeclaratoria] = useState<any>(null)
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})
  const [isPreparingPDF, setIsPreparingPDF] = useState(false)
  const [pdfTitle, setPdfTitle] = useState('Declaratoria de Comision')

  // Handlers optimizados con useCallback para evitar re-renders innecesarios
  const handlePreparePDF = useCallback((title = 'Declaratoria de Comision') => {
    setPdfTitle(title)
    setCurrentPDFData(null)
    setIsPreparingPDF(true)
    setShowPDFModal(true)
  }, [])

  const handleShowPDF = useCallback((pdfData: PDFData) => {
    setPdfTitle('Declaratoria de Comision')
    setCurrentPDFData(pdfData)
    setIsPreparingPDF(false)
    setShowPDFModal(true)
  }, [])

  const handleShowData = useCallback((declaratoria: any) => {
    setCurrentDeclaratoria(declaratoria)
    setShowDataModal(true)
  }, [])

  const handleClosePDFModal = useCallback(() => {
    setIsPreparingPDF(false)
    setShowPDFModal(false)
    // Limpiar después de un pequeño delay para animación
    setTimeout(() => setCurrentPDFData(null), 300)
  }, [])

  const handleCancelPDF = useCallback(() => {
    setIsPreparingPDF(false)
    setShowPDFModal(false)
    setTimeout(() => setCurrentPDFData(null), 300)
  }, [])

  const handleCloseDataModal = useCallback(() => {
    setShowDataModal(false)
    setTimeout(() => setCurrentDeclaratoria(null), 300)
  }, [])

  const handleSetLoading = useCallback((declaratoriaId: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [declaratoriaId]: isLoading
    }))
  }, [])

  const getLoadingState = useCallback((declaratoriaId: string) => {
    return loadingStates[declaratoriaId] || false
  }, [loadingStates])

  // Función para limpiar estados de loading (opcional)
  const clearLoadingStates = useCallback(() => {
    setLoadingStates({})
  }, [])

  return {
    // Estados
    showPDFModal,
    showDataModal,
    currentPDFData,
    currentDeclaratoria,
    
    // Handlers
    handleShowPDF,
    handlePreparePDF,
    handleCancelPDF,
    handleShowData,
    handleClosePDFModal,
    handleCloseDataModal,
    handleSetLoading,
    getLoadingState,
    clearLoadingStates,
    
    // Props para modales (para facilitar el spread)
    pdfModalProps: {
      isOpen: showPDFModal,
      onClose: handleClosePDFModal,
      isPreparing: isPreparingPDF,
      pdfBase64: currentPDFData?.base64 || '',
      filename: currentPDFData?.filename || '',
      title: pdfTitle
    },
    
    dataModalProps: {
      isOpen: showDataModal,
      onClose: handleCloseDataModal,
      declaratoria: currentDeclaratoria
    }
  }
}
