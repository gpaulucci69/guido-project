# Research: Gestión de clientes por tipo

## Decision 1: Extender `AccountingClient` como entidad única

- **Decision**: Mantener un único registro de cliente con un campo `type` (`INDIVIDUAL`/`LEGAL_ENTITY`) y campos específicos nullable, con validación condicional por tipo.
- **Rationale**: El repositorio ya posee `AccountingClient`, relaciones con obligaciones, pagos y créditos. Separar tablas rompería esas relaciones y añadiría complejidad sin valor para esta feature.
- **Alternatives considered**: Dos tablas independientes; rechazado porque duplicaría CRUD y relaciones. Una entidad JSON sin campos explícitos; rechazado porque debilita tipado, validación y consultas.

## Decision 2: Usar CUIT argentino como identificación fiscal

- **Decision**: Persistir el número normalizado sin separadores en un campo de 11 caracteres y validar formato y dígito verificador CUIT antes de crear o editar.
- **Rationale**: El proyecto ya modela `Tenant.cuit` con 11 caracteres y la especificación fija jurisdicción argentina. La unicidad debe ser `(tenant_id, cuit)` y no depender del tipo.
- **Alternatives considered**: Aceptar texto fiscal libre; rechazado por duplicados y errores. Soportar múltiples países; fuera de alcance de esta feature.

## Decision 3: Reutilizar estado y auditoría existentes

- **Decision**: Mantener `status` como estado activo/inactivo compatible con clientes actuales y registrar mutaciones en `ChangeAuditEntry`, incluyendo actor, tenant, entidad, acción y cambios relevantes.
- **Rationale**: La especificación excluye eliminación física y el esquema ya tiene ambos patrones. Permite corregir un tipo mediante desactivación y alta nueva sin perder trazabilidad.
- **Alternatives considered**: Borrado físico; contradice el alcance. Crear una tabla de auditoría específica; duplicaría infraestructura existente.

## Decision 4: API REST en `accounting-client-service`

- **Decision**: Exponer operaciones autenticadas bajo `/api/v1/clients`, con el tenant derivado de la identidad, permisos de ruta/acción y errores en formato RFC 7807 compatible con el repositorio.
- **Rationale**: El servicio ya atiende `/api/v1/clients` y resuelve identidad/tenant; ampliar el contrato evita una nueva frontera de seguridad.
- **Alternatives considered**: Keycloak como fuente de clientes; rechazado porque Keycloak administra identidades, no el expediente fiscal y las relaciones contables. Nuevo microservicio; innecesario para el alcance.

## Decision 5: Formularios condicionales explícitos

- **Decision**: El formulario selecciona tipo al inicio y presenta nombre/apellido para persona física o razón social para persona moral; contacto, domicilio y representante legal son editables opcionalmente.
- **Rationale**: Hace visibles las diferencias de negocio y evita enviar atributos del tipo opuesto. Mantiene la experiencia alineada con el frontend existente.
- **Alternatives considered**: Formulario único con todos los campos; rechazado por exponer campos irrelevantes y aumentar errores.
