import {KTCard} from '../../../../../_metronic/helpers/components/KTCard'
import {KTCardBody} from '../../../../../_metronic/helpers/components/KTCardBody'
import {KTIcon} from '../../../../../_metronic/helpers/components/KTIcon'
import {Administrativo} from '../core/types'
import {codigoArchivo} from '../core/presentation'

export const ExpedienteEncabezado = ({
  persona,
  cantidad,
}: {
  persona: Administrativo
  cantidad: number
}) => {
  const iniciales = persona.nombre_completo
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
  return (
    <>
      <KTCard className='mb-5'>
        <KTCardBody className='pt-6 pb-0'>
          {/* ProfileHeader: identidad y resumen factual en un solo encabezado. */}
          <div className='d-flex align-items-start gap-4 gap-sm-5 mb-5'>
            <div className='symbol symbol-40px symbol-sm-60px flex-shrink-0' aria-hidden='true'>
              <span className='symbol-label bg-light-primary text-primary fs-3 fw-bold'>
                {iniciales}
              </span>
            </div>
            <div className='flex-grow-1 min-w-0'>
              <div className='d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3'>
                <div className='min-w-0'>
                  <h2 className='fs-2 fw-bold text-gray-900 text-break mb-2'>
                    {persona.nombre_completo}
                  </h2>
                  <p className='d-flex align-items-center text-gray-600 fs-7 mb-0'>
                    <span aria-hidden='true'>
                      <KTIcon iconName='profile-circle' className='fs-5 me-2' />
                    </span>
                    CI: {persona.ci} {persona.expedido}
                  </p>
                </div>
                <span
                  className={`badge ${
                    persona.tiene_expediente ? 'badge-light-primary' : 'badge-light-warning'
                  } py-2`}
                >
                  {persona.tiene_expediente ? 'Expediente digital' : 'Sin expediente'}
                </span>
              </div>
              <dl className='d-flex flex-wrap gap-4 gap-sm-8 mb-0'>
                <div>
                  <dt className='text-muted fw-normal fs-7 mb-1'>Código de expediente</dt>
                  <dd className='fw-bold text-gray-800 fs-5 mb-0'>
                    {codigoArchivo(persona.codigo_archivo)}
                  </dd>
                </div>
                <div>
                  <dt className='text-muted fw-normal fs-7 mb-1'>Documentos registrados</dt>
                  <dd className='fw-bold text-gray-800 fs-5 mb-0'>{cantidad}</dd>
                </div>
              </dl>
            </div>
          </div>
        </KTCardBody>
      </KTCard>
    </>
  )
}
