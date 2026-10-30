# NATS JetStream Events Contract: Sistema de Gestión de Cobranzas y Flujo de Fondos v1.0

**Branch**: `001-cobranzas-flujo-fondos` | **Date**: 2026-10-30 | **Spec**: [spec.md](../spec.md)

Este documento define la topología de streams, subjects, esquemas de payload JSON y políticas de entrega para los eventos asíncronos en **NATS JetStream** (`@nestjs/microservices`).

---

## 1. Topología del Stream JetStream

- **Stream Name**: `SAAS_BILLING`
- **Subjects**: `billing.>`
- **Storage**: `File` (persistencia en disco en el pod NATS StatefulSet)
- **Retention Policy**: `Limits` (mensajes retenidos hasta 30 días o límite de 10 GB por stream)
- **Discard Policy**: `Old`
- **Max Message Size**: 1 MB (los comprobantes van a MinIO/S3, solo se transmiten URLs en eventos)
- **Replicas**: 1 (optimizado para bajo consumo de RAM en VPS Contabo, ~20 MB)

---

## 2. Eventos de Dominio y Esquemas de Carga Útil (Payload)

Todos los eventos heredan la envolvente estándar de metadatos de contexto:

```typescript
interface DomainEventEnvelope<T> {
  eventId: string; // UUID unívoco del evento
  eventType: string; // Nombre del tipo de evento
  occurredAt: string; // ISO 8601 UTC
  tenantId: string; // UUID del estudio contable (aislamiento multi-tenant)
  traceId: string; // UUID para correlación de logs en Pino
  triggeredByUserId?: string; // UUID del usuario causante (o null para cron)
  data: T; // Carga útil del evento
}
```

---

### 2.1 `billing.payment.reported` (`PaymentReportedEvent`)

Emitido por `billing-workflow-service` cuando un cliente o contador informa un pago (HU3, FR-008).

- **Consumidores**:
  - `notification-service`: Notifica por correo o alerta interna al contador representante asignado.

#### Schema

```json
{
  "eventId": "b3e14567-e89b-12d3-a456-426614174000",
  "eventType": "PaymentReportedEvent",
  "occurredAt": "2026-06-08T15:20:00Z",
  "tenantId": "c4b12345-6789-4abc-def0-123456789abc",
  "traceId": "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
  "triggeredByUserId": "7a3e8b12-9c44-4820-a612-51a82f345678",
  "data": {
    "paymentSubmissionId": "22334455-6677-8899-aabb-ccddeeff0011",
    "obligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412",
    "clientId": "7a3e8b12-9c44-4820-a612-51a82f345678",
    "clientBusinessName": "Transportes del Plata S.A.",
    "amount": "25000.00",
    "currency": "ARS",
    "paymentDate": "2026-06-08",
    "paymentMethod": "TRANSFER",
    "reportedByClient": true,
    "receiptFileUrl": "https://minio.saascontable.com/comprobantes/tenant-1/comprobante-2.pdf",
    "representativeAccountantId": "88776655-4433-2211-00aa-bbccddeeff99"
  }
}
```

---

### 2.2 `billing.payment.validated` (`PaymentValidatedEvent`)

Emitido por `billing-workflow-service` cuando un contador confirma la validación de un pago (HU4, FR-010, FR-012).

- **Consumidores**:
  - `accounting-client-service`: Actualiza estadísticas y cuenta corriente del cliente.
  - `notification-service`: Despacha correo de recibo de cobro al cliente.

#### Schema

```json
{
  "eventId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "eventType": "PaymentValidatedEvent",
  "occurredAt": "2026-06-08T16:00:00Z",
  "tenantId": "c4b12345-6789-4abc-def0-123456789abc",
  "traceId": "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
  "triggeredByUserId": "88776655-4433-2211-00aa-bbccddeeff99",
  "data": {
    "paymentSubmissionId": "22334455-6677-8899-aabb-ccddeeff0011",
    "obligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412",
    "clientId": "7a3e8b12-9c44-4820-a612-51a82f345678",
    "validatedAmount": "25000.00",
    "currency": "ARS",
    "obligationNewStatus": "PAID",
    "obligationNewBalance": "0.00",
    "surplusAmount": "5000.00",
    "clientNewTotalCredit": "5000.00",
    "clientEmail": "administracion@transportesdelplata.com.ar"
  }
}
```

---

### 2.3 `billing.payment.rejected` (`PaymentRejectedEvent`)

Emitido por `billing-workflow-service` cuando un contador rechaza un pago informado (HU4, FR-011).

- **Consumidores**:
  - `notification-service`: Despacha inmediatamente correo explicativo al cliente con el motivo del rechazo.

