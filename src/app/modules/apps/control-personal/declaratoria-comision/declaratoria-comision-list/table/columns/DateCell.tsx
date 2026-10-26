import useDateFormatter from 'src/app/hooks/useDateFormatter'
import clsx from 'clsx'

export const DateCell = ({declaratoria}) => {
  const {formatShortDate} = useDateFormatter()

  return (
    <div
      className={clsx(
        'bg-light-primary',
        'p-3',
        'rounded',
        'text-gray-800',
        'fw-semibold',
        'text-sm',
        'd-inline-block',
        'w-auto'
      )}
    >
      <div className='mb-2'>
        <i className='fas fa-calendar-alt text-primary me-2' />
        De: <span className='fw-bold'>{formatShortDate(declaratoria.fecha_inicio)}</span>
      </div>
      <div>
        <i className='fas fa-calendar-check text-primary me-2' />
        A: <span className='fw-bold'>{formatShortDate(declaratoria.fecha_fin)}</span>
      </div>
    </div>
  )
}
