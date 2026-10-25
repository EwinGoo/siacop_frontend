import {ReactNode} from 'react'
import {Navigate} from 'react-router-dom'
import {useAuth} from '../../../auth'

export const GroupRoute = ({
  groups,
  children,
}: {
  groups: readonly string[]
  children: ReactNode
}) => {
  const {currentUser} = useAuth()
  return currentUser?.groups?.some((group) => groups.includes(group)) ? (
    <>{children}</>
  ) : (
    <Navigate to='/acceso-denegado' replace />
  )
}
