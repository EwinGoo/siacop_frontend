import useDateFormatter from 'src/app/hooks/useDateFormatter'
import {EstadoBadge} from '../../table/components/EstadoBadge'

export const ComisionDetails = ({comision}: {comision: any}) => {
    const {formatShortDate} = useDateFormatter()

  return (
    <div className='bg-primary bg-opacity-10 p-4 rounded mb-4'>
      <h6 className='text-primary mb-3 fw-semibold'>
        <i className='bi bi-geo-alt me-2'></i>
        Detalles de la comisión
      </h6>
      <p className='mb-1'>
        <strong>Codigo:</strong> {comision.id_temporal || 'N/D'}
      </p>
      <p className='mb-1'>
        <strong>Generado por:</strong> {comision.nombre_generador || 'N/D'}
      </p>
      <p className='mb-1'>
        <strong>Fecha:</strong> {formatShortDate(comision.fecha_comision) || 'N/D'}
      </p>
      <div className='separator separator-dashed border-secondary my-1'></div>
      <p className='mb-0'>
        <strong>Estado:</strong>{' '}
        <EstadoBadge estado={comision.estado_boleta_comision ?? 'GENERADO'} />
      </p>
    </div>
  )
}
