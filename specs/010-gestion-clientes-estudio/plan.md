# Implementation Plan: Gestión de clientes por tipo

**Branch**: `010-gestion-clientes-estudio` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-gestion-clientes-estudio/spec.md`

## Summary

Extender la gestión de clientes contables existente para distinguir personas físicas y personas morales, con atributos específicos por tipo, identificación fiscal argentina única dentro del estudio, estado activo/inactivo y auditoría. La funcionalidad se implementará sobre `accounting-client-service`, el modelo `AccountingClient` de PostgreSQL/Prisma, contratos compartidos y la vista de clientes del frontend; no reutilizará la gestión de identidades Keycloak de `profile-service`.

## Technical Context

**Language/Version**: TypeScript estricto, Node.js >=20, navegador moderno

**Primary Dependencies**: Prisma 6, PostgreSQL, servidor HTTP existente, Vitest, Vite y componentes frontend actuales

**Storage**: PostgreSQL multi-tenant existente; `AccountingClient` se amplía con tipo y atributos diferenciados; `ChangeAuditEntry` se reutiliza para auditoría

**Testing**: Vitest unitario, integración con PostgreSQL/Prisma y pruebas E2E de API/UI; typecheck, lint y cobertura existente del repositorio

**Target Platform**: Servicios Linux en Docker Compose y aplicación web responsive en español

**Project Type**: Aplicación web multi-tenant con servicio backend, contratos compartidos y frontend SPA

**Performance Goals**: Listado inicial y filtrado de hasta 100 clientes visibles en menos de 10 segundos para el usuario; altas y ediciones con feedback inmediato en una interacción normal

**Constraints**: Aislamiento por `tenant_id`; identificación fiscal argentina normalizada y única por tenant; tipo inmutable; mensajes en español; sin eliminación física; no exponer campos del tipo opuesto; no modificar autenticación ni roles globales

**Scale/Scope**: Un listado CRUD de clientes del estudio, dos formularios diferenciados, filtro por tipo, atributos compartidos y específicos, estado activo/inactivo y eventos de auditoría

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Pass: la especificación aprobada define historias independientes, requisitos verificables y criterios observables.

Pass: cada cliente conserva `tenant_id`; las lecturas y mutaciones se ejecutan con identidad y permisos del estudio activo.

Pass: el diseño reutiliza el modelo contable existente y evita duplicar una entidad de cliente en Keycloak.

Pass: los contratos y modelos tendrán tipado estricto, validación de entrada, auditoría con contexto y pruebas de comportamiento; la interfaz será exclusivamente en español.

Pass: el alcance mantiene KISS/YAGNI: dos variantes explícitas y atributos compartidos, sin jerarquía genérica especulativa.

## Project Structure

### Documentation (this feature)

```text
specs/010-gestion-clientes-estudio/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── clients.md
└── tasks.md              # creado por /speckit-tasks
```

### Source Code (repository root)

```text
packages/contracts/clients.ts
packages/database/prisma/schema.prisma
packages/database/src/tenant-prisma.ts
apps/accounting-client-service/src/clients/
apps/accounting-client-service/src/main.ts
apps/frontend/src/features/clients/
apps/frontend/src/components/side-menu.ts
apps/frontend/src/components/navigation-layout.ts
apps/frontend/src/lib/api/client.ts
apps/billing-workflow-service/src/audit/change-audit.service.ts
tests/integration/clients-management.integration.spec.ts
tests/security/clients-management.security.spec.ts
tests/e2e/clients-management.e2e.spec.ts
```

**Structure Decision**: El dominio de clientes permanece en `accounting-client-service`, separado de la administración de personas/identidades de `profile-service`. Los contratos compartidos viven en `packages/contracts`, la persistencia sigue el esquema Prisma existente y el frontend agrega una vista/formulario de clientes con el mismo layout, permisos y patrón de API del proyecto.

## Complexity Tracking

No constitution violations identified; no complexity waiver required.
