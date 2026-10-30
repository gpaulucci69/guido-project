# API REST Contract: Sistema de Gestión de Cobranzas y Flujo de Fondos v1.0

**Branch**: `001-cobranzas-flujo-fondos` | **Date**: 2026-10-30 | **Spec**: [spec.md](../spec.md)

Este contrato define los endpoints HTTP/REST, esquemas de payload, headers requeridos y respuestas de error bajo el estándar **RFC 7807 (Problem Details)**.

---

## 1. Convenciones Globales

- **Base URL**: `https://api.saascontable.com/billing/v1`
- **Autenticación**: `Authorization: Bearer <JWT>` emitido por Keycloak.
- **Claims requeridos en JWT**:
  - `tenant_id`: UUID del estudio contable (aislamiento multi-tenant).
  - `roles`: `SUPER_ADMIN` | `STUDIO_ADMIN` | `ACCOUNTANT` | `CLIENT_VIEWER`.
  - `sub`: UUID del usuario.
- **Headers de Observabilidad**:
  - `X-Trace-Id`: UUID de correlación para trazas distribuidas (inyectado por Traefik o cliente).
- **Formato de Errores RFC 7807**: Todas las respuestas 4xx y 5xx devuelven `application/problem+json`:

```json
{
  "type": "https://api.saascontable.com/errors/invalid-payment-file-size",
  "title": "Payload Too Large",
  "status": 413,
  "detail": "El archivo adjunto supera el límite máximo permitido de 15 MB (15.728.640 bytes).",
  "instance": "/billing/v1/obligations/4f2a7183-5c8e-4b62-9571-0811b7df9452/payments",
  "invalidParams": [
    {
      "name": "receipt",
      "reason": "Tamaño del archivo recibido: 16.200.120 bytes. Máximo permitido: 15.728.640 bytes."
    }
  ]
}
```

---

## 2. Endpoints de Obligaciones de Cobro (`/obligations`)

### 2.1 `POST /obligations` — Emisión de Obligación

Permite registrar una nueva obligación de cobro a un cliente (HU1, FR-001).

- **Roles autorizados**: `STUDIO_ADMIN`, `ACCOUNTANT`.

#### Request

```http
POST /obligations HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT>

{
  "clientId": "7a3e8b12-9c44-4820-a612-51a82f345678",
  "serviceDescription": "Liquidación de Impuestos y Cargas Sociales - Período Mayo 2026",
  "periodStartDate": "2026-05-01",
  "periodEndDate": "2026-05-31",
  "dueDate": "2026-06-10",
  "totalAmount": "85000.00"
}
```

#### Validation Rules

- `clientId`: UUID existente y perteneciente al `tenant_id` del token.
- `totalAmount`: String numérico con 2 decimales, valor estricto `> 0.00`.
- `dueDate`: Fecha en formato `YYYY-MM-DD`, posterior a `periodStartDate`.
- Si el usuario es `ACCOUNTANT`, el cliente debe pertenecer a su cartera asignada (FR-016).

#### Response: `201 Created`

```json
{
  "id": "e91b5c40-1a2f-48d6-9507-68b201a33412",
  "tenantId": "c4b12345-6789-4abc-def0-123456789abc",
  "clientId": "7a3e8b12-9c44-4820-a612-51a82f345678",
  "serviceDescription": "Liquidación de Impuestos y Cargas Sociales - Período Mayo 2026",
  "periodStartDate": "2026-05-01",
  "periodEndDate": "2026-05-31",
  "dueDate": "2026-06-10",
  "currency": "ARS",
  "totalAmount": "85000.00",
  "balanceDue": "85000.00",
  "status": "PENDING",
  "createdAt": "2026-05-15T14:30:00Z"
}
```

---

### 2.2 `GET /obligations` — Listado Paginado de Obligaciones

Consulta el padrón de obligaciones con filtros avanzados.

- **Roles autorizados**: `STUDIO_ADMIN`, `ACCOUNTANT`.
- **Query Params**:
  - `status`: `PENDING` | `OVERDUE` | `PAID` | `PARTIALLY_PAID` | `CANCELLED` (opcional).
  - `clientId`: UUID (opcional).
  - `representativeId`: UUID (solo administradores; contadores quedan restringidos a su ID).
  - `dueDateFrom`, `dueDateTo`: Fechas `YYYY-MM-DD`.
  - `page`: int (default 1), `limit`: int (default 20).

