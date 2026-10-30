# Quickstart Validation Guide: Sistema de Gestión de Cobranzas y Flujo de Fondos v1.0

**Branch**: `001-cobranzas-flujo-fondos` | **Date**: 2026-10-30 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Esta guía describe los escenarios de prueba ejecutables de extremo a extremo (caja negra) para verificar que el sistema cumple con todos los criterios de aceptación y principios constitucionales a través de la interacción observable de la aplicación.

---

## 1. Prerrequisitos y Configuración del Entorno de Validación

### Servicios Requeridos

- **PostgreSQL 16**: Base de datos con extensiones y RLS activado.
- **NATS Server**: Con JetStream habilitado (`nats-server -js`).
- **MinIO**: Bucket `saas-comprobantes` disponible para almacenamiento S3.
- **Keycloak**: Realm de prueba con clientes OIDC configurados para tenants `tenant-estudio-a` y `tenant-estudio-b`.

### Tokens JWT de Prueba para Pruebas Manuales / E2E

```bash
# Token Contador Administrador (Estudio A)
export ADMIN_TOKEN=$(curl -s -X POST "http://localhost:8080/realms/saas-contable/protocol/openid-connect/token" \
  -d "client_id=tenant-estudio-a" \
  -d "grant_type=password" \
  -d "username=admin.estudio@test.com" \
  -d "password=testpass" | jq -r .access_token)

# Token Contador Representante (Estudio A - Cartera A)
export REP_TOKEN=$(curl -s -X POST "http://localhost:8080/realms/saas-contable/protocol/openid-connect/token" \
  -d "client_id=tenant-estudio-a" \
  -d "grant_type=password" \
  -d "username=contador.rep@test.com" \
  -d "password=testpass" | jq -r .access_token)

# Token Cliente Final (Estudio A - Cliente 1)
export CLIENT_TOKEN=$(curl -s -X POST "http://localhost:8080/realms/saas-contable/protocol/openid-connect/token" \
  -d "client_id=tenant-estudio-a" \
  -d "grant_type=password" \
  -d "username=cliente1@test.com" \
  -d "password=testpass" | jq -r .access_token)
```

---

## 2. Escenarios de Validación Ejecutables

### Escenario 1: Emisión y Registro de Obligación (P1 — HU1, CA1, CL-003)

**Objetivo**: Validar el alta de una obligación en AR$, bloqueo de importes inválidos y delimitación de cartera.

1. **Intento de alta con importe inválido (AR$ 0,00)**:

   ```bash
   curl -i -X POST "http://localhost:3000/billing/v1/obligations" \
     -H "Authorization: Bearer $REP_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "clientId": "7a3e8b12-9c44-4820-a612-51a82f345678",
       "serviceDescription": "Liquidación Impositiva",
       "periodStartDate": "2026-05-01",
       "periodEndDate": "2026-05-31",
       "dueDate": "2026-06-10",
       "totalAmount": "0.00"
     }'
   ```
   - **Resultado Esperado**: Código HTTP `400 Bad Request` en formato RFC 7807 indicando que el importe debe ser mayor a cero.

2. **Alta exitosa de obligación válida**:
   ```bash
   curl -i -X POST "http://localhost:3000/billing/v1/obligations" \
     -H "Authorization: Bearer $REP_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "clientId": "7a3e8b12-9c44-4820-a612-51a82f345678",
       "serviceDescription": "Honorarios Mensuales Mayo 2026",
       "periodStartDate": "2026-05-01",
       "periodEndDate": "2026-05-31",
       "dueDate": "2026-06-10",
       "totalAmount": "80000.00"
     }'
   ```
   - **Resultado Esperado**: Código HTTP `201 Created`. Objeto creado con `status = "PENDING"`, `balanceDue = "80000.00"` y `currency = "ARS"`.

---

### Escenario 2: Rendición de Pago y Control de Tamaño de Archivo (P1 — HU3, CA2, CA3, CL-001)

**Objetivo**: Verificar el límite de 15 MB para comprobantes y que la deuda no disminuye antes de validar.

1. **Intento de rendición con archivo excedido (> 15 MB)**:

   ```bash
   # Generar archivo dummy de 16 MB
   dd if=/dev/zero of=/tmp/comprobante_grande.pdf bs=1M count=16

   curl -i -X POST "http://localhost:3000/billing/v1/obligations/$OBLIGATION_ID/payments" \
     -H "Authorization: Bearer $CLIENT_TOKEN" \
     -F "receipt=@/tmp/comprobante_grande.pdf" \
     -F "amount=80000.00" \
     -F "paymentDate=2026-06-08" \
     -F "paymentMethod=TRANSFER"
   ```
   - **Resultado Esperado**: Código HTTP `413 Payload Too Large` con mensaje en español indicando que supera el límite de 15 MB (15.728.640 bytes).

2. **Rendición válida con comprobante legal (< 15 MB)**:
   ```bash
   dd if=/dev/zero of=/tmp/comprobante_valido.pdf bs=1M count=2

   curl -i -X POST "http://localhost:3000/billing/v1/obligations/$OBLIGATION_ID/payments" \
     -H "Authorization: Bearer $CLIENT_TOKEN" \
     -F "receipt=@/tmp/comprobante_valido.pdf" \
     -F "amount=85000.00" \
     -F "paymentDate=2026-06-08" \
     -F "paymentMethod=TRANSFER"
   ```
   - **Resultado Esperado**: Código HTTP `201 Created` con `status = "PENDING_VALIDATION"`.
   - **Verificación de Invariante**: Consultar `GET /obligations/$OBLIGATION_ID`. El `balanceDue` debe continuar en `80000.00` (la deuda no se reduce antes de que el contador presione validar, CA5).

