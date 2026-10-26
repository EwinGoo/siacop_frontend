import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

interface ShowErrorOptions {
  useSwal?: boolean // si es true, usa Swal, si no toast
  defaultTitle?: string
}

export const showAxiosError = (
  error: any,
  options: ShowErrorOptions = { useSwal: false, defaultTitle: 'Error inesperado' }
) => {
  const response = error?.response
  const defaultTitle = options.defaultTitle || 'Error inesperado'
  let title = defaultTitle
  let message = ''

  if (response?.data?.message) {
    title = response.data.message
  }

  if (response?.data?.validation_errors && typeof response.data.validation_errors === 'object') {
    const details = Object.values(response.data.validation_errors).join('\n')
    message += details
  } else if (response?.data?.errors && typeof response.data.errors === 'object') {
    const details = Object.values(response.data.errors).join('\n')
    message += details
  } else if (response?.data?.data && typeof response.data.data === 'object') {
    const details = Object.values(response.data.data).join('\n')
    message += details
  }

  if (!message) {
    message = error.message || 'Ha ocurrido un error inesperado'
  }

  if (options.useSwal) {
    Swal.fire({
      icon: 'error',
      title,
      html: message.includes('\n') ? message.split('\n').map(msg => `<p>${msg}</p>`).join('') : message,
      confirmButtonText: 'Entendido',
      customClass: {
        popup: 'swal2-border-radius',
        confirmButton : 'btn btn-danger'
      }
    })
  } else {
    toast.error(`${title}\n${message}`)
  }
}
