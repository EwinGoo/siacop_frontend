# Auditoría del template y propuesta de rediseño

Fecha: 2026-10-22. Etapas A y B. Propuesta aprobada con ajustes; ejecución aún no autorizada; no se modificaron archivos de implementación, estilos globales, API ni backend para esta auditoría. No se ejecutaron builds.

## 1. Alcance y evidencia

Se revisaron el módulo documental actual, layout y recursos de `src/_metronic`, páginas locales de perfil/documentos, listados de Comisiones y Declaratoria de Comisión, vistas MVC de Usuarios y Declaración Jurada, y el template adicional en `/var/www/html/metronic_template`.

El template adicional declara `name: demo1` y `version: 8.0.38` en package.json. Es una fuente local de ejemplos de Metronic, pero no prueba que todo su código corresponda exactamente a 8.2. Contiene imports antiguos como KTSVG; SIACOP dispone de KTIcon. Se reutilizarán los componentes de SIACOP y se adaptarán los patrones del ejemplo, sin importar su configuración ni dependencias.

Las capturas recibidas anteriormente muestran Principal y el error 500, no las pantallas de listado/expediente. Las observaciones visuales de esas pantallas se basan en el código inspeccionado; no se presenta una comparación de píxeles ni una revisión en navegador como ya realizada.

## 2. Inventario verificable

Rutas relativas a siacop_frontend, salvo indicación contraria.

| Recurso encontrado | Ubicación | Uso propuesto y adaptación |
| --- | --- | --- |
| Layout, sidebar y header | src/_metronic/layout/MasterLayout.tsx; components/sidebar y components/header | Reutilizar íntegros; no cambiar shell global |
| Título, descripción y breadcrumbs | src/_metronic/layout/core/PageData.tsx; components/toolbar/page-title | Usar PageTitle dentro del módulo; evitar títulos duplicados |
| Variantes de toolbar | src/_metronic/layout/components/toolbar/toolbars/ToolbarClassic.tsx, ToolbarExtended.tsx | Referencia de jerarquía y compactación; no cambiar variante global |
| Contenedores de tarjeta | src/_metronic/helpers/components/KTCard.tsx y KTCardBody.tsx | Reutilización directa; una tarjeta principal para el listado |
| Iconos | src/_metronic/helpers; assets/keenicons | KTIcon para búsqueda, filtro, persona, carpeta, PDF y acciones, verificando nombres existentes |
| Listado original de usuarios | /var/www/html/metronic_template/src/app/modules/apps/user-management/users-list/ | Referencia principal de toolbar/tabla/paginación; no copiar sus providers ni DTO de usuarios |
| Cabecera y filtros originales | users-list/components/header/UsersListHeader.tsx y UsersListFilter.tsx del template adicional | Búsqueda a la izquierda y herramientas a la derecha; filtros secundarios desplegables |
| Tabla y celda de usuario originales | users-list/table/UsersTable.tsx y columns/UserInfoCell.tsx del template adicional | Identidad con symbol e información secundaria, cabecera de tabla Metronic, acción alineada a la derecha |
| Perfil original, también presente en SIACOP | src/app/modules/profile/ProfileHeader.tsx y ProfilePage.tsx | Adaptar estructura de identificación/resumen/pestañas; no reutilizar avatar ficticio, métricas comerciales o datos de ejemplo |
| Documentos originales | src/app/modules/profile/components/Documents.tsx | Referencia de iconos PDF/carpeta y toolbar compacta; no adoptar una cuadrícula de tarjetas por cada documento |
| Tarjetas documentales | src/_metronic/partials/content/cards/Card4.tsx | Solo referencia: su enlace # y geometría grande no sirven directamente para este expediente |
| Tablas originales | src/_metronic/partials/widgets/tables/TablesWidget11.tsx y familia TablesWidget* | Patrón de identidad/etiquetas/acciones. No montar widgets con contenido ficticio |
| Listado de Comisiones | src/app/modules/apps/control-personal/comision/comision-list/ | Referencia SIACOP de toolbar responsive, tabla/tarjetas y menú de filtros |
| Paginación de Comisiones | components/pagination/ListPagination.tsx dentro del listado anterior | Reutilizar aspecto y ventana acotada de páginas; adaptar al DTO documental existente, sin copiar su contexto |
| Declaratoria de Comisión | src/app/modules/apps/control-personal/declaratoria-comision/declaratoria-comision-list/ | Referencia de filtros, estados, modales y metadatos; no confundir con Declaración Jurada |
| Modal de detalle existente | declaratoria-comision-list/data-view-modal/DataViewModal.tsx | Referencia de Modal XL/scrollable; conservar React Bootstrap ya instalado |
| Usuarios MVC | siacop_backend/app/Views/seguridad/usuarios/seguridad_usuarios_listar.php | Coherencia de búsqueda solid, toolbar, tabla y acciones institucionales |
| Declaración Jurada MVC | siacop_backend/app/Views/personal/editar/declaracionJuradaPage.php | Referencia institucional de cabecera compacta y listado |
| DataTables jQuery | siacop_backend/public/js/DatosPersonales/PrivatePersonalController/declaracionJuradaPage.js | Está configurado serverSide. Referencia visual/funcional, no introducir jQuery en React |
| Drawer original | /var/www/html/metronic_template/src/_metronic/partials/layout/activity-drawer/ActivityDrawer.tsx | Disponible como patrón; no se recomienda importarlo para el PDF por su ciclo DOM/data-kt-drawer y contenido de actividad |
| Menús | src/_metronic/assets/ts/components; filtros de Comisiones | Reutilizar MenuComponent si se usa dropdown nativo; controlar inicialización y destrucción |
| Modales originales | src/_metronic/partials/modals/ | Patrones de estructura/espaciado; los asistentes create-app/invite-users no corresponden al flujo documental |
| Carga de archivos original | template adicional: src/_metronic/partials/layout/InboxCompose.tsx; user-management/.../UserEditModalForm.tsx | Hay markup dropzone y avatar input; no es un cargador PDF listo para integrar. No implementar carga en este rediseño |
| Tokens y utilidades | src/_metronic/assets/sass/core/components/_variables.scss, _variables-dark.scss, _nav-line-tabs.scss, _menu.scss, _drawer.scss; assets/sass/components/_variables.custom.scss | Usar tokens/clases existentes; no cambiar variables globales |
| Tema | src/_metronic/partials/layout/theme-mode/ThemeModeProvider.tsx; src/app/hooks/useEffectiveTheme.ts | Respetar light/dark/system; evitar blancos, negros y colores fijados por CSS local |
| Activos documentales | public/media/svg/files/pdf.svg, pdf-dark.svg, folder-document.svg y variantes dark | Reutilizar activos con variante de tema, sin imágenes nuevas |
| Carga existente | src/app/modules/components/loading/ListLoading.tsx | Reutilización directa, con estructura de carga/empty/error adecuada al área afectada |

