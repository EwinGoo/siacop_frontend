import {NavLink} from 'react-router-dom'

const links = [
  {to: '/apps/planilla-asistencia/importaciones', label: 'Importaciones', icon: 'bi-upload'},
  {to: '/apps/planilla-asistencia/procesos', label: 'Procesos', icon: 'bi-diagram-3'},
  {to: '/apps/planilla-asistencia/marcaciones-tiempo-real', label: 'Marcaciones', icon: 'bi-broadcast-pin'},
  {to: '/apps/planilla-asistencia/resultados-diarios', label: 'Resultados diarios', icon: 'bi-calendar3'},
]

const PlanillaModuleNav = () => {
  return (
    <div className='card mb-5'>
      <div className='card-body py-4'>
        <div className='d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-4'>
          <div className='flex-shrink-0'>
            <div className='text-gray-900 fw-bolder fs-5 mb-1'>Motor de Planilla de Asistencia</div>
            <div className='text-muted fs-7'>
              Flujo operativo: importar, procesar, auditar y consolidar resultados mensuales.
            </div>
          </div>
          <div className='d-flex flex-wrap justify-content-xl-end gap-2 flex-grow-1 ms-xl-5'>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({isActive}) =>
                  `btn btn-sm px-3 py-2 ${isActive ? 'btn-primary' : 'btn-light-primary'}`
                }
              >
                <i className={`bi ${link.icon} me-2`} />
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export {PlanillaModuleNav}
