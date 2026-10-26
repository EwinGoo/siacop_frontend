import {useQuery} from 'react-query'
import {
  getAdministrativo,
  getAdministrativos,
  getCatalogos,
  getDocumentos,
  getExpediente,
} from './requests'
import {BusquedaAdministrativos, BusquedaDocumentos} from './types'

export const useCatalogos = () =>
  useQuery(['archivo-central', 'catalogos'], ({signal}) => getCatalogos(signal), {staleTime: 60000})
export const useAdministrativos = (filtros: BusquedaAdministrativos) =>
  useQuery(
    ['archivo-central', 'administrativos', filtros],
    ({signal}) => getAdministrativos(filtros, signal),
    {keepPreviousData: true}
  )
export const useAdministrativo = (id: number) =>
  useQuery(['archivo-central', 'persona', id], ({signal}) => getAdministrativo(id, signal))
export const useExpediente = (id: number, enabled: boolean) =>
  useQuery(['archivo-central', 'expediente', id], ({signal}) => getExpediente(id, signal), {
    enabled,
  })
export const useDocumentos = (id: number, filtros: BusquedaDocumentos) =>
  useQuery(
    ['archivo-central', 'documentos', id, filtros],
    ({signal}) => getDocumentos(id, filtros, signal),
    {keepPreviousData: true}
  )
