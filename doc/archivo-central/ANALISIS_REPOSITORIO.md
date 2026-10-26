# Análisis del frontend

## Hechos verificados

- `package.json`: React 18, React Router 6.3, react-query 3.38, Axios, Bootstrap, React Bootstrap, Formik, Yup y react-table; TypeScript declarado ~4.7.4, también versión instalada 4.7.4. No se requiere instalar librerías.
- `tsconfig.json`: strict true pero noImplicitAny false; incluye ignoreDeprecations 6.0, opción que debe comprobarse contra el compilador instalado antes de ejecutar typecheck. No se cambia configuración global en esta fase.
- Existen las rutas del requerimiento: `routing/AppRoutes.tsx`, `routing/PrivateRoutes.tsx`, `config/apiRoutes.ts`, `auth/core/roles/permissions.ts`, `auth/core/roles/roleDefinitions.ts`.
- `PrivateRoutes` usa lazy/Suspense, MasterLayout y rutas `apps/...`; algunos módulos están protegidos y otros no tienen ProtectedRoute.
- `auth/core/roles.ts` contiene APP_ROLES. No incluye auditoria ni operador_archivo. `Auth.tsx` expone currentUser.groups y hasRole.
- Existe mapeo de permisos específicos de otros módulos en roleDefinitions.ts y ProtectedRoute los usa. La comprobación legacy por requiredPermissions está comentada: pasar solamente esa prop no protege rutas.
- `services/axiosClient.ts` usa withCredentials y redirige a /login ante 401. `apiRoutes.ts` depende de REACT_APP_API_URL; otros módulos usan axios global, por lo que hay que verificar configuración efectiva y evitar duplicar baseURL.
- `feriado-asueto/list/core/QueryResponseProvider.tsx` usa React Query 3 con keepPreviousData. `_requests.ts` transforma sobres de backend, pero convierte errores de listado en arrays vacíos; no se copiará esa pérdida de distinción entre error y vacío.
- Están disponibles tablas, tarjetas, modales Formik, validación Yup, ListLoading, paginación y helpers Metronic. Se reutilizará diseño y primitivas, evitando copiar componentes de columnas sin utilidad documental.
- SidebarMenuMain lee `currentUser.menu`, construido por MenuBuilder del backend. Añadir solamente rutas no incorporará accesos al menú.
- node_modules presente; frontend sin cambios Git al comienzo de inspección.

## Decisiones de diseño

Autorización solo por grupos para Archivo Central, según aclaración del usuario. Añadir soporte de grupos explícitos a ProtectedRoute o guard local; no usar requiredPermissions legacy inactivo ni agregar permisos específicos documentales. Mantener el comportamiento de otros módulos.

Interfaces de consulta y gestión con componentes comunes y rutas diferentes. El backend devuelve acceso efectivo; grupos cliente solo adaptan presentación. La gestión permanecerá deshabilitada si backend no habilita escrituras.

## Riesgos

Rutas sin guard, pérdida de errores HTTP, conflicto de baseURL, sesión expirada en PDF y desfase de versión de TypeScript/configuración. Cambios globales deben justificarse y aislarse. La protección visual no sustituye autorización backend.

## Dependencias

API de consulta de Fase 1, respuesta de grupos Shield, menú backend y agrupación centralizada. No crear IDs de categorías en componentes. Ver tipos propuestos en ESTADO_Y_API.md y contrato canónico del backend.

## Pendientes

Comprobar navegación inicial después de login y usuarios multigrupo para que lleguen a UI correcta sin afectar otras funciones. Verificar configuración Axios efectiva, compilación, pruebas y accesibilidad en Fase 2. PDF histórico pendiente no bloquea las pantallas de metadatos. No se ha ejecutado build ni se certifica responsive con documentación sola.


## Actualización de Fase 2

Se implementaron rutas de Auditoría y Archivo Central protegidas por GroupRoute local; no se alteró ProtectedRoute ni permisos específicos existentes. Se agregaron los dos grupos al tipado y sus arrays de permisos específicos permanecen vacíos. El menú se integra desde MenuBuilder y la entrada raíz de React selecciona la UI según grupo.

Se detectaron errores de compilación previos al módulo: ignoreDeprecations incompatible con TypeScript 4.7.4, style no declarado en KTCardBody, fechas opcionales no admitidas por useDateFormatter y dos campos opcionales faltantes en MarcacionNormalizada. Se corrigieron de forma acotada para permitir validar el frontend completo: eliminación de opción desconocida, soporte tipado de style en el div, ampliación de nullables que ya eran manejados en ejecución y tipado de campos utilizados por las vistas existentes. No se cambiaron dependencias ni los cambios previos de Sentry en package.json/package-lock.json.
