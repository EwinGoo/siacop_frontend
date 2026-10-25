import {handleAuthError} from '../../../services/axiosClient'
import {
  FC,
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  Dispatch,
  SetStateAction,
  useMemo,
} from 'react'
import {AuthModel, UserModel} from './_models'
import * as authHelper from './AuthHelpers'
import {getUserBySession} from './_requests'
import {WithChildren} from '../../../../_metronic/helpers'
import {APP_ROLES, PERMISSION_GROUPS, RoleKey} from './roles'
import {useNavigate} from 'react-router-dom'
import {Permission} from './roles/permissions'
import {ROLE_PERMISSIONS} from './roles/roleDefinitions'
import {
  disableSplashScreen,
  enableSplashScreen,
} from '../../../../_metronic/layout/core/_LayoutProvider'
import {AppBootstrapScreen} from '../../components/loading/AppBootstrapScreen'

type AuthContextProps = {
  auth: AuthModel | undefined
  saveAuth: (auth: AuthModel | undefined) => void
  currentUser: UserModel | undefined
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  logout: () => void
  hasRole: (roleKey: RoleKey) => boolean
  // Método legacy para compatibilidad
  hasPermission: (permissionKey: keyof typeof PERMISSION_GROUPS) => boolean
  // Nuevo método para permisos granulares
  hasSpecificPermission: (permission: Permission) => boolean
  // Método para verificar múltiples permisos específicos
  hasAllSpecificPermissions: (permissions: Permission[]) => boolean
  hasAnySpecificPermission: (permissions: Permission[]) => boolean
  userPermissions: Set<Permission>
}

const initAuthContextPropsState = {
  auth: authHelper.getAuth(),
  saveAuth: () => {},
  currentUser: undefined,
  setCurrentUser: () => {},
  logout: () => {},
  hasRole: (_roleKey) => false,
  hasPermission: (_permissionKey) => false,
  hasSpecificPermission: (_permission) => false,
  hasAllSpecificPermissions: (_permissions) => false,
  hasAnySpecificPermission: (_permissions) => false,
  userPermissions: new Set<Permission>(),
}

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState)

const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider: FC<WithChildren> = ({children}) => {
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth())
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>()

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth)
    if (auth) {
      authHelper.setAuth(auth)
    } else {
      authHelper.removeAuth()
    }
  }

  const logout = () => {
    saveAuth(undefined)
    setCurrentUser(undefined)
  }

  const hasRole = (roleKey: RoleKey): boolean => {
    return currentUser?.groups?.includes(APP_ROLES[roleKey]) ?? false
  }

  // Método legacy para compatibilidad (manténlo mientras migras)
  const hasPermission = (permissionKey: keyof typeof PERMISSION_GROUPS): boolean => {
    const allowedRoles = PERMISSION_GROUPS[permissionKey]
    if (!allowedRoles) {
      console.warn(`Permiso no definido: ${permissionKey}`)
      return false
    }
    return currentUser?.groups?.some((group) => allowedRoles.includes(group)) ?? false
  }

  // Memoizar los permisos del usuario para optimizar
  const userPermissions = useMemo(() => {
    if (!currentUser?.groups?.length) return new Set<Permission>()

    const permissions = new Set<Permission>()

    currentUser.groups.forEach((role) => {
      const rolePermissions = ROLE_PERMISSIONS[role]
      if (rolePermissions) {
        rolePermissions.forEach((permission) => permissions.add(permission))
      }
    })

    return permissions
  }, [currentUser?.groups])

  // Nuevos métodos para permisos específicos
  const hasSpecificPermission = (permission: Permission): boolean => {
    return userPermissions.has(permission)
  }

  const hasAllSpecificPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => userPermissions.has(permission))
  }

  const hasAnySpecificPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => userPermissions.has(permission))
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        logout,
        hasRole,
        hasPermission, // Legacy
        hasSpecificPermission,
        hasAllSpecificPermissions,
        hasAnySpecificPermission,
        userPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const AuthInit: FC<WithChildren> = ({children}) => {
  const {logout, setCurrentUser} = useAuth()
  const didRequest = useRef(false)
  const [showSplashScreen, setShowSplashScreen] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    enableSplashScreen()

    const requestUser = async () => {
      try {
        if (!didRequest.current) {
          didRequest.current = true
          const {data} = await getUserBySession()
          if (data && isMounted) {
            setCurrentUser(data.user)
            const authModel: AuthModel = {
              api_token: 'session-based',
              refreshToken: undefined,
            }
            authHelper.setAuth(authModel)
          }
        }
      } catch (error: any) {
        console.error(error)
        if (!isMounted || handleAuthError.isRedirecting()) {
          return
        }

        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
          navigate('/error/500')
          return
        }

        logout()
      } finally {
        if (isMounted && !handleAuthError.isRedirecting()) {
          disableSplashScreen()
          setShowSplashScreen(false)
        }
      }
    }

    requestUser()

    return () => {
      isMounted = false
    }
  }, [logout, navigate, setCurrentUser])

  return showSplashScreen ? <AppBootstrapScreen description='Cargando ...' /> : <>{children}</>
}

export {AuthProvider, AuthInit, useAuth}
