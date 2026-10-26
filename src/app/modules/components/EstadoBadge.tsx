import React from 'react'

type Props = {
  estado: string
}

const estadoStyles: Record<string, string> = {
  GENERADO: 'secondary',
  PENDIENTE: 'primary',
  ENVIADO: 'warning',
  RECEPCIONADO: 'info',
  OBSERVADO: 'danger',
  APROBADO: 'success',
}

const EstadoBadge: React.FC<Props> = ({estado}) => {
  const color = estadoStyles[estado] || 'light'
  return <span className={`badge badge-light-${color}`}>{estado}</span>
}

export {EstadoBadge}
