import React, {useCallback, useState, useRef} from 'react'
import AsyncSelect from 'react-select/async'
import {debounce} from 'lodash'
import {useThemeMode} from 'src/_metronic/partials/layout/theme-mode/ThemeModeProvider'
import {ID} from 'src/_metronic/helpers'
import { useEffectiveTheme } from 'src/app/hooks/useEffectiveTheme'

interface OptionType {
  value: number
  label: string
  tipo_personal?: string
  id_asignacion_administrativo?: number | null
}

interface AsyncSelectFieldProps {
  value: OptionType | null
  onChange: (selected: OptionType | null) => void
  onBlur?: () => void
  fetchOptions: (input: string) => Promise<OptionType[]>
  placeholder?: string
  isInvalid?: boolean
}

const AsyncSelectField: React.FC<AsyncSelectFieldProps> = ({
  value,
  onChange,
  onBlur,
  fetchOptions,
  placeholder = 'Buscar...',
  isInvalid = false,
}) => {

  const {isDark} =  useEffectiveTheme()
  // Estados para control de peticiones
  const [isLoading, setIsLoading] = useState(false)
  const lastRequestRef = useRef<string>('')
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef<number>(0)

  const debouncedFetcher = useCallback(
    debounce(async (inputValue: string, callback: (options: OptionType[]) => void) => {
      // Verificar si es la misma búsqueda que ya se procesó
      if (lastRequestRef.current === inputValue) {
        return
      }

      try {
        setIsLoading(true)

        // Cancelar petición anterior si existe
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        // Crear nuevo AbortController para esta petición
        abortControllerRef.current = new AbortController()
        const currentRequestId = ++requestIdRef.current

        // Actualizar último término buscado
        lastRequestRef.current = inputValue

        const options = await fetchOptions(inputValue)

        // Verificar si esta petición sigue siendo relevante
        if (
          currentRequestId === requestIdRef.current &&
          !abortControllerRef.current.signal.aborted
        ) {
          // Forzar que el callback siempre reciba un array válido
          const validOptions = Array.isArray(options) ? options : []
          callback(validOptions)
        }
      } catch (error) {
        // Solo mostrar error si no fue cancelada la petición
        if (!abortControllerRef.current?.signal.aborted) {
          callback([])
        }
      } finally {
        setIsLoading(false)
      }
    }, 500),
    [fetchOptions]
  )

  const loadOptions = useCallback(
    (inputValue: string, callback: (options: OptionType[]) => void) => {
      if (inputValue.length < 2) {
        callback([])
        lastRequestRef.current = ''
        return
      }

      // Si el input cambió, resetear el último request para permitir nueva búsqueda
      if (lastRequestRef.current !== inputValue) {
        lastRequestRef.current = ''
      }
      debouncedFetcher(inputValue, (receivedOptions) => {
        callback(receivedOptions)
      })
    },
    [debouncedFetcher]
  )

  // Limpiar al desmontar componente
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      debouncedFetcher.cancel()
    }
  }, [debouncedFetcher])

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: isDark ? '#1e1e2d' : '#fff',
      borderColor: isInvalid ? '#f1416c' : isDark ? '#2D2D43' : '#ced4da',
      color: isDark ? '#fff' : '#000',
      // outline: 'none',
      // boxShadow: isInvalid ? 'none' : undefined
    }),
    input: (provided: any) => ({
      ...provided,
      color: isDark ? '#fff' : '#000',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: isDark ? '#fff' : '#000',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: isDark ? '#1e1e2d' : '#fff',
      color: isDark ? '#fff' : '#000',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? (isDark ? '#2a2a3c' : '#f0f0f0') : 'transparent',
      color: isDark ? '#fff' : '#000',
    }),
  }

  const noOptionsMessage = useCallback(
    ({inputValue}: {inputValue: string}) => {
      if (inputValue.length < 2) {
        return 'Escribe al menos 2 caracteres'
      }
      if (isLoading) {
        return 'Buscando...'
      }
      return 'No se encontraron resultados'
    },
    [isLoading]
  )

  const loadingMessage = useCallback(() => {
    return 'Buscando...'
  }, [])

  return (
    <>
      <AsyncSelect
        cacheOptions
        defaultOptions
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        loadOptions={loadOptions}
        noOptionsMessage={noOptionsMessage}
        loadingMessage={loadingMessage}
        styles={customStyles}
        isLoading={isLoading}
      />
    </>
  )
}

export default AsyncSelectField
