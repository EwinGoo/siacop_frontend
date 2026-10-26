import {FC} from 'react'
import {KTIcon} from '../../../../../../../../../_metronic/helpers'
import {AsistenciaPermiso} from '../../core/_models'
import Tooltip from '@mui/material/Tooltip'

type Props = {
  asistenciaPermiso: AsistenciaPermiso
}

const InfoCell: FC<Props> = ({asistenciaPermiso}) => {
  // Status badge classes
  return (
    <div className='d-flex align-items-center'>
      {/* Icon for permiso */}
      <Tooltip
        title="Solicitud de Permiso"
        arrow
        slotProps={{
          tooltip: {
            sx: {
              fontSize: 11,
            },
          },
        }}
      >
        <div className='symbol symbol-50px me-5'>
          <span className='symbol-label bg-light-primary'>
            <KTIcon
              iconName='profile-user'
              className='fs-2 text-primary'
            />
          </span>
        </div>
      </Tooltip>

      <div className='d-flex flex-column'>
        <p className='text-gray-800 text-hover-primary fw-bolder mb-1 fs-6 text-uppercase'>
          {asistenciaPermiso.tipo_permiso_nombre || 'Permiso sin descripción'}
        </p>
      </div>
    </div>
  )
}

export {InfoCell}
