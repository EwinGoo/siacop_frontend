// roles/permissions.ts
export const PERMISSIONS = {
  // Permisos por módulo
  ASISTENCIA_PERMISO: {
    VIEW: 'asistencia_permiso.view',
    CREATE: 'asistencia_permiso.create',
    EDIT: 'asistencia_permiso.edit',
    DELETE: 'asistencia_permiso.delete',
  },
  DECLARATORIA_COMISION: {
    VIEW: 'declaratoria_comision.view',
    CREATE: 'declaratoria_comision.create',
    EDIT: 'declaratoria_comision.edit',
    DELETE: 'declaratoria_comision.delete',
  },
  TIPO_PERMISO: {
    VIEW: 'tipo_permiso.view',
    MANAGE: 'tipo_permiso.manage',
  },
  FERIADO_ASUETO: {
    VIEW: 'feriado_asueto.view',
    MANAGE: 'feriado_asueto.manage',
  },
  COMISION: {
    VIEW_FULL_ACCESS: 'comision.view_full_access', // Nuevo permiso específico
    VIEW: 'comision.view',
    CREATE: 'comision.create',
    EDIT: 'comision.edit',
    DELETE: 'comision.delete',
  },
  GESTION_QR: {
    VIEW: 'gestion_qr.view',
  },
  VACACION: {
    VIEW: 'vacacion.view',
  },
  GUARDIA_SEGURIDAD: {
    VIEW:   'guardia_seguridad.view',
    MANAGE: 'guardia_seguridad.manage',
  },
  PLANILLA_ASISTENCIA: {
    VIEW: 'planilla_asistencia.view',
    IMPORT: 'planilla_asistencia.import',
    CREATE_PROCESS: 'planilla_asistencia.create_process',
    EXECUTE_PROCESS: 'planilla_asistencia.execute_process',
    REVIEW: 'planilla_asistencia.review',
  },
} as const

export type Permission =
  | typeof PERMISSIONS.ASISTENCIA_PERMISO[keyof typeof PERMISSIONS.ASISTENCIA_PERMISO]
  | typeof PERMISSIONS.DECLARATORIA_COMISION[keyof typeof PERMISSIONS.DECLARATORIA_COMISION]
  | typeof PERMISSIONS.TIPO_PERMISO[keyof typeof PERMISSIONS.TIPO_PERMISO]
  | typeof PERMISSIONS.FERIADO_ASUETO[keyof typeof PERMISSIONS.FERIADO_ASUETO]
  | typeof PERMISSIONS.COMISION[keyof typeof PERMISSIONS.COMISION]
  | typeof PERMISSIONS.GESTION_QR[keyof typeof PERMISSIONS.GESTION_QR]
  | typeof PERMISSIONS.VACACION[keyof typeof PERMISSIONS.VACACION]
  | typeof PERMISSIONS.GUARDIA_SEGURIDAD[keyof typeof PERMISSIONS.GUARDIA_SEGURIDAD]
  | typeof PERMISSIONS.PLANILLA_ASISTENCIA[keyof typeof PERMISSIONS.PLANILLA_ASISTENCIA]
