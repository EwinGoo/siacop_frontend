# UX/UI actual del expediente

Decisión autorizada el 2026-10-23: sustituir la navegación por secciones por un listado documental unificado, conservando el encabezado de identidad. Esta decisión sustituye la navegación propuesta en el diseño anterior.

Se reutilizan KTCard, KTCardBody, KTIcon, PageTitle, tabla responsive y controles Bootstrap/Metronic de la integración React 8.2.0 Demo1. No se copian dependencias del template adicional 8.0.38.

Categoría por defecto: Todas las categorías, incluyendo históricas. No se muestra el selector Ordenar por. Los botones nativos en cuatro encabezados admiten Tab, Enter y Espacio, usan foco del tema y una altura mínima de 44 px. Solo la columna activa expone aria-sort. Los indicadores SVG originales del tema señalan la dirección en la columna activa; las columnas inactivas reservan el espacio del indicador con table-sort. El nombre accesible anuncia la siguiente dirección.

En móvil los filtros se apilan y la tabla se desplaza horizontalmente dentro de una región etiquetada y enfocable, sin ocultar las fechas ordenables. No se añaden colores fijos, estadísticas inventadas ni avatares de muestra. El visor existente mantiene su comportamiento.

Validación visual pendiente: no hay navegador operativo disponible. Solicitar capturas de escritorio, tablet y móvil, temas claro y oscuro, con/sin resultados y documentos disponibles/no disponibles. Las pruebas de DOM no sustituyen esa revisión ni verifican contraste, recortes o PDF nativo. Revisar manualmente foco visible y desplazamiento dentro de la tabla.

No se ejecutan builds por indicación del usuario. Revisar las fuentes con el servidor de desarrollo; la copia estática que sirve el backend no se regenera en esta tarea.


## Encabezados nativos de Metronic 8.2.0

Referencia verificada: `metronic_react_v8.2.0_demo1/demo1/package.json` (8.2.0) y `src/app/modules/apps/user-management/users-list/table/columns/{UserCustomHeader,CustomHeaderColumn,_columns}.tsx`. Las reglas del demo en `_metronic/assets/sass/core/components/_tables.scss` coinciden con las integradas en SIACOP: table-sort, table-sort-asc y table-sort-desc generan indicadores mediante pseudoelementos y SVG con el color text-muted del tema.

DocumentoLista reutiliza esas clases sobre el botón semántico dentro de th, sin eventos sobre la celda ni handlers de teclado adicionales. Elimina btn/btn-light, fondos, bordes y flechas de texto. Tipografía, hover y cursor usan utilidades instaladas. Un módulo SCSS local añade únicamente el foco visible con el color primary del tema, sin afectar otras tablas. Área de interacción de altura mínima 44 px.

No se copia react-table, @ts-nocheck ni el tercer estado de orden del demo: se conserva la alternancia asc/desc, los filtros, el reinicio de página y el orden inicial fecha_registro/desc. No se introducen dependencias. La revisión visual de claro/oscuro y tamaños de pantalla sigue pendiente de capturas; no se acredita con las pruebas automatizadas.


## Categorías buscables y búsqueda automática

react-select 5.10.1 ya figura en package.json de SIACOP. Se inspeccionaron SelectField.tsx y selectStyles.ts: el wrapper existente está acoplado a Formik y usa estilos inline con colores fijos; por eso se reutiliza la librería mediante un wrapper controlado tipado y estilos encapsulados. No se instala ni copia Select2 del template.

Categoría muestra Todas las categorías inicialmente. Escribir filtra localmente de inmediato por parte del nombre sin distinguir mayúsculas ni tildes; no hace peticiones HTTP para buscar opciones. Se preservan nombres y el indicador (histórica). Elegir una opción cierra el menú y consulta por ID numérico; limpiar mediante la cruz o Retroceso, o elegir Todas las categorías, aplica undefined. Flechas/Enter/Escape y mensajes ARIA están a cargo de react-select, con etiqueta Categoría asociada al input.

