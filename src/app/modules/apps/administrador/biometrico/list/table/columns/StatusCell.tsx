import {FC} from 'react'
import {DispositivoBiometrico} from '../../core/_models'

type Props = {
  dispositivoBiometrico: DispositivoBiometrico
}

const StatusCell: FC<Props> = ({dispositivoBiometrico}) => {
  const getStatusBadge = () => {
    if (dispositivoBiometrico.estado === 'mantenimiento') {
      return <span className='badge badge-light-info justify-content-center'>Mantenimiento</span>
    }

    if (dispositivoBiometrico.estado === 'inactivo') {
      return <span className='badge badge-light-danger justify-content-center'>Inactivo</span>
    }

    if (!dispositivoBiometrico.ultima_sincronizacion) {
      return <span className='badge badge-light-warning justify-content-center'>Sin conexión reciente</span>
    }

    const lastSync = new Date(dispositivoBiometrico.ultima_sincronizacion)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60)

    if (diffMinutes < 30) {
      return <span className='badge badge-light-success justify-content-center'>En línea</span>
    } else if (diffMinutes < 60) {
      return <span className='badge badge-light-warning justify-content-center'>Desconectado</span>
    } else {
      return <span className='badge badge-light-danger justify-content-center'>Sin reporte reciente</span>
    }
  }

  const formatLastSync = () => {
    if (!dispositivoBiometrico.ultima_sincronizacion) {
      return 'Nunca'
    }
    const lastSync = new Date(dispositivoBiometrico.ultima_sincronizacion)
    return lastSync.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className='d-flex flex-column'>
      {getStatusBadge()}
      <span className='text-muted fs-8 mt-1 text-center'>{formatLastSync()}</span>
      <span className='text-muted fs-8 mt-1 text-center'>
        Usuarios: {dispositivoBiometrico.ultima_sincronizacion_usuarios ? 'OK' : 'Pendiente'}
      </span>
      <span className='text-muted fs-8 text-center'>
        Marcaciones: {dispositivoBiometrico.ultima_sincronizacion_marcaciones ? 'OK' : 'Pendiente'}
      </span>
    </div>
  )
}

export {StatusCell}
