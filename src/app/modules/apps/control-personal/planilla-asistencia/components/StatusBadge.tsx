interface Props {
  value?: string | null
}

const mapClass = (value?: string | null) => {
  switch ((value || '').toUpperCase()) {
    case 'COMPLETADO':
    case 'PRESENTE':
    case 'VALIDO':
    case 'CON_DIAS_PAGABLES':
      return 'badge-light-success'
    case 'PROCESANDO':
      return 'badge-light-primary'
    case 'ATRASO':
    case 'OBSERVADO':
    case 'EXCLUIDO':
      return 'badge-light-warning'
    case 'ERROR':
    case 'ERROR_REVERTIDO':
    case 'FALTA':
    case 'ABANDONO':
    case 'NO_VALIDO':
    case 'SIN_DIAS_PAGABLES':
      return 'badge-light-danger'
    default:
      return 'badge-light-secondary'
  }
}

const StatusBadge = ({value}: Props) => {
  return <span className={`badge ${mapClass(value)}`}>{value || 'SIN ESTADO'}</span>
}

export {StatusBadge}
