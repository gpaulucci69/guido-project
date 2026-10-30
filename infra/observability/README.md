# Observabilidad

Dashboards must consume the structured fields `traceId`, `tenant_id` and
`userId`. Recommended alerts cover HTTP latency, mail failures, NATS consumer
lag, failed health probes, and errors grouped by tenant.
