import axios from 'axios'
// import {toast} from 'react-toastify'

const API_URL = process.env.REACT_APP_API_URL
// Crear instancia de Axios
const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_THEME_API_URL,
  withCredentials: true,
})

// Interceptor de respuesta para manejar errores globales
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    // console.log(error.response);

    if (status === 401) {
      //   toast.error('Sesión expirada. Por favor inicia sesión nuevamente.')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default axiosClient
