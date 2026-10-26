import {Navigate, NavLink, Route, Routes} from 'react-router-dom'
import {KTIcon} from '../../../../../_metronic/helpers'
import {PageLink, PageTitle} from '../../../../../_metronic/layout/core'
import HorarioTipoPage from './HorarioTipoPage'
import HorarioPage from './HorarioPage'
import HorarioAlternoPage from './HorarioAlternoPage'

const breadcrumbs: Array<PageLink> = [
  {
    title: 'Control Personal',
    path: '/apps/horarios/tipos',
    isSeparator: false,
    isActive: false,
  },
]

const HorariosPage = () => (
  <Routes>
    <Route index element={<Navigate to='tipos' replace />} />
    <Route
      path='tipos'
      element={
        <>
          <PageTitle breadcrumbs={breadcrumbs}>Horario Tipo</PageTitle>
          <HorarioTabs />
          <HorarioTipoPage />
        </>
      }
    />
    <Route
      path='horarios'
      element={
        <>
          <PageTitle breadcrumbs={breadcrumbs}>Horario</PageTitle>
          <HorarioTabs />
          <HorarioPage />
        </>
      }
    />
    <Route
      path='alternos'
      element={
        <>
          <PageTitle breadcrumbs={breadcrumbs}>Horario Alterno</PageTitle>
          <HorarioTabs />
          <HorarioAlternoPage />
        </>
      }
    />
    <Route path='*' element={<Navigate to='tipos' replace />} />
  </Routes>
)

const HorarioTabs = () => {
  const tabs = [
    {to: '/apps/horarios/tipos', label: 'Horario tipo', icon: 'calendar'},
    {to: '/apps/horarios/horarios', label: 'Horario', icon: 'time'},
    {to: '/apps/horarios/alternos', label: 'Horario alternativo', icon: 'calendar-2'},
  ]

  return (
    <div className='border-bottom mb-6'>
      <div className='nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-6 fw-bold flex-nowrap overflow-auto'>
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({isActive}) =>
              `nav-link text-active-primary me-8 py-4 d-flex align-items-center gap-2 ${
                isActive ? 'active text-primary' : 'text-gray-500'
              }`
            }
          >
            <KTIcon iconName={tab.icon} className='fs-3' />
            <span className='text-nowrap'>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default HorariosPage