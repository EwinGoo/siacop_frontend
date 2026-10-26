import * as Yup from 'yup'

const normalizeDate = (value: string | Date): Date => {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const countBusinessDaysInclusive = (start: string | Date, end: string | Date): number => {
  const startDate = normalizeDate(start)
  const endDate = normalizeDate(end)

  let businessDays = 0
  const current = new Date(startDate)

  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays += 1
    }
    current.setDate(current.getDate() + 1)
  }

  return businessDays
}

// export const asistenciaPermisoSchema = ({isAdmin = false}: {isAdmin: boolean}) =>
export const asistenciaPermisoSchema = ({
  isAdmin,
  limiteDias,
}: {
  isAdmin: boolean
  limiteDias?: number | null
}) => {
  return Yup.object().shape({
    id_persona: Yup.number().when([], {
      is: () => isAdmin,
      then: (schema) => schema.required('El solicitante es requerido'),
      otherwise: (schema) => schema.notRequired(),
    }),
    id_tipo_permiso: Yup.number().required('Tipo de permiso es requerido'),
    fecha_inicio_permiso: Yup.date().required('Fecha de inicio es requerida'),
    fecha_fin_permiso: Yup.date()
      .required('Fecha de fin es requerida')
      .min(Yup.ref('fecha_inicio_permiso'), 'La fecha fin no puede ser anterior a la fecha inicio')
      .test(
        'limite-dias',
        ({value, path, parent}) => {
          if (!limiteDias) return '' // si no hay límite configurado, no mostramos error
          return `La duración del permiso no puede exceder ${limiteDias} días`
        },
        function (value) {
          if (!limiteDias) return true // sin límite, validación pasa
          if (!value || !this.parent.fecha_inicio_permiso) return true

          const businessDays = countBusinessDaysInclusive(this.parent.fecha_inicio_permiso, value)
          return businessDays <= limiteDias
        }
      ),
  })
}
