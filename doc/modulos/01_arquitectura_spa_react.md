# Modulo frontend: Arquitectura SPA React

## Que hace

Define la estructura general del frontend SIACOP V3 como SPA React montada sobre Metronic.

## Tecnologia

- React 18.
- TypeScript.
- Create React App con `react-scripts`.
- Metronic React 8.2.0.
- Bootstrap 5.
- React Query.
- Axios.

## Entrada principal

- `src/index.tsx`
- `src/app/App.tsx`
- `src/app/routing/AppRoutes.tsx`
- `src/app/routing/PrivateRoutes.tsx`

## Rutas

React entra por rutas privadas despues de validar sesion. Las pantallas internas principales viven bajo:

```text
/apps/...
```

## Regla de diseno

- Desktop: tablas y acciones compactas.
- Mobile: cards, modales y botones de altura estable.
- Reportes: PDF en modal para desktop y descarga/apertura externa en mobile cuando aplique.