#### Schema

```json
{
  "eventId": "c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  "eventType": "PaymentRejectedEvent",
  "occurredAt": "2026-06-08T16:15:00Z",
  "tenantId": "c4b12345-6789-4abc-def0-123456789abc",
  "traceId": "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
  "triggeredByUserId": "88776655-4433-2211-00aa-bbccddeeff99",
  "data": {
    "paymentSubmissionId": "22334455-6677-8899-aabb-ccddeeff0011",
    "obligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412",
    "clientId": "7a3e8b12-9c44-4820-a612-51a82f345678",
    "clientEmail": "administracion@transportesdelplata.com.ar",
    "rejectionReason": "El comprobante adjunto corresponde a otra empresa y no se observa el ingreso en la cuenta del estudio.",
    "obligationServiceDescription": "Liquidación de Impuestos Mayo 2026",
    "obligationBalanceDue": "55000.00"
  }
}
```

---

### 2.4 `billing.claim.triggered` (`ClaimTriggeredEvent`)

Emitido por cron diario o por forzado manual para despachar un reclamo de deuda por correo (HU2, FR-003, FR-004, FR-006).

- **Consumidores**:
  - `notification-service`: Renderiza plantilla HTML en español, adjunta enlace con `QuickActionToken` y envía vía SMTP con BCC a contadores. Registra asiento inmutable en `DebtClaimHistory`.

#### Schema

```json
{
  "eventId": "f1e2d3c4-b5a6-7890-1234-56789abcdef0",
  "eventType": "ClaimTriggeredEvent",
  "occurredAt": "2026-06-11T00:05:00Z",
  "tenantId": "c4b12345-6789-4abc-def0-123456789abc",
  "traceId": "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
  "triggeredByUserId": null,
  "data": {
    "claimType": "AUTOMATIC",
    "obligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412",
    "clientId": "7a3e8b12-9c44-4820-a612-51a82f345678",
    "clientBusinessName": "Transportes del Plata S.A.",
    "recipientEmail": "administracion@transportesdelplata.com.ar",
    "bccEmails": ["contador.perez@estudiocontable.com.ar"],
    "serviceDescription": "Liquidación de Impuestos Mayo 2026",
    "dueDate": "2026-06-10",
    "balanceDue": "55000.00",
    "currency": "ARS",
    "quickActionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJ0b2tlbi0xMjM0NTYiLCJleHAiOjE3NzA...",
    "quickActionUrl": "https://app.saascontable.com/pagar/eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 2.5 `billing.claim.failed` (`ClaimFailedEvent`)

Emitido por `notification-service` cuando un despacho de correo falla tras agotar los reintentos automáticos (D-005, SC-002).

- **Consumidores**:
  - Microservicio de WebSockets / Gateway para emitir alerta push visible en la plataforma para el contador responsable.

#### Schema

```json
{
  "eventId": "d4e5f6a1-b2c3-4d5e-6f7a-8b9c0d1e2f3a",
  "eventType": "ClaimFailedEvent",
  "occurredAt": "2026-06-11T00:15:30Z",
  "tenantId": "c4b12345-6789-4abc-def0-123456789abc",
  "traceId": "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
  "triggeredByUserId": null,
  "data": {
    "debtClaimHistoryId": "8899aabb-ccdd-eeff-0011-223344556677",
    "obligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412",
    "recipientEmail": "administracion@transportesdelplata.com.ar",
    "attemptCount": 2,
    "smtpErrorMessage": "550 5.1.1 The email account that you tried to reach does not exist.",
    "responsibleAccountantId": "88776655-4433-2211-00aa-bbccddeeff99"
  }
}
```

---

### 2.6 `billing.obligation.overdue` (`ObligationOverdueEvent`)

Emitido por el scheduler del `notification-service` o `billing-workflow-service` cuando una obligación pasa de `PENDING` a `OVERDUE` (RN1, SC-001).

- **Consumidores**:
  - `billing-workflow-service`: Transiciona el estado a `OVERDUE` en la base de datos.
  - Emite a continuación `ClaimTriggeredEvent`.

#### Schema

```json
{
  "eventId": "e5f6a1b2-c3d4-4e5f-a6b7-c8d9e0f1a2b3",
  "eventType": "ObligationOverdueEvent",
  "occurredAt": "2026-06-11T00:01:00Z",
  "tenantId": "c4b12345-6789-4abc-def0-123456789abc",
  "traceId": "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
  "data": {
    "obligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412",
    "dueDate": "2026-06-10",
    "balanceDue": "85000.00"
  }
}
```
