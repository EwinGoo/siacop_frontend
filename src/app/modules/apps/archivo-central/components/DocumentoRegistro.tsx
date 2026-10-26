import {useRef, useState} from 'react'
import {Modal} from 'react-bootstrap'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useQueryClient} from 'react-query'
import {SelectorBuscable} from '../../../components/SelectorBuscable'
import {Catalogos} from '../core/types'
import {ArchivoApiError, registrarDocumento} from '../core/requests'

const MAX_PDF = 20 * 1024 * 1024
export const esquemaDocumento = Yup.object({
  categoria_id: Yup.number().required('Selecciona una categoría.'),
  documento_id: Yup.number().required('Selecciona un documento.'),
  tipo: Yup.string()
    .oneOf(['ORIGINAL', 'FOTOCOPIA', 'FOTOCOPIA-LEGALIZADA'])
    .required('Selecciona el tipo de documento.'),
  fecha_inicio: Yup.string(),
  fecha_fin: Yup.string().test(
    'rango',
    'La fecha de fin no puede ser anterior a la de inicio.',
    function (valor) {
      return !valor || !this.parent.fecha_inicio || valor >= this.parent.fecha_inicio
    }
  ),
  descripcion: Yup.string().max(255, 'La descripción admite hasta 255 caracteres.'),
  archivo: Yup.mixed<File>()
    .required('Selecciona un PDF.')
    .test(
      'pdf',
      'Selecciona un PDF válido de hasta 20 MB.',
      (file) =>
        !file ||
        (file.size > 0 &&
          file.size <= MAX_PDF &&
          /\.pdf$/i.test(file.name) &&
          (!file.type || file.type === 'application/pdf'))
    ),
})

