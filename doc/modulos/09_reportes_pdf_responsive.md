# Modulo frontend: Reportes PDF y responsive

## Que hace

Define el patron de consumo y visualizacion de reportes PDF generados por backend.

## Patron

```text
Usuario solicita reporte -> frontend envia filtros -> backend genera PDF -> frontend muestra blob/iframe o descarga
```

## Reglas de UX

- Desktop: modal con iframe cuando sea comodo.
- Mobile: descarga o apertura externa si iframe no es usable.
- Validar filtros antes de solicitar el reporte.
- Mostrar errores del backend con mensajes claros.

## Reportes principales

- Permisos.
- Comisiones.
- Declaratoria.
- Vacaciones.
- Planilla mensual.
- Bono refrigerio.
