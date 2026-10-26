# Documentacion general SIACOP V3 - Frontend

## Proposito

Este documento unifica la documentacion vigente del frontend React de SIACOP V3. El frontend vive en `siacop_frontend/` y se publica como build dentro del backend, recomendado en `siacop_backend/public/siacop-v3`.

## Tecnologia

- React 18.
- TypeScript.
- Create React App con `react-scripts`.
- Metronic React 8.2.0 adaptado a SIACOP.
- Bootstrap 5.
- React Router DOM 6.
- React Query 3.
- Axios.
- Formik + Yup.
- React Table.
- html5-qrcode.

Importante: el frontend no usa Vite.

## Arquitectura frontend

La SPA se monta sobre la sesion existente del backend. No implementa un login independiente para el flujo operativo normal.

```text
siacop_backend login -> cookie de sesion -> siacop_frontend -> ApiSiacop
```

## Ruta publica

La ruta recomendada para el build es:

```text
/siacop-v3
```

En `package.json`:

```json
"homepage": "/siacop-v3"
```

## Modulos documentados

La documentacion consolidada por modulo esta en:

```text
doc/modulos/
```

Indice principal:

```text
doc/modulos/00_indice_modulos.md
```

## Documentos anteriores y estado

| Documento | Estado recomendado |
| --- | --- |
| `frontend.md` | Resumen tecnico anterior; mantener como respaldo. |
| `backend.md` | Resumen de integracion con backend; mantener como respaldo. |
| `DOCUMENTACION_GENERAL_IMPLEMENTACION.md` | Documento largo de implementacion; usar como fuente extendida. |
| `doc/frontend/*` | Documentacion especifica de vistas; mantener para detalle de pantallas. |
| Manuales `.md` y `.docx` | Material de usuario/anexo; mantener. |
| Costos y calidad | Material academico; revisar con observaciones de defensa. |

## Regla de mantenimiento

Toda nueva vista relevante debe documentarse en `doc/frontend/` con prefijo numerico. Toda documentacion de modulo debe agregarse o actualizarse en `doc/modulos/`.
