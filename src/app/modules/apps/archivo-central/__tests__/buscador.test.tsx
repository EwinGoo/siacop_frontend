/// <reference types="jest" />
import {useState} from 'react'
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from 'react-query'
import axios from 'axios'
import {SelectorBuscable} from '../../../components/SelectorBuscable'
import {DocumentoLista} from '../components/DocumentoLista'
import {Catalogos} from '../core/types'

jest.mock('sweetalert2', () => ({__esModule: true, default: {fire: jest.fn()}}))

jest.mock('../../../components/loading/ListLoading', () => ({
  ListLoading: () => <p role='status'>Cargando</p>,
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
const get = axios.get as jest.MockedFunction<typeof axios.get>
const opciones = [
  {value: undefined, label: 'Todas las categorías'},
  {value: 99, label: 'Grado Académico (histórica)'},
  {value: 100, label: 'Memorándum'},
]
const catalogos: Catalogos = {
  categorias: [
    {id: 99, nombre: 'Grado Académico', descripcion: null, orden: null, habilitado: false},
  ],
  documentos: [],
  acceso: {puede_consultar: true, puede_gestionar: false, escrituras_habilitadas: false},
}
const cambio = jest.fn()
function Selector() {
  const [value, setValue] = useState<number | undefined>()
  return (
    <>
      <label htmlFor='categoria-prueba'>Categoría</label>
      <SelectorBuscable
        id='categoria-prueba'
        options={opciones}
        value={value}
        placeholder='Todas las categorías'
        onChange={(id) => {
          setValue(id)
          cambio(id)
        }}
      />
    </>
  )
}
beforeEach(() => {
  jest.clearAllMocks()
  get.mockResolvedValue({data: {status: 'success', data: {data: [], pagination: {total: 0}}}})
})

afterEach(() => jest.useRealTimers())

test.each(['grado', 'GRADO', 'academico', 'académico'])(
  'Filtra inmediatamente por %s sin perder el nombre histórico',
  (texto) => {
    render(<Selector />)
    fireEvent.change(screen.getByRole('combobox', {name: 'Categoría'}), {target: {value: texto}})
    expect(screen.getByRole('option', {name: 'Grado Académico (histórica)'})).toBeInTheDocument()
    expect(screen.queryByRole('option', {name: 'Memorándum'})).not.toBeInTheDocument()
    expect(cambio).not.toHaveBeenCalled()
  }
)

test('Selecciona ID numérico, cierra menú y limpia a Todas las categorías con teclado', () => {
  render(<Selector />)
  const input = screen.getByRole('combobox', {name: 'Categoría'})
  fireEvent.change(input, {target: {value: 'grado'}})
  fireEvent.keyDown(input, {key: 'ArrowDown'})
  fireEvent.keyDown(input, {key: 'Enter'})
  expect(cambio).toHaveBeenLastCalledWith(99)
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  fireEvent.keyDown(input, {key: 'Backspace'})
  expect(cambio).toHaveBeenLastCalledWith(undefined)
  expect(screen.getByText('Todas las categorías')).toBeInTheDocument()
})

test('Sin coincidencias, Escape y menú fuera del contenedor para evitar recortes', () => {
  const {container} = render(<Selector />)
  const input = screen.getByRole('combobox', {name: 'Categoría'})
  fireEvent.change(input, {target: {value: 'inexistente'}})
  expect(screen.getByText('No hay coincidencias')).toBeInTheDocument()
  expect(within(container).queryByRole('listbox')).not.toBeInTheDocument()
  fireEvent.keyDown(input, {key: 'Escape'})
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
})

test.each(['auditoria', 'gestion'] as const)(
  'Búsqueda automática sin duplicar HTTP en %s; categorías se buscan localmente',
  async (modo) => {
    const client = new QueryClient({
      defaultOptions: {queries: {retry: false, cacheTime: 0, refetchOnWindowFocus: false}},
    })
    const view = render(
      <QueryClientProvider client={client}>
        <DocumentoLista personaId={900002} catalogos={catalogos} modo={modo} />
      </QueryClientProvider>
    )
    expect(await screen.findByText(/No hay documentos en el expediente/)).toBeInTheDocument()
    expect(get).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', {name: 'Buscar'})).not.toBeInTheDocument()
    const input = screen.getByLabelText('Nombre o descripción')
    jest.useFakeTimers()
    fireEvent.change(input, {target: {value: 'g'}})
    fireEvent.change(input, {target: {value: 'gr'}})
    fireEvent.change(input, {target: {value: 'grado'}})
    await act(async () => {
      jest.advanceTimersByTime(500)
    })
    jest.useRealTimers()
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2))
    expect(get).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          search: 'grado',
          page: 1,
          sort: 'fecha_registro',
          order: 'desc',
        }),
      })
    )
    fireEvent.change(screen.getByLabelText('Categoría'), {target: {value: 'academico'}})
    expect(get).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByRole('option', {name: 'Grado Académico (histórica)'}))
    await waitFor(() => expect(get).toHaveBeenCalledTimes(3))
    expect(get).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          categoria_id: 99,
          search: 'grado',
          sort: 'fecha_registro',
          order: 'desc',
          page: 1,
        }),
      })
    )
    // Texto equivalente al criterio vigente no debe provocar una segunda consulta.
    jest.useFakeTimers()
    fireEvent.change(input, {target: {value: ' grado '}})
    await act(async () => {
      jest.advanceTimersByTime(500)
    })
    jest.useRealTimers()
    expect(get).toHaveBeenCalledTimes(3)
    view.unmount()
    client.clear()
  }
)
