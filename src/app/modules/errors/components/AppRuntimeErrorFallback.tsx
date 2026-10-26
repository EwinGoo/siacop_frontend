type Props = {
  resetError: () => void
}

const AppRuntimeErrorFallback = ({resetError}: Props) => {
  return (
    <div className='d-flex flex-column flex-center flex-column-fluid bg-body min-vh-100 px-6'>
      <div className='text-center mw-500px'>
        <div className='fs-1 fw-bold text-gray-900 mb-4'>Ocurrio un error inesperado</div>
        <div className='fs-6 text-gray-600 mb-8'>
          La vista no pudo cargarse correctamente. Puedes reintentar o recargar la pagina.
        </div>

        <div className='d-flex flex-center gap-3 flex-wrap'>
          <button type='button' className='btn btn-primary' onClick={resetError}>
            Reintentar vista
          </button>
          <button type='button' className='btn btn-light-primary' onClick={() => window.location.reload()}>
            Recargar pagina
          </button>
        </div>
      </div>
    </div>
  )
}

export {AppRuntimeErrorFallback}
