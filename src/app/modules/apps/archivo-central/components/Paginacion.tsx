export const Paginacion = ({
  page,
  limit,
  total,
  bloqueada,
  cambiar,
  variante = 'actual',
}: {
  page: number
  limit: number
  total: number
  bloqueada: boolean
  cambiar: (page: number) => void
  variante?: 'actual' | 'metronic'
}) => {
  if (variante === 'metronic') {
    const paginas = Math.max(1, Math.ceil(total / limit))
    const inicio = Math.max(1, Math.min(page - 2, paginas - 4))
    const visibles = Array.from({length: Math.min(5, paginas)}, (_, index) => inicio + index)
    const primero = total === 0 ? 0 : Math.min((page - 1) * limit + 1, total)
    const ultimo = Math.min(page * limit, total)
    return (
      <nav
        aria-label='Paginación de resultados'
        className='d-flex flex-wrap flex-stack gap-3 border-top border-gray-200 pt-5 mt-5'
      >
        <span className='text-muted fs-7' aria-live='polite'>
          {primero}–{ultimo} de {total} resultados
        </span>
        <ul className='pagination pagination-sm mb-0 flex-wrap'>
          <li className={`page-item ${bloqueada || page <= 1 ? 'disabled' : ''}`}>
            <button
              type='button'
              className='page-link'
              disabled={bloqueada || page <= 1}
              onClick={() => cambiar(page - 1)}
            >
              Anterior
            </button>
          </li>
          {inicio > 1 && (
            <li className='page-item'>
              <button
                type='button'
                className='page-link'
                disabled={bloqueada}
                aria-label='Ir a la página 1'
                onClick={() => cambiar(1)}
              >
                1
              </button>
            </li>
          )}
          {inicio > 2 && (
            <li className='page-item disabled'>
              <span className='page-link' aria-hidden='true'>
                …
              </span>
            </li>
          )}
          {visibles.map((numero) => (
            <li key={numero} className={`page-item ${page === numero ? 'active' : ''}`}>
              <button
                type='button'
                className='page-link'
                aria-label={`Ir a la página ${numero}`}
                aria-current={page === numero ? 'page' : undefined}
                disabled={bloqueada || page === numero}
                onClick={() => cambiar(numero)}
              >
                {numero}
              </button>
            </li>
          ))}
          {inicio + visibles.length < paginas && (
            <li className='page-item disabled'>
              <span className='page-link' aria-hidden='true'>
                …
              </span>
            </li>
          )}
          {inicio + visibles.length <= paginas && (
            <li className='page-item'>
              <button
                type='button'
                className='page-link'
                disabled={bloqueada}
                aria-label={`Ir a la página ${paginas}`}
                onClick={() => cambiar(paginas)}
              >
                {paginas}
              </button>
            </li>
          )}
          <li className={`page-item ${bloqueada || page >= paginas ? 'disabled' : ''}`}>
            <button
              type='button'
              className='page-link'
              disabled={bloqueada || page >= paginas}
              onClick={() => cambiar(page + 1)}
            >
              Siguiente
            </button>
          </li>
        </ul>
      </nav>
    )
  }
  return (
    <nav
      aria-label='Paginación de resultados'
      className='d-flex flex-wrap gap-3 align-items-center justify-content-between mt-5'
    >
      <span aria-live='polite'>
        {total} resultados · Página {page} de {Math.max(1, Math.ceil(total / limit))}
      </span>
      <div className='d-flex gap-2'>
        <button
          className='btn btn-sm btn-light'
          disabled={bloqueada || page <= 1}
          onClick={() => cambiar(page - 1)}
        >
          Anterior
        </button>
        <button
          className='btn btn-sm btn-light-primary'
          disabled={bloqueada || page * limit >= total}
          onClick={() => cambiar(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </nav>
  )
}
