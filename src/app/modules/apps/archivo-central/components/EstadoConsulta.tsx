import {ARCHIVO_LOGIN_URL} from '../../../../config/apiRoutes'
import {ArchivoApiError} from '../core/requests'
import {ListLoading} from '../../../components/loading/ListLoading'

export const Cargando = () => <ListLoading overlay={false} />
export const ErrorConsulta = ({error, reintentar}: {error: unknown; reintentar?: () => void}) => (
  <div className='alert alert-danger' role='alert'>
    <p className='mb-2'>
      {error instanceof Error ? error.message : 'No se pudo completar la consulta.'}
    </p>
    {error instanceof ArchivoApiError && error.status === 401 ? (
      <a href={ARCHIVO_LOGIN_URL} className='btn btn-sm btn-light-danger'>
        Iniciar sesión
      </a>
    ) : (
      reintentar && (
        <button type='button' className='btn btn-sm btn-light-danger' onClick={reintentar}>
          Reintentar
        </button>
      )
    )}
  </div>
)
