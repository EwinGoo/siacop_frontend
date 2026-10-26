import {ReactNode, useEffect, useState} from 'react'
import {KTIcon} from 'src/_metronic/helpers'
import {CSSProperties} from 'react'

type Props = {
  title: ReactNode
  subtitle?: ReactNode
  headerIcon?: ReactNode
  variant?: 'default' | 'grupo' | 'bloque' | 'horario' | 'warning' | 'danger'
  headerStyle?: CSSProperties
  titleClassName?: string
  subtitleClassName?: string
  closeButtonClassName?: string
  closeIconClassName?: string
  iconBoxStyle?: CSSProperties
  onClose: () => void
  children: ReactNode
  size?: 'md' | 'lg' | 'xl'
}

const SIZE_MAP = {
  md: 'mw-600px',
  lg: 'mw-750px',
  xl: 'mw-900px',
} as const

const ANIMATION_MS = 180

const GuardiaModalShell = ({
  title,
  subtitle,
  headerIcon,
  variant = 'default',
  headerStyle,
  titleClassName,
  subtitleClassName,
  closeButtonClassName,
  closeIconClassName,
  iconBoxStyle,
  onClose,
  children,
  size = 'lg',
}: Props) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 10)
    return () => window.clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setVisible(false)
    window.setTimeout(onClose, ANIMATION_MS)
  }

  return (
    <>
      <div
        className='modal-backdrop fade show'
        style={{
          opacity: visible ? 0.45 : 0,
          transition: `opacity ${ANIMATION_MS}ms ease`,
        }}
        onClick={handleClose}
      />
      <div className='modal fade show d-block' tabIndex={-1} role='dialog' aria-modal='true'>
        <div
          className={`modal-dialog modal-dialog-centered ${SIZE_MAP[size]}`}
          style={{
            transform: visible ? 'translateY(0px) scale(1)' : 'translateY(16px) scale(0.98)',
            opacity: visible ? 1 : 0,
            transition: `transform ${ANIMATION_MS}ms ease, opacity ${ANIMATION_MS}ms ease`,
          }}
        >
          <div className='modal-content shadow-sm border-0 overflow-hidden'>
            <div
              className={`modal-header border-0 px-8 py-6 guardia-modal-header guardia-modal-header--${variant}`}
              style={headerStyle || {background: '#ffffff'}}
            >
              <div className='d-flex align-items-center gap-4'>
                {headerIcon ? (
                  <div
                    className={`d-flex align-items-center justify-content-center flex-shrink-0 guardia-modal-icon-box guardia-modal-icon-box--${variant}`}
                    style={{
                      width: '58px',
                      height: '58px',
                      borderRadius: '18px',
                      background: 'linear-gradient(180deg, #eef8ff 0%, #e6f4fb 100%)',
                      border: '1px solid #cfe7f3',
                      ...iconBoxStyle,
                    }}
                  >
                    {headerIcon}
                  </div>
                ) : null}
                <div className='d-flex flex-column'>
                  <h2 className={`fw-bolder mb-1 ${titleClassName || 'text-gray-900'}`}>{title}</h2>
                  {subtitle ? <span className={subtitleClassName || 'text-muted fs-7'}>{subtitle}</span> : null}
                </div>
              </div>
              <button type='button' className={`btn btn-icon btn-sm ${closeButtonClassName || 'btn-light'}`} onClick={handleClose}>
                <KTIcon iconName='cross' className={`fs-1 ${closeIconClassName || 'text-gray-500'}`} />
              </button>
            </div>
            <div className='modal-body px-8 py-7'>{children}</div>
          </div>
        </div>
      </div>
    </>
  )
}

export {GuardiaModalShell}
