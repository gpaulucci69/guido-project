# Security Checklist: Gestión de clientes y contadores del estudio

**Purpose**: Validar la calidad, claridad y completitud de los requisitos de autorización, aislamiento y ciclo de vida de identidades.
**Created**: 2026-10-31
**Feature**: [spec.md](../spec.md)

**Note**: Esta checklist evalúa la redacción de los requisitos, no la implementación.
**Review Ownership**: Esta checklist pertenece al revisor. Marcar `[x]` significa que el requisito fue revisado y es suficientemente claro.
**Marker Semantics**: `[x]` indica calidad de requisitos satisfecha; no indica que la funcionalidad esté implementada.

## Completeness of Authorization Requirements

- [ ] CHK001 ¿Están definidos de forma separada los permisos de acceso a pantalla y los permisos de mutación? [Completeness, Spec §FR-002–FR-011]
- [ ] CHK002 ¿Están documentadas las ocho acciones CRUD con su alcance exacto para clientes y contadores? [Completeness, Spec §FR-008–FR-010]
- [ ] CHK003 ¿Está especificado el comportamiento cuando falta solo una acción entre `edit` y `update`? [Completeness, Spec §FR-009, Edge Cases]
- [ ] CHK004 ¿Está definido el comportamiento de acceso directo cuando falta la ruta autorizada? [Completeness, Spec §FR-004]
- [ ] CHK005 ¿Está especificado que la autorización debe repetirse en el servidor y no depender únicamente de la interfaz? [Gap]

## Clarity and Type Separation

- [ ] CHK006 ¿Está definido sin ambigüedad que `client` identifica clientes del estudio y `user` identifica contadores? [Clarity, Spec §FR-001, Key Entities]
- [ ] CHK007 ¿Está especificado qué ocurre con identidades sin `type` o con valores desconocidos? [Clarity, Spec §Edge Cases]
- [ ] CHK008 ¿Está claro que una operación de clientes nunca puede afectar una identidad `user`, y viceversa? [Clarity, Spec §FR-012]
- [ ] CHK009 ¿Está definido si la comparación de `type` distingue mayúsculas y minúsculas? [Ambiguity, Spec §FR-001]
- [ ] CHK010 ¿Las reglas de filtrado por tipo son consistentes entre listado, creación, edición y eliminación? [Consistency, Spec §FR-005–FR-012]

## Tenant Isolation and Security Boundaries

- [ ] CHK011 ¿Está especificado que el tenant se deriva de la identidad autenticada y nunca de datos enviados por el navegador? [Security, Spec §FR-015, Data Model]
- [ ] CHK012 ¿Está definido cómo se evita la administración de identidades pertenecientes a otro tenant? [Completeness, Spec §FR-015]
- [ ] CHK013 ¿Está especificado qué información sensible no debe aparecer en respuestas, errores o registros? [Security, Spec §FR-016–FR-017, Edge Cases]
- [ ] CHK014 ¿Está definido el alcance de los roles autorizados para administrar clientes y contadores? [Gap, Constitution §II]
- [ ] CHK015 ¿Está documentada la relación entre el tenant Keycloak, el cliente Keycloak y el tenant interno? [Dependency, Spec §Assumptions, Data Model]

## CRUD Lifecycle and Failure Scenarios

- [ ] CHK016 ¿Están definidos los campos obligatorios, opcionales y sus reglas de validación para alta y actualización? [Completeness, Spec §FR-013]
- [ ] CHK017 ¿Está especificada la regla de inmutabilidad del identificador y del username durante una edición? [Clarity, Data Model §Invariants]
- [ ] CHK018 ¿Está definido el comportamiento ante conflictos de email o username duplicados? [Gap, Contract]
- [ ] CHK019 ¿Está especificado el comportamiento cuando Keycloak no está disponible durante lectura o mutación? [Coverage, Edge Cases]
- [ ] CHK020 ¿Está definido el resultado observable después de una mutación parcialmente fallida? [Recovery, Gap]
- [ ] CHK021 ¿La eliminación del operador actual y del último administrador activo está especificada con reglas objetivas? [Security, Edge Cases]
- [ ] CHK022 ¿Está definido si una identidad eliminada puede recuperarse o solo recrearse? [Gap]

## Acceptance Criteria and Observability

- [ ] CHK023 ¿Los criterios de éxito miden por separado visibilidad, autorización, separación de tipos y persistencia CRUD? [Measurability, Spec §Success Criteria]
- [ ] CHK024 ¿Los escenarios de aceptación cubren los estados vacío, carga, error y éxito para ambas pantallas? [Coverage, Spec §User Scenarios, Edge Cases]
- [ ] CHK025 ¿Está especificado el idioma de todos los mensajes de validación, autorización, conflicto y disponibilidad? [Localization, Spec §FR-014]
- [ ] CHK026 ¿Los requisitos de auditoría incluyen `traceId`, `tenant_id`, `userId`, identidad afectada, tipo y resultado? [Observability, Spec §FR-017, Constitution §III]
- [ ] CHK027 ¿Está definido cómo se correlacionan los eventos de alta, edición y baja con el operador que los realizó? [Traceability, Spec §FR-017]
- [ ] CHK028 ¿La guía de validación incluye casos con rutas presentes, rutas ausentes y acciones incompletas? [Acceptance Criteria, quickstart.md]

## Scope, Dependencies and Assumptions

- [ ] CHK029 ¿Está claramente fuera de alcance la administración de contraseñas dentro de estas pantallas? [Scope, Spec §Assumptions]
- [ ] CHK030 ¿Está documentado que Keycloak es la fuente autorizada y que no se crea un catálogo local duplicado? [Dependency, research.md]
- [ ] CHK031 ¿Está definido el comportamiento ante paginación o volúmenes de identidades superiores a los esperados? [Gap, plan.md]
- [ ] CHK032 ¿Está documentado el requisito de pruebas de comportamiento y cobertura mínima para la lógica de negocio? [Quality, Constitution §IV, quickstart.md]
