import {Navigate, Outlet, Route, Routes} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../../_metronic/layout/core'
import {useAuth} from '../../../auth'
import {APP_ROLES} from '../../../auth/core/roles'
import {AsignacionesAdministrativasListWrapper} from './asignaciones-administrativas-list/AsignacionesAdministrativasList'

const breadcrumbs: Array<PageLink> = [
  {
    title: 'Control Personal',
    path: '/apps/asignaciones-administrativas/listar',
    isSeparator: false,
    isActive: false,
  },
]

const AsignacionesAdministrativasPage = () => {
  const {currentUser} = useAuth()
  const canAccess = Boolean(
    currentUser?.groups?.includes(APP_ROLES.ADMINISTRADOR) ||
      currentUser?.groups?.includes(APP_ROLES.CONTROL_PERSONAL)
  )

  if (!canAccess) {
    return <Navigate to='/acceso-denegado' replace />
  }

  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='/listar'
          element={
            <>
              <PageTitle breadcrumbs={breadcrumbs}>Asignaciones Administrativas</PageTitle>
              <AsignacionesAdministrativasListWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/asignaciones-administrativas/listar' replace />} />
    </Routes>
  )
}

export default AsignacionesAdministrativasPage