No se identificó una aplicación React independiente de File Manager o una página completa de detalle de proyecto dentro de los directorios de ejemplos inspeccionados. Sí existen ProfileHeader, Documents y Projects dentro de Profile. La propuesta se apoya en esos recursos reales, no en rutas de un demo online supuesto. Los HTML hallados dentro de assets corresponden principalmente a iconos/plugins, no se cuentan como páginas de producto reutilizables.

## 3. Diagnóstico de la implementación actual

### Archivo Central y Auditoría

- ArchivoCentralPage añade una cabecera propia y el buscador vuelve a añadir otra cabecera de tarjeta. La jerarquía reparte el título entre dos lugares.
- AdministrativoBuscador separa el formulario de búsqueda, las opciones de orden y la tabla en varias filas. El área de controles ocupa demasiado alto para dos criterios principales.
- La tabla ya tiene datos correctos, pero carece del patrón completo de identidad/symbol, cabecera tipográfica, alineaciones y acción compacta del listado original de usuarios.
- El aviso de gestión ocupa un bloque de ancho completo; junto con botones deshabilitados en distintos lugares, desplaza la tarea principal de consulta.
- Paginacion solo presenta Anterior/Siguiente. Su aspecto y densidad difieren de las paginaciones Metronic del sistema.
- ExpedienteDetalle divide identificación/resumen y navegación/lista en tarjetas separadas. Puede aprovechar mejor la composición de perfil para unir identidad, métricas disponibles y secciones.
- DocumentoLista vuelve a usar un formulario alto y ofrece un botón de detalle por fila. Las acciones de consulta pueden ser más directas, conservando disponibilidad/autorización actuales.
- DocumentoVisor dedica primero el espacio a metadatos; cuando existe PDF, la jerarquía puede favorecer la lectura del archivo y situar los datos a un lado.

### Coherencia con SIACOP

Usuarios MVC y Declaración Jurada usan card-title/card-toolbar, búsqueda con icono y controles solid. Comisiones adapta ese patrón a React y a móviles. Se adoptará esa gramática visual, sin trasladar selección masiva, exportación, filtros de estado o acciones que Archivo Central no soporta.

