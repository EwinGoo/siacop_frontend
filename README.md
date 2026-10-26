# SIACOP V3 - Frontend

Frontend web de `SIACOP V3`, desarrollado como una SPA en React para modernizar los modulos de control personal, planilla de asistencia, bono refrigerio y procesos administrativos relacionados.

Este proyecto vive en:

```text
C:\Users\az232\Desktop\siacop\siacop_frontend
```

## Tecnologia principal

- React `18.0.0`
- TypeScript `4.7`
- Create React App con `react-scripts`
- Metronic React `8.2.0` adaptado al sistema SIACOP
- Bootstrap `5.3`
- React Router DOM `6.3`
- React Query `3.38`
- Axios
- Formik + Yup
- React Table
- SweetAlert2
- html5-qrcode
- Socket.IO Client

Importante: este frontend **no usa Vite**. El arranque, pruebas y compilacion se realizan con `react-scripts`.

## Version activa

- Nombre del paquete: `siacop-frontend`
- Version del frontend: `3.0.0`
- Ruta publica configurada: `/siacop-v3`

La ruta publica se define en `package.json`:

```json
"homepage": "/siacop-v3"
```

## Relacion con el backend

El backend principal vive en:

```text
C:\Users\az232\Desktop\siacop\siacop_backend
```

El frontend se integra con el backend mediante sesion compartida de CodeIgniter Shield. React no maneja un login independiente para el flujo normal; consume la sesion activa del backend usando cookies y `withCredentials`.

Flujo general:

```text
Usuario -> siacop_backend login -> siacop_frontend React -> ApiSiacop -> base_siacop / api_base_upea
```

## Build y despliegue

El build generado por React debe publicarse dentro del backend, recomendado como:

```text
C:\Users\az232\Desktop\siacop\siacop_backend\public\siacop-v3
```

Si se cambia esta carpeta, tambien se debe revisar el controlador del backend que sirve la SPA, especialmente la referencia al `index.html` del build.

## Scripts disponibles

Instalar dependencias:

```bash
npm install
```

Levantar en desarrollo:

```bash
npm start
```

Ejecutar pruebas:

```bash
npm test
```

Verificar formato:

```bash
npm run lint
```

Formatear codigo:

```bash
npm run format
```

Generar build de produccion:

```bash
npm run build
```

Nota del proyecto: no ejecutar `npm run build` salvo que sea solicitado explicitamente.

## Variables de entorno relevantes

El frontend usa variables `.env` para conectarse con el backend y servicios auxiliares.

Variables principales:

```text
REACT_APP_API_URL
REACT_APP_SOCKET_URL
REACT_APP_ENVIRONMENT
REACT_APP_THEME_API_URL
```

En Create React App, las variables disponibles para el navegador deben iniciar con `REACT_APP_`.

## Modulos principales de SIACOP V3

- Autenticacion compartida con backend
- Proteccion de rutas por roles y permisos
- Biometricos y administracion ZKTeco
- Feriados y asuetos
- Tipos de permiso
- Permisos administrativos
- Boletas de comision
- Declaratoria en comision
- Asignaciones administrativas
- Gestion QR
- Guardias de seguridad
- Reporte de vacaciones
- Planilla de asistencia
- Bono refrigerio
- Reportes PDF integrados

## Estructura importante

```text
src/app/routing
src/app/config/apiRoutes.ts
src/app/services/axiosClient.ts
src/app/modules/auth
src/app/modules/apps/control-personal
src/app/modules/apps/administrador
public/media
doc
```

## Documentacion interna

Documentacion general:

```text
doc/frontend.md
doc/backend.md
doc/DOCUMENTACION_GENERAL_IMPLEMENTACION.md
```

Documentacion de vistas:

```text
doc/frontend/
```

Cada nueva vista o modulo relevante debe documentarse en `doc/frontend/` usando prefijo numerico, por ejemplo:

```text
10_NUEVA_VISTA.md
```

## Notas de mantenimiento

- Mantener `axiosClient` para peticiones que dependan de cookies, interceptores o manejo comun de errores.
- No exponer llaves de `api_base_upea` en el frontend.
- El frontend no debe consumir directamente `api_base_upea`; debe pasar por `siacop_backend`.
- Revisar `public/media` antes de eliminar assets, porque Metronic incluye muchos recursos demo no usados.
- Evitar dejar `console.log`, archivos `copy`, pruebas manuales o rutas `localhost` en configuracion de produccion.
