import clsx from 'clsx'
import {CSSProperties, FC} from 'react'
import {WithChildren} from '../react18MigrationHelpers'

type Props = {
  style?: CSSProperties
  className?: string
  scroll?: boolean
  height?: number
}

const KTCardBody: FC<Props & WithChildren> = (props) => {
  const {className, style, scroll, height, children} = props
  return (
    <div
      style={style}
      className={clsx(
        'card-body',
        className && className,
        {
          'card-scroll': scroll,
        },
        height && `h-${height}px`
      )}
    >
      {children}
    </div>
  )
}

export {KTCardBody}
