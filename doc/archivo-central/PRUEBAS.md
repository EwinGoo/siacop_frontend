# Verificación de Archivo Central

La validación vigente es la actualización de refactorización documental al final de este documento. Los resultados anteriores son históricos.

## Verificación histórica de Fase 2

Fecha: 2026-10-22. No se utilizan datos reales como fixtures. No hay escrituras sobre MariaDB ni cambios en archivos de SIACOP2.

## Comandos

Desde siacop_frontend:

```bash
CI=true npm test -- --watchAll=false --runInBand --testPathPattern=archivo-central
node node_modules/typescript/bin/tsc --noEmit --pretty false
node node_modules/eslint/bin/eslint.js src/app/modules/apps/archivo-central --ext .ts,.tsx
CI=false GENERATE_SOURCEMAP=false npm run build
```

Desde siacop_backend:

```bash
XDEBUG_MODE=off /usr/bin/php8.2 vendor/bin/phpunit -c tests/ArchivoCentral/phpunit.xml
```

## Resultados

- Frontend: 26 pruebas correctas en dos suites, interfaz y requests. Los hooks de API se simulan en pruebas de pantallas; no son pruebas end-to-end con sesión real.
- Backend: 64 pruebas y 236 aserciones correctas. Se mantiene la suite aislada de Fase 1 y se añade MenuTest para las entradas React diferenciadas. No se ejecuta la suite global con migraciones.
- TypeScript completo: sin errores tras las correcciones acotadas descritas abajo.
- ESLint del módulo: sin advertencias ni errores. Prettier sobre módulo e integraciones: correcto. git diff --check y enlaces locales de documentación: correctos.
- Build de producción habitual (CI=false, sourcemaps desactivados): correcto, genera build/ con las advertencias existentes del proyecto. No se desactivaron lint ni tipos.
- CI estricto (CI=true): no aprobado; las advertencias de lint en módulos anteriores se elevan a error. No se corrigieron masivamente módulos ajenos al alcance. Esta limitación permanece pendiente y no debe interpretarse como CI global aprobado.

Casos cubiertos: grupos y acceso directo, capacidad de gestión confirmada por API, usuario multigrupo, búsqueda por código, paginación de servidor y reinicio de página, retorno conservando filtros, agrupación documental anterior (sustituida por listado unificado), categoría histórica, nulos y fechas sin desplazamiento, administrativo sin expediente, carga, vacío, error con reintento y sesión expirada. Modal con metadatos, aviso histórico, acciones PDF bloqueadas y restauración de foco. Operador/administrador no pueden registrar, editar, reemplazar ni eliminar desde la UI.

Los requests usan credenciales y AbortSignal; propagan HTTP 401/403/404/422/500 con mensajes locales, sin exponer el mensaje interno del servidor. No hay endpoints de escritura en el cliente.

## Correcciones necesarias para compilar

Se preservaron los cambios previos de package.json y package-lock.json (Sentry); no se instalaron dependencias. Se corrigieron estos problemas existentes detectados por el compilador:

- tsconfig.json: quitar ignoreDeprecations, desconocido por TypeScript 4.7.4 instalado.
- KTCardBody: admitir CSSProperties y aplicar style al div, como ya requieren tablas existentes.
- useDateFormatter: aceptar null/undefined donde los consumidores existentes ya envían fechas/horas opcionales; los guards en ejecución ya estaban presentes.
- MarcacionNormalizada: declarar fecha_importacion e ip_origen como opcionales/nullables, utilizados por la vista de marcaciones existente.

Son correcciones de compatibilidad del build; no cambian reglas de Archivo Central ni esquema de datos.

## Límites de validación

La estructura responsive usa Bootstrap/Metronic con columnas reducidas en móvil, formularios adaptables y contenedores de tabla. No hay navegador automatizado disponible en esta sesión: queda pendiente la revisión visual en escritorio, tablet y móvil, y navegación completa con una sesión real de cada grupo. Las pruebas de DOM comprueban foco y etiquetas, pero no sustituyen esa revisión.

La visualización/descarga de PDF corresponde a Fase 3 y permanece deshabilitada. Los formularios de gestión corresponden a Fase 4 y las escrituras siguen bloqueadas. No se asignaron grupos a usuarios ni se desplegó el módulo.


