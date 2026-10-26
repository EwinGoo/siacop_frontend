import {useEffect, useState} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from 'react-query'
import {useAuth} from '../../auth'
import {ArchivoApiError} from './core/requests'
import {ModoArchivo} from './core/types'
import {AdministrativoBuscador} from './components/AdministrativoBuscador'
import {ExpedienteDetalle} from './components/ExpedienteDetalle'
import {Cargando, ErrorConsulta} from './components/EstadoConsulta'
import {useCatalogos} from './core/useArchivoCentral'

const Contenido = ({modo}: {modo: ModoArchivo}) => {
  const catalogos = useCatalogos()
  if (catalogos.isLoading) return <Cargando />
  if (catalogos.isError)
    return (
      <ErrorConsulta
        error={catalogos.error}
        reintentar={() => {
          void catalogos.refetch()
        }}
      />
    )
  if (
    !catalogos.data?.acceso.puede_consultar ||
    (modo === 'gestion' && !catalogos.data.acceso.puede_gestionar)
  ) {
    return <Navigate to='/acceso-denegado' replace />
  }
  return (
    <section aria-label={modo === 'auditoria' ? 'Auditoría Interna' : 'Archivo Central'}>
      <Routes>
        <Route index element={<AdministrativoBuscador modo={modo} />} />
        <Route
          path=':personaId'
          element={<ExpedienteDetalle modo={modo} catalogos={catalogos.data} />}
        />
        <Route path='*' element={<Navigate to='.' replace />} />
      </Routes>
    </section>
  )
}

const SesionArchivo = ({modo}: {modo: ModoArchivo}) => {
  // Caché propia, en memoria, destruida al salir del módulo o cambiar identidad/grupos.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            cacheTime: 0,
            retry: (intentos, error) =>
              intentos < 1 && error instanceof ArchivoApiError && error.status === 0,
          },
        },
      })
  )
  useEffect(
    () => () => {
      client.clear()
    },
    [client]
  )
  return (
    <QueryClientProvider client={client}>
      <Contenido modo={modo} />
    </QueryClientProvider>
  )
}

const ArchivoCentralPage = ({modo}: {modo: ModoArchivo}) => {
  const {currentUser} = useAuth()
  return <SesionArchivo key={`${currentUser?.id}:${currentUser?.groups?.join(',')}`} modo={modo} />
}
export default ArchivoCentralPage
