# Plan de implementación — Entrega 1

Fecha: 2026-10-22. Estado: planificación únicamente. **No hay autorización para modificar componentes.** La propuesta está aprobada con ajustes; se espera autorización expresa para ejecutar esta entrega.

Referencia: [auditoría y propuesta actualizada](AUDITORIA_TEMPLATE_Y_PROPUESTA_UX.md).

## Objetivo y frontera de la entrega

Rediseñar el listado compartido de administrativos de Archivo Central y Auditoría, con reutilización real del Metronic integrado. Conservar el comportamiento de consulta actual y diferenciar el lenguaje/acciones por modo.

Fuera de esta entrega: encabezado de expediente, pestañas documentales, lista de documentos y visor PDF. Tampoco se modifican backend, datos, API, grupos, rutas, almacenamiento, hooks de consulta ni flags de gestión. No hay builds ni despliegues.

## Base confirmada

Metronic React 8.2.0, Demo 1, layout dark-sidebar adaptado. Se confirma por README, variables de versión/demo y configuración del layout; no se atribuye el origen 8.2 a cada archivo individual sin manifiesto de distribución. El demo adicional 8.0.38 solo proporciona referencias de estructura.

## Reutilización concreta

| Pieza | Reutilización y adaptación prevista |
| --- | --- |
| MasterLayout, HeaderWrapper, Sidebar, ToolbarWrapper | Se mantienen; no se editan |
| PageTitle de layout/core/PageData.tsx | Reutilizar título/breadcrumb propios del listado dentro del módulo |
| KTCard y KTCardBody de helpers/components | Contenedor real del listado, en lugar de duplicar wrappers con clases |
| KTIcon de helpers/components/KTIcon.tsx | Iconos reales; comprobar nombres en icons-config y dar nombre accesible a botones |
| UsersListHeader y UsersListSearchComponent del original | Adaptar composición: búsqueda compacta a la izquierda, herramientas al extremo; mantener búsqueda por envío explícito |
| UsersTable y UserInfoCell del original | Adaptar useTable/columnas/filas, symbol con iniciales y texto secundario a Administrativo; sin fotos ficticias |
| UsersListPagination del original y adaptación de Comisiones | Adoptar composición del paginador con total, página activa y ventana limitada; callbacks reciben page/limit/total existentes |
| UsersListFilter del original; MenuComponent de SIACOP | Adaptar al orden/dirección existentes. Menú acotado al módulo, sin importar filtros por rol/estado del demo. Controlar foco, Escape e inicialización sin duplicar instancias |
| ListLoading y ErrorConsulta existentes | Reutilizar estados sin cambiar manejo de errores ni semántica HTTP |

UsersTable, UserInfoCell y paginación del demo son específicos de usuarios y de sus providers: no se montarán directamente. Su estructura se adaptará dentro del módulo, utilizando componentes y hook de tabla reales del proyecto. No se copia código con ts-nocheck, datos de muestra o permisos ajenos.

La tabla usa únicamente las filas de la página devuelta por API; react-table no filtra, ordena ni pagina de nuevo esos datos. Se mantienen los filtros y callbacks actuales. No se incorpora DataTables jQuery ni otra dependencia.

## Composición de la pantalla

1. **Cabecera del listado:** título y descripción breve. Breadcrumb en el sistema de página existente, sin repetir el título dentro de varias tarjetas.
2. **Toolbar compacta:** CI/nombres/apellidos, código de expediente y Buscar. Filtros abre orden/dirección. Limpiar y un indicador de filtros aplicados permanecen accesibles.
3. **Tabla:** Funcionario (iniciales decorativas, nombre y CI), Código de expediente, Documentos y acción principal identificada. Identidad alineada a la izquierda; cifra/código y acción con alineaciones consistentes. Mantener código sin truncamiento.
4. **Pie:** total y rango de registros, ventana de páginas acotada y Anterior/Siguiente. Mantener límite actual de 10 para no añadir cambios funcionales en esta entrega.
5. **Estados:** carga en la zona de resultados, mensaje de vacío contextual, error con reintento y tratamiento de sesión ya existente. La toolbar no cambia de posición por cada estado.

### Diferencias por modo

- Archivo Central: título institucional de gestión, acceso al expediente y distintivo compacto de Solo consulta mientras las operaciones permanezcan bloqueadas. La acción de registro continúa deshabilitada; no se crean handlers.
- Auditoría: título de revisión, acción Revisar expediente y ausencia de acciones administrativas. No mostrar avisos sobre operaciones que ese grupo nunca podrá ejecutar.
- Usuario multigrupo: conservar los accesos actuales a cada espacio, sin mezclar permisos ni cambiar redirecciones.

Las diferencias se configuran mediante el modo existente. No se crean dos tablas, formularios de búsqueda o paginadores independientes.

## Archivos previstos y límites

Rutas relativas a src/app/modules/apps/archivo-central, salvo indicación distinta.

| Archivo | Intervención permitida en esta entrega |
| --- | --- |
| components/AdministrativoBuscador.tsx | Composición compartida con KTCard/KTCardBody, toolbar y renderizado de tabla |
| components/Paginacion.tsx | Apariencia/piezas de paginación original y ventana acotada, preservando firma y comportamiento |
| ArchivoCentralPage.tsx | Solo retirar duplicación de cabecera del listado y ubicar aviso/accesos de modo. No rediseñar la cabecera del detalle |
| components/EstadoConsulta.tsx | Solo ajuste visual si lo requiere el contenedor; conservar props, textos de errores y acciones |
| __tests__/interfaz.test.tsx | Solo si cambian selectores/estructura de UI; no sustituye validación visual |
| doc/archivo-central/ | Registrar referencias utilizadas, resultados y pendientes |

