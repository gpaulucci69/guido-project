# Validación de Cobranzas v1

La validación automatizada local ejecutada el 30/10/2026 pasó el type-check,
lint y 28 pruebas unitarias. La ejecución completa de Quickstart requiere
levantar PostgreSQL, NATS, MinIO y Keycloak con `docker compose up -d` y
provisionar los tokens de prueba descritos en `specs/001-cobranzas-flujo-fondos/quickstart.md`.