export const DocumentoRegistro = ({
  personaId,
  catalogos,
  cerrar,
  registrado,
}: {
  personaId: number
  catalogos: Catalogos
  cerrar: () => void
  registrado: () => void
}) => {
  const client = useQueryClient()
  const bloqueo = useRef(false)
  const [portal, setPortal] = useState<HTMLDivElement | null>(null)
  const [error, setError] = useState('')
  const [progreso, setProgreso] = useState<number | null>(null)
  const formik = useFormik({
    initialValues: {
      categoria_id: undefined as number | undefined,
      documento_id: undefined as number | undefined,
      tipo: '',
      fecha_inicio: '',
      fecha_fin: '',
      descripcion: '',
      archivo: null as File | null,
    },
    validationSchema: esquemaDocumento,
    onSubmit: async (values, helpers) => {
      if (bloqueo.current) return
      bloqueo.current = true
      setError('')
      setProgreso(null)
      const datos = new FormData()
      for (const [campo, valor] of Object.entries(values)) {
        if (valor instanceof File) datos.append(campo, valor)
        else if (valor !== undefined) datos.append(campo, String(valor))
      }
      try {
        await registrarDocumento(personaId, datos, setProgreso)
        void client.invalidateQueries(['archivo-central'])
        registrado()
      } catch (fallo) {
        if (fallo instanceof ArchivoApiError) helpers.setErrors(fallo.campos)
        setError(fallo instanceof Error ? fallo.message : 'No se pudo registrar el documento.')
      } finally {
        bloqueo.current = false
        helpers.setSubmitting(false)
      }
    },
  })
  type Campo = keyof typeof formik.values
  const mensaje = (campo: Campo) =>
    formik.submitCount > 0 || formik.touched[campo] ? formik.errors[campo] : undefined
  const feedback = (campo: Campo) =>
    mensaje(campo) ? (
      <div id={`registro-${campo}-error`} className='invalid-feedback d-block'>
        {String(mensaje(campo))}
      </div>
    ) : null
  const atributos = (campo: Campo) => ({
    'aria-invalid': !!mensaje(campo),
    'aria-describedby': mensaje(campo) ? `registro-${campo}-error` : undefined,
  })
  const busy = formik.isSubmitting
  return (
    <Modal
      show
      size='lg'
      centered
      onHide={() => {
        if (!busy) cerrar()
      }}
      backdrop={busy ? 'static' : true}
      keyboard={!busy}
      aria-labelledby='registrar-documento-titulo'
    >
      <Modal.Header closeButton={!busy} closeLabel='Cerrar registro'>
        <Modal.Title id='registrar-documento-titulo'>Registrar documento</Modal.Title>
      </Modal.Header>
      <form onSubmit={formik.handleSubmit} noValidate>
        <Modal.Body>
          <div ref={setPortal} />
          {error && (
            <div className='alert alert-danger' role='alert'>
              {error}
            </div>
          )}
          <fieldset disabled={busy}>
            <legend className='visually-hidden'>Datos del documento</legend>
            <div className='row g-5'>
              <div className='col-12 col-md-6'>
                <label htmlFor='registro-categoria' className='form-label required'>
                  Categoría documental
                </label>
                <SelectorBuscable
                  id='registro-categoria'
                  placeholder='Selecciona una categoría'
                  menuPortalTarget={portal}
                  disabled={busy}
                  invalid={!!mensaje('categoria_id')}
                  describedBy={atributos('categoria_id')['aria-describedby']}
                  options={catalogos.categorias
                    .filter((c) => c.habilitado)
                    .map((c) => ({value: c.id, label: c.nombre ?? `Categoría ${c.id}`}))}
                  value={formik.values.categoria_id}
                  onChange={(categoria_id) => {
                    void formik.setValues({...formik.values, categoria_id, documento_id: undefined})
                  }}
                />
                {feedback('categoria_id')}
              </div>
              <div className='col-12 col-md-6'>
                <label htmlFor='registro-documento' className='form-label required'>
                  Documento o subtipo
                </label>
                <SelectorBuscable
                  id='registro-documento'
                  placeholder='Selecciona un documento'
                  menuPortalTarget={portal}
                  disabled={busy || !formik.values.categoria_id}
                  invalid={!!mensaje('documento_id')}
                  describedBy={atributos('documento_id')['aria-describedby']}
                  options={catalogos.documentos
                    .filter((d) => d.habilitado && d.categoria_id === formik.values.categoria_id)
                    .map((d) => ({value: d.id, label: d.nombre ?? `Documento ${d.id}`}))}
                  value={formik.values.documento_id}
                  onChange={(value) => {
                    void formik.setFieldValue('documento_id', value)
                  }}
                />
                {feedback('documento_id')}
              </div>
              <div className='col-12'>
                <label htmlFor='registro-tipo' className='form-label required'>
                  Tipo de documento
                </label>
                <select
                  id='registro-tipo'
                  className='form-select'
                  {...formik.getFieldProps('tipo')}
                  {...atributos('tipo')}
                >
                  <option value=''>Selecciona el tipo</option>
                  <option value='ORIGINAL'>Original</option>
                  <option value='FOTOCOPIA'>Fotocopia</option>
                  <option value='FOTOCOPIA-LEGALIZADA'>Fotocopia legalizada</option>
                </select>
                {feedback('tipo')}
              </div>
              {(['fecha_inicio', 'fecha_fin'] as const).map((campo) => (
                <div className='col-12 col-md-6' key={campo}>
                  <label htmlFor={`registro-${campo}`} className='form-label'>
                    Fecha de {campo === 'fecha_inicio' ? 'inicio' : 'fin'}
                  </label>
                  <input
                    type='date'
                    id={`registro-${campo}`}
                    className='form-control'
                    min='1000-01-01'
                    max='9999-12-31'
                    {...formik.getFieldProps(campo)}
                    {...atributos(campo)}
                  />
                  {feedback(campo)}
                </div>
              ))}
              <div className='col-12'>
                <label htmlFor='registro-descripcion' className='form-label'>
                  Descripción
                </label>
                <textarea
                  id='registro-descripcion'
                  className='form-control'
                  rows={3}
                  maxLength={255}
                  {...formik.getFieldProps('descripcion')}
                  {...atributos('descripcion')}
                />
                {feedback('descripcion')}
              </div>
              <div className='col-12'>
                <label htmlFor='registro-archivo' className='form-label required'>
                  Archivo PDF
                </label>
                <input
                  id='registro-archivo'
                  name='archivo'
                  type='file'
                  accept='.pdf,application/pdf'
                  className='form-control'
                  {...atributos('archivo')}
                  onChange={(event) => {
                    void formik.setFieldValue('archivo', event.currentTarget.files?.[0] ?? null)
                  }}
                />
                <div className='form-text'>
                  PDF de hasta 20 MB. Puedes seleccionar otro archivo antes de guardar.
                </div>
                {formik.values.archivo && (
                  <p className='text-gray-700 mt-2 text-break'>
                    {formik.values.archivo.name} —{' '}
                    {(formik.values.archivo.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
                {feedback('archivo')}
              </div>
            </div>
          </fieldset>
          {busy && (
            <div className='mt-5' role='status'>
              {progreso === null
                ? 'Preparando envío…'
                : progreso < 100
                ? `Subiendo PDF: ${progreso}%`
                : 'PDF enviado. Guardando documento…'}
              {progreso !== null && (
                <progress
                  className='w-100'
                  max={100}
                  value={progreso}
                  aria-label='Progreso de subida'
                />
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button type='button' className='btn btn-light' disabled={busy} onClick={cerrar}>
            Cancelar
          </button>
          <button type='submit' className='btn btn-primary' disabled={busy}>
            {busy ? (
              <>
                <span className='spinner-border spinner-border-sm me-2' aria-hidden='true' />
                Guardando…
              </>
            ) : (
              'Registrar documento'
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
