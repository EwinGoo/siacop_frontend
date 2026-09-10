import {ChangeEvent, DragEvent, useEffect, useMemo, useState} from 'react'
import {KTCard, KTIcon} from 'src/_metronic/helpers'
import {StatusBadge} from '../components/StatusBadge'
import {EmptyState} from '../components/EmptyState'
import {ImportacionResumenResponse} from '../core/_models'
import {getResumenImportaciones, uploadMarcaciones} from '../core/_requests'
import {showToast} from 'src/app/utils/toastHelper'

const toNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const buildFileKey = (file: File): string => file.name + '-' + file.size + '-' + file.lastModified

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  return Math.max(bytes / 1024, 1).toFixed(0) + ' KB'
}

const ImportacionesPage = () => {
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [showImportOverlay, setShowImportOverlay] = useState(false)
  const [loadingResumen, setLoadingResumen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resumen, setResumen] = useState<ImportacionResumenResponse | null>(null)
  const archivosResumen = resumen && Array.isArray(resumen.archivos) ? resumen.archivos : []
  const totalSelectedBytes = useMemo(() => files.reduce((total, file) => total + file.size, 0), [files])
  const totalesImportacion = useMemo(() => {
    const total = archivosResumen.reduce(
      (acc, item) => {
        acc.totalLineas += toNumber(item.total_lineas_archivo)
        acc.marcacionesInsertadas += toNumber(item.marcaciones_insertadas)
        acc.marcacionesDuplicadas += toNumber(item.marcaciones_duplicadas)
        acc.sinPersona += toNumber(item.sin_persona_relacionada)
        acc.duracionS +=
          item.duracion_s !== undefined && item.duracion_s !== null
            ? toNumber(item.duracion_s)
            : toNumber(item.duracion_ms) / 1000

        return acc
      },
      {
        totalLineas: 0,
        marcacionesInsertadas: 0,
        marcacionesDuplicadas: 0,
        sinPersona: 0,
        duracionS: 0,
      }
    )

    return {
      ...total,
      duracionS: Math.round(total.duracionS * 100) / 100,
    }
  }, [archivosResumen])

  const cargarResumen = async () => {
    setLoadingResumen(true)
    try {
      const data = await getResumenImportaciones()
      setResumen(data)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo cargar el resumen.')
    } finally {
      setLoadingResumen(false)
    }
  }

  useEffect(() => {
    void cargarResumen()
  }, [])

  useEffect(() => {
    if (submitting) {
      setShowImportOverlay(true)
      return
    }

    const timeout = window.setTimeout(() => setShowImportOverlay(false), 240)
    return () => window.clearTimeout(timeout)
  }, [submitting])
  const agregarArchivos = (selectedFiles: File[]) => {
    const archivosDat = selectedFiles.filter((file) => file.name.toLowerCase().endsWith('.dat'))

    if (selectedFiles.length > 0 && archivosDat.length === 0) {
      showToast({message: 'Solo se permiten archivos .dat.', type: 'warning'})
      return
    }

    setFiles((current) => {
      const keys = new Set(current.map(buildFileKey))
      const next = [...current]

      archivosDat.forEach((file) => {
        const key = buildFileKey(file)
        if (!keys.has(key)) {
          keys.add(key)
          next.push(file)
        }
      })

      return next
    })
    setError(null)
  }

  const onFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    agregarArchivos(Array.from(event.target.files || []))
    event.target.value = ''
  }

  const onDropFiles = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (submitting) {
      return
    }

    agregarArchivos(Array.from(event.dataTransfer.files || []))
  }

  const removeFile = (fileKey: string) => {
    setFiles((current) => current.filter((file) => buildFileKey(file) !== fileKey))
  }

  const onSubmit = async () => {
    if (files.length === 0) {
      const message = 'Debes seleccionar al menos un archivo .dat.'
      setError(message)
      showToast({message, type: 'warning'})
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const response = await uploadMarcaciones(files)
      setResumen(response)
      setFiles([])

      const totalArchivos = response.total_archivos ?? response.archivos?.length ?? 0
      const totalOk = response.total_ok ?? 0
      const totalError = response.total_error ?? 0

      if (totalError > 0) {
        showToast({
          message: 'Importación completada con ' + totalOk + ' archivo(s) correcto(s) y ' + totalError + ' con error.',
          type: 'warning',
        })
      } else {
        showToast({
          message: 'Importación completada correctamente. ' + totalArchivos + ' archivo(s) procesado(s).',
          type: 'success',
        })
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'No se pudo importar los archivos.'
      setError(message)
      showToast({message, type: 'error'})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>

      {showImportOverlay && (
        <div
          className='position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center'
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.58)',
            opacity: submitting ? 1 : 0,
            pointerEvents: submitting ? 'auto' : 'none',
            transition: 'opacity 220ms ease',
            zIndex: 1095,
          }}
        >
          <div
            className='bg-white rounded shadow-lg p-6 text-center'
            style={{
              transform: submitting ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
              transition: 'transform 220ms ease',
              width: 'min(92vw, 420px)',
            }}
          >
            <video
              src={(process.env.PUBLIC_URL || '') + '/media/videos/transferencia.mp4'}
              className='w-100'
              style={{maxHeight: 260, objectFit: 'contain'}}
              autoPlay
              muted
              loop
              playsInline
            />
            <div className='fw-bold text-gray-900 mt-4'>Importando marcaciones...</div>
          </div>
        </div>
      )}
      {resumen && (
        <div className='row g-3 mb-5'>
          <div className='col-12 col-md-4'>
            <div className='card card-flush h-100'>
              <div className='card-body py-4 px-5'>
                <div className='text-gray-500 fs-8 text-uppercase fw-bold mb-1'>Archivos procesados</div>
                <div className='d-flex align-items-center gap-3'>
                  <span className='fs-2 fw-bolder text-gray-900'>
                    {resumen.total_archivos ?? archivosResumen.length}
                  </span>
                  <span className='badge badge-light-primary'>Total</span>
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-4'>
            <div className='card card-flush h-100'>
              <div className='card-body py-4 px-5'>
                <div className='text-gray-500 fs-8 text-uppercase fw-bold mb-1'>Importaciones correctas</div>
                <div className='d-flex align-items-center gap-3'>
                  <span className='fs-2 fw-bolder text-success'>{resumen.total_ok ?? 0}</span>
                  <span className='badge badge-light-success'>Completadas</span>
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-4'>
            <div className='card card-flush h-100'>
              <div className='card-body py-4 px-5'>
                <div className='text-gray-500 fs-8 text-uppercase fw-bold mb-1'>Importaciones con error</div>
                <div className='d-flex align-items-center gap-3'>
                  <span className='fs-2 fw-bolder text-danger'>{resumen.total_error ?? 0}</span>
                  <span className='badge badge-light-danger'>Revisar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <KTCard className='mb-7'>
        <div className='card-header'>
          <div className='card-title d-flex flex-column'>
            <h3 className='fw-bold m-0'>Importación de marcaciones</h3>
            <span className='text-muted mt-1'>Carga multiarchivo con trazabilidad individual por biométrico</span>
          </div>
        </div>
        <div className='card-body'>
          <div className='row g-5 align-items-start'>
            <div className='col-12 col-lg-8'>
              <div
                className='dropzone dropzone-queue border border-dashed border-gray-300 rounded px-0 py-0'
                onDragOver={(event) => event.preventDefault()}
                onDrop={onDropFiles}
              >
                <input
                  id='marcaciones-uploader'
                  type='file'
                  multiple
                  accept='.dat'
                  className='d-none'
                  disabled={submitting}
                  onChange={onFilesChange}
                />
                <div className='dropzone-panel d-flex align-items-center justify-content-between flex-wrap gap-3 px-6 py-5'>
                  <div className='d-flex align-items-center gap-4'>
                    <div className='symbol symbol-45px symbol-light-primary'>
                      <span className='symbol-label'>
                        <KTIcon iconName='file-up' className='fs-2x text-primary' />
                      </span>
                    </div>
                    <div>
                      <div className='fw-bold text-gray-900'>Cola de archivos</div>
                      <div className='text-muted fs-7'>Puedes agregar archivos .dat</div>
                    </div>
                  </div>
                  <div className='d-flex gap-2'>
                    <label
                      htmlFor='marcaciones-uploader'
                      className={submitting ? 'btn btn-sm btn-light-primary disabled' : 'btn btn-sm btn-light-primary'}
                      style={{pointerEvents: submitting ? 'none' : 'auto'}}
                    >
                      <KTIcon iconName='plus' className='fs-3' />
                      Agregar
                    </label>
                    <button
                      type='button'
                      className='btn btn-sm btn-light-danger'
                      disabled={submitting || files.length === 0}
                      onClick={() => setFiles([])}
                    >
                      <KTIcon iconName='trash' className='fs-3' />
                      Quitar todos
                    </button>
                  </div>
                </div>

                <div className='dropzone-items px-6 pb-5'>
                  {files.length === 0 ? (
                    <div className='text-muted fs-7 border-top pt-4'>Arrastra archivos aquí o usa Agregar.</div>
                  ) : (
                    files.map((file) => {
                      const fileKey = buildFileKey(file)
                      return (
                        <div key={fileKey} className='dropzone-item d-flex align-items-center py-3'>
                          <div className='dropzone-file flex-grow-1'>
                            <div className='dropzone-filename text-gray-900' title={file.name}>
                              <span>{file.name}</span>{' '}
                              <strong className='text-muted'>({formatFileSize(file.size)})</strong>
                            </div>
                            <div className='text-muted fs-8'>Listo para importar</div>
                          </div>
                          <div className='dropzone-toolbar'>
                            <button
                              type='button'
                              className='btn btn-icon btn-sm btn-light-danger'
                              disabled={submitting}
                              onClick={() => removeFile(fileKey)}
                              title='Quitar archivo'
                            >
                              <KTIcon iconName='cross' className='fs-2' />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
              <div className='form-text'>
                {files.length > 0
                  ? files.length + ' archivo(s) en cola, ' + formatFileSize(totalSelectedBytes) + ' en total.'
                  : 'El backend procesará los archivos de forma secuencial.'}
              </div>
            </div>
            <div className='col-12 col-lg-4 d-flex justify-content-lg-end gap-2'>
              <button
                type='button'
                className='btn btn-primary'
                disabled={submitting || files.length === 0}
                onClick={onSubmit}
                title={submitting ? 'Importando archivos' : 'Importar archivos'}
              >
                <KTIcon iconName={submitting ? 'loading' : 'file-up'} className='fs-2' />
                {submitting ? 'Importando...' : 'Importar archivos'}
              </button>
              <button
                type='button'
                className='btn btn-icon btn-light-primary'
                disabled={submitting || loadingResumen}
                onClick={() => void cargarResumen()}
                title='Recargar resumen'
                aria-label='Recargar resumen'
              >
                <KTIcon iconName='arrows-circle' className='fs-2' />
              </button>
            </div>
          </div>
          {error && <div className='alert alert-danger mt-6 mb-0'>{error}</div>}
        </div>
      </KTCard>

      <KTCard>
        <div className='card-header'>
          <div className='card-title d-flex flex-column'>
            <h3 className='fw-bold m-0'>Resumen de importaciones</h3>
            <span className='text-muted mt-1'>
              {resumen
                ? `${resumen.total_archivos ?? archivosResumen.length} archivos, ${resumen.total_ok ?? 0} correctos, ${resumen.total_error ?? 0} con error`
                : 'Trazabilidad por archivo'}
            </span>
          </div>
        </div>
        <div className='card-body'>
          {loadingResumen ? (
            <div className='text-muted'>Cargando resumen...</div>
          ) : !resumen || archivosResumen.length === 0 ? (
            <EmptyState
              title='Sin importaciones registradas'
              description='Cuando subas archivos, aquí verás el resultado por archivo.'
            />
          ) : (
            <div className='table-responsive'>
              <table className='table align-middle table-row-dashed fs-6 gy-4'>
                <thead>
                  <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                    <th>Archivo</th>
                    <th>Estado</th>
                    <th>Líneas</th>
                    <th>Marcaciones</th>
                    <th>Sin persona</th>
                    <th>Duración</th>
                  </tr>
                </thead>
                <tbody className='fw-semibold text-gray-700'>
                  {archivosResumen.map((item) => (
                    <tr key={`${item.id_importacion_archivo}-${item.archivo_origen}`}>
                      <td>
                        <div className='d-flex flex-column'>
                          <span className='fw-bold'>{item.archivo_origen}</span>
                          <span className='text-muted fs-7'>{item.ruta_archivo_guardado}</span>
                        </div>
                      </td>
                      <td><StatusBadge value={item.estado_importacion} /></td>
                      <td>{item.total_lineas_archivo ?? 0}</td>
                      <td>
                        <div>Insertadas: {item.marcaciones_insertadas ?? 0}</div>
                        <div className='text-muted fs-7'>Duplicadas: {item.marcaciones_duplicadas ?? 0}</div>
                      </td>
                      <td>{item.sin_persona_relacionada ?? 0}</td>
                      <td>{item.duracion_s ?? 0} s</td>
                    </tr>
                  ))}
                  <tr className='fw-bold bg-light'>
                    <td>Total</td>
                    <td>{archivosResumen.length} archivo(s)</td>
                    <td>{totalesImportacion.totalLineas}</td>
                    <td>
                      <div>Insertadas: {totalesImportacion.marcacionesInsertadas}</div>
                      <div className='text-muted fs-7'>Duplicadas: {totalesImportacion.marcacionesDuplicadas}</div>
                    </td>
                    <td>{totalesImportacion.sinPersona}</td>
                    <td>{totalesImportacion.duracionS} s</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </KTCard>
    </>
  )
}

export default ImportacionesPage
