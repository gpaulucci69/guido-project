# Observabilidad

Dashboards must consume the structured fields `traceId`, `tenant_id` and
`userId`. Recommended alerts cover HTTP latency, mail failures, NATS consumer
lag, failed health probes, and errors grouped by tenant.

# Observabilidad de autenticación y autorización

Los eventos de seguridad se emiten estructurados e incluyen `event`, `sub` cuando existe, `tenant_id`, `requiredPermission`, `traceId`, `result` y `occurredAt`.

Se deben monitorear especialmente denegaciones de permisos, intentos cross-tenant, credenciales inválidas, fallos de renovación y uso del modo demo.
