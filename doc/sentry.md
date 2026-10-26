# Sentry en el frontend

## Que quedo implementado

- Inicializacion central en `src/app/config/sentry.ts`
- Captura de errores de React con `Sentry.ErrorBoundary`
- Integracion con React Router v6 para navegacion y rendimiento
- Contexto extra para diagnostico:
  - memoria estimada del dispositivo
  - nucleos de CPU
  - red efectiva
  - viewport
- Etiqueta especial para errores de chunks dinamicos

## Variables de entorno

- `REACT_APP_SENTRY_DSN`
- `REACT_APP_SENTRY_ENVIRONMENT`
- `REACT_APP_SENTRY_RELEASE`
- `REACT_APP_SENTRY_TRACES_SAMPLE_RATE`
- `REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE`
- `REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE`

Si `REACT_APP_SENTRY_DSN` esta vacio, Sentry no se inicializa.

## Recomendacion actual

- `tracesSampleRate=0.1` en produccion para empezar liviano
- `replaysSessionSampleRate=0` para no grabar sesiones normales al inicio
- `replaysOnErrorSampleRate=1` para grabar solo cuando haya error

## Fuente legible de errores

Ahora mismo el proyecto tiene `GENERATE_SOURCEMAP=false`.

Eso significa que Sentry va a capturar errores, pero los stack traces en produccion pueden salir minificados.

La siguiente fase profesional es:

1. Generar sourcemaps en el build de produccion.
2. Subirlos a Sentry desde CI o desde `sentry-cli`.
3. No exponerlos publicamente en el servidor final.

## Lo ideal despues

- Subir sourcemaps en el pipeline de despliegue
- Activar alertas para errores nuevos
- Revisar eventos con tag `lazy_chunk_error`
- Correlacionar errores con `device_diagnostics` para detectar PCs limitadas