La densidad de ciertos ejemplos —avatar muy grande, paneles comerciales y múltiples métricas— sería excesiva aquí. El perfil se reducirá a los datos disponibles: nombre, CI/expedido, código y cantidad de documentos. No se inventarán foto, cargo, unidad, estado laboral, porcentaje de completitud ni estadísticas globales.

## 4. Propuesta por pantalla

### A. Listado de Archivo Central

Referencia: UsersListHeader + UsersTable + UserInfoCell del template local, adaptados a KTCard/KTCardBody y al listado de Comisiones de SIACOP.

1. Título y breadcrumb en el sistema PageTitle existente: Archivo Central / Expedientes.
2. Una tarjeta de listado. Toolbar en una sola franja en escritorio: búsqueda CI/nombres, código de expediente compacto y botón Buscar; al extremo, Filtros y el estado Solo consulta.
3. Orden y dirección pasan al panel desplegable Filtros. Solo parámetros ya admitidos por API. Indicador de filtros aplicados con acción Limpiar.
4. Tabla: Funcionario (iniciales decorativas + nombre + CI), Código, Documentos y acción Abrir expediente alineada a la derecha. Código con ancho estable y cifras legibles.
5. Paginación con ventana de páginas acotada, total y controles de navegación. Conservar paginación del servidor y filtros en URL.
6. Sin barras de acciones masivas ni exportación. Mientras gestión siga bloqueada, un estado compacto explica la restricción; no presentar un gran botón deshabilitado como acción principal.

En móvil la búsqueda ocupa una fila, el código/filtros otra; la identidad conserva CI visible y cantidad de documentos se puede presentar como texto secundario. No depender del hover para abrir acciones.

Mejora esperada: llegar antes a resultados, reducir altura de filtros y localizar expediente/acción con una jerarquía estable.

### B. Listado de Auditoría Interna

Referencia: el mismo listado administrativo original, con composición de consulta.

Comparte tabla y filtros con Archivo Central; cambia título, descripción y lenguaje de acción a Revisar expediente. No muestra botones de registro, edición o eliminación, ni avisos de funciones administrativas que Auditoría nunca podrá usar. Los usuarios con varios grupos conservan el acceso a cambiar de espacio sin mezclar acciones.

Mejora esperada: tarea de revisión explícita, sin ruido administrativo ni una segunda implementación del listado.

### C. Detalle de expediente en ambos espacios

Referencia: ProfileHeader y su navegación nav-line-tabs, reducidos a información institucional disponible.

1. Breadcrumb y regreso al buscador que conserva la búsqueda anterior.
2. Encabezado compacto con symbol de iniciales, nombre, CI/expedido y dos resúmenes integrados: código y documentos. No usar avatar de muestra ni tarjetas KPI independientes.
3. Actualización 2026-10-23: un único listado documental debajo del encabezado, con categoría y ordenamiento por columnas; sustituye la navegación inicialmente propuesta.
4. Lista documental continua debajo. Buscar por nombre/descripción como acción principal; categoría y orden en filtro compacto/desplegable.
5. Columna Documento con icono PDF según tema, título y categoría; tipo y fecha de registro alineados; descripción abreviada visualmente con texto completo en detalle.
6. Estado de archivo legible: disponible, histórico pendiente o sin archivo. Acceso a detalle siempre que ya esté permitido; visualizar/descargar solo cuando archivo esté disponible, conservando comprobación del backend.

No se ofrecerán contadores globales nuevos ni búsquedas sobre datos que API no filtre. La organización seguirá usando catalogos.agrupaciones; no habrá IDs de categoría en JSX.

### D. Visor documental

Referencia: Documents y activos documentales para iconografía; Modal XL/scrollable existente en Declaratoria de Comisión para comportamiento. Se conserva el modal React Bootstrap en vez de introducir un drawer global.

En escritorio: área PDF principal y columna estrecha de metadatos. Encabezado con nombre y categoría; descarga compacta junto a las acciones de consulta. En móvil: metadatos resumidos y visor apilados, cierre siempre accesible. Si no hay archivo disponible, el mensaje de estado sustituye el área PDF sin dejar un gran espacio vacío.

Conservar cancelación de solicitudes, liberación de URLs temporales, errores de sesión, nombres de descarga, foco y teclado. No añadir subida, reemplazo ni eliminación mediante este rediseño.

### E. Formularios y eliminación

