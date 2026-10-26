import {SelectorBuscable} from '../../../components/SelectorBuscable'
import {KTIcon} from '../../../../../_metronic/helpers/components/KTIcon'
import {useEffect, useMemo, useRef, useState} from 'react'
import {BusquedaDocumentos, Catalogos, Documento, ModoArchivo} from '../core/types'
import {fechaDocumento} from '../core/presentation'
import {API_ROUTES} from '../../../../config/apiRoutes'
import {useDocumentos} from '../core/useArchivoCentral'
import {Cargando, ErrorConsulta} from './EstadoConsulta'
import {Paginacion} from './Paginacion'
import {DocumentoVisor} from './DocumentoVisor'
import {DocumentoRegistro} from './DocumentoRegistro'
import {useQueryClient} from 'react-query'
import styles from './DocumentoLista.module.scss'

export const DocumentoLista = ({
  personaId,
  catalogos,
  modo,
}: {
  personaId: number
  catalogos: Catalogos
  modo: ModoArchivo
}) => {
  const client = useQueryClient()
  const [registro, setRegistro] = useState(false)
  const [exito, setExito] = useState('')
  const [filtros, setFiltros] = useState<BusquedaDocumentos>({
    page: 1,
    limit: 50,
    search: '',
    sort: 'fecha_registro',
    order: 'desc',
  })
  const [search, setSearch] = useState('')
  const [seleccion, setSeleccion] = useState<Documento | null>(null)
  const consulta = useDocumentos(personaId, filtros)
  const categorias = useMemo(
    () => [
      {value: undefined, label: 'Todas las categorías'},
      ...catalogos.categorias.map((item) => ({
        value: item.id,
        label: `${item.nombre ?? `Categoría ${item.id}`}${!item.habilitado ? ' (histórica)' : ''}`,
      })),
    ],
    [catalogos.categorias]
  )
  const busquedaPendiente = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (busquedaPendiente.current) clearTimeout(busquedaPendiente.current)
    },
    []
  )
  const buscar = (texto: string) => {
    setSearch(texto)
    if (busquedaPendiente.current) clearTimeout(busquedaPendiente.current)
    busquedaPendiente.current = setTimeout(() => {
      setFiltros((actual) =>
        actual.search === texto.trim() ? actual : {...actual, search: texto.trim(), page: 1}
      )
    }, 500)
  }
  const ordenar = (sort: BusquedaDocumentos['sort']) => {
    setFiltros((actual) => ({
      ...actual,
      sort,
      order:
        actual.sort === sort
          ? actual.order === 'asc'
            ? 'desc'
            : 'asc'
          : sort === 'nombre'
          ? 'asc'
          : 'desc',
      page: 1,
    }))
  }
  const columnaOrdenable = (sort: BusquedaDocumentos['sort'], titulo: string) => {
    const activa = filtros.sort === sort
    const siguiente = activa
      ? filtros.order === 'asc'
        ? 'desc'
        : 'asc'
      : sort === 'nombre'
      ? 'asc'
      : 'desc'
    return (
      <th
        scope='col'
        aria-sort={activa ? (filtros.order === 'asc' ? 'ascending' : 'descending') : undefined}
      >
        <button
          type='button'
          className={`${
            styles.encabezadoOrdenable
          } border-0 bg-transparent p-0 w-100 text-start text-gray-500 text-hover-gray-800 fw-bold fs-7 text-nowrap cursor-pointer ${
            activa ? `table-sort-${filtros.order}` : 'table-sort'
          }`}
          style={{minHeight: 44}}
          aria-label={`Ordenar por ${titulo.toLowerCase()}, ${
            siguiente === 'asc' ? 'ascendente' : 'descendente'
          }`}
          onClick={() => ordenar(sort)}
        >
          {titulo}
        </button>
      </th>
    )
  }
  return (
    <>
      <div className='d-flex flex-wrap justify-content-between align-items-center gap-3 mb-5'>
        <h3 className='fs-4 mb-0'>Documentos del expediente</h3>
        {modo === 'gestion' && (
          <button
            className='btn btn-sm btn-light-primary'
            disabled={!catalogos.acceso.escrituras_habilitadas}
            onClick={() => setRegistro(true)}
          >
            Registrar documento
          </button>
        )}
      </div>
      {exito && (
        <div className='alert alert-success' role='status'>
          {exito}
        </div>
      )}
      {registro && (
        <DocumentoRegistro
          personaId={personaId}
          catalogos={catalogos}
          cerrar={() => setRegistro(false)}
          registrado={() => {
            setRegistro(false)
            setExito('Documento registrado correctamente.')
            setFiltros((actual) => ({...actual, page: 1}))
          }}
        />
      )}
      <div className='row g-3 mb-5 align-items-end' role='search' aria-label='Filtrar documentos'>
        <div className='col-12 col-md-6'>
          <div className='position-relative flex-grow-1 min-w-0'>
            <span className='position-absolute top-50 translate-middle-y ms-6' aria-hidden='true'>
              <KTIcon iconName='magnifier' className='fs-1 text-gray-500' />
            </span>
            <label htmlFor='documento-buscar' className='visually-hidden'>
              Nombre o descripción
            </label>
            <input
              id='documento-buscar'
              type='search'
              className='form-control form-control-solid ps-14 pe-12'
              style={{width: '100%', minWidth: 0, height: 44}}
              value={search}
              maxLength={100}
              onChange={(event) => buscar(event.target.value)}
              placeholder='Nombre o descripción'
            />
          </div>
        </div>
        <div className='col-12 col-md-6'>
          <label htmlFor='documento-categoria' className='form-label'>
            Categoría
          </label>
          <SelectorBuscable
            id='documento-categoria'
            options={categorias}
            value={filtros.categoria_id}
            placeholder='Todas las categorías'
            onChange={(categoria_id) =>
              setFiltros((actual) => ({...actual, categoria_id, page: 1}))
            }
          />
        </div>
      </div>
      {consulta.isLoading ? (
        <Cargando />
      ) : consulta.isError ? (
        <ErrorConsulta
          error={consulta.error}
          reintentar={() => {
            void consulta.refetch()
          }}
        />
      ) : (
        consulta.data && (
          <>
            {consulta.isFetching && (
              <p role='status' className='text-muted'>
                Actualizando documentos…
              </p>
            )}
            {consulta.data.data.length === 0 ? (
              <p className='text-muted py-8' role='status'>
                No hay documentos en el expediente con los filtros seleccionados.
              </p>
            ) : (
              <div
                className='table-responsive'
                role='region'
                aria-label='Documentos del expediente, tabla desplazable'
                tabIndex={0}
                aria-busy={consulta.isFetching}
              >
                <table className='table table-row-dashed align-middle gy-5'>
                  <caption className='visually-hidden'>
                    Documentos del expediente. Deslice horizontalmente para consultar todas las
                    columnas.
                  </caption>
                  <thead>
                    <tr className='text-muted'>
                      {columnaOrdenable('nombre', 'Documento')}
                      <th scope='col' className='d-none d-md-table-cell'>
                        Tipo
                      </th>
                      {columnaOrdenable('fecha_registro', 'Fecha de registro')}
                      {columnaOrdenable('fecha_inicio', 'Fecha de inicio')}
                      {columnaOrdenable('fecha_fin', 'Fecha de fin')}
                      <th scope='col'>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consulta.data.data.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <span className='d-block text-break'>
                            <b>{doc.categoria ?? 'Sin categoría'}</b> {'->'}{' '}
                            {doc.nombre ?? 'Documento sin nombre'}
                          </span>
                          {doc.descripcion && (
                            <span className='text-muted d-block'>{doc.descripcion}</span>
                          )}
                        </td>
                        <td className='d-none d-md-table-cell'>{doc.tipo ?? 'Sin dato'}</td>
                        <td className='text-nowrap'>{fechaDocumento(doc.fecha_registro)}</td>
                        <td className='text-nowrap'>{fechaDocumento(doc.fecha_inicio)}</td>
                        <td className='text-nowrap'>{fechaDocumento(doc.fecha_fin)}</td>
                        <td>
                          <div className='d-flex gap-2'>
                            {doc.archivo.estado === 'disponible' ? (
                              <a
                                className='btn btn-sm btn-icon btn-light'
                                href={`${API_ROUTES.ARCHIVO_CENTRAL}/documentos/${doc.id}/preview`}
                                target='_blank'
                                rel='noopener noreferrer'
                                title='Visualizar PDF en una nueva pestaña'
                                aria-label={`Visualizar ${
                                  doc.nombre ?? 'documento'
                                } en una nueva pestaña`}
                              >
                                <i
                                  className='bi bi-file-earmark-pdf fs-2 text-danger'
                                  aria-hidden='true'
                                />
                              </a>
                            ) : (
                              <button
                                type='button'
                                className='btn btn-sm btn-icon btn-light'
                                disabled
                                title='El PDF no está disponible'
                                aria-label='Visualizar PDF: archivo no disponible'
                              >
                                <i
                                  className='bi bi-file-earmark-pdf fs-2 text-muted'
                                  aria-hidden='true'
                                />
                              </button>
                            )}
                            <button
                              className='btn btn-sm btn-light-primary text-nowrap'
                              onClick={() => setSeleccion(doc)}
                              aria-label={`Ver detalle de ${doc.nombre ?? 'documento'}`}
                            >
                              Ver detalle
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Paginacion
              page={filtros.page}
              limit={filtros.limit}
              total={consulta.data.pagination.total}
              bloqueada={consulta.isFetching}
              cambiar={(page) => setFiltros({...filtros, page})}
            />
          </>
        )
      )}
      <DocumentoVisor
        documento={seleccion}
        cerrar={() => setSeleccion(null)}
        modo={modo}
        escriturasHabilitadas={catalogos.acceso.escrituras_habilitadas}
        eliminado={() => {
          setSeleccion(null)
          setExito('Documento eliminado correctamente.')
          if (filtros.page > 1 && consulta.data?.data.length === 1) {
            setFiltros((actual) => ({...actual, page: actual.page - 1}))
          }
          void client.invalidateQueries(['archivo-central'])
        }}
      />
    </>
  )
}
