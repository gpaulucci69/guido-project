# Implementation Plan: Navegación principal y bienvenida del frontend

**Branch**: `main` | **Date**: 2026-10-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-frontend-navigation-welcome/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Agregar una pantalla de bienvenida y navegación lateral al frontend existente. El encabezado resolverá mediante backend el `name` del cliente Keycloak identificado por `authorization.client_id`, mientras el acceso a `Estado de cuenta` se habilitará únicamente con la ruta normalizada `/home/client/services`. La vista existente de obligaciones se reutilizará.

## Technical Context

**Language/Version**: TypeScript, Node.js >=20, navegador moderno

**Primary Dependencies**: frontend SPA existente, `oidc-client-ts`, servicio de perfil, cliente API existente, Vitest

**Storage**: Keycloak para identidad y nombre del cliente; PostgreSQL/servicios existentes para obligaciones

**Testing**: Vitest unitario/contractual y validación E2E observable en navegador

**Target Platform**: SPA web en Chrome y navegadores modernos, servicios Linux containerizados

**Project Type**: Monorepo web multi-servicio con frontend SPA

**Performance Goals**: Cambio de pantalla y colapso del menú en menos de 1 segundo en condiciones normales; sin solicitudes adicionales al abrir/cerrar el menú

**Constraints**: Autorización derivada del token existente; no consultar APIs administrativas desde el navegador; textos en español; reutilizar obligaciones; no duplicar sesión OIDC

**Scale/Scope**: Dos nuevas vistas de navegación para usuarios autenticados; una ruta protegida reutilizada; sin cambios al dominio contable

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- I. SDD y verificabilidad: PASS. La especificación define historias, escenarios y criterios observables.
- II. Aislamiento y mínimo privilegio: PASS. La ruta de estado de cuenta se habilita y protege por permisos del token; el nombre del cliente se resuelve server-side.
- III. Observabilidad: PASS. Se reutilizan logs y health checks existentes; los errores de navegación no deben revelar tokens.
- IV. Testing >=80%: PASS condicionado a pruebas de normalización de rutas, navegación protegida y E2E.
- V. SOLID: PASS. Se separan layout, menú, bienvenida, contexto de cliente y guardia de rutas.
- VI. KISS/YAGNI: PASS. Se reutiliza la pantalla de obligaciones y no se agrega un sistema de navegación alternativo.
- VII. Localización: PASS. Las etiquetas y mensajes visibles estarán en español.

## Project Structure

### Documentation (this feature)

```text
specs/004-frontend-navigation-welcome/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
apps/frontend/src/
├── auth/
│   ├── session.ts
│   ├── permission-evaluator.ts
│   └── client-context.ts
├── components/
│   ├── app-header.ts
│   ├── side-menu.ts
│   └── navigation-layout.ts
├── features/
│   ├── welcome/welcome-view.ts
│   └── obligations/obligation-view.ts
└── main.ts

apps/profile-service/src/
└── client-context/
    ├── client-context.controller.ts
    └── client-context.service.ts

tests/
├── security/navigation.security.spec.ts
└── integration/navigation.integration.spec.ts
```

**Structure Decision**: Mantener la SPA y extraer la navegación en componentes pequeños. El backend existente de perfil resolverá el nombre descriptivo del cliente Keycloak a partir del `client_id` autenticado. El frontend solo recibirá el contexto autorizado y reutilizará la vista de obligaciones actual.

## Phase 0: Research

Las decisiones se documentan en [research.md](./research.md): resolución server-side del nombre del cliente Keycloak, normalización exacta de rutas y guardas de navegación en una SPA.

## Phase 1: Design

- [data-model.md](./data-model.md): contexto del cliente, navegación y estados de menú.
- [contracts/client-context.md](./contracts/client-context.md): contrato para obtener el nombre del cliente Keycloak.
- [quickstart.md](./quickstart.md): escenarios de bienvenida, navegación protegida y menú colapsable.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because                                   |
| --------- | ---------- | ---------------------------------------------------------------------- |
| None      | N/A        | La feature reutiliza frontend, autorización y obligaciones existentes. |
