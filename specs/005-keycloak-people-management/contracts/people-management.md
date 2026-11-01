# Contract: Gestión de clientes y contadores

El profile-service expone operaciones autenticadas bajo `/api/v1/people`. Todas las respuestas usan JSON y los errores siguen el formato RFC 7807 existente.

## Listar

`GET /api/v1/people?type=client` o `GET /api/v1/people?type=user`

- Requiere la ruta correspondiente.
- Devuelve `200` con `{ "items": AdministrableIdentity[] }`.
- Devuelve `401` sin autenticación, `403` sin ruta autorizada y `502` si Keycloak no está disponible.

## Crear

`POST /api/v1/people`

Body: `type`, `firstName`, `lastName`, `alias`, `email`.

- Requiere `/client/add` o `/user/add` según `type`.
- El backend fuerza el `type` del caso de uso y no acepta un tenant del navegador.
- Devuelve `201` con la identidad creada; `400` por validación; `403` por acción ausente; `409` por conflicto de username/email.

## Actualizar

`PATCH /api/v1/people/{id}`

Body: `firstName`, `lastName`, `alias`, `email`, `enabled`.

- Requiere simultáneamente `edit` y `update` del tipo de identidad.
- El backend vuelve a leer la identidad y valida que el `type` corresponda a la pantalla.
- Devuelve `200` con la identidad actualizada; `400`, `403`, `404` o `409` según corresponda.

## Eliminar

`DELETE /api/v1/people/{id}`

- Requiere `/client/delete` o `/user/delete`.
- El frontend solicita confirmación antes de invocarlo; el backend aplica las invariantes de seguridad.
- Devuelve `204`; `400` si la eliminación viola una invariante, `403`, `404` o `409`.

## Auditoría

Cada mutación registra evento, `traceId`, `tenant_id`, `userId`, identidad afectada, tipo y resultado sin incluir secretos.
