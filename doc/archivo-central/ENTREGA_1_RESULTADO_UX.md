# Entrega 1 — Implementación para revisión

Fecha: 2026-10-22. Estado: código implementado y ESLint aprobado. **Validación visual pendiente. No se declara aceptación visual ni se inicia Entrega 2.**

## Alcance implementado

Listados de Archivo Central y Auditoría comparten buscador, toolbar, tabla y paginación. Se conserva la consulta/paginación del servidor y el retorno del expediente con filtros en URL. No hay cambios de backend, base de datos, API, permisos, almacenamiento ni operaciones de gestión.

## Reutilización real

- KTCard y KTCardBody envuelven el listado.
- PageTitle integra título y breadcrumb en la toolbar nativa; la cabecera anterior permanece en el detalle y no se rediseñó.
- KTIcon usa los iconos existentes magnifier, filter, folder, lock y arrow-right.
- AdministrativoTabla adapta UsersTable/UserInfoCell con useTable de react-table instalado: definición de columnas, preparación de filas, identidad con iniciales decorativas, CI secundario y acción por modo. No agrega ordenamiento, filtrado o paginación locales.
- Toolbar compacta inspirada en UsersListHeader: búsqueda y código visibles; orden/dirección en Filtros, con indicador de filtros aplicados y Limpiar.
- Paginación de aspecto Metronic con rango/total, página activa y ventana de cinco páginas más extremos. Variante opcional activada solo en el buscador: DocumentoLista conserva la presentación anterior.

Para el desplegable se usa Dropdown de React Bootstrap ya instalado, con la composición visual Metronic. Esta decisión evita una segunda instancia de MenuComponent gestionada por DOM y conserva el comportamiento de foco/cierre del control React. No se añade dependencia ni se importa el dropdown de ejemplo con filtros ficticios. Los contenedores, iconos, título y renderizado de tabla sí reutilizan componentes funcionales reales del proyecto.

Auditoría presenta Revisar expediente y no muestra acciones administrativas. Gestión presenta Abrir expediente, distintivo Solo consulta y registro deshabilitado. Los accesos entre espacios para usuarios multigrupo permanecen. No se activaron handlers de escritura.

## Archivos de implementación

Rutas relativas a src/app/modules/apps/archivo-central:

- ArchivoCentralPage.tsx: separar visualmente cabecera de listado y detalle, manteniendo acceso, rutas y caché existentes.
- components/AdministrativoBuscador.tsx: composición del listado con componentes Metronic, filtros en URL y estados existentes.
- components/AdministrativoToolbar.tsx: controles de búsqueda y filtros compartidos, con etiquetas accesibles.
- components/AdministrativoTabla.tsx: tabla compartida basada en el patrón original de usuarios.
- components/Paginacion.tsx: variante metronic opcional; valor por defecto actual para no adelantar Entrega 3.
- __tests__/interfaz.test.tsx: adaptar etiquetas de la acción de Auditoría, distintivo de consulta y título de página al nuevo árbol. No se ejecutó la suite en esta entrega, conforme a la validación acotada acordada.

No se modificaron ExpedienteDetalle, DocumentoLista, DocumentoVisor, EstadoConsulta, core/requests, core/useArchivoCentral, grupos ni rutas privadas durante esta entrega.

## Validación realizada

```bash
node node_modules/eslint/bin/eslint.js src/app/modules/apps/archivo-central --ext .ts,.tsx
```

Resultado: sin errores ni advertencias. Se aplicó el formato Prettier de los archivos intervenidos y se revisa git diff --check. No se ejecutaron builds, compilación de producción, instalación de dependencias ni actualización de archivos compilados.

## Validación visual pendiente

No hay navegador funcional confirmado en esta sesión: el lanzador Firefox requiere un Snap ausente. No se ha comprobado visualmente el resultado ni se afirma aprobación de responsive, temas, estados, foco o teclado.

Se solicitan capturas de ambos listados desde el entorno que sirva el código fuente actualizado:

| Evidencia | Claro | Oscuro |
| --- | --- | --- |
| Escritorio (referencia 1440 px) | Pendiente | Pendiente |
| Tablet (referencia 768 px) | Pendiente | Pendiente |
| Móvil (referencia 390 px) | Pendiente | Pendiente |
| Con resultados y sin resultados | Pendiente | Pendiente |
| Filtros abiertos y criterios aplicados | Pendiente | Pendiente |

También falta confirmar manualmente navegación por teclado, Escape y retorno de foco. Las capturas no validan interacción. La vista de documentos disponibles/no disponibles corresponde a Entrega 3 y permanece fuera de esta intervención.

El backend en localhost:8080 sirve una copia compilada previa: al no haber build ni copia de activos, esa copia no muestra automáticamente este rediseño. Las capturas deben obtenerse en el frontend de desarrollo que use los archivos fuente actuales.

## Punto de revisión

Detenerse aquí. Revisar capturas y comentarios del usuario, ajustar únicamente Entrega 1 si corresponde y esperar aprobación antes de modificar el encabezado/navegación del expediente en Entrega 2.


## Ajuste posterior solicitado por el usuario

Se retiraron el desplegable Filtros (orden/dirección) y la franja de filtros aplicados de los listados compartidos. Se mantienen búsqueda por CI/nombre y código, Buscar, Limpiar, paginación y distribución responsive. Se conservaron las eliminaciones realizadas por el usuario de los enlaces entre Archivo Central y Auditoría. Sin builds ni avance a Entrega 2.


## Búsqueda automática y refrescar — ajuste solicitado

Se adoptó el patrón de ListSearchComponent de Comisiones: botón Actualizar tabla con icono arrows-circle, búsqueda solid de 44 px e icono magnifier, y limpieza accesible dentro del campo. Se retiró Buscar. Tanto CI/nombre como código aplican la búsqueda tras 500 ms sin nuevas pulsaciones y reinician página. El botón de refrescar conserva criterios y página, y se deshabilita mientras hay consulta o texto pendiente. Se cancelan temporizadores al navegar, limpiar o desmontar. Sin filtros adicionales, builds ni cambios de API. La sincronización de URL respeta la versión instalada de React Router 6.3.
