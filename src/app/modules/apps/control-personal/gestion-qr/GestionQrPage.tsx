import React, {lazy, Suspense, useEffect} from 'react'
import {PageLink, PageTitle} from 'src/_metronic/layout/core'
import {ControlPanel} from './components/ControlPanel'
import {UltimoCodigoCard, HistorialCard} from './components/Cards'
import {useQRScanner} from './hooks'

const QRScannerPanel = lazy(() =>
  import('./components/QRScanner/QRScannerPanel').then((module) => ({
    default: module.QRScannerPanel,
  }))
)

const GestionQrPage: React.FC = () => {
  const gestionQRBreadcrumbs: Array<PageLink> = [
    {
      title: 'Control Personal',
      path: '/apps/comisiones/gestion-qr',
      isSeparator: false,
      isActive: false,
    },
  ]
  const {
    // Estados
    loading,
    lastScanned,
    scannedHistory,
    modoRecepcion,
    tipoPermiso,
    fechaHora,
    isPaused,

    // Handlers
    handleQRDetected,
    handleIngresoManual,
    setModoRecepcion,
    setTipoPermiso,
    setFechaHora,
    setIsPaused,
    actualizarTiempo,
  } = useQRScanner()

  // Efecto para manejar el atajo de teclado Ctrl + M
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Verificar si se presiona Ctrl + M
      if (event.ctrlKey && event.key.toLowerCase() === 'm') {
        event.preventDefault()
        handleIngresoManual() 
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleIngresoManual])

  return (
    <>
      <PageTitle breadcrumbs={gestionQRBreadcrumbs}>Gestión por QR</PageTitle>

      <div className='row g-6'>
        {/* Panel principal del escáner */}
        <div className='col-xl-8'>
          <Suspense
            fallback={
              <div className='card'>
                <div className='card-header'>
                  <div className='card-title'>
                    <h3 className='fw-bold mb-0'>
                      <i className='bi bi-qr-code-scan me-3 text-primary'></i>
                      Escaner de Codigos QR
                    </h3>
                  </div>
                </div>
                <div className='card-body'>
                  <div className='alert alert-primary d-flex align-items-center mb-4'>
                    <i className='bi bi-hourglass-split me-2'></i>
                    <span>Cargando modulo de escaneo...</span>
                  </div>
                  <div
                    className='bg-light rounded d-flex flex-column justify-content-center align-items-center text-muted'
                    style={{minHeight: '420px'}}
                  >
                    <div className='spinner-border text-primary mb-3' role='status' />
                    <span>Preparando la camara y el lector QR.</span>
                  </div>
                </div>
              </div>
            }
          >
            <QRScannerPanel
              modoRecepcion={modoRecepcion}
              tipoPermiso={tipoPermiso}
              onQRDetected={handleQRDetected}
            />
          </Suspense>
        </div>

        {/* Panel de información y controles */}
        <div className='col-xl-4'>
          <ControlPanel
            modoRecepcion={modoRecepcion}
            tipoPermiso={tipoPermiso}
            fechaHora={fechaHora}
            isPaused={isPaused}
            loading={loading}
            onModoRecepcionChange={setModoRecepcion}
            onTipoPermisoChange={setTipoPermiso}
            onFechaHoraChange={setFechaHora}
            onPausedChange={setIsPaused}
            onIngresoManual={handleIngresoManual}
            onTimeUpdate={actualizarTiempo}
          />

          <UltimoCodigoCard lastScanned={lastScanned}  />
          <HistorialCard scannedHistory={scannedHistory}   />
        </div>
      </div>
    </>
  )
}

export default GestionQrPage
