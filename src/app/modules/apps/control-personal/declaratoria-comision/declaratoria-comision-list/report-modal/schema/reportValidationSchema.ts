import * as Yup from 'yup'

export const reportValidationSchema = Yup.object().shape({
  fechaInicio: Yup.date()
    .required('La fecha de inicio es requerida')
    .test('fecha-inicio-valida', 'La fecha de inicio no puede ser mayor a la fecha de fin', function (value) {
      const {fechaFin} = this.parent
      if (!value || !fechaFin) return true
      return new Date(value) <= new Date(fechaFin)
    }),
  fechaFin: Yup.date()
    .required('La fecha de fin es requerida')
    .test('fecha-fin-valida', 'La fecha de fin no puede ser menor a la fecha de inicio', function (value) {
      const {fechaInicio} = this.parent
      if (!value || !fechaInicio) return true
      return new Date(value) >= new Date(fechaInicio)
    })
    .test('rango-maximo', 'El rango de fechas no puede ser mayor a 1 año', function (value) {
      const {fechaInicio} = this.parent
      if (!value || !fechaInicio) return true
      const inicio = new Date(fechaInicio)
      const fin = new Date(value)
      const diffDays = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 365
    }),
  estado: Yup.string().required('Debe seleccionar un estado'),
  tipoViatico: Yup.string().required('Debe seleccionar un tipo de viático'),
})