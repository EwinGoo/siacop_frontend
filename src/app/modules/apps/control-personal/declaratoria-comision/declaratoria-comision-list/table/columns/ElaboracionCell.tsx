import React from 'react'
import useDateFormatter from 'src/app/hooks/useDateFormatter'

const ElaboracionCell = ({ declaratoria}) => {
  const {formatShortDate} = useDateFormatter()

  return (
    <div className='d-inline-flex align-items-center rounded bg-light px-3 py-1'>
      <span className='text-primary fw-semibold'>{formatShortDate(declaratoria.fecha_elaboracion)}</span>
    </div>
  )
}

export default ElaboracionCell