## Actualización de Fase 3

30 pruebas frontend correctas; 84 backend y 286 aserciones correctas. TypeScript sin errores y revisión final de ESLint. Las pruebas nuevas cubren runtime local preferido a la URL compilada, requests de sesión compartidos y respuesta PDF binaria/MIME. Los cambios anteriores se verificaron antes de la indicación de no ejecutar builds.

Se generó previamente build-local con configuración localhost y Sentry remoto deshabilitado; se utilizó ese artefacto existente para reparar la copia local servida por el backend, sin recompilar tras la instrucción del usuario. No se eliminaron chunks antiguos ni se desplegó en producción.

Las pruebas de pantalla aún no constituyen una comprobación completa del visor PDF nativo en navegadores reales. Esa revisión y el acceso con sesión real quedan pendientes. No se asignaron grupos ni se habilitaron escrituras.


## Refactorización del expediente — 2026-10-23

Sin cambios de backend, MariaDB, SIACOP2 ni almacenamiento. Ninguna escritura habilitada. No se instalan dependencias ni se hacen commits.

Comandos actuales desde siacop_frontend:

```bash
CI=true npm test -- --watchAll=false --runInBand --testPathPattern=archivo-central
node node_modules/eslint/bin/eslint.js src/app/modules/apps/archivo-central/components/ExpedienteDetalle.tsx src/app/modules/apps/archivo-central/components/ExpedienteEncabezado.tsx src/app/modules/apps/archivo-central/components/DocumentoLista.tsx src/app/modules/apps/archivo-central/core/types.ts src/app/modules/apps/archivo-central/__tests__ --ext .ts,.tsx
```

Pruebas: 39 correctas en tres suites. Incluyen ausencia de pestañas/selector de orden, categorías completas e históricas, petición sin sección, cuatro campos de orden, dirección inicial/alternancia, aria-sort único, reinicio de página, conservación de filtros/orden al paginar, teclado Tab/Enter/Espacio, estado vacío, ambos modos, gestión bloqueada y conservación de filtros al cerrar visor. Se mantienen pruebas de PDF histórico, credenciales, respuesta PDF binaria y rechazo de HTML.

ESLint de archivos afectados sin errores ni advertencias. La suite informa una advertencia previa de keys en AdministrativoTabla (fuera del cambio). No se ejecutan build ni comprobación TypeScript independiente, conforme a la indicación de validar con ESLint. No se repite la suite backend porque no cambia el endpoint.

Revisión visual pendiente: Firefox instalado es un lanzador Snap sin navegador disponible; no hay navegador operativo. Solicitar capturas de escritorio/tablet/móvil, claro/oscuro, resultados/vacío y disponibilidad PDF. DOM y ESLint no acreditan revisión visual ni PDF nativo. Usar frontend de desarrollo para ver las fuentes, ya que la copia estática del backend permanece sin regenerar.


## Encabezados Metronic 8.2.0 — 2026-10-23

Referencia original inspeccionada en metronic_react_v8.2.0_demo1/demo1, versión 8.2.0 confirmada en package.json. Reutilizadas las reglas SCSS ya integradas en SIACOP, sin copiar dependencias ni cambiar estilos globales.

- Suite del módulo: 40 pruebas correctas en tres suites. Nueva prueba comprueba indicadores table-sort, table-sort-asc y table-sort-desc, ausencia de btn/btn-light, fondo transparente/borde cero y alternancia sin tercer estado. Permanecen las pruebas de teclado, filtros, paginación, visor y ambos modos.
- ESLint sobre DocumentoLista.tsx e interfaz.test.tsx: sin errores ni advertencias. Persiste la advertencia previa de React sobre keys en AdministrativoTabla durante pruebas.
- TypeScript (`node node_modules/typescript/bin/tsc --noEmit --pretty false`): correcto, sin errores. Se añadió una declaración local tipada para el módulo SCSS de foco.
- Sin builds ni modificación de activos compilados. Sin cambios de backend, API, base de datos, Shield, permisos, SIACOP2 ni escrituras.
- Revisión visual pendiente por falta de navegador operativo; solicitar capturas de escritorio/tablet/móvil en claro/oscuro. Las pruebas confirman clases y comportamiento DOM, no renderizado visual.


