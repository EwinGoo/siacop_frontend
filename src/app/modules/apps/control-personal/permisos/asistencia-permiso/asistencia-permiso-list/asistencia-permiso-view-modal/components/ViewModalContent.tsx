import {FC} from 'react'
import useDateFormatter from 'src/app/hooks/useDateFormatter'
import {KTIcon} from 'src/_metronic/helpers'
import {AsistenciaPermiso} from '../../core/_models'
import {EstadoBadge} from 'src/app/modules/apps/control-personal/comision/comision-list/table/components/EstadoBadge'

type Props = {
  permiso: AsistenciaPermiso
}

const InfoRow: FC<{label: string; value?: string | number | null; icon?: string}> = ({
  label,
  value,
  icon,
}) => (
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

const ViewModalContent: FC<Props> = ({permiso}) => {
  const {formatShortDate} = useDateFormatter()
  const fechaUnica =
    permiso.fecha_inicio_permiso === permiso.fecha_fin_permiso ||
    permiso.tipo_permiso_nombre === 'Cumpleaños'
  const esCumpleanos =
    permiso.tipo_permiso_nombre?.toLowerCase().includes('cumpleaños') ||
    permiso.tipo_permiso_nombre?.toLowerCase().includes('cumpleanos')
  const fechaValue = fechaUnica
    ? formatShortDate(permiso.fecha_inicio_permiso)
    : `${formatShortDate(permiso.fecha_inicio_permiso)} - ${formatShortDate(
        permiso.fecha_fin_permiso
      )}`

  return (
    <div className='bg-white rounded border p-5'>
      <div className='row g-0 border-bottom pb-4 mb-2'>
        <div className='col-6 col-md px-3 border-end'>
          <span className='text-muted fs-8 fw-bold text-uppercase d-block mb-1'>Código</span>
          <span className='text-gray-800 fs-7 fw-semibold'>
            {permiso.id_temporal || 'Sin código'}
          </span>
        </div>
        <div className='col-6 col-md px-3 border-end'>
          <span className='text-muted fs-8 fw-bold text-uppercase d-block mb-1'>Tipo</span>
          <span className='badge badge-light-primary fw-bold'>
            {permiso.tipo_permiso_nombre || 'Permiso'}
          </span>
        </div>
        <div className='col-6 col-md px-3 border-end mt-4 mt-md-0'>
          <span className='text-muted fs-8 fw-bold text-uppercase d-block mb-1'>Estado</span>
          <EstadoBadge estado={permiso.estado_permiso} />
        </div>
        {permiso.nro_correlativo && (
          <div className='col-6 col-md px-3 border-end mt-4 mt-md-0'>
            <span className='text-muted fs-8 fw-bold text-uppercase d-block mb-1'>Correlativo</span>
            <span className='text-gray-800 fs-7 fw-semibold'>{permiso.nro_correlativo}</span>
          </div>
        )}
        <div className='col-6 col-md px-3 mt-4 mt-md-0'>
          <span className='text-muted fs-8 fw-bold text-uppercase d-block mb-1'>Registrado</span>
          <span className='text-gray-800 fs-7 fw-semibold'>
            {formatShortDate(permiso.created_at || permiso.fecha_inicio_permiso)}
          </span>
        </div>
      </div>

      <div className='row gx-6'>
        <div className='col-12 col-md-6'>
          <InfoRow label='Solicitante' value={permiso.nombre_generador} icon='user' />
        </div>
        <div className='col-12 col-md-6'>
          <InfoRow label='Cédula de Identidad' value={permiso.ci} icon='profile-circle' />
        </div>
        <div className='col-12 col-md-6'>
          <InfoRow label='Tipo de personal' value={permiso.tipo_personal} icon='profile-user' />
        </div>
        <div className='col-12 col-md-6'>
          <InfoRow
            label={fechaUnica ? 'Fecha' : 'Fecha inicio - fin'}
            value={fechaValue}
            icon='calendar'
          />
        </div>
        {esCumpleanos ? (
          <div className='col-12 col-md-6'>
            <InfoRow label='Turno' value={permiso.turno_permiso} icon='time' />
          </div>
        ) : null}
        </div>

      <div className='rounded bg-light p-4 mt-4'>
        <div className='row g-4'>
          <div className='col-12'>
            <span className='fs-8 fw-bold text-uppercase text-muted d-block mb-1'>Detalle</span>
            <p className='text-gray-800 fw-semibold mb-0'>
              {permiso.detalle_permiso || 'Sin detalle registrado.'}
            </p>
          </div>
          <div className='col-12'>
            <span className='fs-8 fw-bold text-uppercase text-muted d-block mb-1'>Observaciones</span>
            <p className='text-gray-700 mb-0'>
              {permiso.observacion || 'Ninguna observación registrada.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export {ViewModalContent}
