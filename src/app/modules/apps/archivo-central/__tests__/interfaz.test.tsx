import userEvent from '@testing-library/user-event'
/// <reference types="jest" />
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import ArchivoCentralPage from '../ArchivoCentralPage'
import {GroupRoute} from '../components/GroupRoute'
import {Administrativo, Catalogos, Documento, ModoArchivo} from '../core/types'
import {ArchivoApiError} from '../core/requests'

let mockUser = {id: 900001, groups: ['auditoria']}
const persona: Administrativo = {
  persona_id: 900002,
  ci: 'FICTICIO-01',
  expedido: 'LP',
  nombre: 'Persona',
  paterno: 'Ficticia',
  materno: null,
  apellido_de_casado: null,
  nombre_completo: 'Persona Ficticia',
  tiene_expediente: true,
  codigo_archivo: 42,
  cantidad_documentos: 1,
}
const documento: Documento = {
  id: 900003,
  persona_id: 900002,
  documento_id: 900004,
  categoria_id: 99,
  nombre: 'Documento ficticio',
  categoria: 'Categoría histórica',
  tipo: null,
  fecha_inicio: '2000-01-02',
  fecha_fin: null,
  descripcion: null,
  fecha_registro: null,
  archivo: {estado: 'historico_pendiente'},
}
const catalogos: Catalogos = {
  categorias: [
    {id: 99, nombre: 'Categoría histórica', descripcion: null, orden: null, habilitado: false},
  ],
  documentos: [],
  acceso: {puede_consultar: true, puede_gestionar: false, escrituras_habilitadas: false},
}
let mockCatalogos = catalogos
let mockPersona = persona
let mockError: unknown = null
let mockEmpty = false
let mockLoading = false
let mockDocumentosVacios = false
const mockRefetch = jest.fn()
const mockDocumentos = jest.fn()
const mockAdministrativos = jest.fn()

jest.mock('sweetalert2', () => ({__esModule: true, default: {fire: jest.fn()}}))

jest.mock('../../../../../_metronic/layout/core/PageData', () => ({
  PageTitle: ({children}: {children: string}) => <h1>{children}</h1>,
}))
jest.mock('../../../auth', () => ({useAuth: () => ({currentUser: mockUser})}))
jest.mock('../../../components/loading/ListLoading', () => ({
  ListLoading: () => <div role='status'>Cargando consulta</div>,
}))
jest.mock('../core/useArchivoCentral', () => ({
  useCatalogos: () => ({data: mockCatalogos, isLoading: false, isError: false}),
  useAdministrativos: (filtros: object) => {
    mockAdministrativos(filtros)
    return {
      data: {data: mockEmpty ? [] : [persona], pagination: {total: 21}},
      isLoading: mockLoading,
      isFetching: false,
      isError: !!mockError,
      error: mockError,
      refetch: mockRefetch,
    }
  },
  useAdministrativo: () => ({data: mockPersona, isLoading: false, isError: false}),
  useExpediente: () => ({
    data: {
      cantidad_documentos: 1,
    },
    isLoading: false,
    isError: false,
  }),
  useDocumentos: (_id: number, filtros: object) => {
    mockDocumentos(filtros)
    return {
      data: {
        data: mockDocumentosVacios ? [] : [documento],
        pagination: {total: mockDocumentosVacios ? 0 : 21},
      },
      isLoading: false,
      isError: false,
    }
  },
}))
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create() {
      return this
    },
    interceptors: {response: {use: jest.fn()}},
    get: jest.fn(),
    isAxiosError: () => false,
    isCancel: () => false,
  },
}))

beforeEach(() => {
  mockUser = {id: 900001, groups: ['auditoria']}
  mockCatalogos = catalogos
  mockPersona = persona
  mockError = null
  mockEmpty = false
  mockLoading = false
  mockDocumentosVacios = false
  jest.clearAllMocks()
})

function abrir(modo: ModoArchivo = 'auditoria', path = '/apps/auditoria') {
  const raiz = modo === 'auditoria' ? '/apps/auditoria' : '/apps/archivo-central'
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path={`${raiz}/*`}
          element={
            <GroupRoute
              groups={
                modo === 'auditoria'
                  ? ['auditoria', 'operador_archivo', 'administrador']
                  : ['operador_archivo', 'administrador']
              }
            >
              <ArchivoCentralPage modo={modo} />
            </GroupRoute>
          }
        />
        <Route path='/acceso-denegado' element={<p>Acceso denegado</p>} />
      </Routes>
    </MemoryRouter>
  )
}