## Categorías buscables y búsqueda automática — 2026-10-23

Dependencia reutilizada: react-select 5.10.1 existente. Sin cambios de package.json/lockfile por esta tarea. Archivos: SelectorBuscable.tsx y sus estilos/tipos compartidos, DocumentoLista.tsx, interfaz.test.tsx, nuevo buscador.test.tsx y documentación COMPONENTES/UX_UI/PRUEBAS. También se sincronizan PANTALLAS y ESTADO_Y_API para retirar la referencia a envío explícito documental.

Resultados: 48 pruebas correctas en cuatro suites. Verifican búsqueda parcial, mayúsculas/tildes, nombres históricos intactos, ID numérico, limpieza por teclado a undefined, Todas las categorías, menú cerrado al seleccionar/Escape, ausencia de coincidencias y portal fuera del contenedor. Se conservan pruebas de filtros/orden/página, teclado, visor, gestión bloqueada y ambos modos.

Una prueba por cada modo usa React Query y Axios simulado (sin simular el hook): tres cambios rápidos producen una única consulta después de 500 ms; buscar opciones de categoría no hace peticiones, seleccionar hace una consulta y el texto equivalente tras trim no duplica solicitudes. Se comprueba ausencia de botón Buscar. No son pruebas con sesión real.

ESLint de los archivos modificados: sin errores ni advertencias. TypeScript sin emisión: correcto. Persiste la advertencia React previa de keys en AdministrativoTabla, ajena a esta tarea. No se ejecutan builds, respetando la instrucción previa de no hacerlos; no se actualizan activos compilados.

Claro/oscuro y responsive se preparan con variables/estilos del tema y rejilla existente, pero su validación visual sigue pendiente por falta de navegador operativo. Solicitar capturas escritorio/tablet/móvil, claro/oscuro y menú abierto/con y sin coincidencias. Sin cambios de backend, MariaDB, Shield, permisos, SIACOP2, API ni escrituras.


## Cliente HTTP centralizado

58 pruebas correctas en seis suites junto con services/__tests__. Se simula la instancia Axios compartida en fixtures del módulo. TypeScript y ESLint correctos; sin builds. Nueva cobertura de 401 concurrentes, 2FA JSON/blob y AuthInit sin competir con la navegación de seguridad. Backend: 158 pruebas, 567 aserciones, sin base de datos. Ver ../SEGURIDAD_HTTP.md.

## Gestión — verificación vigente 2026-10-23

`CI=true npm test -- --watchAll=false --runInBand --testPathPattern='archivo-central|services/__tests__'`: **67 pruebas correctas en siete suites**. TypeScript (`tsc --noEmit`) correcto. ESLint se ejecuta sobre los componentes, cliente HTTP, selector compartido y pruebas modificadas. No se ejecutan builds ni se regeneran activos compilados.

Cobertura nueva: validación PDF/tamaño/fechas/descripción; creación usando solo la persona existente y bloqueo de doble envío; errores por campo; categoría/documento numéricos relacionados; históricos excluidos solo de altas; reemplazo del PDF antes de guardar; porcentaje de subida real simulado; actualización de React Query; acceso de auditoría sin eliminación; confirmación/cancelación y protección de históricos; token CSRF enviado en JSON/multipart; errores HTTP con campos y sin reintento de escritura.

Los fixtures son ficticios y las peticiones están simuladas; no equivalen a validación con sesión/BD reales. Las pruebas sincronizan los wrappers React de las dos instancias DOM Testing Library instaladas para que user-event no genere avisos artificiales de act, sin instalar dependencias. SweetAlert2 se simula en pruebas de componentes; su integración visual queda pendiente. Persiste únicamente el aviso previo de keys en AdministrativoTabla.

Backend: 177 pruebas, 614 aserciones correctas; sin escrituras contra MariaDB real. Gestión implementada, deshabilitada por defecto hasta configuración explícita. Editar documento/reemplazar PDF ya registrado siguen fuera de esta entrega.

**Validación visual pendiente:** no hay navegador operativo. Se solicitan capturas de escritorio/tablet/móvil, temas claro/oscuro, formularios con errores y procesamiento, selectores abiertos y confirmación de eliminación. No se afirma haber verificado visualmente esos estados.
