import {useEffect, useRef, useState} from 'react'
import Swal from 'sweetalert2'
import {eliminarDocumento, getPdfDocumento} from '../core/requests'
import {ErrorConsulta} from './EstadoConsulta'
import {Modal} from 'react-bootstrap'
import {Documento, ModoArchivo} from '../core/types'
import {fechaDocumento} from '../core/presentation'

export const DocumentoVisor = ({
  documento,
  cerrar,
  modo,
  escriturasHabilitadas = false,
  eliminado,
}: {
  documento: Documento | null
  cerrar: () => void
  modo: ModoArchivo
  escriturasHabilitadas?: boolean
  eliminado?: () => void
}) => {
  const contenedor = useRef<HTMLDivElement | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [cargando, setCargando] = useState(false)
  const recurso = useRef<string | null>(null)
  const solicitud = useRef<AbortController | null>(null)
  useEffect(() => {
    setUrl(null)
    setError(null)
    setCargando(false)
    return () => {
      solicitud.current?.abort()
      if (recurso.current) URL.revokeObjectURL(recurso.current)
      recurso.current = null
    }
  }, [documento?.id])
  const obtener = async (accion: 'preview' | 'download') => {
    if (!documento || documento.archivo.estado !== 'disponible') return
    solicitud.current?.abort()
    const controller = new AbortController()
    solicitud.current = controller
    setCargando(true)
    setError(null)
    try {
      const blob = await getPdfDocumento(documento.id, accion, controller.signal)
      if (controller.signal.aborted) return
      const nueva = URL.createObjectURL(blob)
      if (accion === 'preview') {
        if (recurso.current) URL.revokeObjectURL(recurso.current)
        recurso.current = nueva
        setUrl(nueva)
      } else {
        const enlace = document.createElement('a')
        enlace.href = nueva
        enlace.download = `documento-${documento.id}.pdf`
        document.body.appendChild(enlace)
        enlace.click()
        enlace.remove()
        setTimeout(() => URL.revokeObjectURL(nueva), 0)
      }
    } catch (fallo: unknown) {
      if (!controller.signal.aborted) setError(fallo)
    } finally {
      if (!controller.signal.aborted) setCargando(false)
    }
  }
  const eliminar = async () => {
    if (!documento || eliminando || !escriturasHabilitadas) return
    setEliminando(true)
    try {
      const resultado = await Swal.fire({
        title: 'Eliminar documento',
        text: `Se eliminará «${
          documento.nombre ?? 'Documento sin nombre'
        }» del expediente y su PDF local, si existe. Esta acción es permanente.`,
        icon: 'warning',
        target: contenedor.current ?? document.body,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar documento',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {confirmButton: 'btn btn-danger', cancelButton: 'btn btn-light ms-3'},
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        allowEscapeKey: () => !Swal.isLoading(),
        preConfirm: async () => {
          try {
            await eliminarDocumento(documento.id)
            return true
          } catch (fallo) {
            Swal.showValidationMessage(
              fallo instanceof Error ? fallo.message : 'No se pudo eliminar el documento.'
            )
            return false
          }
        },
      })
      if (resultado.isConfirmed) eliminado?.()
    } finally {
      setEliminando(false)
    }
  }
  const disponible = documento?.archivo.estado === 'disponible'
  return (
    <Modal
      show={documento !== null}
      onHide={() => {
        if (!eliminando) cerrar()
      }}
      keyboard={!eliminando}
      backdrop={eliminando ? 'static' : true}
      size='lg'
      centered
      aria-labelledby='archivo-documento-titulo'
    >
      <Modal.Header closeButton={!eliminando} closeLabel='Cerrar detalle'>
        <Modal.Title id='archivo-documento-titulo'>
          {documento?.nombre ?? 'Detalle del documento'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body ref={contenedor}>
        {documento && (
          <>
            <dl className='row mb-5'>
              <dt className='col-sm-4'>Categoría</dt>
              <dd className='col-sm-8'>{documento.categoria ?? 'Sin categoría'}</dd>
              <dt className='col-sm-4'>Descripción</dt>
              <dd className='col-sm-8 text-break'>{documento.descripcion ?? 'Sin descripción'}</dd>
              <dt className='col-sm-4'>Tipo de documento</dt>
              <dd className='col-sm-8'>{documento.tipo ?? 'Sin dato'}</dd>
              <dt className='col-sm-4'>Fecha de inicio</dt>
              <dd className='col-sm-8'>{fechaDocumento(documento.fecha_inicio)}</dd>
              <dt className='col-sm-4'>Fecha de fin</dt>
              <dd className='col-sm-8'>{fechaDocumento(documento.fecha_fin)}</dd>
              <dt className='col-sm-4'>Fecha de registro</dt>
              <dd className='col-sm-8'>{fechaDocumento(documento.fecha_registro)}</dd>
            </dl>
            {!disponible && (
              <div className='alert alert-info' role='status'>
                {documento.archivo.estado === 'historico_pendiente'
                  ? 'Este PDF histórico permanece en SIACOP2. Su visualización y descarga desde SIACOP V3 todavía no están disponibles.'
                  : documento.archivo.estado === 'sin_archivo'
                  ? 'Este documento no tiene un archivo digital registrado.'
                  : 'La visualización y descarga del PDF no están disponibles en este momento.'}
              </div>
            )}
            {error !== null && <ErrorConsulta error={error} />}
            {cargando && <p role='status'>Cargando PDF…</p>}
            {url && (
              <iframe
                title='Vista previa del documento PDF'
                src={url}
                className='w-100 border rounded mb-5'
                style={{height: '60vh'}}
              />
            )}
            {modo === 'gestion' &&
              escriturasHabilitadas &&
              !['disponible', 'sin_archivo'].includes(documento.archivo.estado) && (
                <p className='text-muted'>
                  La eliminación estará disponible cuando se verifique el archivo en SIACOP V3.
                </p>
              )}
            {modo === 'gestion' && (
              <div className='d-flex flex-wrap gap-3'>
                <button className='btn btn-light' disabled>
                  Editar documento
                </button>
                <button className='btn btn-light' disabled>
                  Reemplazar PDF
                </button>
                <button
                  className='btn btn-light-danger'
                  disabled={
                    !escriturasHabilitadas ||
                    eliminando ||
                    cargando ||
                    !['disponible', 'sin_archivo'].includes(documento.archivo.estado)
                  }
                  onClick={() => {
                    void eliminar()
                  }}
                >
                  Eliminar documento
                </button>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button
          className='btn btn-light'
          disabled={!disponible || cargando || eliminando}
          onClick={() => {
            void obtener('preview')
          }}
        >
          Visualizar PDF
        </button>
        <button
          className='btn btn-light-primary'
          disabled={!disponible || cargando || eliminando}
          onClick={() => {
            void obtener('download')
          }}
        >
          Descargar PDF
        </button>
        <button className='btn btn-primary' disabled={eliminando} onClick={cerrar}>
          Cerrar
        </button>
      </Modal.Footer>
    </Modal>
  )
}
