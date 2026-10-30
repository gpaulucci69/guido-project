# Research: Sistema de Gestión de Cobranzas y Flujo de Fondos v1.0

**Branch**: `001-cobranzas-flujo-fondos` | **Date**: 2026-10-30

## Decisiones Técnicas Resueltas

---

### D-001: Aislamiento Multi-Tenant — RLS sobre PostgreSQL con Prisma Client Extension

**Decision**: Base de datos compartida con `tenant_id` discriminador en todas las entidades. Row-Level Security (RLS) habilitado por tabla con política `USING (tenant_id = current_setting('app.current_tenant')::uuid)`. Prisma Client Extension inyecta `SET LOCAL app.current_tenant = '<id>'` en cada transacción antes de cualquier sentencia SQL.

**Rationale**: RLS garantiza el aislamiento a nivel de motor de base de datos, eliminando la posibilidad de filtros manuales fallidos. La inyección via Prisma Extension centraliza el contexto en un único punto, aplicando el Principio de Responsabilidad Única (SRP) y la Inversión de Dependencias (DIP). Es el patrón recomendado en la Constitución v2.0.0 del proyecto.

**Alternatives considered**:

- _Base de datos por tenant_: descartada por costo operativo desproporcionado en VPS Contabo y complejidad de migraciones.
- _Filtros manuales WHERE_: descartado por riesgo de omisión en consultas complejas y falta de garantía estructural.

---

### D-002: Comunicación Asíncrona — NATS JetStream vía `@nestjs/microservices`

**Decision**: NATS con persistencia JetStream como message broker para eventos de dominio asíncronos (reclamos, notificaciones por correo, auditoría de envíos). Integración mediante el transporte nativo `@nestjs/microservices`.

**Rationale**: NATS JetStream ofrece persistencia de mensajes, entrega garantizada (at-least-once) y reconocimiento de mensajes con una huella de memoria extremadamente baja (~10-20 MB en reposo), alineado con la restricción de ≤ 40 MB por microservicio en el VPS Contabo. La integración nativa con NestJS reduce el boilerplate.

**Alternatives considered**:

- _RabbitMQ_: descartado por mayor consumo de RAM (~80-100 MB base) y overhead operativo.
- _Kafka_: descartado por consumo de recursos y complejidad operativa excesivos para la escala de Fase 1 (~50 estudios).
- _Llamadas HTTP síncronas inter-servicio_: descartado para notificaciones porque acopla latencia del correo a la respuesta de la API.

---

### D-003: Almacenamiento de Comprobantes — MinIO (S3-compatible) en el Clúster K8s

**Decision**: MinIO desplegado dentro del clúster K8s como almacén de objetos S3-compatible para los comprobantes de pago. Límite de 15 MB por archivo validado en el servicio antes de la carga.

**Rationale**: MinIO es autohospedable, compatible con la API S3 estándar (facilitando migración futura a AWS S3 u otro proveedor), y se integra directamente en el ecosistema K3s/Contabo sin dependencias externas. El límite de 15 MB se valida en el `billing-workflow-service` antes de cualquier operación de I/O.

**Alternatives considered**:

- _AWS S3 externo_: descartado por costo recurrente y dependencia de red externa en Fase 1.
- _Almacenamiento en volúmenes del pod_: descartado por falta de persistencia garantizada y complejidad de backup.

---

### D-004: Token de Acción Rápida — JWT de Uso Único para Rendición desde Correo

**Decision**: Los correos de reclamo incluyen un enlace con un JWT firmado de uso único (`jti` — JWT ID) que codifica: `obligationId`, `tenantId`, `clientId` y una fecha de expiración (72 horas). El token se invalida en la base de datos tras su primer uso exitoso o al expirar.

**Rationale**: Permite al cliente informar un pago sin pasar por el flujo completo de login OIDC, mejorando la tasa de conversión. El JWT firmado garantiza que no puede forjarse ni reutilizarse. La invalidación tras uso único respeta el Principio de Mínimo Privilegio de la Constitución.

**Alternatives considered**:

- _Token opaco (UUID) en base de datos_: viable pero requiere una lookup table extra; el JWT firmado es autocontenido y reduce latencia de validación.
- _Sin enlace de acción (solo portal)_: descartado por el usuario en la sesión de clarificación (Q1, Opción C elegida).

---

### D-005: Reintento de Correos Fallidos — Cola en NATS JetStream con Estado `Fallido`

