import axios, {AxiosResponse} from 'axios'
import {ID, Response} from 'src/_metronic/helpers'
import {
  DispositivoBiometrico,
  DispositivoBiometricoQueryResponse,
  DispositivoBiometricoBackendData,
  ZktecoLoginResponse,
  LogoutResponse,
  DeviceUsersResponse,
  DeviceInfoResponse,
  DeviceUser,
  BiometricoEventosResponse,
  LocalBiometricoUsersResponse,
  SyncMarcacionesResponse,
  SyncUsuariosResponse,
  DeviceTimeResponse,
  DeviceTimeSyncResponse,
} from './_models'
import {API_ROUTES} from 'src/app/config/apiRoutes'
import axiosClient from 'src/app/services/axiosClient'

const BIOMETRICO_URL = API_ROUTES.ADMINISTRADOR + '/biometrico'
const ZKTECO_URL = API_ROUTES.ADMINISTRADOR + '/zkteco'

type ApiSiacopResponse<T> = {
  status: 'success' | 'error'
  data: T
  message: string
  timestamp: string
}

const getDispositivosBiometricos = (query: string): Promise<DispositivoBiometricoQueryResponse> => {
  return axiosClient
    .get<ApiSiacopResponse<DispositivoBiometricoBackendData>>(`${BIOMETRICO_URL}?${query}`)
    .then((response) => {
      const backendData = response.data.data

      if (!backendData?.data || !Array.isArray(backendData.data)) {
        throw new Error('Estructura de datos inválida')
      }

      return {
        data: backendData.data, // Array de dispositivos biométricos
        payload: {
          message: response.data.message,
          pagination: backendData.payload?.pagination,
        },
      }
    })
    .catch((error) => {
      console.error('Error fetching dispositivos biométricos:', error)
      return {
        data: [],
        payload: {
          message: 'Error al obtener dispositivos biométricos',
          errors: {server: [error.message]},
        },
      }
    })
}

const getDispositivoBiometricoById = (id: ID): Promise<DispositivoBiometrico | undefined> => {
  return axiosClient
    .get(`${BIOMETRICO_URL}/${id}`)
    .then((response: AxiosResponse<ApiSiacopResponse<DispositivoBiometrico>>) => response.data.data)
}

const getDispositivoBiometricoBySerial = (
  serial: string
): Promise<DispositivoBiometrico | undefined> => {
  return axiosClient
    .get(`${BIOMETRICO_URL}/serial/${serial}`)
    .then((response: AxiosResponse<ApiSiacopResponse<DispositivoBiometrico>>) => response.data.data)
}

const getBiometricoUsuariosLocales = (id: ID): Promise<LocalBiometricoUsersResponse> => {
  return axiosClient
    .get(`${BIOMETRICO_URL}/${id}/usuarios`)
    .then((response: AxiosResponse<ApiSiacopResponse<LocalBiometricoUsersResponse>>) => response.data.data)
}

const getBiometricoEventos = (id: ID, limit = 30): Promise<BiometricoEventosResponse> => {
  return axiosClient
    .get(`${BIOMETRICO_URL}/${id}/eventos?limit=${limit}`)
    .then((response: AxiosResponse<ApiSiacopResponse<BiometricoEventosResponse>>) => response.data.data)
}

const syncBiometricoUsuarios = (id: ID): Promise<SyncUsuariosResponse> => {
  return axiosClient
    .post(`${BIOMETRICO_URL}/${id}/sincronizar-usuarios`)
    .then((response: AxiosResponse<ApiSiacopResponse<SyncUsuariosResponse>>) => response.data.data)
}

const syncBiometricoMarcaciones = (
  id: ID,
  payload: {fecha_desde: string; fecha_hasta: string}
): Promise<SyncMarcacionesResponse> => {
  return axiosClient
    .post(`${BIOMETRICO_URL}/${id}/sincronizar-marcaciones`, payload)
    .then((response: AxiosResponse<ApiSiacopResponse<SyncMarcacionesResponse>>) => response.data.data)
}

