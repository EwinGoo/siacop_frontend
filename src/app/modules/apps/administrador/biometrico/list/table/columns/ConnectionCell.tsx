import {FC} from 'react'
import {DispositivoBiometrico} from '../../core/_models'

type Props = {
  dispositivoBiometrico: DispositivoBiometrico
}

const ConnectionCell: FC<Props> = ({dispositivoBiometrico}) => (
  <div className='d-flex flex-column'>
    <div className='text-gray-800 fw-bold fs-7'>
      {dispositivoBiometrico.direccion_ip || 'Sin dirección principal'}
    </div>
    {dispositivoBiometrico.direccion_ip_privada && (
      <span className='text-muted fs-8'>Privada: {dispositivoBiometrico.direccion_ip_privada}</span>
    )}
    {dispositivoBiometrico.direccion_ip_dns && (
      <span className='text-muted fs-8'>DNS: {dispositivoBiometrico.direccion_ip_dns}</span>
    )}
    <span className='text-muted fs-8'>
      Puerto: {dispositivoBiometrico.puerto}
    </span>
  </div>
)

export {ConnectionCell}
