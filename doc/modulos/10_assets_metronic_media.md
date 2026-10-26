# Modulo frontend: Assets Metronic public/media

## Que hace

Documenta la limpieza recomendada de `public/media`, porque Metronic incluye muchos recursos demo no usados por SIACOP V3.

## Resultado de revision inicial

- Total aproximado en `public/media`: 2450 archivos.
- Referencias directas detectadas: 123 archivos.
- Gran parte de `books`, `demo`, `email`, `features-logos`, `framework-logos`, `plugins`, `preview`, `product` y `smiles` parece no usarse directamente.

## Recomendacion segura

No borrar de inmediato. Primero mover lo no usado a una carpeta de respaldo, por ejemplo:

```text
public/media_unused_backup
```

Luego probar navegacion principal, login, dashboard, errores, modulos de control personal, reportes y mobile.

## Carpetas que no deben borrarse completas sin revisar

- `auth`
- `avatars`
- `flags`
- `icons`
- `illustrations`
- `logos`
- `misc`
- `patterns`
- `products`
- `stock`
- `svg`