const createDispositivoBiometrico = (
  dispositivo: DispositivoBiometrico
): Promise<DispositivoBiometrico | undefined> => {
  return axiosClient
    .post(BIOMETRICO_URL, dispositivo)
    .then((response: AxiosResponse<ApiSiacopResponse<DispositivoBiometrico>>) => response.data.data)
}

const updateDispositivoBiometrico = (
  dispositivo: DispositivoBiometrico
): Promise<DispositivoBiometrico | undefined> => {
  return axiosClient
    .put(`${BIOMETRICO_URL}/${dispositivo.id_biometrico}`, dispositivo)
    .then((response: AxiosResponse<ApiSiacopResponse<DispositivoBiometrico>>) => response.data.data)
}

const deleteDispositivoBiometrico = (dispositivoId: ID): Promise<void> => {
  return axiosClient.delete(`${BIOMETRICO_URL}/${dispositivoId}`).then(() => {})
}

const deleteSelectedDispositivosBiometricos = (dispositivoIds: Array<ID>): Promise<void> => {
  const requests = dispositivoIds.map((id) => axiosClient.delete(`${BIOMETRICO_URL}/${id}`))
  return axios.all(requests).then(() => {})
}

const testDeviceConnection = (id: ID): Promise<{status: string; message: string} | undefined> => {
  return axiosClient
    .get<ApiSiacopResponse<{status: string; message: string}>>(`${ZKTECO_URL}/${id}/ping`)
    .then((response) => response.data.data)
}

const testDeviceVoice = (
  id: ID,
  payload: {voice_index?: number} = {}
): Promise<{status: string; message: string; voice_index?: number} | undefined> => {
  return axiosClient
    .post<ApiSiacopResponse<{status: string; message: string; voice_index?: number}>>(
      `${BIOMETRICO_URL}/${id}/sonar`,
      payload
    )
    .then((response) => response.data.data)
}

const getDeviceTime = (id: ID): Promise<DeviceTimeResponse | undefined> => {
  return axiosClient
    .get<ApiSiacopResponse<DeviceTimeResponse>>(`${BIOMETRICO_URL}/${id}/hora-actual`)
    .then((response) => response.data.data)
}

const syncDeviceTime = (id: ID): Promise<DeviceTimeSyncResponse | undefined> => {
  return axiosClient
    .post<ApiSiacopResponse<DeviceTimeSyncResponse>>(`${BIOMETRICO_URL}/${id}/sincronizar-hora`)
    .then((response) => response.data.data)
}

const downloadBiometricoMarcacionesDat = async (
  id: ID
): Promise<{blob: Blob; filename: string}> => {
  const response = await axiosClient.get(`${BIOMETRICO_URL}/${id}/descargar-marcaciones-dat`, {
    responseType: 'blob',
  })

  const disposition = String(response.headers['content-disposition'] ?? '')
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/i)
  const filename = filenameMatch?.[1] || `biometrico_${id}_attlog.dat`

  return {
    blob: response.data as Blob,
    filename,
  }
}

const loginBiometrico = (
  device_ip: string,
  username: string,
  password: string
): Promise<ZktecoLoginResponse> => {
  return axiosClient
    .post<ApiSiacopResponse<{authenticated: boolean; session_status: any; device_info?: any}>>(`${ZKTECO_URL}/login`, {
      device_ip, // 👈 enviamos la IP del dispositivo
      username,
      password,
    })
    .then((res) => ({
      success: res.data.status === 'success',
      data: res.data.data,
      message: res.data.message,
      session_status: res.data.data?.session_status ?? null,
    }))
}

const logoutBiometrico = async (): Promise<LogoutResponse> => {
  const {data} = await axiosClient.post<ApiSiacopResponse<{session_cleared: boolean}>>(`${ZKTECO_URL}/logout`)
  return {
    success: data.status === 'success',
    message: data.message,
    session_cleared: data.data?.session_cleared ?? true,
    timestamp: data.timestamp,
  }
}

