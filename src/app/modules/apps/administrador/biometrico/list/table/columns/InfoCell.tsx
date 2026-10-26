import {FC} from 'react'
import {DispositivoBiometrico} from '../../core/_models'

type Props = {
  dispositivoBiometrico: DispositivoBiometrico
}

const InfoCell: FC<Props> = ({dispositivoBiometrico}) => (
  <div className='d-flex flex-column'>
    <div className='text-gray-800 text-hover-primary mb-1 fw-bold fs-6'>
      {dispositivoBiometrico.nombre_dispositivo}
    </div>
    <div className='d-flex flex-wrap gap-2 mt-1'>
      <span className={`badge badge-light-${dispositivoBiometrico.fuente_principal_marcacion === 'ADMS' ? 'primary' : 'warning'}`}>
        Principal: {dispositivoBiometrico.fuente_principal_marcacion || 'TCP_PULL'}
      </span>
      <span className='badge badge-light-info'>
        {dispositivoBiometrico.metodo_ingesta_marcacion || 'TCP_PULL'}
      </span>
    </div>
  </div>
)

export {InfoCell}
