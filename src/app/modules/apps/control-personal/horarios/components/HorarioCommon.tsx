import {ReactNode, useMemo} from 'react'
import Modal from 'react-bootstrap/Modal'
import {KTIcon} from '../../../../../../_metronic/helpers'

export type FieldErrors = Record<string, string>

const estadoLabel = (value?: number | boolean) =>
  Number(value) === 1 || value === true ? 'Activo' : 'Inactivo'
const estadoClass = (value?: number | boolean) =>
  Number(value) === 1 || value === true ? 'badge-light-success' : 'badge-light-danger'

export const isActive = (value?: number | boolean) => Number(value) === 1 || value === true

export const getBackendMessage = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback

export const extractFieldErrors = (err: any): FieldErrors => {
  const errors =
    err?.response?.data?.errors ||
    err?.response?.data?.messages ||
    err?.response?.data?.data?.errors
  if (!errors || typeof errors !== 'object') return {}

  return Object.entries(errors).reduce<FieldErrors>((acc, [key, value]) => {
    acc[key] = Array.isArray(value) ? String(value[0]) : String(value)
    return acc
  }, {})
}

export const ListHeader = ({
  search,
  onSearchChange,
  onSearch,
  loading,
  buttonLabel,
  buttonTitle,
  onCreate,
  children,
}: {
  search: string
  onSearchChange: (value: string) => void
  onSearch: () => void
  loading: boolean
  buttonLabel: string
  buttonTitle: string
  onCreate: () => void
  children?: ReactNode
}) => (
  <div className='card-header border-0 pt-6 d-flex align-items-center gap-3'>
    <div className='d-flex align-items-center gap-3 w-100 flex-wrap'>
      <div
        className='d-flex align-items-center position-relative flex-grow-1 min-w-300px'
        style={{maxWidth: '640px'}}
      >
        <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-6' />
        <input
          type='text'
          className='form-control form-control-solid ps-14'
          placeholder='Buscar...'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>
      <div className='card-toolbar ms-auto d-flex align-items-center justify-content-end gap-3 flex-wrap'>
        {children}
        <button type='button' className='btn btn-primary' onClick={onCreate} title={buttonTitle}>
          <KTIcon iconName='plus' className='fs-2' />
          {buttonLabel}
        </button>
      </div>
    </div>
  </div>
)

export const EstadoBadge = ({value}: {value?: number | boolean}) => (
  <span className={`badge ${estadoClass(value)} fw-bold`}>{estadoLabel(value)}</span>
)

export const ActionButtons = ({onEdit, onDelete}: {onEdit: () => void; onDelete: () => void}) => (
  <div className='d-flex justify-content-end gap-2'>
    <button
      type='button'
      className='btn btn-icon btn-light-primary btn-sm'
      onClick={onEdit}
      title='Editar'
    >
      <KTIcon iconName='pencil' className='fs-3 p-0' />
    </button>
    <button
      type='button'
      className='btn btn-icon btn-light-danger btn-sm'
      onClick={onDelete}
      title='Inactivar'
    >
      <KTIcon iconName='trash' className='fs-3 p-0' />
    </button>
  </div>
)

export const ListPagination = ({
  total,
  page,
  totalPages,
  limit,
  loading,
  onPageChange,
  onLimitChange,
}: {
  total: number
  page: number
  totalPages: number
  limit: number
  loading: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}) => {
  const pages = useMemo(() => {
    const maxPages = 5
    const start = Math.max(1, Math.min(page - 2, totalPages - maxPages + 1))
    const end = Math.min(totalPages, start + maxPages - 1)
    return Array.from({length: end - start + 1}, (_, index) => start + index)
  }, [page, totalPages])

  return (
    <div className='row pt-6'>
      <div className='col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start gap-3'>
        <select
          className='form-select form-select-sm form-select-solid w-90px'
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          disabled={loading}
        >
          {[10, 20, 50].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <span className='text-muted fs-7'>Total: {total} registro(s)</span>
      </div>
      <div className='col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'>
        <ul className='pagination mb-0'>
          <PageButton disabled={loading || page === 1} onClick={() => onPageChange(1)}>
            Primero
          </PageButton>
          <PageButton
            disabled={loading || page === 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            Anterior
          </PageButton>
          {pages.map((item) => (
            <PageButton
              key={item}
              active={item === page}
              disabled={loading}
              onClick={() => onPageChange(item)}
            >
              {item}
            </PageButton>
          ))}
          <PageButton
            disabled={loading || page === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          >
            Siguiente
          </PageButton>
          <PageButton
            disabled={loading || page === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            Ultimo
          </PageButton>
        </ul>
      </div>
    </div>
  )
}

const PageButton = ({
  children,
  active,
  disabled,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) => (
  <li className={`page-item ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
    <button type='button' className='page-link' onClick={onClick} disabled={disabled}>
      {children}
    </button>
  </li>
)

export const HorarioModal = ({
  show,
  title,
  children,
  onHide,
}: {
  show: boolean
  title: string
  children: ReactNode
  onHide: () => void
}) => (
  <Modal show={show} onHide={onHide} centered size='lg' backdrop='static' animation>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{children}</Modal.Body>
  </Modal>
)

export const Field = ({
  className,
  label,
  required,
  error,
  children,
}: {
  className?: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) => (
  <div className={className}>
    <label className={`form-label fw-semibold ${required ? 'required' : ''}`}>{label}</label>
    {children}
    {error ? <div className='invalid-feedback d-block'>{error}</div> : null}
  </div>
)

export const SwitchField = ({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) => (
  <label className='form-check form-switch form-check-custom form-check-solid mb-0'>
    <input
      className='form-check-input'
      type='checkbox'
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className='form-check-label fw-semibold ms-3'>Activo</span>
  </label>
)

export const ModalActions = ({saving, onCancel}: {saving: boolean; onCancel: () => void}) => (
  <div className='d-flex justify-content-end gap-3 mt-8'>
    <button type='button' className='btn btn-light' onClick={onCancel} disabled={saving}>
      Cancelar
    </button>
    <button type='submit' className='btn btn-primary' disabled={saving}>
      {saving ? (
        <span className='spinner-border spinner-border-sm me-2' />
      ) : (
        <KTIcon iconName='check' className='fs-2' />
      )}
      Guardar
    </button>
  </div>
)

export const LoadingRow = ({colSpan, text}: {colSpan: number; text: string}) => (
  <tr>
    <td colSpan={colSpan} className='text-center py-10'>
      <span className='spinner-border spinner-border-sm me-3' />
      {text}
    </td>
  </tr>
)

export const EmptyRow = ({colSpan, text}: {colSpan: number; text: string}) => (
  <tr>
    <td colSpan={colSpan} className='text-center text-muted py-10'>
      {text}
    </td>
  </tr>
)
