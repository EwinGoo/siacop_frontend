import axios, {AxiosResponse} from 'axios'
import {ID, Response} from '../../../../../../../../_metronic/helpers'
import {Bloque, BloqueQueryResponse} from './_models'
import {API_ROUTES} from 'src/app/config/apiRoutes'

const BASE_URL = `${API_ROUTES.GUARDIAS}/bloques`

const getBloques = (query: string): Promise<BloqueQueryResponse> => {
  return axios
    .get(`${BASE_URL}?${query}`)
    .then((res) => ({
      data: res.data.data.data,
      payload: {
        message: res.data.message,
        pagination: res.data.data.payload?.pagination,
      },
    }))
    .catch(() => ({data: [], payload: {message: 'Error al obtener bloques'}}))
}

const getBloqueById = (id: ID): Promise<Bloque | undefined> => {
  return axios
    .get(`${BASE_URL}/${id}`)
    .then((res: AxiosResponse<Response<Bloque>>) => res.data.data)
}

const createBloque = (bloque: Bloque): Promise<Bloque | undefined> => {
  return axios.post(BASE_URL, bloque).then((res) => res.data.data)
}

const updateBloque = (bloque: Bloque): Promise<Bloque | undefined> => {
  return axios.put(`${BASE_URL}/${bloque.id_guardia_bloque}`, bloque).then((res) => res.data.data)
}

const deleteBloque = (id: ID): Promise<void> => {
  return axios.delete(`${BASE_URL}/${id}`).then(() => {})
}

const getBloquesDropdown = (): Promise<Bloque[]> => {
  return axios.get(`${BASE_URL}/dropdown`).then((res) => res.data.data)
}

export {getBloques, getBloqueById, createBloque, updateBloque, deleteBloque, getBloquesDropdown}
