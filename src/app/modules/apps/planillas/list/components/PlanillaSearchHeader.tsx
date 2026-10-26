import { ReactNode, useEffect, useState } from 'react'
import { KTIcon, useDebounce } from 'src/_metronic/helpers'

type Props = {
  search: string
  placeholder: string
  onSearch: (value: string) => void
  onReload: () => void
  children?: ReactNode
}

export const PlanillaSearchHeader = ({
  search,
  placeholder,
  onSearch,
  onReload,
  children
}: Props) => {
  const [searchTerm, setSearchTerm] = useState(search)
  const debouncedSearchTerm = useDebounce(searchTerm, 150)

  useEffect(() => {
    setSearchTerm(search)
  }, [search])

  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      onSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, onSearch])

  return (
    <div className='card-header border-0 pt-6'>
      <div className='card-title d-flex flex-wrap align-items-center gap-2 gap-sm-3'>

        {/* Botón de recargar */}
        <button
          type='button'
          className='btn btn-light btn-sm'
          onClick={onReload}
          title='Actualizar tabla'
        >
          <KTIcon iconName='arrows-circle' className='fs-1' />
        </button>

        {/* Buscador */}
        <div className='d-flex align-items-center position-relative flex-grow-1 flex-sm-grow-0'>
          <KTIcon
            iconName='magnifier'
            className='fs-1 position-absolute ms-6'
          />
          <input
            type='text'
            className='form-control form-control-solid ps-14'
            style={{ minWidth: '180px' }}
            placeholder={placeholder}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

      </div>

      {/* Toolbar (botones adicionales) */}
      {children && (
        <div className='card-toolbar gap-3 flex-wrap mt-3 mt-sm-0'>
          {children}
        </div>
      )}
    </div>
  )
}