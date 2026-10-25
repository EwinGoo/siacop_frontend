# Entrega 2 — Encabezado del expediente

Actualizado el 2026-10-23 tras autorización de la refactorización documental. La navegación propuesta inicialmente ha sido sustituida por un listado unificado; ver [UX actual](UX_UI.md) y [componentes](COMPONENTES.md).

Se conserva el patrón ProfileHeader adaptado a identidad institucional: nombre, CI, código y cantidad documental reales. Las iniciales provienen del nombre recibido. Se eliminan los estados, props y código comentado de navegación, sin restaurar botones retirados por el usuario.

La consulta documental comparte tabla entre Auditoría y Archivo Central. La gestión sigue deshabilitada, el visor conserva sus restricciones y no se modifica backend, API, MariaDB, almacenamiento ni SIACOP2.

No se ejecutan builds ni se actualiza la copia estática servida por backend. Validación visual pendiente; revisar mediante servidor de desarrollo y capturas. Resultados automatizados actuales en [PRUEBAS.md](PRUEBAS.md).
