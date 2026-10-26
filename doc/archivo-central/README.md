# Archivo Central: frontend

Actualizado: 2026-10-26. Consulta, visor y gestión documental integrados con el backend MinIO. Las secciones de fases anteriores conservan antecedentes; el comportamiento vigente se resume a continuación. Resultados y límites de validación en PRUEBAS.md.

## Comportamiento vigente

- Auditoría y Archivo Central comparten los listados: 50 administrativos o documentos por página, con paginación del servidor. Si hay menos de 50 resultados, se muestran los existentes; el total no es el tamaño de página.
- Solo se muestran documentos y categorías activos según el backend: estado_documento=1 y estado_documento_tipo=1. Los funcionarios no se filtran por estado.
- El icono bi-file-earmark-pdf usa text-danger sobre btn-light cuando el PDF está disponible; se muestra text-muted y deshabilitado cuando no está disponible. Abre el endpoint autenticado preview con target=_blank y rel=noopener noreferrer. Ver detalle conserva el modal.
- No se usan enlaces temporales ni públicos de MinIO. El backend entrega el PDF por streaming; abrir el enlace requiere sesión y grupo autorizado.
- Gestión depende de grupos, CSRF y escrituras_habilitadas; edición y reemplazo de documentos registrados siguen pendientes.
- Sin builds por indicación del usuario. Las validaciones de esta actualización se detallan en PRUEBAS.md.

- [Análisis real](ANALISIS_REPOSITORIO.md)
- [Pantallas y arquitectura](PANTALLAS.md)
- [Estado y contratos TypeScript](ESTADO_Y_API.md)
- [Pruebas y limitaciones](PRUEBAS.md)
- [Backend y decisiones compartidas](../../../siacop_backend/doc/archivo-central/README.md)
- [Contrato API canónico](../../../siacop_backend/doc/archivo-central/API.md)

Se autorizan consultas generales por grupos de sesión. Auditoría y operador tienen interfaces diferentes; no se crea un sistema de permisos específicos para este módulo. Las escrituras futuras permanecen bloqueadas por backend y UI. Históricos sin integración muestran estado explícito de indisponibilidad.


## Antecedentes de Fase 2: backend disponible

La Fase 1 ya implementa los cinco GET de consulta. Su contrato y verificaciones están en la documentación canónica del backend. Las pantallas React y las entradas de menú están implementadas. Gestión documental y almacenamiento permanecen pendientes.


## Acceso a las interfaces

- Auditoría: `/apps/auditoria`.
- Operador y administrador: `/apps/archivo-central`.
- El detalle de cada administrativo agrega `/{personaId}` a la ruta.

Se mantiene el layout actual. MenuBuilder proporciona entradas diferentes por grupo. La entrada raíz de React redirige al operador a Archivo Central y al grupo auditoria a su consulta; si tiene ambos, se prefiere gestión. Los demás grupos conservan su entrada.

La búsqueda se ejecuta automáticamente tras 500 ms sin pulsaciones; no se descargan todos los administrativos. Los filtros, orden y página se guardan en la URL. El detalle preserva la ruta de retorno. No se almacenan documentos ni datos personales en localStorage.

[Archivos, decisiones y validación](PRUEBAS.md).


## Fase 3 y error al abrir menús

Se encontró un bundle antiguo en siacop_backend/public/siacop-v3 que no incluía Archivo Central y apuntaba a producción. Se reemplazó la copia local por la compilación local previamente generada, conservando chunks anteriores. Es necesario recargar la pestaña para abandonar el bundle antiguo.

El visor habilita vista previa y descarga solo cuando API informa disponible. Históricos permanecen pendientes. No hay operaciones de escritura.

Por indicación del usuario, no ejecutar más builds: ESLint es suficiente para validar los cambios siguientes. scripts/build-local.cjs y build:local quedan como utilidades para uso manual explícito, no se ejecutan automáticamente.


## Rediseño incremental — Entrega 1

Listados de Archivo Central y Auditoría implementados con reutilización Metronic, sin builds ni cambios de backend. ESLint aprobado; revisión visual pendiente. [Resultado y archivos](ENTREGA_1_RESULTADO_UX.md). No se inició Entrega 2.


## Rediseño incremental — Entrega 2

Encabezado según ProfileHeader con datos reales. La refactorización autorizada el 2026-10-23 sustituye la navegación por un listado documental unificado y ordenamiento por columnas. [UX actual](UX_UI.md), [componentes](COMPONENTES.md) y [resultado](ENTREGA_2_RESULTADO_UX.md). Sin cambios de backend ni builds; revisión visual pendiente.
