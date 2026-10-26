import {FC} from 'react'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import {useEffectiveTheme} from '../../../hooks/useEffectiveTheme'

type Props = {
  description?: string
}

const AppBootstrapScreen: FC<Props> = ({description = 'Cargando ...'}) => {
  const {isDark} = useEffectiveTheme()
  const logoSrc = toAbsoluteUrl('/media/logos/logo_siacop.png')

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: "Inter, Helvetica, 'sans-serif'",
        backgroundColor: isDark ? '#151521' : '#f9f9f9',
        color: isDark ? '#ffffff' : '#5e6278',
        lineHeight: 1,
        fontSize: '14px',
        fontWeight: 400,
      }}
    >
      <img
        src={logoSrc}
        alt='SiACop'
        style={{
          marginLeft: 'calc(100vw - 100%)',
          marginBottom: '30px',
          height: '30px',
        }}
      />
      <span
        style={{
          color: isDark ? '#ffffff' : '#5e6278',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {description}
      </span>
    </div>
  )
}

export {AppBootstrapScreen}
