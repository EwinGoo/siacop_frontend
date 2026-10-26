import Tooltip from '@mui/material/Tooltip'
import {KTIcon} from 'src/_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {usePermissions} from 'src/app/modules/auth/hooks/usePermissions'

const ListToolbar = () => {
  const {openCreateModal} = useListView()
  const {guardiaSeguridad} = usePermissions()

  return (
    <div className='d-flex justify-content-end'>
      {guardiaSeguridad.canManage && (
        <Tooltip title='Crear un nuevo grupo de rotación' arrow placement='top'>
          <button type='button' className='btn btn-primary d-inline-flex align-items-center' onClick={openCreateModal}>
            <KTIcon iconName='plus' className='fs-2 me-1' />
            Nuevo Grupo
          </button>
        </Tooltip>
      )}
    </div>
  )
}

export {ListToolbar}