// Obtener usuarios del dispositivo
const getDeviceUsers = async (): Promise<DeviceUsersResponse> => {
  try {
    const {data} = await axiosClient.get<ApiSiacopResponse<{count: number; users: DeviceUser[]}>>(`${ZKTECO_URL}/users`)
    return {
      success: data.status === 'success',
      data: data.data?.users ?? [],
      count: data.data?.count ?? 0,
      timestamp: data.timestamp,
    }
  } catch (error: any) {
    console.error('Error al obtener usuarios del dispositivo:', error)
    throw new Error(error.response?.data?.message || 'Error al obtener usuarios del dispositivo')
  }
}

// Obtener información del dispositivo
const getDeviceInfo = async (): Promise<DeviceInfoResponse> => {
  try {
    const {data} = await axiosClient.get<ApiSiacopResponse<DeviceInfoResponse['data']>>(`${ZKTECO_URL}/device-info`)
    return {
      success: data.status === 'success',
      data: data.data,
      timestamp: data.timestamp,
    }
  } catch (error: any) {
    console.error('Error al obtener información del dispositivo:', error)
    throw new Error(error.response?.data?.message || 'Error al obtener información del dispositivo')
  }
}

// Obtener un usuario específico del dispositivo
const getDeviceUser = async (uid: number): Promise<{success: boolean; data: DeviceUser}> => {
  const {data} = await axiosClient.get<ApiSiacopResponse<DeviceUser>>(
    `${ZKTECO_URL}/users/${uid}`
  )
  return {
    success: data.status === 'success',
    data: data.data,
  }
}

// Verificar si la sesión con el dispositivo sigue activa
const getSessionStatus = async (): Promise<{
  success: boolean
  authenticated: boolean
  session: any | null
}> => {
  const {data} = await axiosClient.get<ApiSiacopResponse<{authenticated: boolean; session: any | null}>>(`${ZKTECO_URL}/session-status`)
  return {
    success: data.status === 'success',
    authenticated: data.data?.authenticated ?? false,
    session: data.data?.session ?? null,
  }
}

// Agregar usuario al dispositivo
const addDeviceUser = async (userData: {
  id_number: string
  name: string
  department_id?: number
  privilege_value?: number
  password?: string
  card?: string
}): Promise<{success: boolean; message: string}> => {
  const {data} = await axiosClient.post<ApiSiacopResponse<null>>(`${ZKTECO_URL}/users`, userData)
  return {
    success: data.status === 'success',
    message: data.message,
  }
}

// Eliminar usuarios del dispositivo (batch)
const deleteDeviceUsers = async (uids: number[]): Promise<{
  success: boolean
  message: string
  data: {success: number[]; errors: any[]; total: number}
}> => {
  const {data} = await axiosClient.post<ApiSiacopResponse<{success: number[]; errors: any[]; total: number}>>(`${ZKTECO_URL}/users/delete`, {uids})
  return {
    success: data.status === 'success',
    message: data.message,
    data: data.data,
  }
}

export {
  getDispositivosBiometricos,
  deleteDispositivoBiometrico,
  deleteSelectedDispositivosBiometricos,
  getDispositivoBiometricoById,
  getDispositivoBiometricoBySerial,
  getBiometricoUsuariosLocales,
  getBiometricoEventos,
  syncBiometricoUsuarios,
  syncBiometricoMarcaciones,
  createDispositivoBiometrico,
  updateDispositivoBiometrico,
  testDeviceConnection,
  testDeviceVoice,
  getDeviceTime,
  syncDeviceTime,
  downloadBiometricoMarcacionesDat,
  loginBiometrico,
  logoutBiometrico,
  getDeviceUsers,
  getDeviceInfo,
  getDeviceUser,
  getSessionStatus,
  addDeviceUser,
  deleteDeviceUsers,
}
