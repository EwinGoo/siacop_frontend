import {ReactNode} from 'react'
import {Navigate, Outlet, Route, Routes, useLocation} from 'react-router-dom'
import {PageLink, PageTitle} from 'src/_metronic/layout/core'
import ImportacionesPage from './importaciones/ImportacionesPage'
import ProcesosPage from './procesos/ProcesosPage'
import ResultadosDiariosPage from './resultados-diarios/ResultadosDiariosPage'
import ResultadosMensualesPage from './resultados-mensuales/ResultadosMensualesPage'
import BonoRefrigerioPage from './bono-refrigerio/BonoRefrigerioPage'
import MarcacionesTiempoRealPage from './marcaciones-tiempo-real/MarcacionesTiempoRealPage'
import {PlanillaModuleNav} from './components/PlanillaModuleNav'

const breadcrumbs: Array<PageLink> = [
  {
    title: 'Control Personal',
    path: '#',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const PlanillaViewTransition = ({children}: {children: ReactNode}) => {
  const location = useLocation()

  return (
    <div
      key={location.pathname}
      className='animate__animated animate__fadeIn'
      style={{animationDuration: '180ms', animationTimingFunction: 'ease-in-out'}}
    >
      {children}
    </div>
  )
}
const PlanillaAsistenciaPage = () => {
  return (
    <Routes>
      <Route
        element={
          <>
            <PlanillaModuleNav />
            <Outlet />
          </>
        }
      >
        <Route
          path='/importaciones'
          element={
            <>
              <PageTitle breadcrumbs={breadcrumbs}>Planilla de Asistencia: Importaciones</PageTitle>
              <PlanillaViewTransition>
                <ImportacionesPage />
              </PlanillaViewTransition>
            </>
          }
        />
        <Route
          path='/procesos'
          element={
            <>
              <PageTitle breadcrumbs={breadcrumbs}>Planilla de Asistencia: Procesos</PageTitle>
              <PlanillaViewTransition>
                <ProcesosPage />
              </PlanillaViewTransition>
            </>
          }
        />
        <Route
          path='/marcaciones-tiempo-real'
          element={
            <>
              <PageTitle breadcrumbs={breadcrumbs}>Planilla de Asistencia: Marcaciones en Tiempo Real</PageTitle>
              <PlanillaViewTransition>
                <MarcacionesTiempoRealPage />
              </PlanillaViewTransition>
            </>
          }
        />        <Route
          path='/resultados-diarios'
          element={
            <>
              <PageTitle breadcrumbs={breadcrumbs}>Planilla de Asistencia: Resultados Diarios</PageTitle>
              <PlanillaViewTransition>
                <ResultadosDiariosPage />
              </PlanillaViewTransition>
            </>
          }
        />
        <Route
          path='/resultados-mensuales'
          element={
            <>
              <PageTitle breadcrumbs={breadcrumbs}>Planilla de Asistencia: Resultado Mensual</PageTitle>
              <PlanillaViewTransition>
                <ResultadosMensualesPage />
              </PlanillaViewTransition>
            </>
          }
        />
        <Route
          path='/bono-refrigerio'
          element={
            <>
              <PageTitle breadcrumbs={breadcrumbs}>Planilla de Asistencia: Bono Refrigerio</PageTitle>
              <PlanillaViewTransition>
                <BonoRefrigerioPage />
              </PlanillaViewTransition>
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/planilla-asistencia/importaciones' />} />
    </Routes>
  )
}

export default PlanillaAsistenciaPage