#### Response: `200 OK`

```json
{
  "items": [
    {
      "id": "e91b5c40-1a2f-48d6-9507-68b201a33412",
      "clientId": "7a3e8b12-9c44-4820-a612-51a82f345678",
      "clientBusinessName": "Transportes del Plata S.A.",
      "clientCuit": "30712345678",
      "serviceDescription": "Liquidación de Impuestos Mayo 2026",
      "dueDate": "2026-06-10",
      "currency": "ARS",
      "totalAmount": "85000.00",
      "balanceDue": "85000.00",
      "status": "PENDING",
      "pendingSubmissionsCount": 1
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### 2.3 `GET /obligations/{id}` — Detalle Completo de Obligación

Retorna la obligación, sus rendiciones de pago asociadas, historial de reclamos y advertencia de saldo a favor disponible del cliente (HU5).

- **Roles autorizados**: `STUDIO_ADMIN`, `ACCOUNTANT`.

#### Response: `200 OK`

```json
{
  "id": "e91b5c40-1a2f-48d6-9507-68b201a33412",
  "clientId": "7a3e8b12-9c44-4820-a612-51a82f345678",
  "clientBusinessName": "Transportes del Plata S.A.",
  "clientAvailableCredit": "15000.00",
  "hasAvailableCreditWarning": true,
  "serviceDescription": "Liquidación de Impuestos Mayo 2026",
  "periodStartDate": "2026-05-01",
  "periodEndDate": "2026-05-31",
  "dueDate": "2026-06-10",
  "currency": "ARS",
  "totalAmount": "85000.00",
  "balanceDue": "55000.00",
  "status": "PARTIALLY_PAID",
  "submissions": [
    {
      "id": "11223344-5566-7788-99aa-bbccddeeff00",
      "paymentDate": "2026-06-05",
      "amount": "30000.00",
      "paymentMethod": "TRANSFER",
      "receiptFileUrl": "https://minio.saascontable.com/comprobantes/tenant-1/comprobante-1.pdf",
      "status": "VALIDATED",
      "resolvedAt": "2026-06-06T10:15:00Z"
    },
    {
      "id": "22334455-6677-8899-aabb-ccddeeff0011",
      "paymentDate": "2026-06-08",
      "amount": "25000.00",
      "paymentMethod": "TRANSFER",
      "receiptFileUrl": "https://minio.saascontable.com/comprobantes/tenant-1/comprobante-2.pdf",
      "status": "PENDING_VALIDATION",
      "resolvedAt": null
    }
  ],
  "claimsCount": 1
}
```

---

### 2.4 `POST /obligations/{id}/cancel` — Cancelación Lógica

Anulación de obligación. Prohibido borrado físico (FR-014, FR-011).

- **Roles autorizados**: `STUDIO_ADMIN`, `ACCOUNTANT`.

#### Request

```json
{
  "reason": "Error en el concepto de facturación del período acordado con el cliente."
}
```

#### Response: `200 OK`

```json
{
  "id": "e91b5c40-1a2f-48d6-9507-68b201a33412",
  "status": "CANCELLED",
  "cancelledReason": "Error en el concepto de facturación del período acordado con el cliente.",
  "cancelledAt": "2026-06-09T11:20:00Z"
}
```

---

### 2.5 `POST /obligations/{id}/claim-manual` — Despacho de Reclamo Manual

Fuerza el envío inmediato de un correo de reclamo al cliente con copia oculta (BCC) al contador (FR-006).

- **Roles autorizados**: `STUDIO_ADMIN`, `ACCOUNTANT`.
- **Precondición**: El estado de la obligación debe ser `OVERDUE` o `PARTIALLY_PAID`.

#### Response: `202 Accepted`

```json
{
  "message": "Reclamo de deuda encolado exitosamente para despacho.",
  "obligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412",
  "recipientEmail": "administracion@transportesdelplata.com.ar",
  "bcc": ["contador.perez@estudiocontable.com.ar"]
}
```

---

## 3. Endpoints de Pagos y Rendiciones (`/payments`)

### 3.1 `POST /obligations/{id}/payments` — Informar Pago

Registra una rendición de pago (HU3, FR-008). Soporta `multipart/form-data`.

- **Roles autorizados**: `CLIENT_VIEWER`, `ACCOUNTANT`, `STUDIO_ADMIN`.

#### Headers & Request Body (Multipart)

- `receipt`: Archivo binario (PDF/PNG/JPG). Obligatorio si el usuario es `CLIENT_VIEWER`. Máximo 15 MB (15.728.640 bytes).
- `paymentDate`: `2026-06-08`
- `amount`: `25000.00`
- `paymentMethod`: `TRANSFER`

#### Response: `201 Created`

```json
{
  "id": "22334455-6677-8899-aabb-ccddeeff0011",
  "obligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412",
  "amount": "25000.00",
  "paymentDate": "2026-06-08",
  "paymentMethod": "TRANSFER",
  "receiptFileName": "comprobante_banco_galicia.pdf",
  "receiptFileSizeBytes": 1254320,
  "status": "PENDING_VALIDATION",
  "createdAt": "2026-06-08T15:20:00Z"
}
```

---

### 3.2 `POST /payments/{id}/validate` — Confirmar Validación de Pago

Valida un pago pendiente, impacta la deuda, genera saldo a favor si hay excedente y emite eventos (HU4, FR-010, FR-012).

- **Roles autorizados**: `STUDIO_ADMIN`, `ACCOUNTANT`.

#### Response: `200 OK`

```json
{
  "paymentId": "22334455-6677-8899-aabb-ccddeeff0011",
  "obligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412",
  "paymentStatus": "VALIDATED",
  "validatedAmount": "25000.00",
  "obligationPreviousBalance": "20000.00",
  "obligationNewBalance": "0.00",
  "obligationStatus": "PAID",
  "surplusGenerated": "5000.00",
  "clientTotalAvailableCredit": "5000.00"
}
```

#### Manejo de Concurrencia (CL-002)

Si el pago ya fue resuelto previamente por otro contador:

```json
{
  "type": "https://api.saascontable.com/errors/payment-already-resolved",
  "title": "Conflict",
  "status": 409,
  "detail": "El pago informado ya fue resuelto previamente con estado VALIDATED por otro contador.",
  "instance": "/billing/v1/payments/22334455-6677-8899-aabb-ccddeeff0011/validate"
}
```

---

### 3.3 `POST /payments/{id}/reject` — Rechazar Pago

Rechaza un pago informado exigiendo motivo obligatorio (HU4, FR-011). Dispara correo de desestimación.

- **Roles autorizados**: `STUDIO_ADMIN`, `ACCOUNTANT`.

#### Request

```json
{
  "rejectionReason": "El comprobante adjunto corresponde a otro concepto y no coincide con la cuenta bancaria del estudio."
}
```

#### Response: `200 OK`

```json
{
  "paymentId": "22334455-6677-8899-aabb-ccddeeff0011",
  "paymentStatus": "REJECTED",
  "rejectionReason": "El comprobante adjunto corresponde a otro concepto y no coincide con la cuenta bancaria del estudio.",
  "resolvedAt": "2026-06-08T16:00:00Z",
  "debtUnaltered": true
}
```

---

## 4. Endpoints de Saldo a Favor (`/credit-balance`)

### 4.1 `GET /clients/{clientId}/credit-balance` — Consulta de Saldo a Favor

- **Roles autorizados**: `STUDIO_ADMIN`, `ACCOUNTANT`, `CLIENT_VIEWER` (solo su propio cliente).

#### Response: `200 OK`

```json
{
  "clientId": "7a3e8b12-9c44-4820-a612-51a82f345678",
  "availableAmount": "15000.00",
  "movements": [
    {
      "id": "aa11bb22-cc33-dd44-ee55-ff66aa77bb88",
      "type": "ACCREDITATION",
      "amount": "5000.00",
      "createdAt": "2026-06-08T15:20:00Z",
      "sourceObligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412"
    }
  ]
}
```

---

### 4.2 `POST /obligations/{id}/apply-credit` — Imputación Manual de Saldo a Favor

Aplica parte o el total del saldo a favor de un cliente para cancelar deuda de una obligación (HU5, FR-013).

- **Roles autorizados**: `STUDIO_ADMIN`, `ACCOUNTANT`.

#### Request

```json
{
  "amountToApply": "10000.00"
}
```

#### Validation Rules

- `amountToApply` debe ser `> 0.00`.
- `amountToApply` debe ser `<= CustomerCreditBalance.availableAmount`.
- `amountToApply` debe ser `<= PaymentObligation.balanceDue`.

#### Response: `200 OK`

```json
{
  "obligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412",
  "appliedAmount": "10000.00",
  "obligationNewBalance": "45000.00",
  "obligationStatus": "PARTIALLY_PAID",
  "clientRemainingCredit": "5000.00"
}
```

---

## 5. Endpoints de Reportes (`/reports`)

### 5.1 `GET /reports/cash-flow` — Reporte de Flujo de Fondos

Consolida lo cobrado vs. lo adeudado en un rango de fechas (HU6, FR-012, FR-015).

- **Roles autorizados**: `STUDIO_ADMIN`, `ACCOUNTANT` (restringido a su cartera).
- **Query Params**:
  - `fromDate`: `YYYY-MM-DD` (default: primer día del mes corriente).
  - `toDate`: `YYYY-MM-DD` (default: fecha actual).
  - `representativeId`: UUID (opcional para `STUDIO_ADMIN`; prohibido cambiar para `ACCOUNTANT`).

#### Response: `200 OK`

```json
{
  "period": {
    "fromDate": "2026-05-01",
    "toDate": "2026-05-31"
  },
  "metrics": {
    "totalInvoiced": "1500000.00",
    "totalCollected": "950000.00",
    "totalPending": "550000.00",
    "currency": "ARS",
    "formatted": {
      "totalInvoiced": "$ 1.500.000,00",
      "totalCollected": "$ 950.000,00",
      "totalPending": "$ 550.000,00"
    }
  },
  "collectedDetails": [
    {
      "paymentDate": "2026-05-12",
      "amount": "85000.00",
      "clientBusinessName": "Transportes del Plata S.A.",
      "obligationDescription": "Honorarios Mayo 2026"
    }
  ],
  "pendingDetails": [
    {
      "dueDate": "2026-05-20",
      "balanceDue": "55000.00",
      "clientBusinessName": "Metalúrgica San Martín S.R.L.",
      "status": "OVERDUE"
    }
  ]
}
```

---

## 6. Endpoints Públicos de Acción Rápida (`/public/quick-pay`)

### 6.1 `GET /public/quick-pay/{token}` — Resolver Token de Correo

Permite a un cliente visualizar los datos de la obligación a pagar sin iniciar sesión (FR-008b, D-004).

- **Seguridad**: Token JWT firmado con validación de no expiración ni uso previo (`is_used == false`).

#### Response: `200 OK`

```json
{
  "obligationId": "e91b5c40-1a2f-48d6-9507-68b201a33412",
  "clientBusinessName": "Transportes del Plata S.A.",
  "serviceDescription": "Liquidación de Impuestos Mayo 2026",
  "dueDate": "2026-06-10",
  "balanceDue": "55000.00",
  "currency": "ARS",
  "formattedBalanceDue": "$ 55.000,00"
}
```

---

### 6.2 `POST /public/quick-pay/{token}` — Rendición de Pago desde Correo

Envía comprobante y datos de pago consumiendo el token de acción rápida.

- **Multipart**: `receipt` (obligatorio, máx 15 MB), `paymentDate`, `amount`, `paymentMethod`.
- **Efecto colateral**: Marca `QuickActionToken.is_used = true` e inserta `PaymentSubmission` en estado `PENDING_VALIDATION`.

#### Response: `201 Created`

```json
{
  "message": "Comprobante de pago recibido exitosamente. Será revisado por su contador asignado.",
  "paymentSubmissionId": "99887766-5544-3322-1100-aabbccddeeff"
}
```

---

## 7. Endpoints de Configuración de Estudio (`/settings`)

### 7.1 `GET /settings/notifications` — Obtener Parámetros de Reclamo

- **Roles autorizados**: `STUDIO_ADMIN`.

#### Response: `200 OK`

```json
{
  "graceAfterDueDays": 1,
  "reminderIntervalDays": 7,
  "updatedAt": "2026-05-01T08:00:00Z"
}
```

---

### 7.2 `PUT /settings/notifications` — Actualizar Parámetros

- **Roles autorizados**: `STUDIO_ADMIN`.

#### Request

```json
{
  "graceAfterDueDays": 2,
  "reminderIntervalDays": 5
}
```

#### Response: `200 OK`

```json
{
  "graceAfterDueDays": 2,
  "reminderIntervalDays": 5,
  "updatedAt": "2026-05-15T10:00:00Z"
}
```
