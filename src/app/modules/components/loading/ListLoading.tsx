import {CSSProperties} from 'react'
import {useEffectiveTheme} from 'src/app/hooks/useEffectiveTheme'

type Props = {
  message?: string
  overlay?: boolean
}

const ListLoading = ({message: _message, overlay = true}: Props) => {
  const {isDark} = useEffectiveTheme()

  const wrapperStyles: CSSProperties = overlay
    ? {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? 'rgba(21, 21, 33, 0.12)' : 'rgba(249, 249, 249, 0.55)',
        backdropFilter: 'blur(0.5px)',
        zIndex: 5,
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '180px',
      }

  const spinnerStyles: CSSProperties = {
    width: '2.25rem',
    height: '2.25rem',
    borderWidth: '0.22rem',
  }

  return (
    <div style={wrapperStyles}>
      <div className='spinner-border text-primary' role='status' style={spinnerStyles}>
        <span className='visually-hidden'>Cargando</span>
      </div>
    </div>
  )
}

export {ListLoading}
