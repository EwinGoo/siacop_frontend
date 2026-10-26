import axios, { AxiosResponse } from 'axios';
import { ID, Response } from '../../../../../../../../_metronic/helpers';
import { TipoPermiso, TipoPermisoQueryResponse, BackendResponse, TipoPermisoBackendData } from './_models';
import { API_ROUTES } from 'src/app/config/apiRoutes';
import axiosClient from 'src/app/services/axiosClient';
import { ValidationError } from 'src/app/utils/httpErrors';

export const TIPO_PERMISO_URL = API_ROUTES.CONTROL_PERSONAL + '/tipos-permiso'

const getTiposPermiso = (query: string): Promise<TipoPermisoQueryResponse> => {
  return axios
    .get<BackendResponse<TipoPermisoBackendData>>(`${TIPO_PERMISO_URL}?${query}`)
    .then((response) => {
      const backendData = response.data.data;
      
      if (!backendData?.data || !Array.isArray(backendData.data)) {
        throw new Error('Estructura de datos inválida');
      }

      return {
        data: backendData.data, // Array de tipos de permiso
        payload: {
          message: response.data.message,
          pagination: backendData.payload?.pagination
        }
      };
    })
    .catch((error) => {
      console.error('Error fetching tipos de permiso:', error);
      return {
        data: [],
        payload: {
          message: 'Error al obtener tipos de permiso',
          errors: { server: [error.message] }
        }
      };
    });
};

const getTipoPermisoById = async (id: ID): Promise<TipoPermiso> => {
  const response = await axiosClient.get<BackendResponse<TipoPermiso>>(`${TIPO_PERMISO_URL}/${id}`)
  const data = response.data

  if (data.error) {
    throw new Error(data.message || 'Error desconocido al obtener la comisión')
  }

  if (!data.data) {
    throw new Error('Comisión no encontrada')
  }

  return data.data
}

const createTipoPermiso = async (comision: TipoPermiso): Promise<TipoPermiso> => {
  try {
    const response = await axiosClient.post(TIPO_PERMISO_URL, comision)
    return response.data.data
  } catch (error: any) {
    const status = error?.response?.status
    const validationErrors =
      error?.response?.data?.validation_errors || error?.response?.data?.data || {}
    const message = error?.response?.data?.message || 'Ocurrió un error'

    if (status === 400 || status === 422) {
      throw new ValidationError(validationErrors, message)
    }

    throw new Error(message)  
  }
}

const updateTipoPermiso = async (tipoPermiso: TipoPermiso): Promise<TipoPermiso> => {
  try {
    const response = await axiosClient.put(`${TIPO_PERMISO_URL}/${tipoPermiso.id_tipo_permiso}`, tipoPermiso)
    return response.data.data
  } catch (error: any) {
    if (error.response?.status === 422 || error.response?.status === 400) {
      const validationErrors =
        error.response.data.validation_errors || error.response.data.data || {}

      throw new ValidationError(
        validationErrors,
        error.response.data.message
      )
    }
    throw error 
  }
}

const deleteTipoPermiso = (tipoPermisoId: ID): Promise<void> => {
  return axios.delete(`${TIPO_PERMISO_URL}/${tipoPermisoId}`).then(() => {});
};

const deleteSelectedTiposPermiso = (tipoPermisoIds: Array<ID>): Promise<void> => {
  const requests = tipoPermisoIds.map((id) => axios.delete(`${TIPO_PERMISO_URL}/${id}`));
  return axios.all(requests).then(() => {});
};

const toggleTipoPermisoStatus = (id: ID): Promise<TipoPermiso | undefined> => {
  return axios
    .patch(`${TIPO_PERMISO_URL}/${id}/toggle-status`)
    .then((response: AxiosResponse<Response<TipoPermiso>>) => response.data)
    .then((response: Response<TipoPermiso>) => response.data);
};

export {
  getTiposPermiso,
  deleteTipoPermiso,
  deleteSelectedTiposPermiso,
  getTipoPermisoById,
  createTipoPermiso,
  updateTipoPermiso,
  toggleTipoPermisoStatus
};
