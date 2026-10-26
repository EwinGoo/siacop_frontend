import {FC} from 'react'
import useDateFormatter from 'src/app/hooks/useDateFormatter'
import {KTIcon} from 'src/_metronic/helpers'
import {Comision} from '../../core/_models'
import {EstadoBadge} from '../../table/components/EstadoBadge'

type Props = {
  comision: Comision
}

const InfoRow: FC<{label: string; value?: string | number | null; icon?: string}> = ({label, value, icon}) => (
  <div className='d-flex align-items-start gap-3 py-3 border-bottom border-gray-200'>
    {icon && (
      <div className='symbol symbol-32px flex-shrink-0'>
        <span className='symbol-label bg-light-primary'>
          <KTIcon iconName={icon} className='fs-5 text-gray-600' />
        </span>
      </div>
    )}
    <div className='d-flex flex-column min-w-0'>
      <span className='text-muted fw-bold fs-8 text-uppercase'>{label}</span>
      <span className='text-gray-800 fw-semibold fs-6 text-break'>{value || '—'}</span>
    </div>
  </div>
)

const ViewModalContent: FC<Props> = ({comision}) => {
  const {formatTimeFromString, formatShortDate} = useDateFormatter()
  const tipo = comision.tipo_comision || 'COMISIÓN'
  const esCajaSalud = tipo === 'CAJA SALUD'
  const esFisioterapia = tipo === 'FISIOTERAPIA'
  const esPermisoSalud = esCajaSalud || esFisioterapia
  const muestraRecorrido = tipo === 'PERSONAL' || tipo === 'TRANSPORTE' || tipo === 'COMISIÓN'
  const fechaFin = comision.fecha_comision_fin
  const sameDay = !esFisioterapia || !fechaFin || fechaFin === comision.fecha_comision
  const fechaValue = sameDay
    ? formatShortDate(comision.fecha_comision)
    : `${formatShortDate(comision.fecha_comision)} - ${formatShortDate(fechaFin)}`
  const fechaLabel = esFisioterapia
    ? 'Fecha inicio - fin'
    : esCajaSalud
    ? 'Fecha de atención'
    : 'Fecha'
  const horarioLabel = esPermisoSalud ? 'Hora de llegada - salida' : 'Horario'
  const descripcionLabel = esCajaSalud
    ? 'Razón de atención'
    : esFisioterapia
    ? 'Motivo de fisioterapia'
    : 'Descripción'

  return (
    <div className='bg-white rounded border p-5'>
      <div className='row g-0 border-bottom pb-4 mb-2'>
        <div className='col-6 col-md px-3 border-end'>
          <span className='text-muted fs-8 fw-bold text-uppercase d-block mb-1'>Código</span>
          <span className='text-gray-800 fs-7 fw-semibold'>{comision.id_temporal || 'Sin código'}</span>
        </div>
        <div className='col-6 col-md px-3 border-end'>
          <span className='text-muted fs-8 fw-bold text-uppercase d-block mb-1'>
            {esPermisoSalud ? 'Tipo de permiso' : 'Tipo comisión'}
          </span>
          <span className='badge badge-light-primary fw-bold'>
            {tipo}
          </span>
        </div>
        <div className='col-6 col-md px-3 border-end mt-4 mt-md-0'>
          <span className='text-muted fs-8 fw-bold text-uppercase d-block mb-1'>Estado</span>
          <EstadoBadge estado={comision.estado_boleta_comision} />
        </div>
        {comision.nro_correlativo && (
          <div className='col-6 col-md px-3 border-end mt-4 mt-md-0'>
            <span className='text-muted fs-8 fw-bold text-uppercase d-block mb-1'>Correlativo</span>
            <span className='text-gray-800 fs-7 fw-semibold'>{comision.nro_correlativo}</span>
          </div>
        )}
        <div className='col-6 col-md px-3 mt-4 mt-md-0'>
          <span className='text-muted fs-8 fw-bold text-uppercase d-block mb-1'>Registrado</span>
          <span className='text-gray-800 fs-7 fw-semibold'>
            {formatShortDate(comision.created_at || comision.fecha_comision)}
          </span>
        </div>
      </div>

      <div className='row gx-6'>
        <div className='col-12 col-md-6'>
          <InfoRow label='Solicitante' value={comision.nombre_generador} icon='user' />
          <InfoRow label='Cédula de Identidad' value={comision.ci} icon='profile-circle' />
          <InfoRow label='Cargo / Función' value={comision.nombre_cargo} icon='briefcase' />
        </div>

        <div className='col-12 col-md-6'>
          <InfoRow label={fechaLabel} value={fechaValue} icon='calendar' />
          <InfoRow
            label={horarioLabel}
            value={`${formatTimeFromString(comision.hora_salida)} - ${formatTimeFromString(
              comision.hora_retorno
            )}`}
            icon='time'
          />
        </div>
      </div>

      <div className='rounded bg-light p-4 mt-4'>
        <div className='row g-4'>
          {muestraRecorrido && (
            <div className='col-12 col-md-5'>
              <span className='fs-8 fw-bold text-uppercase text-muted d-block mb-2'>Lugar / Recorrido</span>
              <div className='d-flex flex-column gap-2'>
                <div>
                  <span className='text-muted fw-bold me-2'>De:</span>
                  <span className='text-gray-800 fw-semibold text-break'>
                    {comision.recorrido_de || 'N/D'}
                  </span>
                </div>
                <div>
                  <span className='text-muted fw-bold me-2'>A:</span>
                  <span className='text-gray-800 fw-semibold text-break'>
                    {comision.recorrido_a || 'N/D'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className={muestraRecorrido ? 'col-12 col-md-7' : 'col-12'}>
            <span className='fs-8 fw-bold text-uppercase text-muted d-block mb-1'>
              {descripcionLabel}
            </span>
            <p className='text-gray-800 fw-semibold mb-0'>
              {comision.descripcion_comision || 'Sin descripción detallada.'}
            </p>
          </div>
          <div className='col-12'>
            <span className='fs-8 fw-bold text-uppercase text-muted d-block mb-1'>Observaciones</span>
            <p className='text-gray-700 mb-0'>
              {comision.observacion || 'Ninguna observación registrada.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export {ViewModalContent}
