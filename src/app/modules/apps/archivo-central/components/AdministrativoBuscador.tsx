import {useEffect, useRef, useState} from 'react'
import {useLocation, useSearchParams} from 'react-router-dom'
import {BusquedaAdministrativos, ModoArchivo} from '../core/types'
import {useAdministrativos} from '../core/useArchivoCentral'
import {KTCard} from '../../../../../_metronic/helpers/components/KTCard'
import {KTCardBody} from '../../../../../_metronic/helpers/components/KTCardBody'
import {KTIcon} from '../../../../../_metronic/helpers/components/KTIcon'
import {PageTitle} from '../../../../../_metronic/layout/core/PageData'
import {AdministrativoTabla} from './AdministrativoTabla'
import {AdministrativoToolbar} from './AdministrativoToolbar'
import {Cargando, ErrorConsulta} from './EstadoConsulta'
import {Paginacion} from './Paginacion'

const breadcrumbs = [{title: 'Expedientes', path: '', isActive: true}]

export const AdministrativoBuscador = ({modo}: {modo: ModoArchivo}) => {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const pagina = Number(params.get('page'))
  const sort = params.get('sort')
  const filtros: BusquedaAdministrativos = {
    search: params.get('search') ?? '',
    codigo_archivo: params.get('codigo_archivo') || undefined,
    page: Number.isSafeInteger(pagina) && pagina > 0 && pagina <= 1000000 ? pagina : 1,
    limit: 10,
    sort: sort === 'ci' || sort === 'codigo_archivo' ? sort : 'nombre',
    order: params.get('order') === 'desc' ? 'desc' : 'asc',
  }
  const [search, setSearch] = useState(filtros.search)
  const [codigo, setCodigo] = useState(filtros.codigo_archivo ?? '')
  const [esperandoBusqueda, setEsperandoBusqueda] = useState(false)
  const busquedaPendiente = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (busquedaPendiente.current) clearTimeout(busquedaPendiente.current)
    setEsperandoBusqueda(false)
    setSearch(filtros.search)
    setCodigo(filtros.codigo_archivo ?? '')
  }, [location.search, filtros.search, filtros.codigo_archivo])
  useEffect(
    () => () => {
      if (busquedaPendiente.current) clearTimeout(busquedaPendiente.current)
    },
    []
  )
  // Mismo intervalo de Comisiones: consultar después de 500 ms sin nuevas pulsaciones.
  const programarBusqueda = (texto: string, numero: string) => {
    if (busquedaPendiente.current) clearTimeout(busquedaPendiente.current)
    setSearch(texto)
    setCodigo(numero)
    setEsperandoBusqueda(true)
    busquedaPendiente.current = setTimeout(() => {
      const next = new URLSearchParams(params)
      if (texto.trim()) next.set('search', texto.trim())
      else next.delete('search')
      if (numero.trim()) next.set('codigo_archivo', numero.trim())
      else next.delete('codigo_archivo')
      next.set('page', '1')
      next.delete('limit')
      setParams(next, {replace: true})
      setEsperandoBusqueda(false)
    }, 500)
  }
  const consulta = useAdministrativos(filtros)
  const cambiar = (cambios: Partial<BusquedaAdministrativos>) => {
    const next = {...filtros, ...cambios}
    const value = new URLSearchParams()
    Object.entries(next).forEach(([key, item]) => {
      if (item !== undefined && item !== '') value.set(key, String(item))
    })
    // limit es fijo y no forma parte de la navegación.
    value.delete('limit')
    setParams(value)
  }
  return (
    <>
      <PageTitle
        description={
          modo === 'auditoria'
            ? 'Consulta de expedientes administrativos'
            : 'Archivo documental administrativo'
        }
        breadcrumbs={breadcrumbs}
      >
        {modo === 'auditoria' ? 'Auditoría Interna' : 'Archivo Central'}
      </PageTitle>
      <div className='d-flex flex-wrap flex-stack gap-3 mb-5'>
        <div>
          <h2 className='fs-4 fw-bold text-gray-900 mb-1'>Expedientes administrativos</h2>
          <p className='fs-7 text-muted mb-0'>
            {modo === 'auditoria'
              ? 'Localiza al funcionario y revisa su expediente digital.'
              : 'Consulta el archivo documental del personal administrativo.'}
          </p>
        </div>
      </div>
      <KTCard>
        <AdministrativoToolbar
          search={search}
          codigo={codigo}
          setSearch={(texto) => programarBusqueda(texto, codigo)}
          setCodigo={(numero) => programarBusqueda(search, numero)}
          refrescar={() => {
            void consulta.refetch()
          }}
          actualizando={consulta.isFetching || esperandoBusqueda}
          limpiar={() => {
            if (busquedaPendiente.current) clearTimeout(busquedaPendiente.current)
            setEsperandoBusqueda(false)
            setSearch('')
            setCodigo('')
            setParams({})
          }}
          modo={modo}
        />
        <KTCardBody className='py-4'>
          {consulta.isFetching && !consulta.isLoading && (
            <p className='text-muted fs-7 mb-3' role='status'>
              Actualizando resultados…
            </p>
          )}
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
                {consulta.data.data.length === 0 ? (
                  <div className='text-center py-12' role='status'>
                    <span className='symbol symbol-60px mb-4' aria-hidden='true'>
                      <span className='symbol-label bg-light'>
                        <KTIcon iconName='folder' className='fs-2x text-gray-500' />
                      </span>
                    </span>
                    <p className='fw-semibold text-gray-800 mb-1'>
                      No se encontraron administrativos con estos filtros.
                    </p>
                    <p className='text-muted fs-7 mb-0'>
                      Prueba con otro CI, nombre o código de expediente.
                    </p>
                  </div>
                ) : (
                  <AdministrativoTabla
                    personas={consulta.data.data}
                    modo={modo}
                    volver={`${location.pathname}${location.search}`}
                    actualizando={consulta.isFetching}
                  />
                )}
                <Paginacion
                  variante='metronic'
                  page={filtros.page}
                  limit={filtros.limit}
                  total={consulta.data.pagination.total}
                  bloqueada={consulta.isFetching || esperandoBusqueda}
                  cambiar={(page) => cambiar({page})}
                />
              </>
            )
          )}
        </KTCardBody>
      </KTCard>
    </>
  )
}
