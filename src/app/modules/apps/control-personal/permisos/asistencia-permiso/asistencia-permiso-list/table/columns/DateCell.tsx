import useDateFormatter from 'src/app/hooks/useDateFormatter'
import clsx from 'clsx'

export const DateCell = ({row}) => {
  const {formatShortDate} = useDateFormatter()
  
  const {fecha_inicio_permiso, fecha_fin_permiso, tipo_permiso_nombre} = row.original

  // Verificamos si es el mismo día o si el tipo es Cumpleaños
  const esFechaUnica = fecha_inicio_permiso === fecha_fin_permiso || tipo_permiso_nombre === 'Cumpleaños'

  return (
    <div
      className={clsx(
        'bg-light-primary',
        'p-3',
        'rounded',
        'text-gray-800',
        'fw-semibold',
        'text-sm',
        'min-w-100px'
      )}
    >
      {esFechaUnica ? (
        // Diseño para fecha única (Cumpleaños o mismo día)
        <div className='d-flex align-items-center'>
          <i className='fas fa-calendar-alt text-primary me-2' /> 
          <div>
            <span className='fw-bold'>{formatShortDate(fecha_inicio_permiso)}</span>
          </div>
        </div>
      ) : (
        // Diseño original para rangos
        <>
          <div className='mb-2'>
            <i className='fas fa-calendar-alt text-primary me-2' />
            De: <span className='fw-bold'>{formatShortDate(fecha_inicio_permiso)}</span>
          </div>
          <div>
            <i className='fas fa-calendar-check text-primary me-2' />
            A: <span className='fw-bold'>{formatShortDate(fecha_fin_permiso)}</span>
          </div>
        </>
      )}
    </div>
  )
}