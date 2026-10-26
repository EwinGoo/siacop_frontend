import {handleAuthError} from '../../../services/axiosClient'
import {AuthModel} from './_models'

const AUTH_LOCAL_STORAGE_KEY = 'kt-auth-react-v'
// const getAuth = (): AuthModel | undefined => {
//   if (!localStorage) {
//     return
//   }

//   const lsValue: string | null = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY)
//   if (!lsValue) {
//     return
//   }

//   try {
//     const auth: AuthModel = JSON.parse(lsValue) as AuthModel
//     if (auth) {
//       // You can easily check auth_token expiration also
//       return auth
//     }
//   } catch (error) {
//     console.error('AUTH LOCAL STORAGE PARSE ERROR', error)
//   }
// }

const getAuth = (): AuthModel | undefined => {
  // En este modelo, no necesitamos almacenar realmente el token
  // porque usamos cookies de sesión
  return {
    api_token: 'session-based',
    refreshToken: undefined,
  }
}

const setAuth = (auth: AuthModel) => {
  // if (!localStorage) {
  //   return
  // }
  // try {
  //   const lsValue = JSON.stringify(auth)
  //   localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, lsValue)
  // } catch (error) {
  //   console.error('AUTH LOCAL STORAGE SAVE ERROR', error)
  // }
}

const removeAuth = () => {
  if (!localStorage) {
    return
  }

  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY)
  } catch (error) {
    console.error('AUTH LOCAL STORAGE REMOVE ERROR', error)
  }
}

export function setupAxios(axios: any) {
  axios.defaults.headers.Accept = 'application/json'
  axios.defaults.withCredentials = true // IMPORTANTE para enviar cookies
  axios.interceptors.response.use((response: unknown) => response, handleAuthError)
  axios.interceptors.request.use(
    (config: any) => {
      // const auth = getAuth()
      // if (auth && auth.api_token) {
      //   config.headers.Authorization = `Bearer ${auth.api_token}`
      // }

      return config
    },
    (err: any) => Promise.reject(err)
  )
}

export {getAuth, setAuth, removeAuth, AUTH_LOCAL_STORAGE_KEY}
