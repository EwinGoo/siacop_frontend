# Pantallas y plan de archivos

Implementación de Fase 2. Los formularios de escritura y el PDF siguen pendientes.

## Navegación por grupos

Rutas implementadas dentro de PrivateRoutes: `apps/auditoria/*` para consulta y `apps/archivo-central/*` para gestión. Auditoría solo consulta; operador_archivo y administrador gestionan según bloqueo backend. Si un usuario tiene ambos grupos, mostrar ambos accesos y usar gestión como entrada preferente del módulo; la entrada raíz de React prefiere gestión. No se modifica el login MVC del backend. Las rutas directas deben validar grupos igualmente.

MenuBuilder del backend proporciona las entradas correspondientes; no depender solo de botones internos. Se agregaron los grupos en roles.ts y se adaptó el tipado de roleDefinitions.ts con arrays vacíos si lo exige su Record, sin inventar permisos documentales.

## Buscador

CI/nombre/apellidos y código de expediente, tabla paginada en servidor e indicador de expediente existente. Sin filtro activo/inactivo. Los administrativos sin expediente tendrán estado vacío comprensible y acceso a creación únicamente en gestión futura habilitada. Cambiar filtros reinicia página; búsqueda automática tras 500 ms y paginación consultan al servidor sin descargar todos los administrativos.

## Expediente

Encabezado con nombre, CI, código formateado (sin truncar códigos mayores de seis cifras) y cantidad real de documentos. Un único listado compartido entre Auditoría y Archivo Central muestra todos los documentos por defecto, sin navegación por secciones ni conteos por pestaña.

El filtro de categoría usa el catálogo completo, incluidas categorías históricas. La búsqueda documental por nombre/descripción se aplica automáticamente tras 500 ms, sin botón Buscar. Categoría es un combo buscable que filtra opciones localmente sin distinguir mayúsculas/tildes y permite limpiar a Todas las categorías. Los encabezados Documento, Fecha de registro, Fecha de inicio y Fecha de fin ordenan en servidor antes de paginar. Nombre comienza ascendente y fechas descendentes al cambiar de columna; otro clic alterna la dirección. El estado inicial es fecha de registro descendente. Categoría, búsqueda y orden se conservan al paginar y cerrar el visor. Cambiar filtros u orden reinicia página.

La tabla permite desplazamiento horizontal en móvil, manteniendo accesibles las cuatro columnas ordenables. No se interpreta vencimiento ni significado de fechas históricas.

## Visor

Mostrar metadatos y PDF autenticado cuando disponible, sin recargar toda la pantalla. Si histórico pendiente, mensaje explícito y acciones de visualización/descarga deshabilitadas. Si falta referencia, indicar que no hay archivo digital. Una sesión expirada debe producir error de sesión, no mostrarse como PDF roto. Liberar object URLs al cerrar/cambiar documento si se usa blob.

## Gestión

Composición propia del operador con creación de expediente y documentos, edición, carga/reemplazo y confirmación de eliminación definitiva. Capacidad de grupo y escrituras_habilitadas deben permitir la acción. Al estar bloqueada, mostrar estado solo lectura y deshabilitar controles; el backend también rechaza solicitudes manuales. No se habilita CRUD de categorías en esta etapa.

## Plan de archivos de Fase 2

- `src/app/modules/apps/archivo-central/ArchivoCentralPage.tsx`: composición y rutas internas compartidas.
- `pages/AuditoriaPage.tsx`, `pages/GestionArchivoPage.tsx`: entradas diferenciadas por grupo.
- `components/AdministrativoBuscador.tsx`, `ExpedienteDetalle.tsx`, `DocumentoLista.tsx`, `DocumentoVisor.tsx`: componentes con responsabilidad real; rutas relativas al módulo.
- `core/types.ts`, `core/requests.ts`, `core/useArchivoCentral.ts`: contratos, Axios y React Query.
- `src/app/routing/PrivateRoutes.tsx`, `src/app/config/apiRoutes.ts`, `src/app/modules/auth/core/roles.ts` y guard de grupos: integración localizada.
- `siacop_backend/app/Libraries/MenuBuilder.php`: entradas de navegación por grupo.
- Pruebas de rutas/componentes dentro del módulo y actualización de documentación.

Los formularios de gestión se añaden en Fase 4, no como archivos vacíos en Fase 2. Reutilizar MasterLayout, ListLoading, estilos/card/tab/modal de Metronic y React Bootstrap. Responsive con tarjetas o columnas reducidas en móvil, etiquetas accesibles, navegación por teclado, foco al abrir/cerrar visor y mensajes separados para vacío/error/carga.


## Archivos reales

Se implementaron `ArchivoCentralPage.tsx`, `core/types.ts`, `core/requests.ts`, `core/useArchivoCentral.ts`, `core/presentation.ts`, y los componentes `GroupRoute`, `AdministrativoBuscador`, `ExpedienteDetalle`, `DocumentoLista`, `DocumentoVisor`, `EstadoConsulta` y `Paginacion` dentro de `src/app/modules/apps/archivo-central/`.

Las entradas de Auditoría y Gestión comparten ArchivoCentralPage con modo explícito; no se crearon wrappers de página sin responsabilidad. GroupRoute comprueba grupos para la URL directa, y el contenido comprueba también acceso del backend. ProtectedRoute de otros módulos permanece intacto y no se agregaron permisos específicos documentales.

El visor es un modal React Bootstrap con metadatos, nulos preservados, aviso de PDF histórico y restauración de foco al cerrar. Las acciones de PDF dependen de la disponibilidad informada por API; solo los archivos disponibles pueden visualizarse o descargarse mediante endpoints autenticados. Los botones de gestión son informativos/deshabilitados y no tienen handlers de escritura; su implementación corresponde a Fase 4 aunque el servidor cambiara su flag.

Las tablas reducen columnas en pantallas pequeñas y permiten desplazamiento horizontal en su contenedor. Formularios usan columnas Bootstrap adaptables. Se usan botones nativos para ordenar columnas y etiquetas explícitas para todos los filtros. La revisión visual en dispositivos reales queda documentada como pendiente, no se presume aprobada por las pruebas de DOM.
