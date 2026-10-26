import { KTIcon } from '../../../../../_metronic/helpers/components/KTIcon'
import { ModoArchivo } from '../core/types'

export const AdministrativoToolbar = ({
  search,
  codigo,
  setSearch,
  setCodigo,
  refrescar,
  actualizando,
  limpiar,
  modo,
}: {
  search: string
  codigo: string
  setSearch: (value: string) => void
  setCodigo: (value: string) => void
  refrescar: () => void
  actualizando: boolean
  limpiar: () => void
  modo: ModoArchivo
}) => (
  <div className='card-header border-0 pt-6 pb-3 d-flex flex-column flex-xl-row align-items-stretch gap-3'>
    <div
      className='d-flex flex-wrap flex-sm-nowrap align-items-center gap-3 flex-grow-1 min-w-0'
      role='search'
      aria-label='Buscar administrativos'
    >
      <button
        type='button'
        className='btn btn-light btn-sm d-inline-flex align-items-center justify-content-center flex-shrink-0'
        onClick={refrescar}
        disabled={actualizando}
        title='Actualizar tabla'
        aria-label='Actualizar tabla'
        style={{ width: '44px', minWidth: '44px', height: '44px', padding: 0 }}
      >
        <KTIcon iconName='arrows-circle' className='fs-1' />
      </button>
      <div className='position-relative flex-grow-1 min-w-0'>
        <span className='position-absolute top-50 translate-middle-y ms-6' aria-hidden='true'>
          <KTIcon iconName='magnifier' className='fs-1 text-gray-500' />
        </span>
        <label htmlFor='archivo-buscar' className='visually-hidden'>
          CI, nombres o apellidos
        </label>
        <input
          id='archivo-buscar'
          type='search'
          className='form-control form-control-solid ps-14 pe-12'
          style={{ width: '100%', minWidth: 0, height: '44px' }}
          value={search}
          maxLength={100}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='CI, nombres o apellidos'
        />
      </div>
      <div className='flex-shrink-0 w-125px w-sm-150px'>
        <label htmlFor='archivo-codigo' className='visually-hidden'>
          Código de expediente
        </label>
        <input
          id='archivo-codigo'
          className='form-control form-control-solid'
          style={{ height: '44px' }}
          inputMode='numeric'
          pattern='[0-9]*'
          maxLength={10}
          value={codigo}
          onChange={(event) => setCodigo(event.target.value)}
          placeholder='Cód. expediente'
        />
      </div>
    </div>
    <div className='card-toolbar m-0 d-flex flex-wrap align-items-center gap-2 justify-content-end'>
      <button className='btn btn-sm btn-light' type='button' onClick={limpiar}>
        Limpiar
      </button>
      {modo === 'gestion' && (
        <button
          className='btn btn-sm btn-light-primary'
          type='button'
          disabled
          title='El registro de expedientes está deshabilitado'
        >
          Registrar expediente
        </button>
      )}
    </div>
  </div>
)
