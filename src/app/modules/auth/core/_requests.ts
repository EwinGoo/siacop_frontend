import axios from 'axios'
import {AuthModel, UserModel, UserCheckRequest} from './_models'

import {API_BASE_URL as API_URL} from '../../../config/apiRoutes'

export const GET_USER_BY_SESSION_URL = `${API_URL}/auth/check`
export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/auth/token`
export const LOGIN_URL = `/login`
export const REGISTER_URL = `${API_URL}/register`
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`

// Configura axios para enviar credenciales (cookies)
axios.defaults.withCredentials = true
// Server should return AuthModel
export function login(email: string, password: string) {
  // return axios.post<{data: AuthModel}>(LOGIN_URL, {

  return axios.post<AuthModel>(LOGIN_URL, {
    email,
    password,
  })
}

// Server should return AuthModel
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  })
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{result: boolean}>(REQUEST_PASSWORD_URL, {
    email,
  })
}

export function getUserByToken(token: string) {
  return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    api_token: token,
  })
}

export function getUserBySession() {
  return axios.get<UserCheckRequest>(GET_USER_BY_SESSION_URL, {
    timeout: 15000,
  })
}
