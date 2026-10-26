# Seguridad HTTP compartida

axiosClient.ts es la instancia reutilizable para todos los módulos. Utiliza REACT_APP_API_URL, cookies y Accept application/json. Su handleAuthError también se instala sobre Axios global mediante setupAxios, de modo que las peticiones anteriores que aún importan axios reciben la misma política de errores.

401 navega al login del backend. 403 con data.code TWO_FACTOR_REQUIRED navega al flujo de verificación existente; los demás 403 se propagan sin cerrar sesión. Las rutas se derivan de API_BASE_URL y funcionan entre orígenes distintos. Las descargas blob JSON conservan el mismo comportamiento. El error original siempre se rechaza para permitir los mensajes locales.

La navegación de seguridad se dispara una sola vez ante fallos concurrentes. AuthInit conserva la pantalla de carga si el interceptor ya navega, evitando que reemplace el destino de 2FA por el login. AppRoutes usa BACKEND_LOGIN_URL; ARCHIVO_LOGIN_URL se mantiene como alias compatible.

Archivo Central reutiliza esta instancia tanto para consultas como para PDF, conservando timeouts, AbortSignal, validación MIME y mensajes. No se duplican interceptores por módulo ni se añade configuración runtime. El contexto de usuario y los guards frontend continúan reutilizando AuthProvider; las capacidades visuales no sustituyen la autorización en servidor.

El backend reutiliza SessionAuthFilter con grupos opcionales en rutas y respuestas JSON; políticas y archivos en ../siacop_backend/doc/security/SEGURIDAD_COMPARTIDA.md (ruta desde la raíz de SIACOP).

Pruebas: 58 correctas en seis suites mediante testPathPattern archivo-central|services/__tests__. Incluyen el interceptor global/compartido, 401 concurrentes, 403 de grupo, 2FA en JSON/blob y coordinación de AuthInit. TypeScript y ESLint de archivos afectados correctos. No se ejecutan builds ni se acredita una sesión real de navegador. Persiste una advertencia previa de keys en AdministrativoTabla.

Archivos: src/app/services/axiosClient.ts y sus pruebas; src/app/config/apiRoutes.ts; src/app/modules/auth/core/AuthHelpers.ts y Auth.tsx; src/app/routing/AppRoutes.tsx; src/app/modules/apps/archivo-central/core/requests.ts y fixtures del módulo.
