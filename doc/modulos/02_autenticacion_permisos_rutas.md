# Modulo frontend: Autenticacion, permisos y rutas

## Que hace

Controla acceso a la SPA usando la sesion compartida del backend y permisos recibidos desde SIACOP.

## Piezas principales

- `src/app/modules/auth`
- `src/app/modules/auth/core/ProtectedRoute.tsx`
- `src/app/modules/auth/core/roles/permissions.ts`
- `src/app/modules/auth/hooks/usePermissions.ts`
- `src/app/routing/AppRoutes.tsx`
- `src/app/routing/PrivateRoutes.tsx`

## Flujo

```text
React consulta sesion -> usuario valido -> rutas privadas -> permisos por modulo
```

## Validaciones importantes

- Si no hay sesion, redirige al login del backend.
- Si el usuario no tiene permiso, muestra acceso denegado o bloquea la ruta.
- El frontend no debe reemplazar la validacion del backend; solo mejora la experiencia de usuario.
