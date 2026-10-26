import {act, fireEvent, render, screen, waitFor, getConfig as getReactConfig} from '@testing-library/react'
// eslint-disable-next-line testing-library/no-dom-import -- user-event usa otra instancia DOM; se sincronizan sus wrappers de React.
import {configure as configureDom} from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import {QueryClient, QueryClientProvider} from 'react-query'
import Swal from 'sweetalert2'
import {DocumentoRegistro, esquemaDocumento} from '../components/DocumentoRegistro'
import {ExpedienteRegistro} from '../components/ExpedienteRegistro'
import {DocumentoVisor} from '../components/DocumentoVisor'
import {eliminarDocumento, registrarDocumento, registrarExpediente} from '../core/requests'
import {Administrativo, Catalogos, Documento} from '../core/types'

jest.mock('../../../components/loading/ListLoading', () => ({ListLoading: () => <p>Cargando</p>}))
jest.mock('sweetalert2', () => ({
  __esModule: true,
  default: {fire: jest.fn(), isLoading: () => false, showValidationMessage: jest.fn()},
}))
jest.mock('../core/requests', () => ({
  registrarExpediente: jest.fn(),
  registrarDocumento: jest.fn(),
  eliminarDocumento: jest.fn(),
  getPdfDocumento: jest.fn(),
  ArchivoApiError: class extends Error {},
}))
const persona: Administrativo = {
  persona_id: 123,
  ci: 'FICTICIO',
  expedido: 'LP',
  nombre: 'Persona',
  paterno: 'Prueba',
  materno: null,
  apellido_de_casado: null,
  nombre_completo: 'Persona Prueba',
  tiene_expediente: false,
  codigo_archivo: null,
  cantidad_documentos: 0,
}
const categoria = {id: 1, nombre: 'Académica', descripcion: null, orden: 1, habilitado: true}
const catalogos: Catalogos = {
  categorias: [categoria, {...categoria, id: 9, nombre: 'Histórica', habilitado: false}],
  documentos: [{...categoria, id: 2, categoria_id: 1, nombre: 'Título'}],
  acceso: {puede_consultar: true, puede_gestionar: true, escrituras_habilitadas: true},
}
const documento: Documento = {
  id: 100,
  persona_id: 123,
  documento_id: 2,
  categoria_id: 1,
  nombre: 'Título',
  categoria: 'Académica',
  tipo: 'ORIGINAL',
  fecha_inicio: null,
  fecha_fin: null,
  descripcion: null,
  fecha_registro: null,
  archivo: {estado: 'disponible'},
}
const archivo = () => new File(['%PDF-1.4\n%%EOF'], 'titulo.pdf', {type: 'application/pdf'})
const validos = () => ({
  categoria_id: 1,
  documento_id: 2,
  tipo: 'ORIGINAL',
  fecha_inicio: '',
  fecha_fin: '',
  descripcion: '',
  archivo: archivo(),
})
function montar(ui: React.ReactElement) {
  const client = new QueryClient({defaultOptions: {queries: {retry: false}}})
  const invalidate = jest.spyOn(client, 'invalidateQueries')
  return {...render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>), invalidate}
}
// user-event y React Testing Library resuelven versiones distintas de DOM Testing Library.
// Reutilizar sus wrappers de React evita actualizaciones fuera de act sin ocultar avisos.
beforeAll(() => {
  const {asyncWrapper, eventWrapper} = getReactConfig()
  configureDom({asyncWrapper, eventWrapper})
})
beforeEach(() => jest.clearAllMocks())

test('valida PDF, tamaño, fechas y longitud sin rechazar campos opcionales vacíos', async () => {
  await expect(esquemaDocumento.isValid(validos())).resolves.toBe(true)
  await expect(
    esquemaDocumento.isValid({...validos(), archivo: new File(['x'], 'otro.txt')})
  ).resolves.toBe(false)
  const grande = new File(['x'], 'grande.pdf', {type: 'application/pdf'})
  Object.defineProperty(grande, 'size', {value: 20 * 1024 * 1024 + 1})
  await expect(esquemaDocumento.isValid({...validos(), archivo: grande})).resolves.toBe(false)
  await expect(
    esquemaDocumento.isValid({...validos(), fecha_inicio: '2026-02-01', fecha_fin: '2026-01-01'})
  ).resolves.toBe(false)
  await expect(
    esquemaDocumento.isValid({...validos(), descripcion: 'x'.repeat(256)})
  ).resolves.toBe(false)
})

test('crea expediente usando solo la persona existente, bloquea doble envío y actualiza consultas', async () => {
  let resolver: (valor: {persona_id: number}) => void = () => undefined
  ;(registrarExpediente as jest.Mock).mockReturnValue(
    new Promise((resolve) => {
      resolver = resolve
    })
  )
  const registrado = jest.fn()
  const {invalidate} = montar(
    <ExpedienteRegistro persona={persona} cerrar={jest.fn()} registrado={registrado} />
  )
  expect(screen.getByText('Persona Prueba')).toBeInTheDocument()
  const boton = screen.getByRole('button', {name: 'Confirmar registro'})
  await userEvent.click(boton)
  await userEvent.click(boton)
  expect(registrarExpediente).toHaveBeenCalledTimes(1)
  expect(registrarExpediente).toHaveBeenCalledWith(123)
  expect(screen.getByRole('button', {name: 'Cancelar'})).toBeDisabled()
  await act(async () => {
    resolver({persona_id: 123})
  })
  await waitFor(() => expect(registrado).toHaveBeenCalledTimes(1))
  expect(invalidate).toHaveBeenCalledWith(['archivo-central'])
})

