# Contract: Gestión de clientes por tipo

Base path: `/api/v1/clients`.

- `GET /api/v1/clients?type=INDIVIDUAL|LEGAL_ENTITY` devuelve `{ items }` filtrado por tenant.
- `POST /api/v1/clients` crea una persona física o moral y devuelve `201`.
- `PATCH /api/v1/clients/{id}` edita datos permitidos; no acepta cambiar `type` ni `cuit`.
- `PATCH /api/v1/clients/{id}/status` activa o inactiva sin borrar físicamente.
- Los errores usan RFC 7807 en español; `400` validación, `401` autenticación, `403` permisos, `404` cliente no visible y `409` CUIT duplicado/conflicto de versión.
