# Implementation Plan: Gestión de clientes y contadores del estudio

**Branch**: `005-keycloak-people-management` | **Date**: 2026-10-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-keycloak-people-management/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Agregar dos pantallas protegidas para administrar identidades Keycloak del tenant activo: clientes (`type=client`) y contadores (`type=user`). Las rutas controlan el acceso a las pantallas y las acciones separadas controlan cada operación CRUD. El profile-service actuará como frontera autenticada hacia la API administrativa de Keycloak; el frontend reutilizará el layout SPA existente.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript estricto sobre Node.js y navegador

**Primary Dependencies**: Vite, `oidc-client-ts`, servidor HTTP existente, Prisma para tenant lookup y API administrativa de Keycloak

**Storage**: Keycloak para identidades y PostgreSQL existente para resolver el tenant interno

**Testing**: Vitest, pruebas contractuales/integración y escenarios end-to-end existentes

**Target Platform**: Navegador web responsive y servicios Linux en Docker Compose

**Project Type**: Aplicación web multi-tenant con frontend y servicios backend

**Performance Goals**: Listados visibles en una interacción normal y operaciones CRUD con feedback de carga; sin paginación avanzada requerida en esta versión

**Constraints**: No exponer credenciales administrativas ni tokens; validar tenant, ruta, action y tipo en backend; mensajes en español; no administrar contraseñas en estas pantallas

**Scale/Scope**: Dos listados CRUD, dos rutas protegidas, ocho acciones CRUD y las identidades del tenant activo

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Pass: la especificación está aprobada y las operaciones se separan por permisos de ruta y acción.

Pass: el tenant se valida antes de cada lectura o mutación y Keycloak continúa siendo la fuente de identidades.

Pass: el diseño conserva logging estructurado, tipado estricto, interfaz en español y pruebas de comportamiento.

Pass: no se agregan dependencias ni persistencia duplicada; se reutilizan el layout y los patrones de autenticación existentes.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
apps/frontend/src/components/side-menu.ts
apps/frontend/src/components/navigation-layout.ts
apps/frontend/src/features/people/people-view.ts
apps/frontend/src/features/people/people-form.ts
apps/frontend/src/auth/permission-evaluator.ts
apps/profile-service/src/people/people.service.ts
apps/profile-service/src/people/people.controller.ts
apps/profile-service/src/keycloak/keycloak-admin.adapter.ts
packages/contracts/people.ts
tests/security/people-management.security.spec.ts
tests/integration/people-management.integration.spec.ts
```

**Structure Decision**: Se separan contratos, lógica de negocio y adaptador administrativo. El frontend contiene vistas reutilizables para ambos tipos y el profile-service valida autenticación, tenant, permisos y tipo antes de invocar Keycloak. Las rutas HTTP quedan detrás del servicio existente y las pruebas se ubican junto a los contratos de seguridad e integración.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