function seleccionarCategoria(nombre = 'Categoría histórica (histórica)') {
  fireEvent.keyDown(screen.getByLabelText('Categoría'), {key: 'ArrowDown', code: 'ArrowDown'})
  fireEvent.click(screen.getByRole('option', {name: nombre}))
}

test('Auditoría lista administrativos sin acciones de gestión', () => {
  abrir()
  expect(screen.getByRole('heading', {name: 'Auditoría Interna'})).toBeInTheDocument()
  expect(screen.getByText('Persona Ficticia')).toBeInTheDocument()
  expect(screen.getByText('000042')).toBeInTheDocument()
  expect(screen.queryByRole('button', {name: 'Registrar expediente'})).not.toBeInTheDocument()
})
test.each(['operador_archivo', 'administrador'])('Gestión bloqueada para %s', (grupo) => {
  mockUser.groups = [grupo]
  mockCatalogos = {...catalogos, acceso: {...catalogos.acceso, puede_gestionar: true}}
  abrir('gestion', '/apps/archivo-central')
  expect(screen.getByRole('heading', {name: 'Archivo Central'})).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Registrar expediente'})).toBeDisabled()
})
test('Auditoría no entra por URL directa a gestión', () => {
  abrir('gestion', '/apps/archivo-central/900002')
  expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
})
test('Grupo ajeno no entra al módulo', () => {
  mockUser.groups = ['administrativo']
  abrir()
  expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
})
test('Capacidad backend también deniega gestión', () => {
  mockUser.groups = ['operador_archivo']
  abrir('gestion', '/apps/archivo-central')
  expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
})
test('Búsqueda automática por código y paginación son de servidor y reinician página', async () => {
  abrir()
  fireEvent.click(screen.getByRole('button', {name: 'Siguiente'}))
  expect(mockAdministrativos).toHaveBeenLastCalledWith(expect.objectContaining({page: 2}))
  fireEvent.change(screen.getByLabelText('Código de expediente'), {target: {value: '000042'}})
  fireEvent.change(screen.getByLabelText('CI, nombres o apellidos'), {target: {value: 'Ficticia'}})
  await waitFor(() =>
    expect(mockAdministrativos).toHaveBeenLastCalledWith(
      expect.objectContaining({page: 1, codigo_archivo: '000042', search: 'Ficticia'})
    )
  )
})
test('Expediente unificado sin pestañas ni selector de orden, con categorías históricas', () => {
  mockCatalogos = {
    ...catalogos,
    categorias: [
      ...catalogos.categorias,
      {id: 100, nombre: 'Otra categoría', descripcion: null, orden: null, habilitado: true},
    ],
  }
  abrir('auditoria', '/apps/auditoria/900002')
  expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Ordenar por')).not.toBeInTheDocument()
  expect(mockDocumentos.mock.calls.slice(-1)[0][0]).not.toHaveProperty('seccion')
  expect(screen.getByLabelText('Categoría')).toHaveValue('')
  fireEvent.keyDown(screen.getByLabelText('Categoría'), {key: 'ArrowDown'})
  expect(screen.getByRole('option', {name: 'Categoría histórica (histórica)'})).toBeInTheDocument()
  expect(screen.getByRole('option', {name: 'Otra categoría'})).toBeInTheDocument()
})

