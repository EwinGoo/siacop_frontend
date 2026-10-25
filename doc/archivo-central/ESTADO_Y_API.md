# Estado, API y validación

Contrato canónico: [API backend](../../../siacop_backend/doc/archivo-central/API.md). Los tipos de producción ya están en core/types.ts; las definiciones de abajo conservan el contrato de referencia.

```typescript
type TipoDocumento = 'FOTOCOPIA' | 'FOTOCOPIA-LEGALIZADA' | 'ORIGINAL'
type EstadoArchivo = 'sin_archivo' | 'historico_pendiente' | 'disponible' | 'no_disponible'
interface ApiResponse<T> {
  status: 'success' | 'error'
  data: T | null
  message: string
  timestamp: string
}
interface Pagina<T> {
  data: T[]
  pagination: {page: number; items_per_page: number; total: number}
}
interface AccesoArchivo {
  puede_consultar: boolean
  puede_gestionar: boolean
  escrituras_habilitadas: boolean
}
interface AdministrativoResumen {
  persona_id: number
  ci: string
  expedido: string
  nombre: string
  paterno: string
  materno: string | null
  apellido_de_casado: string | null
  nombre_completo: string
  tiene_expediente: boolean
  codigo_archivo: number | null
  cantidad_documentos: number
}
interface ExpedienteResumen {
  persona: AdministrativoResumen
  codigo_archivo: number
  fecha_registro: string | null
  cantidad_documentos: number
}
interface DocumentoResumen {
  id: number
  persona_id: number
  documento_id: number
  categoria_id: number | null
  nombre: string | null
  categoria: string | null
  tipo: TipoDocumento | null
  fecha_inicio: string | null
  fecha_fin: string | null
  descripcion: string | null
  fecha_registro: string | null
  archivo: {estado: EstadoArchivo}
}
interface BusquedaAdministrativos {
  search?: string
  codigo_archivo?: number
  page: number
  limit: number
  sort?: 'nombre' | 'ci' | 'codigo_archivo'
  order?: 'asc' | 'desc'
}
interface BusquedaDocumentos {
  page: number
  limit: number
  categoria_id?: number
  documento_id?: number
  search?: string
  sort?: 'nombre' | 'fecha_registro' | 'fecha_inicio' | 'fecha_fin'
  order?: 'asc' | 'desc'
}
```

Los tipos de catálogos se implementarán con los campos explícitos del contrato backend. No usar `any` para respuestas o errores. El cliente debe validar fallos y propagar errores a React Query; nunca convertir fallo HTTP en lista vacía.

## Estado y peticiones

Usar React Query 3 instalada. Claves incluyen usuario/sesión, persona, filtros, orden y página. Invalidar/limpiar caché documental al cerrar sesión o cambiar usuario; no persistir expedientes en localStorage. Desactivar reintentos para 401/403/404/422. Cancelación y debounce para evitar respuestas de filtros antiguos; keepPreviousData para paginación con indicador de actualización.

Una petición de catálogos obtiene agrupaciones y acceso; no repetir llamadas por cada fila ni reconstruir el mapa por IDs en React. API_ROUTES tendrá ARCHIVO_CENTRAL bajo la base existente, verificando que incluya `/api/v1` exactamente una vez. withCredentials y sesión actual, sin tokens/autenticación paralelos. El acceso se deniega visualmente mientras no se haya confirmado; errores de configuración no deben habilitar gestión.

En Fase 3 elegir URL autenticada o blob según despliegue y comprobar credenciales, respuestas no PDF y liberación de memoria. En Fase 4 integrar CSRF de sesión y renovación del token con backend; CORS no sustituye CSRF.

## Pruebas previstas

Testing Library/Jest con datos ficticios y requests simulados: acceso por cada grupo, rechazo de ruta directa, UI diferenciada, multigrupo, escritura bloqueada para operador/administrador, búsqueda y paginación, listado unificado, categorías inactivas, fechas/tipos nulos, sin expediente, histórico pendiente, error HTTP distinto de vacío, sesión expirada y teclado/foco del visor.

Verificación manual de escritorio/tablet/móvil y descarga con sesión. Para esta refactorización ejecutar pruebas del módulo y ESLint, sin builds conforme a la instrucción del usuario. Si `ignoreDeprecations: 6.0` impide typecheck con TS 4.7.4, registrar el fallo y resolver de forma acotada antes de declarar terminada la fase correspondiente; no ocultarlo con afirmaciones de validación exitosa.

Los resultados de validación de Fase 2 están en PRUEBAS.md.


## Estado implementado en Fase 2

El módulo crea su propio QueryClient en memoria. Se destruye al desmontar el módulo o cambiar identidad/grupos; las claves contienen recurso, persona, filtros y página y están aisladas por ese cliente de sesión. cacheTime es 0, refetchOnWindowFocus false. Se reintenta una sola vez un error de red; no se reintentan errores HTTP. AbortSignal se transmite a Axios, y se conserva withCredentials.

Se usa axiosClient compartido con el manejador de seguridad común, con URL completa derivada de API_ROUTES y timeout de 20 segundos. El sobre success debe contener data no nulo; los errores se propagan a React Query con mensajes locales sin SQL ni mensajes internos del servidor. Sesión expirada ofrece el login MVC del backend, también al usar un origen de desarrollo distinto.

Administrativos: búsqueda automática tras 500 ms; filtros/orden/página permanecen en URL. Documentos: búsqueda automática tras 500 ms sin botón Buscar y consulta unificada sin enviar `seccion`; categoría usa todo `catalogos.categorias`, incluidas entradas históricas. El contrato vigente ya no incluye seccion, conteos_seccion ni agrupaciones; tampoco admite el parámetro seccion.

La clave existente de React Query es `['archivo-central', 'documentos', personaId, filtros]`. Incluye categoría, búsqueda, sort, order y página. Los encabezados envían únicamente la unión tipada de campos admitidos: nombre, fecha_registro, fecha_inicio y fecha_fin. Estado inicial fecha_registro/desc. Cambio de columna: nombre/asc y fechas/desc; segundo clic alterna. Cambiar filtros/orden reinicia página sin perder los demás valores. El servidor ya valida lista blanca, ordena antes de paginar y desempata por ID documental descendente; no se modifica el endpoint.

El modal conserva filtros y página al cerrar. El estado documental es local: no se promete conservarlo después de abandonar la pantalla ni persistirlo en almacenamiento.

Se mantienen componentes y requests exclusivamente de lectura. La agrupación histórica y autorización definitiva permanecen en backend.


## Transporte compartido vigente

Las consultas y los PDF usan axiosClient de app/services, que comparte handleAuthError con Axios global. Los 401 conducen al login del backend y los 403 con TWO_FACTOR_REQUIRED al flujo de verificación. Otros 403 conservan la sesión y se propagan. El módulo mantiene su validación de respuesta, MIME, mensajes locales y cancelación, sin un interceptor propio. Ver ../SEGURIDAD_HTTP.md.
