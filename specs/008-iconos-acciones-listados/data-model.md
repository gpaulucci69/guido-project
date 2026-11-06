# Data Model: Iconos para acciones de listados

No se agregan entidades ni campos. Se documenta el contrato visual de las acciones existentes.

| Acción | Condición | Nombre accesible | Flujo conservado |
|---|---|---|---|
| Editar | Permiso de edición | `Editar` | Abre el modal de edición |
| Inactivar | Registro `enabled=true` y permisos de edición/actualización | `Inactivar` | Confirma y cambia `enabled` a `false` |
| Activar | Registro `enabled=false` y permisos de edición/actualización | `Activar` | Confirma y cambia `enabled` a `true` |

## Invariantes

- La acción contextual se determina por el estado actual del registro.
- El texto visible puede ser reemplazado por el SVG, pero la acción mantiene un nombre accesible en español.
- La falta de permiso no crea un botón ni un icono ejecutable.
- Los iconos no modifican identificadores, datos, requests ni persistencia.