Solo se identificaron referencias del template. No se implementarán formularios de carga/edición ni nuevas confirmaciones destructivas en esta intervención: la gestión permanece restringida y no existe autorización para habilitarla. El patrón definitivo se abordará cuando el backend permita esas operaciones.

## 5. Componentes reutilizados y límites

Reutilización directa: MasterLayout, PageTitle, KTCard, KTCardBody, KTIcon, Modal de React Bootstrap, ListLoading, utilidades de tabla/menu/nav/pagination y tema existentes.

Adaptación de patrón: UsersTable/UserInfoCell, ProfileHeader y Documents contienen datos/contratos específicos o ficticios. No se montarán directamente ni se copiarán sus providers. Los componentes documentales ya existentes recibirán la composición nueva.

Ajuste solicitado: el listado adaptará la estructura original de UsersTable con useTable de react-table ya instalado, junto con KTCard, KTCardBody, KTIcon y PageTitle. La reutilización no se limitará a clases CSS. La tabla representará únicamente la página recibida; búsqueda, orden y paginación seguirán en servidor, sin añadir procesamiento local alternativo. No incorporar DataTables jQuery, select2, MUI ni otra biblioteca visual.

Para filtros, preferir el dropdown React Bootstrap ya disponible con clases Metronic y control de foco; si se adopta data-kt-menu, inicializar únicamente el menú del módulo y limpiar su ciclo de vida. No usar ambos mecanismos en el mismo control.

## 6. Archivos previstos tras aprobación

Todos bajo src/app/modules/apps/archivo-central, salvo indicación explícita:

| Archivo | Cambio propuesto |
| --- | --- |
| ArchivoCentralPage.tsx | PageTitle, jerarquía de encabezado y estado compacto de consulta |
| components/AdministrativoBuscador.tsx | Toolbar, identidad de fila, columnas y filtros compactos compartidos |
| components/Paginacion.tsx | Aspecto Metronic y ventana acotada sin cambiar contrato de paginación |
| components/ExpedienteDetalle.tsx | Encabezado inspirado en perfil y secciones integradas |
| components/DocumentoLista.tsx | Tabla documental, filtro compacto y disponibilidad visible |
| components/DocumentoVisor.tsx | Modal de lectura con PDF/metadatos y acciones de consulta |
| components/EstadoConsulta.tsx | Estados coherentes con el nuevo contenedor, sin cambiar semántica HTTP |
| __tests__/interfaz.test.tsx | Ajustar selectores/estructura accesible si la implementación aprobada lo necesita |
| doc/archivo-central/ | Actualizar pantallas y decisiones del rediseño |

Se extraería una pequeña pieza compartida de toolbar/filtros solo si ambas listas la necesitan realmente; no se crean por adelantado nuevos sistemas de tablas, providers, layouts ni componentes vacíos.

No se prevén cambios en core/requests.ts, core/useArchivoCentral.ts, grupos, rutas privadas, configuración API, backend, almacenamiento, archivos PDF o base de datos. Cualquier necesidad funcional fuera de esta lista debe explicarse antes de ampliar el alcance.

## 7. Riesgos y criterios de aceptación

- Filtros ocultos: mostrar estado aplicado y permitir limpiar sin abrir el panel. Conservar envío explícito de búsqueda y reinicio de página.
- React frente a plugins DOM: elegir un mecanismo de dropdown y preservar foco/cierre con Escape; evitar listeners duplicados.
- Tema oscuro: usar tokens gray/light/primary semánticos y activos dark; no copiar bg-white/text-dark rígidos del template antiguo.
- Accesibilidad: etiquetas aunque se compacten visualmente, botones nativos, foco visible, nombre accesible de acciones, aria-current y contadores que no se comuniquen solo por color.
- Móvil: ninguna acción esencial desaparece al ocultar columnas; nombre/CI/código siguen disponibles, filtros se apilan y modal cabe en el viewport.
- Privacidad y funcionalidad: no añadir datos personales, métricas, filtros o acciones nuevos; mantener sesión, grupos y disponibilidad PDF.
- Paginación: no listar miles de páginas; conservar búsqueda, orden y página al volver del detalle.
- Gestión bloqueada: la reorganización visual no añade handlers de escritura ni activa controles por pertenecer al grupo operador.

Validación acordada: ESLint de los archivos modificados y revisión manual de light/dark, tamaños móvil/tablet/escritorio, teclado y sesión. No ejecutar builds; se mantiene la instrucción previa del usuario. ESLint no sustituye la revisión visual obligatoria. No cambiar activos compilados, publicar ni desplegar como parte de esta auditoría.