Control mínimo 44 px, ancho responsive, bordes/radios/colores/foco tomados de variables del tema. Menú con scroll y portal sobre document.body para evitar recortes de tarjetas/tablas. Solo el z-index del portal usa un pequeño ajuste de react-select; los demás estilos están en el módulo SCSS compartido. No hay estado de selección duplicado.

La búsqueda documental usa lupa, form-control-solid, etiqueta accesible Nombre o descripción y consulta automática tras 500 ms sin pulsaciones. Se elimina Buscar. Cambiar texto aplicado reinicia página conservando categoría y orden; escribir términos equivalentes no añade solicitudes. El filtro sigue consultando nombre/descripción documental, sin introducir búsqueda por CI en este endpoint.

Sin builds por la instrucción previa del usuario. Pendiente revisión visual real de desktop/tablet/móvil y claro/oscuro; se necesitan capturas. No se afirma validación visual por disponer de clases responsive.

## Gestión incremental — 2026-10-23

Se implementan Registrar expediente, Registrar documento y Eliminar documento, conservando tarjeta de identidad, tabla única, filtros, ordenamiento y visor. Las operaciones aparecen únicamente en gestión y permanecen deshabilitadas cuando el backend informa `escrituras_habilitadas: false`; no se activó la configuración de despliegue.

Registrar expediente presenta identidad y CI existentes, confirmación, procesamiento, error y resultado. No solicita datos personales ni código: el código se asigna en MariaDB. Registrar documento utiliza formulario compacto responsive con Formik/Yup, selectores relacionados por ID, solo catálogos habilitados para nuevas altas, tipo original/fotocopia/fotocopia legalizada, fechas opcionales y descripción de hasta 255 caracteres. Los históricos siguen visibles en consulta.

La selección PDF muestra nombre y tamaño, admite reemplazo antes de enviar y valida hasta 20 MiB (20971520 bytes, presentado como 20 MB). El porcentaje procede de Axios cuando existe total; 100% de subida no se presenta como registro terminado. El envío queda bloqueado mientras se procesa. Los errores de servidor se asocian al campo. La comprobación real del contenido y tamaño se repite en backend.

Se reutilizan React Bootstrap Modal y las clases Metronic originales. El selector compartido permite montar el portal dentro del modal para mantener el foco y evitar recortes. Se reutiliza SweetAlert2, ya instalado y usado en Comisiones/Horarios, para confirmar la eliminación mediante nombre del documento y botones Metronic. Cancelar no escribe. Los documentos históricos/no verificables no se eliminan; el mensaje explica la restricción. Editar documento y Reemplazar PDF existente permanecen pendientes, fuera de esta entrega.

Referencias inspeccionadas:
- `metronic_react_v8.2.0_demo1/demo1/package.json`: versión 8.2.0, Demo1.
- `metronic_react_v8.2.0_demo1/demo1/src/app/modules/apps/user-management/users-list/user-edit-modal/UserEditModal.tsx`: estructura del modal.
- `metronic_react_v8.2.0_demo1/demo1/src/app/modules/apps/user-management/users-list/user-edit-modal/UserEditModalForm.tsx`: Formik/Yup, campos, validación y procesamiento. Se adapta el patrón, sin copiar lógica de usuarios/avatar ni el cierre incondicional del ejemplo ante errores.
- `metronic_react_v8.2.0_demo1/demo1/src/app/modules/apps/user-management/users-list/table/columns/UserCustomHeader.tsx`: encabezados ordenables existentes.
- `siacop_frontend/src/app/modules/apps/control-personal/comision/comision-list/components/header/ListToolbar.tsx`: confirmaciones con SweetAlert2 en SIACOP.

No se incorporan dependencias, jQuery, bibliotecas visuales nuevas ni cambios de layout global. No se realizó validación visual en navegador: quedan pendientes escritorio/tablet/móvil, temas claro/oscuro, foco/superposición de modales y vista real de PDF. Se requieren capturas para revisar esos estados cuando no haya navegador operativo.
