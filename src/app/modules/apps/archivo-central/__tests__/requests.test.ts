/// <reference types="jest" />
import axios from 'axios'
import {
  ArchivoApiError,
  getAdministrativos,
  getCatalogos,
  getDocumentos,
  getPdfDocumento,
  registrarExpediente,
  registrarDocumento,
  eliminarDocumento,
} from '../core/requests'
import {codigoArchivo, fechaDocumento} from '../core/presentation'

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create() {
      return this
    },
    interceptors: {response: {use: jest.fn()}},
    get: jest.fn(),
    request: jest.fn(),
    isAxiosError: (e: unknown) => typeof e === 'object' && e !== null && 'isAxiosError' in e,
    isCancel: () => false,
  },
}))
const get = axios.get as jest.MockedFunction<typeof axios.get>
beforeEach(() => jest.clearAllMocks())

test('Consulta incluye credenciales, cancelación y filtros de servidor', async () => {
  const signal = new AbortController().signal
  get.mockResolvedValue({data: {status: 'success', data: {data: [], pagination: {total: 0}}}})
  await getAdministrativos(
    {
      search: 'Ficticio',
      codigo_archivo: '000042',
      page: 2,
      limit: 10,
      sort: 'nombre',
      order: 'asc',
    },
    signal
  )
  expect(get).toHaveBeenCalledWith(
    expect.stringContaining('/archivo-central/administrativos'),
    expect.objectContaining({
      withCredentials: true,
      signal,
      params: expect.objectContaining({page: 2, codigo_archivo: '000042'}),
    })
  )
})
test.each([401, 403, 404, 422, 500])(
  'HTTP %s propaga error sin filtrar mensajes internos',
  async (status) => {
    get.mockRejectedValue({isAxiosError: true, response: {status, data: {message: 'SQL privado'}}})
    await expect(getCatalogos()).rejects.toBeInstanceOf(ArchivoApiError)
    await expect(getCatalogos()).rejects.not.toThrow('SQL privado')
  }
)
test('Respuesta mal formada no se convierte en lista vacía', async () => {
  get.mockResolvedValue({data: {status: 'error', data: null}})
  await expect(getCatalogos()).rejects.toThrow('No se pudo interpretar')
})
test('Código y fechas conservan valores y nullables', () => {
  expect(codigoArchivo(42)).toBe('000042')
  expect(codigoArchivo(1234567)).toBe('1234567')
  expect(codigoArchivo(null)).toBe('Sin expediente')
  expect(fechaDocumento('2000-01-02')).toBe('02/01/2000')
  expect(fechaDocumento(null)).toBe('Sin dato')
})

test('PDF válido usa credenciales y respuesta binaria', async () => {
  const pdf = new Blob(['%PDF-1.4\n%%EOF'], {type: 'application/pdf'})
  get.mockResolvedValue({data: pdf})
  await expect(getPdfDocumento(900003, 'preview')).resolves.toBe(pdf)
  expect(get).toHaveBeenLastCalledWith(
    expect.stringContaining('/documentos/900003/preview'),
    expect.objectContaining({responseType: 'blob', withCredentials: true})
  )
})
test('Una página HTML o JSON no se muestra como PDF', async () => {
  get.mockResolvedValue({data: new Blob(['login'], {type: 'text/html'})})
  await expect(getPdfDocumento(900003, 'preview')).rejects.toThrow('no devolvió un PDF válido')
})

test('Listado unificado envía categoría, orden y página sin sección', async () => {
  get.mockResolvedValue({data: {status: 'success', data: {data: [], pagination: {total: 0}}}})
  await getDocumentos(900002, {
    page: 2,
    limit: 10,
    search: 'ficticio',
    categoria_id: 99,
    sort: 'fecha_fin',
    order: 'desc',
  })
  expect(get).toHaveBeenLastCalledWith(
    expect.stringContaining('/expedientes/900002/documentos'),
    expect.objectContaining({
      params: {
        page: 2,
        limit: 10,
        search: 'ficticio',
        categoria_id: 99,
        sort: 'fecha_fin',
        order: 'desc',
      },
      withCredentials: true,
    })
  )
})

test('gestión usa token CSRF en cuerpo sin cambiar cabeceras CORS ni duplicar solicitudes', async () => {
  get.mockResolvedValue({
    data: {status: 'success', data: {name: 'csrf_test_name', hash: 'token-ficticio'}},
  })
  const request = axios.request as jest.Mock
  request.mockResolvedValue({data: {status: 'success', data: {persona_id: 123}}})
  await registrarExpediente(123)
  expect(get).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenLastCalledWith(
    expect.objectContaining({
      method: 'POST',
      data: {persona_id: 123, csrf_test_name: 'token-ficticio'},
      withCredentials: true,
    })
  )
  const datos = new FormData()
  datos.append('documento_id', '2')
  const progreso = jest.fn()
  await registrarDocumento(123, datos, progreso)
  expect(datos.get('csrf_test_name')).toBe('token-ficticio')
  const config = request.mock.calls[1][0]
  config.onUploadProgress({loaded: 50, total: 100})
  expect(progreso).toHaveBeenCalledWith(50)
  await eliminarDocumento(100)
  expect(request).toHaveBeenLastCalledWith(
    expect.objectContaining({method: 'DELETE', data: {csrf_test_name: 'token-ficticio'}})
  )
})

test('errores de gestión conservan validaciones por campo y no reintentan escrituras', async () => {
  get.mockResolvedValue({
    data: {status: 'success', data: {name: 'csrf_test_name', hash: 'token-ficticio'}},
  })
  const request = axios.request as jest.Mock
  request.mockRejectedValue({
    isAxiosError: true,
    response: {
      status: 422,
      data: {message: 'Revisa los campos.', data: {archivo: 'PDF inválido.'}},
    },
  })
  await expect(registrarDocumento(123, new FormData(), jest.fn())).rejects.toMatchObject({
    status: 422,
    campos: {archivo: 'PDF inválido.'},
  })
  expect(request).toHaveBeenCalledTimes(1)
})
