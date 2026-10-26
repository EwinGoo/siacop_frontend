import {Suspense, lazy} from 'react'
import {createRoot} from 'react-dom/client'
// Axios
import axios from 'axios'
import {QueryClient, QueryClientProvider} from 'react-query'
// Apps
import {MetronicI18nProvider} from './_metronic/i18n/Metronici18n'
import './_metronic/assets/fonticon/fonticon.css'
import './_metronic/assets/keenicons/duotone/style.css'
import './_metronic/assets/keenicons/outline/style.css'
import './_metronic/assets/keenicons/solid/style.css'
/**
 * TIP: Replace this style import with rtl styles to enable rtl mode
 *
 * import './_metronic/assets/css/style.rtl.css'
 **/
import './_metronic/assets/sass/style.scss'
import './_metronic/assets/sass/plugins.scss'
import './_metronic/assets/sass/style.react.scss'

import 'flatpickr/dist/flatpickr.min.css'

import {AppRoutes} from './app/routing/AppRoutes'
import {AuthProvider, setupAxios} from './app/modules/auth'
import {AppRuntimeErrorBoundary} from './app/modules/errors/components/AppRuntimeErrorBoundary'
/**
 * Creates `axios-mock-adapter` instance for provided `axios` instance, add
 * basic Metronic mocks and returns it.
 *
 * @see https://github.com/ctimmerm/axios-mock-adapter
 */
/**
 * Inject Metronic interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */

setupAxios(axios)

const queryClient = new QueryClient()
const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? lazy(() =>
        import('react-query/devtools').then((module) => ({
          default: module.ReactQueryDevtools,
        }))
      )
    : null

const bootstrapApplication = async () => {
  if (process.env.REACT_APP_SENTRY_DSN?.trim()) {
    const {initializeSentry} = await import('./app/config/sentry')
    await initializeSentry()
  }

  const container = document.getElementById('root')

  if (!container) {
    return
  }

  createRoot(container).render(
    <AppRuntimeErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MetronicI18nProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </MetronicI18nProvider>
        {ReactQueryDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </AppRuntimeErrorBoundary>
  )
}

void bootstrapApplication()