**Decision**: El `notification-service` publica el evento `ClaimTriggeredEvent` en NATS JetStream. Si el proveedor SMTP rechaza el envío, el servicio reintenta automáticamente al menos una vez (con backoff exponencial de 5 minutos). Si persiste el fallo tras el reintento, el asiento en `DebtClaimHistory` se marca con estado `Fallido` y se emite un evento `ClaimFailedEvent` que el frontend consume para mostrar una alerta al contador.

**Rationale**: Garantiza SC-002 (100% de reclamos auditados) incluyendo los fallidos. El reintento automático minimiza las intervenciones manuales. La alerta en plataforma respeta el principio de transparencia operativa para el contador.

**Alternatives considered**:

- _Sin reintento (fallo silencioso)_: descartado; rompe SC-002 y la auditabilidad.
- _Dead Letter Queue (DLQ) separada_: viable para Fase 2, sobredimensionado para Fase 1 con la escala proyectada.

---

### D-006: Configuración de Parámetros de Reclamo — Entidad `StudioNotificationSettings`

**Decision**: Una única entidad `StudioNotificationSettings` por estudio (tenant) con los campos: `graceAfterDueDays` (días de gracia antes del primer aviso, default: 1) y `reminderIntervalDays` (días entre reiteraciones, default: 7). Solo modificable por `STUDIO_ADMIN`.

**Rationale**: Definido en la sesión de clarificación (Q4). La configuración global simplifica el modelo de datos (YAGNI) y elimina la lógica de resolución de prioridades (global vs. por cliente). El cron diario lee esta configuración al evaluar cada obligación del estudio.

**Alternatives considered**:

- _Configuración por cliente o por representante_: evaluada en clarificación y descartada por sobreingeniería en Fase 1.

---

### D-007: Múltiples Pagos Pendientes por Obligación — Resolución Individual por Contador

**Decision**: Una obligación puede tener múltiples rendiciones de pago simultáneas en estado `Pendiente de Validación`. La vista de detalle de la obligación lista todos los pagos pendientes. Cuando un contador valida un pago que cubre el 100% del saldo, los pagos pendientes restantes no se rechazan automáticamente — el contador debe resolverlos explícitamente (CL-007).

**Rationale**: Definido en la sesión de clarificación (Q3). Evita rechazos automáticos incorrectos (e.g., si el cliente envió el comprobante dos veces por error, el contador puede rechazar uno informando el motivo). Mantiene la trazabilidad completa de todos los pagos informados.

**Alternatives considered**:

- _Bloquear nuevos pagos mientras hay uno pendiente_: descartado por el usuario en clarificación.
- _Auto-rechazo de excedentes_: descartado por riesgo de rechazar pagos válidos que el cliente informó para cubrir saldos parciales.

---

### D-008: Visibilidad del Cliente en el Portal Autenticado

**Decision**: El portal del cliente (rol `CLIENT_VIEWER`) expone: (1) listado de sus obligaciones de cobro con estado y saldo adeudado, (2) historial de sus propias rendiciones de pago con estado (`Pendiente de Validación`, `Validado`, `Rechazado`), y (3) saldo a favor disponible como dato de solo lectura. El cliente no puede imputar el saldo a favor — es potestad exclusiva de los contadores.

**Rationale**: Definido en clarificación (Q5). La visibilidad del saldo a favor genera confianza y reduce consultas al estudio. La restricción de imputación solo por contadores protege la integridad financiera y cumple con el Principio de Mínimo Privilegio.

**Alternatives considered**:

- _Solo obligaciones y rendiciones (sin saldo a favor)_: descartado en clarificación.
- _Permitir imputación por el cliente_: descartado; cambiaría el alcance del módulo y requeriría flujos de aprobación adicionales no especificados.

---

### D-009: Precisión Monetaria — `DECIMAL(14,2)` en PostgreSQL / `Prisma.Decimal`

**Decision**: Todos los campos monetarios en el modelo de datos usan tipo `DECIMAL(14,2)` en PostgreSQL y `Prisma.Decimal` en la capa de aplicación. El frontend formatea con `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`.

**Rationale**: Los números de punto flotante (`float`, `double`) son inadecuados para aritmética financiera por errores de redondeo acumulativos. `DECIMAL(14,2)` soporta importes de hasta AR$ 999.999.999.999,99, suficiente para la escala proyectada. Requerimiento explícito de la Constitución v2.0.0 (Principio VII).

**Alternatives considered**:

- _Enteros (centavos)_: viable pero requiere conversión en cada capa; `DECIMAL` es más legible e igualmente exacto.
- _float/double_: descartado explícitamente por la Constitución.