test('registro muestra errores por campo y no envía un formulario incompleto', async () => {
  montar(
    <DocumentoRegistro
      personaId={123}
      catalogos={catalogos}
      cerrar={jest.fn()}
      registrado={jest.fn()}
    />
  )
  await userEvent.click(screen.getByRole('button', {name: 'Registrar documento'}))
  await screen.findByText('Selecciona una categoría.')
  expect(screen.getByText('Selecciona un PDF.')).toBeInTheDocument()
  expect(registrarDocumento).not.toHaveBeenCalled()
})

test('registra por ID, excluye históricos, permite reemplazar PDF y actualiza datos', async () => {
  let resolver: (valor: {id: number}) => void = () => undefined
  ;(registrarDocumento as jest.Mock).mockImplementation((_id, _datos, progreso) => {
    progreso(50)
    return new Promise((resolve) => {
      resolver = resolve
    })
  })
  const registrado = jest.fn()
  const {invalidate} = montar(
    <DocumentoRegistro
      personaId={123}
      catalogos={catalogos}
      cerrar={jest.fn()}
      registrado={registrado}
    />
  )
  const categoriaInput = screen.getByLabelText('Categoría documental')
  await userEvent.click(categoriaInput)
  expect(screen.queryByText('Histórica')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('option', {name: 'Académica'}))
  await userEvent.click(screen.getByLabelText('Documento o subtipo'))
  await userEvent.click(screen.getByRole('option', {name: 'Título'}))
  await userEvent.selectOptions(screen.getByLabelText('Tipo de documento'), 'ORIGINAL')
  await userEvent.upload(screen.getByLabelText('Archivo PDF'), archivo())
  const nuevo = new File(['%PDF-1.4\n%%EOF'], 'reemplazo.pdf', {type: 'application/pdf'})
  await userEvent.upload(screen.getByLabelText('Archivo PDF'), nuevo)
  await userEvent.click(screen.getByRole('button', {name: 'Registrar documento'}))
  await screen.findByText('Subiendo PDF: 50%')
  expect(screen.getByRole('button', {name: 'Guardando…'})).toBeDisabled()
  expect(registrarDocumento).toHaveBeenCalledTimes(1)
  await act(async () => {
    resolver({id: 100})
  })
  await waitFor(() => expect(registrado).toHaveBeenCalledTimes(1))
  const [id, datos] = (registrarDocumento as jest.Mock).mock.calls[0]
  expect(id).toBe(123)
  expect(datos.get('categoria_id')).toBe('1')
  expect(datos.get('documento_id')).toBe('2')
  expect(datos.get('archivo').name).toBe('reemplazo.pdf')
  expect(invalidate).toHaveBeenCalledWith(['archivo-central'])
})

test('auditoría no muestra eliminación y gestión deshabilitada no la habilita', () => {
  const {rerender} = render(
    <DocumentoVisor
      documento={documento}
      modo='auditoria'
      cerrar={jest.fn()}
      escriturasHabilitadas
      eliminado={jest.fn()}
    />
  )
  expect(screen.queryByRole('button', {name: 'Eliminar documento'})).not.toBeInTheDocument()
  rerender(<DocumentoVisor documento={documento} modo='gestion' cerrar={jest.fn()} />)
  expect(screen.getByRole('button', {name: 'Eliminar documento'})).toBeDisabled()
})

test('confirmación destructiva identifica el documento y elimina solo tras confirmar', async () => {
  ;(eliminarDocumento as jest.Mock).mockResolvedValue({id: 100})
  ;(Swal.fire as jest.Mock).mockImplementation(async (opciones) => {
    await opciones.preConfirm()
    return {isConfirmed: true}
  })
  const eliminado = jest.fn()
  render(
    <DocumentoVisor
      documento={documento}
      modo='gestion'
      cerrar={jest.fn()}
      escriturasHabilitadas
      eliminado={eliminado}
    />
  )
  fireEvent.click(screen.getByRole('button', {name: 'Eliminar documento'}))
  await waitFor(() => expect(eliminado).toHaveBeenCalledTimes(1))
  expect(Swal.fire).toHaveBeenCalledWith(
    expect.objectContaining({text: expect.stringContaining('Título')})
  )
  expect(eliminarDocumento).toHaveBeenCalledWith(100)
})

test('cancelar la confirmación no elimina y los históricos permanecen protegidos', async () => {
  ;(Swal.fire as jest.Mock).mockResolvedValue({isConfirmed: false})
  const {rerender} = render(
    <DocumentoVisor documento={documento} modo='gestion' cerrar={jest.fn()} escriturasHabilitadas />
  )
  fireEvent.click(screen.getByRole('button', {name: 'Eliminar documento'}))
  await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1))
  expect(eliminarDocumento).not.toHaveBeenCalled()
  rerender(
    <DocumentoVisor
      documento={{...documento, archivo: {estado: 'historico_pendiente'}}}
      modo='gestion'
      cerrar={jest.fn()}
      escriturasHabilitadas
    />
  )
  expect(screen.getByRole('button', {name: 'Eliminar documento'})).toBeDisabled()
})
