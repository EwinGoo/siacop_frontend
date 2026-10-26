import axios from 'axios'
import {API_BASE_URL, BACKEND_LOGIN_URL, BACKEND_2FA_URL} from '../config/apiRoutes'

/** Un único tratamiento de sesión para Axios global y la instancia compartida. */
export const createAuthErrorHandler = (navigate: (url: string) => void) => {
  let navigating = false
  const reject = async (error: unknown): Promise<never> => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      let data: unknown = error.response?.data
      // Las descargas usan blob también cuando el servidor devuelve un error JSON.
      if (status === 403 && data instanceof Blob && typeof data.text === 'function') {
        try {
          data = JSON.parse(await data.text())
        } catch {
          // Un cuerpo no JSON conserva su error original.
        }
      }
      const payload =
        typeof data === 'object' && data !== null && 'data' in data
          ? (data as {data: unknown}).data
          : null
      const code =
        typeof payload === 'object' && payload !== null && 'code' in payload
          ? (payload as {code: unknown}).code
          : undefined
      const target =
        status === 401
          ? BACKEND_LOGIN_URL
          : status === 403 && code === 'TWO_FACTOR_REQUIRED'
          ? BACKEND_2FA_URL
          : undefined
      if (target && !navigating) {
        navigating = true
        navigate(target)
      }
    }
    return Promise.reject(error)
  }
  return Object.assign(reject, {isRedirecting: () => navigating})
}

export const handleAuthError = createAuthErrorHandler((url) => window.location.assign(url))

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {Accept: 'application/json'},
})
axiosClient.interceptors.response.use((response) => response, handleAuthError)

export default axiosClient
