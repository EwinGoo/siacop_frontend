/* eslint-disable react-hooks/exhaustive-deps */
import {FC, useContext, useEffect, useMemo, useState} from 'react'
import {useQuery} from 'react-query'
import {
  PaginationState,
  WithChildren,
  createResponseContext,
  initialQueryResponse,
  initialQueryState,
  stringifyRequestQuery,
} from 'src/_metronic/helpers'
import {AsignacionAdministrativa} from '../core/_models'
import {getAsignacionesAdministrativas} from '../core/_requests'
import {useQueryRequest} from './QueryRequestProvider'

const ASIGNACIONES_ADMINISTRATIVAS_QUERY_KEY = 'asignacion-administrativo-list'

const QueryResponseContext = createResponseContext<AsignacionAdministrativa>(initialQueryResponse)

const QueryResponseProvider: FC<WithChildren> = ({children}) => {
  const {state} = useQueryRequest()
  const [query, setQuery] = useState<string>(stringifyRequestQuery(state))
  const updatedQuery = useMemo(() => stringifyRequestQuery(state), [state])

  useEffect(() => {
    if (query !== updatedQuery) {
      setQuery(updatedQuery)
    }
  }, [updatedQuery])

  const {
    isFetching,
    refetch,
    data: response,
  } = useQuery(
    `${ASIGNACIONES_ADMINISTRATIVAS_QUERY_KEY}-${query}`,
    () => getAsignacionesAdministrativas(query),
    {cacheTime: 0, keepPreviousData: true, refetchOnWindowFocus: false}
  )

  return (
    <QueryResponseContext.Provider value={{isLoading: isFetching, refetch, response, query}}>
      {children}
    </QueryResponseContext.Provider>
  )
}

const useQueryResponse = () => useContext(QueryResponseContext)

const useQueryResponseData = () => {
  const {response} = useQueryResponse()
  return response?.data || []
}

const useQueryResponsePagination = (): PaginationState => {
  const {response} = useQueryResponse()

  return (
    response?.payload?.pagination || {
      links: [],
      ...initialQueryState,
    }
  )
}

const useQueryResponseLoading = (): boolean => {
  const {isLoading} = useQueryResponse()
  return isLoading
}

export {
  ASIGNACIONES_ADMINISTRATIVAS_QUERY_KEY,
  QueryResponseProvider,
  useQueryResponse,
  useQueryResponseData,
  useQueryResponsePagination,
  useQueryResponseLoading,
}
