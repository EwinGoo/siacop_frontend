# Componentes del expediente documental

- `ExpedienteDetalle`: valida persona, consulta identidad/resumen y monta un único `DocumentoLista`; conserva estados sin expediente, carga y error. Eliminado el estado local de sección y los paneles comentados.
- `ExpedienteEncabezado`: KTCard/KTCardBody/KTIcon de Metronic instalado. Identidad, CI, código y total documental. Simplificado a props persona/cantidad, sin navegación por secciones, refs de botones ni conteos por pestaña. No restaura enlaces retirados por el usuario.
- `DocumentoLista`: encabezados con clases originales table-sort/table-sort-asc/table-sort-desc de Metronic 8.2.0, botones semánticos sin apariencia de botón y foco visible local en DocumentoLista.module.scss; tabla compartida entre ambos modos. Catálogo completo de categorías, búsqueda automática tras 500 ms sin nuevas pulsaciones, orden por encabezados y paginación de servidor. Conserva categoría en negrita, nombre y descripción. Las fechas nulas usan Sin dato. Registro documental permanece deshabilitado en gestión.
- `DocumentoVisor`: modal existente, sin rediseño en esta tarea. Mantiene disponibilidad, permisos, liberación de recursos y foco al cerrar.
- `Paginacion` y `useDocumentos`: reutilizados sin cambio; filtros/orden integrados en la clave de caché existente.

No se añaden dependencias, endpoints ni componentes de gestión. Se retiran los tipos y fixtures de agrupaciones: la API ya no devuelve campos de secciones. La UI conserva su listado único por categoría.

## Archivos de esta refactorización

Código dentro de `src/app/modules/apps/archivo-central/`:

- `components/ExpedienteDetalle.tsx`
- `components/ExpedienteEncabezado.tsx`
- `components/DocumentoLista.tsx`
- `core/types.ts`
- `__tests__/interfaz.test.tsx`
- `__tests__/requests.test.ts`

Documentación dentro de `doc/archivo-central/`: PANTALLAS.md, COMPONENTES.md, ESTADO_Y_API.md, UX_UI.md, PRUEBAS.md, README.md, ENTREGA_2_RESULTADO_UX.md y AUDITORIA_TEMPLATE_Y_PROPUESTA_UX.md.

Ajuste de ordenamiento Metronic: modificados `components/DocumentoLista.tsx`, `__tests__/interfaz.test.tsx`, este documento, UX_UI.md y PRUEBAS.md; añadidos `components/DocumentoLista.module.scss` únicamente para el foco visible y su declaración tipada `DocumentoLista.module.scss.d.ts`.


## Selector de categorías y búsqueda documental

- Compartido: `src/app/modules/components/SelectorBuscable.tsx`, `SelectorBuscable.module.scss` y su declaración `.scss.d.ts`. Wrapper controlado de react-select 5.10.1 ya instalado; sin Formik, any, jQuery ni dependencias nuevas. Recibe opciones, ID seleccionado, etiqueta por inputId y callback de cambio. No mantiene una segunda selección.
- `DocumentoLista.tsx` transforma el catálogo existente a opciones con useMemo, preserva nombres originales y agrega el indicador histórico y la opción Todas las categorías. El callback guarda `categoria_id` numérico o undefined y reinicia página mediante actualización funcional, conservando búsqueda/orden.
- El texto de búsqueda documental conserva un borrador local para debounce de 500 ms; el criterio aplicado vive en filtros. Un único temporizador se cancela al escribir/desmontar. Texto equivalente tras trim conserva la referencia de filtros, sin consulta adicional. El icono KTIcon magnifier y form-control-solid reutilizan el patrón del buscador administrativo. No existe botón Buscar.
- Pruebas nuevas: `__tests__/buscador.test.tsx`; adaptadas `__tests__/interfaz.test.tsx`. Los hooks/requests/API no se modifican.

## Actualización vigente: gestión — 2026-10-23

Esta sección sustituye las afirmaciones anteriores de ausencia de componentes/endpoints de gestión.

- `ExpedienteRegistro`: confirmación de alta usando identidad existente, bloqueo de doble envío, error y actualización de React Query.
- `DocumentoRegistro`: modal React Bootstrap, formulario Formik/Yup, categoría/documento relacionados y habilitados, campos opcionales, PDF hasta 20 MiB, reemplazo previo y progreso real. Errores de validación asociados por campo.
- `SelectorBuscable`: mismo componente para consulta y registro; incorpora props opcionales de deshabilitado, error, descripción accesible y destino del portal. Los formularios no duplican su comportamiento ni estilos.
- `DocumentoLista` y `ExpedienteDetalle`: abren los nuevos formularios según capacidad informada por el servidor y muestran resultado sin sustituir la pantalla.
- `DocumentoVisor`: conserva consulta/descarga y añade eliminación con confirmación SweetAlert2 dentro del modal para respetar el foco. Gestión deshabilitada por defecto; archivos históricos/no verificados bloqueados también en API.
- `core/requests.ts`: mutaciones con el cliente Axios compartido, sesión y CSRF nativo obtenido antes de cada operación; token enviado en cuerpo, compatible con CORS actual. Sin reintentos automáticos de escritura. Conserva errores por campo.

Editar metadatos y reemplazar un PDF ya registrado no se implementan en esta entrega. Ninguna dependencia nueva.
