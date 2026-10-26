interface Props {
  title: string
  description: string
}

const EmptyState = ({title, description}: Props) => {
  return (
    <div className='text-center py-10'>
      <i className='bi bi-inbox fs-3tx text-gray-400 d-block mb-3' />
      <div className='text-gray-800 fw-bold fs-4 mb-2'>{title}</div>
      <div className='text-gray-500'>{description}</div>
    </div>
  )
}

export {EmptyState}