test.each([
  ['Documento', 'nombre', 'asc', 'desc'],
  ['Fecha de registro', 'fecha_registro', 'desc', 'asc'],
  ['Fecha de inicio', 'fecha_inicio', 'desc', 'asc'],
  ['Fecha de fin', 'fecha_fin', 'desc', 'asc'],
])(
  'Orden por %s reinicia página, alterna y conserva filtros',
  async (titulo, sort, primero, segundo) => {
    abrir('auditoria', '/apps/auditoria/900002')
    fireEvent.change(screen.getByLabelText('Nombre o descripción'), {target: {value: 'ficticio'}})
    await waitFor(() =>
      expect(mockDocumentos).toHaveBeenLastCalledWith(expect.objectContaining({search: 'ficticio'}))
    )
    seleccionarCategoria()
    fireEvent.click(screen.getByRole('button', {name: /Ordenar por fecha de fin/}))
    if (sort === 'fecha_fin')
      fireEvent.click(screen.getByRole('button', {name: /Ordenar por documento/}))
    fireEvent.click(screen.getByRole('button', {name: 'Siguiente'}))
    fireEvent.click(
      screen.getByRole('button', {name: new RegExp(`Ordenar por ${titulo.toLowerCase()},`)})
    )
    expect(mockDocumentos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sort,
        order: primero,
        page: 1,
        categoria_id: 99,
        search: 'ficticio',
      })
    )
    const encabezado = screen.getByRole('columnheader', {name: new RegExp(`^${titulo}`)})
    expect(encabezado).toHaveAttribute('aria-sort', primero === 'asc' ? 'ascending' : 'descending')
    expect(
      screen.getAllByRole('columnheader').filter((item) => item.hasAttribute('aria-sort'))
    ).toHaveLength(1)
    fireEvent.click(within(encabezado).getByRole('button'))
    expect(mockDocumentos).toHaveBeenLastCalledWith(
      expect.objectContaining({sort, order: segundo, page: 1})
    )
    fireEvent.click(screen.getByRole('button', {name: 'Siguiente'}))
    expect(mockDocumentos).toHaveBeenLastCalledWith(
      expect.objectContaining({sort, order: segundo, page: 2, categoria_id: 99, search: 'ficticio'})
    )
    seleccionarCategoria('Todas las categorías')
    expect(mockDocumentos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sort,
        order: segundo,
        page: 1,
        categoria_id: undefined,
        search: 'ficticio',
      })
    )
  }
)

test('Encabezados permiten Tab, Enter y Espacio conservando foco', async () => {
  const user = userEvent.setup()
  abrir('auditoria', '/apps/auditoria/900002')
  const nombre = screen.getByRole('button', {name: /Ordenar por documento/})
  nombre.focus()
  await act(async () => {
    await user.keyboard('{Enter}')
  })
  expect(nombre).toHaveFocus()
  expect(mockDocumentos).toHaveBeenLastCalledWith(
    expect.objectContaining({sort: 'nombre', order: 'asc'})
  )
  await act(async () => {
    await user.keyboard(' ')
  })
  expect(mockDocumentos).toHaveBeenLastCalledWith(
    expect.objectContaining({sort: 'nombre', order: 'desc'})
  )
  await user.tab()
  expect(screen.getByRole('button', {name: /Ordenar por fecha de registro/})).toHaveFocus()
})

test('Expediente sin resultados informa vacío y permite cambiar categoría', () => {
  mockDocumentosVacios = true
  abrir('auditoria', '/apps/auditoria/900002')
  expect(screen.getByRole('status')).toHaveTextContent('No hay documentos en el expediente')
  seleccionarCategoria()
  expect(mockDocumentos).toHaveBeenLastCalledWith(
    expect.objectContaining({categoria_id: 99, page: 1})
  )
})

test('Visor conserva nulos, informa histórico pendiente y restaura foco', async () => {
  abrir('auditoria', '/apps/auditoria/900002')
  const abrirDetalle = screen.getByRole('button', {name: 'Ver detalle de Documento ficticio'})
  abrirDetalle.focus()
  fireEvent.click(abrirDetalle)
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText(/permanece en SIACOP2/)).toBeInTheDocument()
  expect(within(dialog).getByText('02/01/2000')).toBeInTheDocument()
  expect(within(dialog).getAllByText('Sin dato').length).toBeGreaterThan(0)
  expect(within(dialog).getByRole('button', {name: 'Descargar PDF'})).toBeDisabled()
  expect(within(dialog).queryByRole('button', {name: 'Eliminar documento'})).not.toBeInTheDocument()
  fireEvent.click(within(dialog).getByRole('button', {name: /^Cerrar$/}))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(abrirDetalle).toHaveFocus()
})
test('Administrativo sin expediente permanece consultable', () => {
  mockPersona = {...persona, tiene_expediente: false, codigo_archivo: null}
  abrir('auditoria', '/apps/auditoria/900002')
  expect(screen.getByText('Sin expediente registrado')).toBeInTheDocument()
  expect(screen.queryByRole('button', {name: 'Crear expediente'})).not.toBeInTheDocument()
})
test('Error no se confunde con resultado vacío y permite reintentar', () => {
  mockError = new Error('No se pudo consultar')
  abrir()
  expect(screen.getByRole('alert')).toHaveTextContent('No se pudo consultar')
  expect(screen.queryByText(/No se encontraron administrativos/)).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', {name: 'Reintentar'}))
  expect(mockRefetch).toHaveBeenCalledTimes(1)
})
test('Sesión expirada ofrece iniciar sesión', () => {
  mockError = new ArchivoApiError(401, 'Tu sesión ha finalizado.')
  abrir()
  expect(screen.getByRole('link', {name: 'Iniciar sesión'})).toHaveAttribute(
    'href',
    expect.stringMatching(/\/login$/)
  )
})
test('Estado vacío comprensible', () => {
  mockEmpty = true
  abrir()
  expect(screen.getByText(/No se encontraron administrativos/)).toBeInTheDocument()
})
test('Estado de carga accesible', () => {
  mockLoading = true
  abrir()
  expect(screen.getByRole('status')).toHaveTextContent('Cargando consulta')
})
test('ID inválido no solicita detalles', () => {
  abrir('auditoria', '/apps/auditoria/no-valido')
  expect(screen.getByRole('alert')).toHaveTextContent('Identificador de administrativo inválido')
  expect(mockDocumentos).not.toHaveBeenCalled()
})

