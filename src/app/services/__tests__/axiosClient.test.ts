/// <reference types="jest" />
import axiosClient, {createAuthErrorHandler, handleAuthError} from '../axiosClient'
import {setupAxios} from '../../modules/auth/core/AuthHelpers'
import {API_BASE_URL, BACKEND_LOGIN_URL, BACKEND_2FA_URL} from '../../config/apiRoutes'

jest.mock('axios', () => jest.requireActual('axios/dist/node/axios.cjs'))

const httpError = (status: number, data: unknown = {}) => ({
  isAxiosError: true,
  response: {status, data},
})

test('Instancia compartida usa API configurada, cookies y JSON', () => {
  expect(axiosClient.defaults.baseURL).toBe(API_BASE_URL)
  expect(axiosClient.defaults.withCredentials).toBe(true)
  expect(axiosClient.defaults.headers.Accept).toBe('application/json')
})

test('Axios global reutiliza el mismo interceptor de seguridad', () => {
  const response = jest.fn()
  const client = {
    defaults: {headers: {}},
    interceptors: {response: {use: response}, request: {use: jest.fn()}},
  }
  setupAxios(client)
  expect(response).toHaveBeenCalledWith(expect.any(Function), handleAuthError)
})

test('401 concurrentes redirigen una sola vez al backend y conservan cada error', async () => {
  const navigate = jest.fn()
  const reject = createAuthErrorHandler(navigate)
  const first = httpError(401)
  const second = httpError(401)
  const results = await Promise.allSettled([reject(first), reject(second)])
  expect(reject.isRedirecting()).toBe(true)
  expect(navigate).toHaveBeenCalledTimes(1)
  expect(navigate).toHaveBeenCalledWith(BACKEND_LOGIN_URL)
  expect(results).toEqual([
    {status: 'rejected', reason: first},
    {status: 'rejected', reason: second},
  ])
})

test('403 por 2FA conduce al flujo existente de verificación', async () => {
  const navigate = jest.fn()
  const reject = createAuthErrorHandler(navigate)
  const error = httpError(403, {data: {code: 'TWO_FACTOR_REQUIRED'}})
  await expect(reject(error)).rejects.toBe(error)
  expect(navigate).toHaveBeenCalledWith(BACKEND_2FA_URL)
})

test('403 por grupo se propaga sin cerrar sesión ni redirigir', async () => {
  const navigate = jest.fn()
  const reject = createAuthErrorHandler(navigate)
  const error = httpError(403, {data: {code: 'GROUP_FORBIDDEN'}})
  await expect(reject(error)).rejects.toBe(error)
  expect(navigate).not.toHaveBeenCalled()
})

test('Errores PDF en blob también utilizan el manejo común de 2FA', async () => {
  const navigate = jest.fn()
  const reject = createAuthErrorHandler(navigate)
  const blob = new Blob(['{}'], {type: 'application/json'})
  Object.defineProperty(blob, 'text', {
    value: async () => JSON.stringify({data: {code: 'TWO_FACTOR_REQUIRED'}}),
  })
  const error = httpError(403, blob)
  await expect(reject(error)).rejects.toBe(error)
  expect(navigate).toHaveBeenCalledWith(BACKEND_2FA_URL)
})

test('Red y validación conservan el error sin navegar', async () => {
  const navigate = jest.fn()
  const reject = createAuthErrorHandler(navigate)
  for (const error of [new Error('Red'), httpError(422), httpError(500)]) {
    await expect(reject(error)).rejects.toBe(error)
  }
  expect(navigate).not.toHaveBeenCalled()
})
