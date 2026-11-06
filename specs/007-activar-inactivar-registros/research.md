# Research: Activar e inactivar registros desde listados

## Decision 1: reutilizar la actualización existente

- **Decision**: Usar `updatePerson(id, type, { enabled: !row.original.enabled })` en lugar de `deletePerson`.
- **Rationale**: `PeopleUpdate` ya admite `enabled` y el formulario de edición ya persiste ese campo mediante PATCH. Esto evita borrar, recrear o introducir endpoints nuevos.
- **Alternatives considered**: Mantener DELETE con semántica de baja o crear endpoints separados; ambos contradicen la reversibilidad o duplican el contrato existente.

## Decision 2: etiqueta contextual derivada del estado actual

- **Decision**: Si `enabled` es `true`, mostrar `Inactivar`; si es `false`, mostrar `Activar`.
- **Rationale**: La acción comunica la transición que se ejecutará y evita mostrar una operación inválida.
- **Alternatives considered**: Mostrar siempre `Cambiar estado`; descartado porque el requerimiento pide etiquetas explícitas.

## Decision 3: conservar el permiso de actualización

- **Decision**: Autorizar con `client/update` o `user/update`, no con permisos de eliminación.
- **Rationale**: Activar/inactivar es una modificación reversible y debe seguir la autorización de actualización.
- **Alternatives considered**: Crear permisos `activate`/`deactivate`; queda fuera por no estar solicitado y requerir configuración adicional.

## Decision 4: confirmación contextual y recarga

- **Decision**: Confirmar con texto distinto para `Inactivar` y `Activar`; tras éxito, usar el callback existente para refrescar el listado.
- **Rationale**: Evita acciones accidentales y no muestra un estado no confirmado ante errores o concurrencia.
- **Alternatives considered**: Mutación optimista local; descartada para no ocultar fallos de persistencia.
