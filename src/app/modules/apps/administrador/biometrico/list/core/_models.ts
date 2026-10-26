import {ID, PaginationState} from 'src/_metronic/helpers'

export type DispositivoBiometrico = {
  id_biometrico?: ID
  id_usuario?: number
  nombre_dispositivo?: string
  direccion_ip?: string
  direccion_ip_privada?: string | null
  direccion_ip_dns?: string | null
  puerto?: number
  ubicacion?: string | null
  ubicacion_descripcion?: string | null
  modelo?: string | null
  firmware?: string | null
  serial?: string
  platform?: string | null
  fecha_hora?: string | null
  ultima_sincronizacion?: string | null
  estado?: string | null
  mac_address?: string | null
  clave_comunicacion?: string | null
  adms_key?: string | null
  metodo_ingesta_marcacion?: 'ADMS' | 'TCP_PULL' | 'MIXTO' | string
  fuente_principal_marcacion?: 'ADMS' | 'TCP_PULL' | string
  permite_consulta_bajo_demanda?: number
  job_nocturno_habilitado?: number
  ultima_sincronizacion_usuarios?: string | null
  ultima_sincronizacion_marcaciones?: string | null
  ultima_fecha_marcacion_sync?: string | null
  total_usuarios?: number
  total_usuarios_admin?: number
  total_usuarios_sin_persona?: number
  estado_sincronizacion?: {
    fuente_principal?: string | null
    metodo_ingesta?: string | null
    consulta_bajo_demanda_habilitada?: boolean
    job_nocturno_habilitado?: boolean
    ultima_sincronizacion_usuarios?: string | null
    ultima_sincronizacion_marcaciones?: string | null
    ultima_fecha_marcacion_sync?: string | null
    usa_adms_como_principal?: boolean
    usa_tcp_pull_como_principal?: boolean
    usa_tcp_pull_como_respaldo?: boolean
  } | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  // Campo adicional del JOIN con usuarios
  usuario?: string
}

// Tipo genérico para respuestas del backend
export type BackendResponse<T> = {
  status: number
  error: boolean
  message: string
  data: T
}

// Respuesta del Backend para DispositivoBiometrico
export type DispositivoBiometricoBackendResponse = {
  status: number
  error: boolean
  message: string
  data: DispositivoBiometrico[]
  pagination?: PaginationState
}

// Tipo específico para el endpoint
export type DispositivoBiometricoBackendData = {
  data: DispositivoBiometrico[]
  payload?: {
    pagination?: PaginationState
    errors?: Record<string, string[]>
  }
}

// Respuesta del Frontend (Query)
export type DispositivoBiometricoQueryResponse = {
  data?: DispositivoBiometrico[]
  payload?: {
    message?: string
    errors?: Record<string, string[]>
    pagination?: PaginationState
  }
}

export type ZktecoLoginResponse = {
  success: boolean
  data: any // aquí lo tipas según lo que devuelva tu backend
  message?: string
  session_status: any
}

export type LogoutResponse = {
  success: boolean
  message: string
  session_cleared: boolean
  timestamp: string
  warning?: string
}

export type DeviceUser = {
  uid: number
  department: string
  id_number: string
  name: string
  card: string
  group: string
  privilege: string
  edit_url: string
}

export type DeviceUsersResponse = {
  success: boolean
  data: DeviceUser[]
  count: number
  timestamp: string
}

export type DeviceInfo = {
  device_name: string
  serial_number: string
  produce_date: string
  ip_address: string
  user_capacity: string
  transaction_capacity: string
  finger_capacity: string
  lock: string
  rf_card: string
  short_message_management: string
  usb_disk: string
  usb_client: string
  remote_identification_server: string
}

export type DeviceInfoResponse = {
  success: boolean
  data: DeviceInfo
  timestamp: string
}

export type BiometricoDispositivoUsuario = {
  id_biometrico_dispositivo_usuario?: ID
  id_biometrico_dispositivo?: ID
  id_persona?: number | null
  user_id_biometrico?: string
  user_id?: string
  pin?: string | null
  nombre_en_dispositivo?: string
  password?: string | null
  privilegio?: number
  grupo?: string | null
  tarjeta_rfid?: string | null
  activo?: number
  fecha_inicio?: string | null
  fecha_fin?: string | null
  timezone?: string | null
  sincronizado?: number
  metadatos?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type LocalBiometricoUsersResponse = {
  dispositivo: DispositivoBiometrico
  usuarios: BiometricoDispositivoUsuario[]
}

export type SyncUsuariosResponse = {
  dispositivo: {
    id_biometrico_dispositivo: number
    serial: string
    nombre: string
  }
  total_recibidos: number
  insertados: number
  actualizados: number
  vinculados_persona: number
  pendientes_conciliacion: number
  errores: number
  items: Array<Record<string, any>>
}

export type SyncMarcacionesResponse = {
  fecha_desde: string
  fecha_hasta: string
  total_dispositivos: number
  dispositivos_ok: number
  dispositivos_error: number
  raw_insertadas: number
  raw_duplicadas: number
  normalizadas_insertadas: number
  normalizadas_duplicadas: number
  pendientes: number
  errores_items: number
  items: Array<Record<string, any>>
}

export type DeviceTimeResponse = {
  status: string
  message: string
  serial_detectado?: string
  ip?: string
  device_time?: string
  server_time?: string
  diff_seconds?: number
  diff_minutes?: number
}

export type DeviceTimeSyncResponse = {
  status: string
  message: string
  serial_detectado?: string
  ip?: string
  before_device_time?: string
  after_device_time?: string
  server_time?: string
  sync_time?: string
  diff_seconds?: number
  diff_minutes?: number
}

export type BiometricoEvento = {
  id: number
  id_biometrico_dispositivo?: number | null
  dispositivo_serial: string
  tipo_evento: string
  comando_id?: number | null
  descripcion?: string | null
  datos_adicionales?: string | null
  nivel: 'info' | 'warning' | 'error' | 'debug' | string
  ip_origen?: string | null
  user_agent?: string | null
  origen?: string | null
  estado?: string | null
  created_at?: string | null
}

export type BiometricoEventosResponse = {
  dispositivo: {
    id_biometrico_dispositivo: number
    serial: string
    nombre: string
  }
  items: BiometricoEvento[]
}

// Valores iniciales para un formulario
export const initialDispositivoBiometrico: DispositivoBiometrico = {
  id_usuario: 9972,
  nombre_dispositivo: '',
  direccion_ip: '',
  direccion_ip_privada: '',
  direccion_ip_dns: '',
  puerto: 4370,
  ubicacion: '',
  ubicacion_descripcion: '',
  modelo: '',
  firmware: '',
  mac_address: '',
  clave_comunicacion: '0',
  adms_key: '',
  metodo_ingesta_marcacion: 'TCP_PULL',
  fuente_principal_marcacion: 'TCP_PULL',
  permite_consulta_bajo_demanda: 1,
  job_nocturno_habilitado: 1,
  serial: '',
  platform: '',
  fecha_hora: null,
  ultima_sincronizacion: null,
  ultima_sincronizacion_usuarios: null,
  ultima_sincronizacion_marcaciones: null,
  ultima_fecha_marcacion_sync: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
}
