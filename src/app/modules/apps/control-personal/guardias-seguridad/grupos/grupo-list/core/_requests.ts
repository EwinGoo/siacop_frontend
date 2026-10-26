import axios from 'axios'
import {ID} from '../../../../../../../../_metronic/helpers'
import {Grupo, GrupoMiembro, GrupoQueryResponse} from './_models'
import {API_ROUTES} from 'src/app/config/apiRoutes'

const BASE_URL = `${API_ROUTES.GUARDIAS}/grupos`

export const getGrupos = (query: string): Promise<GrupoQueryResponse> => {
  return axios
    .get(`${BASE_URL}?${query}`)
    .then((res) => ({
      data: res.data.data.data,
      payload: {
        message: res.data.message,
        pagination: res.data.data.payload?.pagination,
      },
    }))
    .catch(() => ({data: [], payload: {message: 'Error al obtener grupos'}}))
}

export const getGrupoById = (id: ID): Promise<Grupo | undefined> => {
  return axios.get(`${BASE_URL}/${id}`).then((res) => res.data.data)
}

export const createGrupo = (grupo: Grupo): Promise<Grupo | undefined> => {
  return axios.post(BASE_URL, grupo).then((res) => res.data.data)
}

export const updateGrupo = (grupo: Grupo): Promise<Grupo | undefined> => {
  return axios.put(`${BASE_URL}/${grupo.id_guardia_grupo}`, grupo).then((res) => res.data.data)
}

export const deleteGrupo = (id: ID): Promise<void> => {
  return axios.delete(`${BASE_URL}/${id}`).then(() => {})
}

export const getGruposDropdown = (): Promise<Grupo[]> => {
  return axios.get(`${BASE_URL}/dropdown`).then((res) => res.data.data)
}

export const agregarMiembro = (
  idGrupo: number,
  idPersona: number,
  idBloque?: number | null
): Promise<Grupo | undefined> => {
  return axios
    .post(`${BASE_URL}/${idGrupo}/miembros`, {id_persona: idPersona, id_guardia_bloque: idBloque})
    .then((res) => res.data.data)
}

export const actualizarMiembro = (
  idGrupo: number,
  idMiembro: number,
  idBloque: number | null
): Promise<Grupo | undefined> => {
  return axios
    .put(`${BASE_URL}/${idGrupo}/miembros/${idMiembro}`, {id_guardia_bloque: idBloque})
    .then((res) => res.data.data)
}

export const eliminarMiembro = (idGrupo: number, idMiembro: number): Promise<void> => {
  return axios.delete(`${BASE_URL}/${idGrupo}/miembros/${idMiembro}`).then(() => {})
}
