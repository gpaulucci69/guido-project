# Data Model: Gestión de clientes por tipo

## AccountingClient

Registro fiscal y operativo de un cliente perteneciente a un estudio.

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `id` | UUID | Identificador inmutable. |
| `tenantId` | UUID | Obligatorio; deriva del contexto autenticado y no del request. |
| `type` | `INDIVIDUAL \| LEGAL_ENTITY` | Obligatorio e inmutable después del alta. |
| `firstName` | texto nullable | Obligatorio cuando `type=INDIVIDUAL`; nombre de la persona física. |
| `lastName` | texto nullable | Obligatorio cuando `type=INDIVIDUAL`; apellido de la persona física. |
| `legalName` | texto nullable | Obligatorio cuando `type=LEGAL_ENTITY`; razón social. |
| `tradeName` | texto nullable | Opcional para persona moral. |
| `cuit` | texto de 11 caracteres | Obligatorio, normalizado, CUIT argentino válido y único dentro del tenant. El tipo de CUIT se conserva por separado. |
| `email` | texto nullable | Opcional durante el alta; formato de email si se informa. |
| `phone` | texto nullable | Opcional; texto normalizado. |
| `taxAddress` | texto nullable | Opcional durante el alta; domicilio fiscal. |
| `legalRepresentativeName` | texto nullable | Opcional durante el alta; aplicable a persona moral. Debe informarse junto con `legalRepresentativeTaxId`. |
| `legalRepresentativeTaxId` | texto nullable | Opcional; CUIT argentino válido si se informa y siempre acompañado por `legalRepresentativeName`. |
| `status` | `ACTIVE \| INACTIVE` | Por defecto `ACTIVE`; la corrección de tipo se realiza inactivando y creando otro registro. |
| `representativeAccountantId` | UUID nullable | Relación existente, fuera del alcance de esta feature. |
| `createdAt` / `updatedAt` | fecha-hora | Gestionados por persistencia; mostrar en formato argentino. |

La actualización debe incluir la fecha `updatedAt` conocida por el usuario; si ya no coincide, se rechaza por conflicto de concurrencia.

## ChangeAuditEntry

Se reutiliza la entidad existente para mutaciones de `AccountingClient`.

- `tenantId`: tenant derivado del contexto.
- `entityType`: valor canónico `AccountingClient`.
- `entityId`: cliente afectado.
- `action`: `CREATE`, `UPDATE`, `DEACTIVATE`, `ACTIVATE`, `UPDATE_REJECTED`.
- `fieldName`, `oldValue`, `newValue`: cambios individuales, sin secretos.
- `reason`: motivo obligatorio para correcciones de tipo y opcional para otras mutaciones.
- `performedByUserId`, `createdAt`: actor y momento.

## Relationships

- Un `Tenant` tiene muchos `AccountingClient`.
- Un `AccountingClient` mantiene las relaciones existentes con obligaciones, pagos, créditos y movimientos.
- Un `AccountingClient` tiene muchos eventos de auditoría por medio de `ChangeAuditEntry`.

## Invariants and validation

- El tenant siempre se deriva de la identidad autenticada y se aplica antes de leer o mutar.
- `type` no se modifica mediante PATCH.
- Para `INDIVIDUAL`, `firstName` y `lastName` son obligatorios y los campos de entidad legal deben quedar vacíos.
- Para `LEGAL_ENTITY`, `legalName` es obligatorio y los campos de persona física deben quedar vacíos.
- `cuit` se normaliza quitando separadores permitidos y se valida con algoritmo de dígito verificador argentino.
- La unicidad es `(tenantId, cuit)`; el mismo CUIT puede existir en otro tenant.
- No se realiza borrado físico.
- Un cambio de estado o una edición sobre una versión obsoleta no sobrescribe la versión vigente.
