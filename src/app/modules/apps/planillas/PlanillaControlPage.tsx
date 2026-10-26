import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { PageLink, PageTitle } from 'src/_metronic/layout/core'
import { PlanillaControlList } from './list/PlanillaControlList'
import { PlanillaModulo } from './list/core/_models'

type Props = {
  modulo: PlanillaModulo
}

const titles: Record<PlanillaModulo, string> = {
  docente: 'Control de Planilla Docente',
  estudiante: 'Control de Planilla Estudiante',
}

const redirectPaths: Record<PlanillaModulo, string> = {
  docente: '/apps/planillas-docente/control',
  estudiante: '/apps/planillas-estudiante/control',
}

const breadcrumbs: Array<PageLink> = [
  {
    title: 'Planillas',
    path: '#',
    isSeparator: false,
    isActive: false,
  },
]

const PlanillaControlPage = ({ modulo }: Props) => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='/control'
          element={
            <>
              <PageTitle breadcrumbs={breadcrumbs}>{titles[modulo]}</PageTitle>
              <PlanillaControlList modulo={modulo} />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to={redirectPaths[modulo]} />} />
    </Routes>
  )
}

export default PlanillaControlPage
