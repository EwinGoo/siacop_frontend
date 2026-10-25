/// <reference types="jest" />
import {render, screen, waitFor} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {AuthProvider, AuthInit} from '../../modules/auth/core/Auth'
import {getUserBySession} from '../../modules/auth/core/_requests'
import {disableSplashScreen} from '../../../_metronic/layout/core/_LayoutProvider'
import {handleAuthError} from '../axiosClient'

jest.mock('../axiosClient', () => ({
  handleAuthError: Object.assign(jest.fn(), {isRedirecting: jest.fn(() => true)}),
}))
jest.mock('../../modules/auth/core/_requests', () => ({getUserBySession: jest.fn()}))
jest.mock('../../../_metronic/layout/core/_LayoutProvider', () => ({
  enableSplashScreen: jest.fn(),
  disableSplashScreen: jest.fn(),
}))
jest.mock('../../modules/components/loading/AppBootstrapScreen', () => ({
  AppBootstrapScreen: () => <p role='status'>Cargando sesión</p>,
}))

afterEach(() => jest.restoreAllMocks())

test('La inicialización no reemplaza una redirección de seguridad por otra al login', async () => {
  ;(handleAuthError.isRedirecting as jest.Mock).mockReturnValue(true)
  const logged = jest.spyOn(console, 'error').mockImplementation(() => {})
  ;(getUserBySession as jest.Mock).mockRejectedValue({
    response: {status: 403, data: {data: {code: 'TWO_FACTOR_REQUIRED'}}},
  })
  render(
    <MemoryRouter>
      <AuthProvider>
        <AuthInit>
          <p>Aplicación privada</p>
        </AuthInit>
      </AuthProvider>
    </MemoryRouter>
  )
  await waitFor(() => expect(logged).toHaveBeenCalled())
  expect(handleAuthError.isRedirecting()).toBe(true)
  expect(screen.getByRole('status')).toHaveTextContent('Cargando sesión')
  expect(screen.queryByText('Aplicación privada')).not.toBeInTheDocument()
  expect(disableSplashScreen).not.toHaveBeenCalled()
})
