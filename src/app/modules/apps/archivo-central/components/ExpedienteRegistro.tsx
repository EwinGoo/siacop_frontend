import {useRef, useState} from 'react'
import {Modal} from 'react-bootstrap'
import {useQueryClient} from 'react-query'
import {Administrativo} from '../core/types'
import {registrarExpediente} from '../core/requests'

export const ExpedienteRegistro = ({
  persona,
  cerrar,
  registrado,
}: {
  persona: Administrativo
  cerrar: () => void
  registrado: () => void
}) => {
  const client = useQueryClient()
  const bloqueo = useRef(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const guardar = async () => {
    if (bloqueo.current) return
    bloqueo.current = true
    setProcesando(true)
    setError('')
    try {
      await registrarExpediente(persona.persona_id)
      void client.invalidateQueries(['archivo-central'])
      registrado()
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo registrar el expediente.')
      // Un conflicto puede significar que otra persona ya creó el expediente.
      void client.invalidateQueries(['archivo-central', 'persona', persona.persona_id])
    } finally {
      bloqueo.current = false
      setProcesando(false)
    }
  }
  return (
    <Modal
      show
      onHide={() => {
        if (!procesando) cerrar()
      }}
      centered
      aria-labelledby='registrar-expediente-titulo'
      backdrop={procesando ? 'static' : true}
      keyboard={!procesando}
    >
      <Modal.Header closeButton={!procesando} closeLabel='Cerrar registro'>
        <Modal.Title id='registrar-expediente-titulo'>Registrar expediente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className='fw-bold text-gray-900'>{persona.nombre_completo}</p>
        <p>
          CI: {persona.ci} {persona.expedido}
        </p>
        <p>Se creará su expediente digital. El código se asignará automáticamente.</p>
        {error && (
          <div className='alert alert-danger' role='alert'>
            {error}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className='btn btn-light' disabled={procesando} onClick={cerrar}>
          Cancelar
        </button>
        <button
          className='btn btn-primary'
          disabled={procesando}
          onClick={() => {
            void guardar()
          }}
        >
          {procesando ? (
            <>
              <span className='spinner-border spinner-border-sm me-2' aria-hidden='true' />
              Registrando…
            </>
          ) : (
            'Confirmar registro'
          )}
        </button>
      </Modal.Footer>
    </Modal>
  )
}
