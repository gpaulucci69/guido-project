# Validación de Cobranzas v1

La validación automatizada local ejecutada el 30/10/2026 pasó el type-check,
lint y 28 pruebas unitarias. La ejecución completa de Quickstart requiere
levantar PostgreSQL, NATS, MinIO y Keycloak con `docker compose up -d` y
provisionar los tokens de prueba descritos en `specs/001-cobranzas-flujo-fondos/quickstart.md`.

# Validación de autenticación y autorización multi-tenant

## Desarrollo local

1. Levantar `docker compose up -d`.
2. Usar el realm `saas-contable` y el cliente OIDC `guido`.
3. Confirmar que el access token contiene `authorization.client_id`, `authorization.routes` y `authorization.actions`.
4. Verificar que el frontend envía `Authorization: Bearer`.
5. Verificar que health checks responden sin credencial y las rutas de negocio responden `401` sin ella.
6. Verificar que un usuario sin permisos puede autenticarse, pero recibe `403` en cualquier operación protegida.
7. Verificar que `view/customers/own` no permite clientes de otra cartera ni de otro tenant.