---

### Escenario 3: Validación de Pago, Cancelación y Saldo a Favor (P1/P2 — HU4, RN3, SC-004)

**Objetivo**: Validar el pago con excedente, comprobar acreditación automática de saldo a favor y control de concurrencia.

1. **Validación del pago de AR$ 85.000 sobre deuda de AR$ 80.000**:

   ```bash
   curl -i -X POST "http://localhost:3000/billing/v1/payments/$PAYMENT_ID/validate" \
     -H "Authorization: Bearer $REP_TOKEN"
   ```
   - **Resultado Esperado**: Código HTTP `200 OK`.
     - `obligationStatus`: `"PAID"`
     - `obligationNewBalance`: `"0.00"`
     - `surplusGenerated`: `"5000.00"`
     - `clientTotalAvailableCredit`: `"5000.00"`

2. **Verificación de concurrencia (CL-002)**:
   - Inmediatamente volver a enviar la misma petición o un rechazo sobre `$PAYMENT_ID`.
   - **Resultado Esperado**: Código HTTP `409 Conflict` (RFC 7807) indicando que el pago ya fue resuelto previamente.

---

### Escenario 4: Imputación Manual de Saldo a Favor (P2 — HU5, RN4, CA8)

**Objetivo**: Imputar saldo a favor disponible contra una nueva obligación pendiente.

1. **Crear una segunda obligación por AR$ 40.000**.
2. **Consultar detalle de la obligación (`GET /obligations/$OBLIGATION_2_ID`)**:
   - Comprobar que la respuesta incluye:
     `"hasAvailableCreditWarning": true` y `"clientAvailableCredit": "5000.00"`.
3. **Imputar AR$ 5.000 de saldo a favor**:
   ```bash
   curl -i -X POST "http://localhost:3000/billing/v1/obligations/$OBLIGATION_2_ID/apply-credit" \
     -H "Authorization: Bearer $REP_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"amountToApply": "5000.00"}'
   ```
   - **Resultado Esperado**: Código HTTP `200 OK`.
     - `obligationNewBalance`: `"35000.00"`
     - `obligationStatus`: `"PARTIALLY_PAID"`
     - `clientRemainingCredit`: `"0.00"`

---

### Escenario 5: Reclamo Manual y Auditoría de Correo (P2 — HU2, FR-006, CL-004)

**Objetivo**: Forzar el reclamo de deuda y validar el registro inmutable en auditoría.

1. **Disparar reclamo manual sobre obligación parcial**:
   ```bash
   curl -i -X POST "http://localhost:3000/billing/v1/obligations/$OBLIGATION_2_ID/claim-manual" \
     -H "Authorization: Bearer $REP_TOKEN"
   ```
   - **Resultado Esperado**: Código HTTP `202 Accepted`.
2. **Verificar asiento en auditoría**:
   - Consultar `GET /obligations/$OBLIGATION_2_ID`.
   - La pestaña de reclamos debe contener la entrada con destinatario, BCC al contador, cuerpo en español y enlace con `QuickActionToken`.

---

### Escenario 6: Panel de Flujo de Fondos y Aislamiento por Contador (P3 — HU6, RN5, CA9)

**Objetivo**: Probar las métricas consolidadas y el estricto aislamiento de visibilidad por rol.

1. **Consulta con Contador Representante**:
   ```bash
   curl -i -X GET "http://localhost:3000/billing/v1/reports/cash-flow?fromDate=2026-05-01&toDate=2026-06-30" \
     -H "Authorization: Bearer $REP_TOKEN"
   ```
   - **Resultado Esperado**: Métricas correspondientes exclusivamente a los clientes de su cartera asignada.
2. **Consulta con Contador Administrador**:
   ```bash
   curl -i -X GET "http://localhost:3000/billing/v1/reports/cash-flow?fromDate=2026-05-01&toDate=2026-06-30" \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```
   - **Resultado Esperado**: Total consolidado de todo el estudio contable. Los importes se presentan con formateo regional argentino (`$ 80.000,00`).

---

### Escenario 7: Cancelación Lógica y Auditoría Inmutable (FR-014, CA10, CL-006)

**Objetivo**: Verificar que no existe borrado físico y que la cancelación exige justificación.

1. **Intento de cancelación sin motivo**:

   ```bash
   curl -i -X POST "http://localhost:3000/billing/v1/obligations/$OBLIGATION_2_ID/cancel" \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
   - **Resultado Esperado**: Código HTTP `400 Bad Request` indicando que el motivo es obligatorio.

2. **Cancelación válida con motivo**:
   ```bash
   curl -i -X POST "http://localhost:3000/billing/v1/obligations/$OBLIGATION_2_ID/cancel" \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"reason": "Servicio cancelado de común acuerdo con el cliente."}'
   ```
   - **Resultado Esperado**: Código HTTP `200 OK`. `status = "CANCELLED"`.
   - **Verificación de Persistencia**: El registro sigue existiendo en base de datos (`SELECT status, cancelled_reason FROM payment_obligations WHERE id = ...`) con su asiento inmutable en `change_audit_entries`.
