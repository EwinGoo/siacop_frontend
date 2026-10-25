/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import {FC} from 'react'
import {Route, BrowserRouter, Navigate} from 'react-router-dom'
import {PrivateRoutes} from './PrivateRoutes'
import {ErrorsPage} from '../modules/errors/ErrorsPage'
import {Logout, useAuth} from '../modules/auth'
import {App} from '../App'
import {ExternalRedirect} from './components/ExternalRedirect'
import {API_URL, BACKEND_LOGIN_URL} from '../config/apiRoutes'
import {getInstrumentedRoutesRenderer} from '../config/runtimeMonitoring'

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
// const {PUBLIC_URL} = process.env.REACT_APP_ENVIRONMENT || ''
const enviroment = process.env.REACT_APP_ENVIRONMENT || ''

const AppRoutes: FC = () => {
  const {currentUser} = useAuth()
  const archivoInicio = currentUser?.groups?.includes('operador_archivo')
    ? '/apps/archivo-central'
    : currentUser?.groups?.includes('auditoria')
    ? '/apps/auditoria'
    : undefined
  const RoutesRenderer = getInstrumentedRoutesRenderer()
  return (
    <BrowserRouter>
      <RoutesRenderer>
        <Route element={<App />}>
          <Route path='error/*' element={<ErrorsPage />} />
          <Route path='logout' element={<Logout />} />
          {currentUser ? (
            <>
              {archivoInicio && <Route index element={<Navigate to={archivoInicio} replace />} />}
              {!archivoInicio && enviroment === 'production' && (
                <Route index element={<ExternalRedirect url={`${API_URL}`} />} />
              )}
              <Route path='/*' element={<PrivateRoutes />} />
              {!archivoInicio && enviroment === 'development' && (
                <Route index element={<Navigate to='/dashboard' />} />
              )}
              {/* <Route index element={<Navigate to='/principal' />} /> */}
            </>
          ) : (
            <>
              <Route path='*' element={<ExternalRedirect url={BACKEND_LOGIN_URL} />} />
              <Route path='auth/*' element={<ExternalRedirect url={BACKEND_LOGIN_URL} />} />
              {/* <Route path='auth/*' element={<AuthPage />} />
              <Route path='auth/*' element={<AuthPage />} />
              <Route path='auth/*' element={<AuthPage />} />
              <Route path='*' element={<Navigate to='/auth' />} /> */}
            </>
          )}
        </Route>
      </RoutesRenderer>
    </BrowserRouter>
  )
}

export {AppRoutes}