## 8. Orden propuesto para implementación

1. Listado compartido, empezando por Archivo Central y revisando la variante Auditoría.
2. Encabezado y navegación del expediente.
3. Lista documental y visor.
4. Revisión conjunta de temas, responsive, accesibilidad y ausencia de cambios funcionales.

## 9. Punto de aprobación

Aprobar o ajustar esta propuesta antes de modificar el frontend, conforme a la Etapa C del documento del usuario. La aprobación solicitada cubre únicamente este rediseño UX/UI; no habilita gestión, cambios de seguridad, API, base de datos ni builds.


## 10. Ajustes aprobados y condiciones de ejecución

Estas condiciones sustituyen cualquier recomendación anterior incompatible.

### Identidad de la integración

La integración declara Metronic React **8.2.0, Demo 1**, adaptado a SIACOP. Evidencias: README.md, REACT_APP_VERSION=v8.2.0 y REACT_APP_THEME_DEMO=demo1 en .env y .env.production; _LayoutConfig.ts declara layoutType dark-sidebar. MasterLayout usa HeaderWrapper, Sidebar, ToolbarWrapper y PageDataProvider del proyecto. El identificador persistente metronic-react-demo1-8150 es una clave de configuración, no una prueba de versión del paquete.

No existe una dependencia npm Metronic con un lockfile que certifique la procedencia exacta de cada archivo: la confirmación corresponde a los metadatos y composición realmente integrados. El template adicional declara 8.0.38 y no se copiarán sus dependencias, configuración, imports antiguos ni recursos que entren en conflicto con SIACOP.

### Reutilización real y alcance

Listados: UsersListHeader/UsersTable/UserInfoCell/UsersListPagination son las referencias principales. Se reutilizarán los componentes Metronic instalados y el renderizado con react-table ya presente, adaptando datos y callbacks; no se importarán providers de usuarios/comisiones ni componentes con tipado específico o ts-nocheck. Búsqueda, tabla y paginación serán comunes a Archivo Central y Auditoría; las acciones y títulos dependen del modo ya existente.

Expediente: adaptar la identidad de ProfileHeader a nombre, CI, código y cantidad documental; listado unificado según UX_UI.md. Sin avatares ficticios, tarjetas KPI decorativas, indicadores de completitud ni estadísticas nuevas.

Visor: PDF principal y panel secundario de metadatos en escritorio; apilados en móvil. Conservar autorización, disponibilidad, cancelación y liberación de recursos existentes.

### Tres entregas con pausa obligatoria

1. **Entrega 1:** listados de Archivo Central y Auditoría. Única entrega cuyo plan detallado se prepara ahora.
2. **Entrega 2:** encabezado y navegación del expediente. No iniciar sin revisión y aprobación de Entrega 1.
3. **Entrega 3:** listado documental y visor PDF. No iniciar sin revisión y aprobación de Entrega 2.

Al terminar cada entrega se detendrá el trabajo para revisión y aprobación. La aceptación de esta propuesta no equivale a autorización de modificación de componentes; el usuario ha solicitado solo documentación y planificación en este momento.

### Validación visual obligatoria

Cada entrega requiere revisión de escritorio, tablet y móvil en claro/oscuro. Los listados requieren estados con/sin resultados, filtros y estados de carga/error; Entrega 3 añade documentos disponibles/no disponibles. ESLint correcto no permite declarar finalizado visualmente un componente.

Disponibilidad comprobada en esta sesión: no se encontró Chromium/Chrome utilizable; firefox --version devuelve que falta firefox Snap. No hay navegador funcional demostrado para inspeccionar estas pantallas. No se instala software ni se afirma haber visto renders inexistentes.

Será necesario solicitar al usuario capturas de las pantallas de la entrega implementada en los tamaños y temas indicados. Las capturas sirven para revisión visual asistida; foco, Escape y navegación por teclado requieren además comprobación interactiva. Si no hay evidencia, esa validación se marca pendiente y no se declara la entrega visualmente aprobada.

### Invariantes

Sin modificaciones de backend, base de datos, contratos API, rutas, permisos, almacenamiento o reglas de negocio. Sin habilitación de gestión, subida, edición o eliminación. Sin builds ni cambios de activos compilados. Conservar consulta, filtros, retorno del detalle y acceso documental existentes.

Plan operativo de la primera entrega: [PLAN_ENTREGA_1_UX.md](PLAN_ENTREGA_1_UX.md).