Posibles piezas locales nuevas, si permiten separar responsabilidades: una toolbar/filtro y la definición de columnas compartidas. Deben ser usadas por ambos modos, con responsabilidad concreta. No crear un nuevo sistema de tablas ni modificar helpers globales.

**Paginacion también se usa en DocumentoLista:** revisar sus dos consumidores antes del cambio. Evitar modificar globalmente su aspecto para el listado documental todavía no aprobado. Si es necesario, agregar una opción de presentación cuyo valor por defecto conserve el aspecto actual y activar la variante Metronic únicamente en el buscador. Misma cautela con EstadoConsulta y la cabecera compartida: los cambios de Entrega 1 no deben adelantar las Entregas 2 o 3.

No editar core/requests.ts, core/useArchivoCentral.ts, tipos de contratos, ProtectedRoute/GroupRoute, permisos, rutas ni archivos del backend. No modificar _metronic globalmente ni importar archivos ejecutables desde fuera del repositorio.

## Secuencia cuando se autorice

1. Registrar estado inicial y preservar cambios existentes; confirmar props y consumidores compartidos.
2. Adaptar composición UsersList a los componentes Metronic instalados, sin tocar fetch ni filtros del servidor.
3. Aplicar tabla, celdas de identidad, acciones y pie compartidos por modo.
4. Integrar filtros compactos y sus etiquetas, foco y estado aplicado.
5. Ejecutar ESLint solamente sobre archivos modificados, sin builds. Corregir fallos de lint antes de revisión.
6. Revisar visualmente mediante navegador funcional o capturas suministradas por el usuario; registrar evidencia por tamaño/tema/estado.
7. Entregar lista de cambios, capturas revisadas, límites y resultado. **Detenerse y esperar revisión/aprobación antes de Entrega 2.**

## Matriz obligatoria de revisión visual

Tamaños de referencia, ajustables al dispositivo real: escritorio 1440 px, tablet 768 px y móvil 390 px; verificar también 320 px si existe desbordamiento.

| Revisión | Claro | Oscuro |
| --- | --- | --- |
| Escritorio: toolbar, columnas, acciones y paginación | Pendiente | Pendiente |
| Tablet: redistribución sin solapamientos | Pendiente | Pendiente |
| Móvil: nombre, CI, código y acción accesibles | Pendiente | Pendiente |
| Resultados y ausencia de resultados | Pendiente | Pendiente |
| Panel de filtros abierto y filtro aplicado | Pendiente | Pendiente |
| Carga, error y sesión expirada | Pendiente | Pendiente |

Teclado: Tab/Shift+Tab, apertura/cierre de filtros con teclado, Escape, foco visible, acción principal y paginador. No comunicar selección/bloqueo solo por color. El panel no debe perder criterios al cerrarse.

Las pruebas de documentos disponibles/no disponibles se exigen en Entrega 3. En Entrega 1 no se modifica el visor: esas condiciones no se dan por validadas ni se alteran mediante el rediseño.

## Disponibilidad real de navegador y capturas necesarias

Se comprobó `/usr/bin/firefox`: es un lanzador que falla porque no está instalado Firefox Snap. No se encontró un Chromium/Chrome utilizable. Por tanto **no hay navegador funcional confirmado en esta sesión** y no se afirma haber validado visualmente las pantallas.

Para revisar esta entrega, se solicitarán capturas de ambos listados en escritorio, tablet y móvil, en tema claro y oscuro, con resultados y sin resultados, y al menos una captura del panel de filtros abierto. Pueden utilizarse datos ficticios u ocultarse CI/nombres. Si falta evidencia visual, se indicará como pendiente y no se declarará finalizado ese criterio. Las capturas no prueban por sí solas el comportamiento del teclado; también debe confirmarse manualmente.

## Criterios de aceptación y revisión

- Uso comprobable de componentes Metronic y patrón UsersList; no solo nuevas clases CSS.
- Una búsqueda/tabla compartida para ambos modos, con diferencias de acciones respetadas.
- Consultas, filtros, página y retorno del expediente conservados.
- Sin datos ficticios de identidad real, KPI inventados, nuevas acciones de gestión ni filtros no soportados.
- Lint correcto y evidencia visual revisada para la matriz aplicable.
- Ningún cambio funcional de backend, datos, permisos, almacenamiento o API.
- Sin builds ni cambios de archivos compilados.
- Pausa para revisión al entregar; no iniciar Entrega 2 automáticamente.

## Estado actual

Solo se actualizaron la propuesta y este plan. No se modificó código. La siguiente acción depende de autorización expresa para implementar Entrega 1.


## Ejecución autorizada y resultado

Después de este plan, el usuario autorizó implementar con «ahora si implementa». Se ejecutó únicamente Entrega 1 y se detuvo para revisión. Véase [ENTREGA_1_RESULTADO_UX.md](ENTREGA_1_RESULTADO_UX.md). La matriz visual permanece pendiente; la autorización de esta entrega no habilita Entrega 2.
