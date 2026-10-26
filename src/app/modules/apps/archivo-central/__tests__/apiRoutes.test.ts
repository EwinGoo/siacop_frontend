/// <reference types="jest" />
import {readFileSync} from 'fs'
import {resolve} from 'path'

const original = process.env.REACT_APP_API_URL

afterEach(() => {
  if (original === undefined) delete process.env.REACT_APP_API_URL
  else process.env.REACT_APP_API_URL = original
  jest.resetModules()
})

function configurar(apiUrl?: string) {
  if (apiUrl === undefined) delete process.env.REACT_APP_API_URL
  else process.env.REACT_APP_API_URL = apiUrl
  jest.resetModules()
  return require('../../../../config/apiRoutes') as typeof import('../../../../config/apiRoutes')
}

test.each([
  ['.env', 'http://localhost:8080'],
  ['.env.production', 'https://siacop.upea.bo'],
])('URLs de API y login según configuración existente %s', (archivo, backend) => {
  const contenido = readFileSync(resolve(process.cwd(), archivo), 'utf8')
  const apiUrl = /^REACT_APP_API_URL=(.+)$/m.exec(contenido)?.[1].trim()
  expect(apiUrl).toBe(`${backend}/api/v1`)
  const config = configurar(apiUrl)
  expect(config.API_BASE_URL).toBe(apiUrl)
  expect(config.API_ROUTES.ARCHIVO_CENTRAL).toBe(`${backend}/api/v1/archivo-central`)
  expect(config.ARCHIVO_LOGIN_URL).toBe(`${backend}/login`)
})

test('La barra final no duplica separadores en Archivo Central ni login', () => {
  const config = configurar('http://localhost:8080/api/v1/')
  expect(config.API_ROUTES.ARCHIVO_CENTRAL).toBe('http://localhost:8080/api/v1/archivo-central')
  expect(config.ARCHIVO_LOGIN_URL).toBe('http://localhost:8080/login')
})

test('Sin variable se conservan rutas relativas de Archivo Central y login', () => {
  const config = configurar()
  expect(config.API_BASE_URL).toBe('')
  expect(config.API_ROUTES.ARCHIVO_CENTRAL).toBe('/api/v1/archivo-central')
  expect(config.ARCHIVO_LOGIN_URL).toBe('/login')
})
