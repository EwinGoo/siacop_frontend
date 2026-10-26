/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC} from 'react'
import {useAuth} from '../../../../app/modules/auth'
import {Languages} from './Languages'

const API_URL = process.env.REACT_APP_API_URL

const HeaderUserMenu: FC = () => {
  const {currentUser, logout} = useAuth()
  const firstChar = currentUser?.first_name?.charAt(0).toUpperCase() ?? ''
  const email = currentUser?.email ?? ''
  const shortEmail = email.length > 20 ? email.slice(0, 20) + '...' : email

  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
      data-kt-menu='true'
    >
      <div className='menu-item px-3'>
        <div className='menu-content d-flex align-items-center px-3'>
          <div className='symbol symbol-50px me-5'>
            {/* <img alt='Logo' src={toAbsoluteUrl('/media/images/images.jpeg')} /> */}
            <div className='symbol-label fs-2 fw-semibold bg-primary text-inverse-primary'>
              {firstChar}
            </div>
          </div>

          <div className='d-flex flex-column'>
            <div className='fw-bolder d-flex align-items-center fs-5 text-capitalize'>
              {currentUser?.first_name}
            </div>
            {/* <span className='d-flex badge badge-light-success fw-bolder fs-8 px-2 py-1 ms-2'>administrador</span> */}
            <a
              href='#'
              title={currentUser?.email}
              className='fw-bold text-muted text-hover-primary fs-7'
            >
              {shortEmail}
            </a>
          </div>
        </div>
      </div>

      <div className='separator my-2'></div>

      <Languages />

      <div className='menu-item px-5 my-1'>
        <a href={'/seguridad/cuenta/configuracion'} className='menu-link px-5'>
          Cuenta
        </a>
      </div>
      <div className='menu-item px-5 my-1'>
        <a href={'/seguridad/usuario/modificar-contrasena'} className='menu-link px-5'>
          Cambiar Contraseña
        </a>
      </div>
      <div className='menu-item px-5'>
        {/* <a href='' onClick={logout} className='menu-link px-5'>
          Cerrar Sesión
        </a> */}
        <a href={'/logout'} onClick={logout} className='menu-link px-5'>
          Cerrar Sesión
        </a>
      </div>
    </div>
  )
}

export {HeaderUserMenu}