test('Entrar al expediente conserva identidad y no restaura botones retirados', () => {
  abrir('auditoria', '/apps/auditoria?search=Ficticia&page=2')
  fireEvent.click(screen.getByRole('link', {name: 'Revisar expediente de Persona Ficticia'}))
  expect(screen.getByRole('heading', {name: 'Persona Ficticia'})).toBeInTheDocument()
  expect(screen.getByText(/CI: FICTICIO-01/)).toBeInTheDocument()
  expect(screen.getByText('000042')).toBeInTheDocument()
  expect(screen.queryByRole('link', {name: /Volver al buscador/})).not.toBeInTheDocument()
})

test('Operador no puede editar, reemplazar ni eliminar desde el detalle', async () => {
  mockUser.groups = ['operador_archivo']
  mockCatalogos = {...catalogos, acceso: {...catalogos.acceso, puede_gestionar: true}}
  abrir('gestion', '/apps/archivo-central/900002')
  expect(screen.getByRole('button', {name: 'Registrar documento'})).toBeDisabled()
  fireEvent.click(screen.getByRole('button', {name: 'Ver detalle de Documento ficticio'}))
  const dialog = await screen.findByRole('dialog')
  for (const name of ['Editar documento', 'Reemplazar PDF', 'Eliminar documento']) {
    expect(within(dialog).getByRole('button', {name})).toBeDisabled()
  }
})

test.each(['auditoria', 'gestion'] as const)(
  'Usuario multigrupo consulta expediente en %s',
  (modo) => {
    mockUser.groups = ['auditoria', 'operador_archivo']
    mockCatalogos = {...catalogos, acceso: {...catalogos.acceso, puede_gestionar: true}}
    abrir(modo, `${modo === 'auditoria' ? '/apps/auditoria' : '/apps/archivo-central'}/900002`)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', {name: /Ir a Archivo Central|Ir a Auditoría/})
    ).not.toBeInTheDocument()
  }
)

test('Cerrar visor conserva categoría, orden y página documental', async () => {
  abrir('auditoria', '/apps/auditoria/900002')
  seleccionarCategoria()
  fireEvent.click(screen.getByRole('button', {name: /Ordenar por documento/}))
  fireEvent.click(screen.getByRole('button', {name: 'Siguiente'}))
  fireEvent.click(screen.getByRole('button', {name: 'Ver detalle de Documento ficticio'}))
  const dialog = await screen.findByRole('dialog')
  fireEvent.click(within(dialog).getByRole('button', {name: /^Cerrar$/}))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(mockDocumentos).toHaveBeenLastCalledWith(
    expect.objectContaining({categoria_id: 99, sort: 'nombre', order: 'asc', page: 2})
  )
})

test('Encabezados usan indicadores nativos Metronic sin apariencia de botón', () => {
  abrir('auditoria', '/apps/auditoria/900002')
  const registro = screen.getByRole('button', {name: /Ordenar por fecha de registro/})
  const nombre = screen.getByRole('button', {name: /Ordenar por documento/})
  expect(registro).toHaveClass('table-sort-desc')
  expect(nombre).toHaveClass('table-sort')
  for (const control of [registro, nombre]) {
    expect(control).not.toHaveClass('btn', 'btn-light')
    expect(control).toHaveClass('bg-transparent', 'border-0', 'cursor-pointer')
  }
  fireEvent.click(nombre)
  expect(nombre).toHaveClass('table-sort-asc')
  expect(registro).toHaveClass('table-sort')
  expect(registro).not.toHaveClass('table-sort-desc')
  fireEvent.click(nombre)
  expect(nombre).toHaveClass('table-sort-desc')
  fireEvent.click(nombre)
  expect(nombre).toHaveClass('table-sort-asc')
})
