import React, {useEffect, useState} from 'react'
import {Modal} from 'react-bootstrap'

interface PDFModalProps {
  isOpen: boolean
  onClose: () => void
  isPreparing?: boolean
  pdfBase64: string
  filename: string
  title?: string
}

const PDFModal: React.FC<PDFModalProps> = ({
  isOpen,
  onClose,
  isPreparing = false,
  pdfBase64,
  filename,
  title = 'Vista de PDF',
}) => {
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [isMobile, setIsMobile] = useState<boolean>(false)

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      )
      const isSmallScreen = window.innerWidth <= 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isPreparing) {
      setPdfUrl('')
      setIsLoading(true)
      setError('')
      return
    }

    if (pdfBase64 && isOpen) {
      try {
        setIsLoading(true)
        setError('')

        // Convertir base64 a blob URL
        const byteCharacters = atob(pdfBase64)
        const byteNumbers = new Array(byteCharacters.length)

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], {type: 'application/pdf'})
        const url = URL.createObjectURL(blob)

        setPdfUrl(url)
        setIsLoading(false)
      } catch (err) {
        console.error('Error al procesar PDF:', err)
        setError('Error al cargar el PDF')
        setIsLoading(false)
      }
    }

    // Cleanup function para liberar memoria
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfBase64, isOpen, isPreparing])

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePrint = () => {
    if (pdfUrl) {
      // Opción 1: Crear iframe oculto para imprimir (más elegante)
      const printFrame = document.createElement('iframe')
      printFrame.style.position = 'absolute'
      printFrame.style.top = '-1000px'
      printFrame.style.left = '-1000px'
      printFrame.style.width = '0'
      printFrame.style.height = '0'
      printFrame.style.border = 'none'

      document.body.appendChild(printFrame)

      printFrame.onload = () => {
        try {
          // Intentar imprimir desde el iframe oculto
          printFrame.contentWindow?.print()

          // Limpiar después de un tiempo
          setTimeout(() => {
            document.body.removeChild(printFrame)
          }, 1000)
        } catch (error) {
          // Fallback: abrir en nueva pestaña si falla
          console.warn('Impresión directa falló, usando fallback')
          document.body.removeChild(printFrame)
          handlePrintFallback()
        }
      }

      printFrame.src = pdfUrl
    }
  }

  const handlePrintFallback = () => {
    // Fallback: nueva pestaña que se cierra automáticamente
    const printWindow = window.open(pdfUrl, '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
        // Cerrar automáticamente después de imprimir (opcional)
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }
    }
  }

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }
  }

  // Renderizar vista móvil
  const renderMobileView = () => (
    <div className='text-center py-5'>
      <div className='mb-4'>
        <i className='las la-file-pdf' style={{fontSize: '4rem', color: '#dc3545'}}></i>
      </div>

      <h5 className='mb-3'>PDF Generado Correctamente</h5>
      <p className='text-muted mb-4'>
        En dispositivos móviles, recomendamos descargar el PDF para una mejor visualización
      </p>
      <div className='mt-4'>
        <small className='text-muted d-block'>{filename}</small>
        <small className='text-muted'>
          Tamaño: {Math.round((pdfBase64.length * 0.75) / 1024)} KB
        </small>
      </div>
    </div>
  )

  // Renderizar vista desktop con iframe
  const renderDesktopView = () => (
    <div style={{position: 'relative', height: '100%'}}>
      <iframe
        ref={(iframe) => {
          // Guardar referencia del iframe para imprimir
          if (iframe) {
            ;(window as any).currentPDFIframe = iframe
          }
        }}
        src={pdfUrl}
        width='100%'
        height='100%'
        style={{border: 'none'}}
        title={filename}
      />
    </div>
  )

  // Función mejorada para imprimir desde iframe cuando sea posible
  const handlePrintFromIframe = () => {
    try {
      const iframe = (window as any).currentPDFIframe
      if (iframe && iframe.contentWindow) {
        // Intentar imprimir directamente desde el iframe visible
        iframe.contentWindow.print()
        return true
      }
    } catch (error) {
      console.warn('No se pudo imprimir desde iframe:', error)
    }
    return false
  }

  const handlePrintOptimized = () => {
    if (!pdfUrl) return

    // En desktop, intentar imprimir desde iframe visible primero
    if (!isMobile && handlePrintFromIframe()) {
      return
    }

    // Si falla o es móvil, usar el método con iframe oculto
    handlePrint()
  }

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      size={isMobile ? 'lg' : 'xl'}
      centered
      backdrop='static'
      keyboard={false}
      fullscreen={isMobile ? 'sm-down' : undefined}
    >
      <Modal.Header closeButton className='py-5'>
        <Modal.Title className='fs-4'>
          <i className='las la-file-pdf fs-2 text-danger me-2'></i>
          {title}
        </Modal.Title>
        {/* {!isMobile && (
          <div className="ms-auto me-3">
            <button
              type="button"
              className="btn btn-sm btn-light-primary me-2"
              onClick={handleDownload}
              disabled={isLoading || !!error}
              title="Descargar PDF"
            >
              <i className="las la-download fs-4"></i>
              Descargar
            </button>
            <button
              type="button"
              className="btn btn-sm btn-light-info me-2"
              onClick={handlePrintOptimized}
              disabled={isLoading || !!error}
              title="Imprimir PDF"
            >
              <i className="las la-print fs-4"></i>
              Imprimir
            </button>
            <button
              type="button"
              className="btn btn-sm btn-light-secondary"
              onClick={handleOpenInNewTab}
              disabled={isLoading || !!error}
              title="Abrir en nueva pestaña"
            >
              <i className="las la-external-link-alt fs-4"></i>
              Nueva pestaña
            </button>
          </div>
        )} */}
      </Modal.Header>

      <Modal.Body className='p-0' style={{height: isMobile ? 'auto' : '80vh'}}>
        {(isPreparing || isLoading) && (
          <div
            className='d-flex justify-content-center align-items-center h-100'
            style={{minHeight: '300px'}}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary mb-3' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='text-muted'>{isPreparing ? 'Preparando documento...' : 'Generando PDF...'}</p>
            </div>
          </div>
        )}

        {error && (
          <div
            className='d-flex justify-content-center align-items-center h-100'
            style={{minHeight: '300px'}}
          >
            <div className='text-center'>
              <i className='las la-exclamation-triangle fs-1 text-warning mb-3'></i>
              <p className='text-danger fs-5'>{error}</p>
              <button className='btn btn-primary' onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        )}

        {!isPreparing && !isLoading && !error && pdfUrl && (isMobile ? renderMobileView() : renderDesktopView())}
      </Modal.Body>

      {!isMobile && (
        <Modal.Footer className='py-2'>
          <small className='text-muted me-auto'>
            {filename} • {Math.round((pdfBase64.length * 0.75) / 1024)} KB
          </small>

          {!isMobile && (
            <div className='ms-auto me-3'>
              <button
                type='button'
                className='btn btn-sm btn-light-secondary'
                onClick={handleOpenInNewTab}
                disabled={isPreparing || isLoading || !!error}
                title='Abrir en nueva pestaña'
              >
                <i className='las la-external-link-alt fs-4'></i>
                Nueva pestaña
              </button>
              <button
                type='button'
                className='btn btn-sm btn-light-primary me-2'
                onClick={handleDownload}
                disabled={isPreparing || isLoading || !!error}
                title='Descargar PDF'
              >
                <i className='las la-download fs-4'></i>
                Descargar
              </button>
              <button
                type='button'
                className='btn btn-sm btn-light-info me-2'
                onClick={handlePrintOptimized}
                disabled={isPreparing || isLoading || !!error}
                title='Imprimir PDF'
              >
                <i className='las la-print fs-4'></i>
                Imprimir
              </button>
            </div>
          )}
          {/*           
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cerrar
          </button> */}
        </Modal.Footer>
      )}

      {isMobile && (
        <Modal.Footer className='py-3 text-center'>
          <button type='button' className='btn btn-secondary btn-lg w-100' onClick={onClose}>
            Cerrar
          </button>
        </Modal.Footer>
      )}
    </Modal>
  )
}

export default PDFModal
