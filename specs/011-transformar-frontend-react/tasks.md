---
description: "Task list for the complete React frontend replacement"
---

# Tasks: Transformar frontend a React

**Input**: Design documents from `/specs/011-transformar-frontend-react/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar la aplicación React y la configuración de desarrollo sin modificar los servicios backend.

- [x] T001 [P] Add React, React DOM, TanStack Query, TanStack Table Core and their TypeScript dependencies to `package.json` and update `package-lock.json`.
- [x] T002 [P] Add React JSX and Vite typing configuration in `tsconfig.json`, `apps/frontend/src/vite-env.d.ts` and the frontend entry configuration.
- [x] T003 Create the React source structure under `apps/frontend/src/app`, `apps/frontend/src/components`, `apps/frontend/src/features`, `apps/frontend/src/hooks`, `apps/frontend/src/lib` and `apps/frontend/src/styles`.
- [x] T004 [P] Define the frontend test and quality commands for the React entrypoint in `package.json` and document the expected commands in `specs/011-transformar-frontend-react/quickstart.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Crear las bases compartidas que todas las historias necesitan.

- [x] T005 Implement the application root and provider composition in `apps/frontend/src/main.tsx` and `apps/frontend/src/app/App.tsx`.
- [x] T006 Implement typed API, error and `204 No Content` handling in `apps/frontend/src/lib/api/client.ts` and domain API modules under `apps/frontend/src/lib/api`.
- [x] T007 Implement the TanStack Query client, query keys, invalidation and mutation defaults in `apps/frontend/src/app/query-client.ts` and `apps/frontend/src/app/App.tsx`.
- [x] T008 Implement session, identity, permissions and expiration context in `apps/frontend/src/auth/session.ts`, `apps/frontend/src/app/session-context.tsx` and `apps/frontend/src/hooks/use-session.ts`.
- [x] T009 Implement client context loading and fallback behavior in `apps/frontend/src/auth/client-context.ts` and `apps/frontend/src/app/client-context.tsx`.
- [x] T010 Define shared loading, empty, error, modal, button, form and responsive layout primitives in `apps/frontend/src/components` and `apps/frontend/src/styles`.
- [x] T011 Preserve Spanish localization, Argentine date/currency formatting and accessible labels in `apps/frontend/src/lib/formatters` and `apps/frontend/src/styles`.
- [x] T012 Establish the route table and protected-route boundary in `apps/frontend/src/app/routes.tsx` and `apps/frontend/src/components/permission-boundary.tsx`.

**Checkpoint**: React shell can authenticate, resolve session/client context and protect routes before any domain view is migrated.

---

## Phase 3: User Story 1 - Navegación y sesión en React (Priority: P1) 🎯 MVP

**Goal**: Reemplazar el shell actual conservando autenticación, bienvenida, navegación, permisos, cliente activo, avatar y sesión expirada.

**Independent Test**: Un usuario autenticado puede ver bienvenida, contexto y avatar; solo ve rutas autorizadas; una sesión expirada permite volver al login.

- [x] T013 [US1] Implement the login and OIDC callback in `components/react-login.tsx` and `app/session-context.tsx`.
- [ ] T014 [P] [US1] Implement the responsive navigation and client branding in `apps/frontend/src/components/side-menu.tsx` and `apps/frontend/src/components/navigation-layout.tsx`.
- [ ] T015 [P] [US1] Implement the account header, avatar fallback, client roles and account menu in `apps/frontend/src/components/app-header.tsx`.
- [ ] T016 [P] [US1] Implement the welcome view with identity and client context in `apps/frontend/src/features/welcome/welcome-view.tsx`.
- [x] T017 [US1] Implement the session-expired dialog and sign-in recovery in `components/react-shell.tsx`.
- [x] T018 [US1] Replace the current entrypoint in `apps/frontend/src/main.ts` with the React entrypoint and remove the legacy bootstrap path after parity is confirmed.
- [x] T019 [US1] Apply the redesigned visual system to the shell in `apps/frontend/src/styles` while keeping Spanish labels and accessible focus/keyboard behavior.

**Checkpoint**: The React shell and protected navigation are independently usable.

---

## Phase 4: User Story 2 - Gestión de clientes y asociados (Priority: P1)

**Goal**: Migrar los listados y formularios operativos con tablas, filtros, roles, avatares, estados y errores funcionales.

**Independent Test**: Un usuario autorizado puede listar, filtrar, crear, editar y cambiar estado de clientes y asociados sin perder permisos ni contexto.

- [x] T020 [P] [US2] Extract typed client API operations into `apps/frontend/src/features/clients/clients-api.ts` and typed people API operations into `apps/frontend/src/features/people/people-api.ts`.
- [ ] T021 [P] [US2] Implement the TanStack Table client list with filter, compact responsive layout and actions in `apps/frontend/src/features/clients/clients-view.tsx`.
- [ ] T022 [P] [US2] Implement the TanStack Table associated list with avatar fallback, role, Ingreso, Nacimiento, status and actions in `apps/frontend/src/features/people/people-view.tsx`.
- [ ] T023 [P] [US2] Implement the client create/edit modal and validation messages in `apps/frontend/src/features/clients/client-form.tsx`.
- [ ] T024 [P] [US2] Implement the associated create/edit modal with client role, avatar, dates and status in `apps/frontend/src/features/people/people-form.tsx`.
- [ ] T025 [US2] Integrate optional pagination as a performance decision, plus filter state, loading/empty/error states and refresh behavior in the client and people feature containers.
- [ ] T026 [US2] Preserve conflict and validation messages for duplicate CUIT, duplicate email, invalid roles and unauthorized mutations in the feature forms.
- [x] T027 [US2] Apply the compact professional list styles and responsive table behavior in `apps/frontend/src/styles`.

**Checkpoint**: Both operational list domains are independently usable from the React shell.

---

## Phase 5: User Story 3 - Perfil y acciones de cuenta (Priority: P2)

**Goal**: Migrar el perfil, avatar, roles visibles y cambio de clave a modales React claros y accesibles.

**Independent Test**: El usuario puede abrir el menú de cuenta, editar perfil/avatar, cambiar clave y ver mensajes de éxito/error.

- [x] T028 [P] [US3] Implement profile loading and update hooks in `apps/frontend/src/auth/profile.ts` and `apps/frontend/src/hooks/use-profile.ts`.
- [ ] T029 [P] [US3] Implement the profile edit modal with avatar upload and fallback behavior in `apps/frontend/src/components/profile-modal.tsx`.
- [ ] T030 [P] [US3] Implement the password reset modal with new password confirmation and Spanish validation messages in `apps/frontend/src/components/password-modal.tsx`.
- [ ] T031 [US3] Connect profile mutations to header refresh and session identity refresh in `apps/frontend/src/components/app-header.tsx` and `apps/frontend/src/app/session-context.tsx`.
- [ ] T032 [US3] Preserve accessible modal focus, Escape close, status announcements and error presentation across profile/account dialogs.

**Checkpoint**: Account actions are independently usable from the React header.

---

## Phase 6: Remaining Domain Views (Cross-cutting migration)

**Purpose**: Migrar las vistas funcionales restantes para completar el reemplazo único del frontend.

- [x] T033 [P] Migrate the account status list, creation and cancellation to `apps/frontend/src/features/react-lists/obligation-list.tsx`.
- [ ] T034 [P] Migrate payments, reports, credit balance, notifications and client portal views from `apps/frontend/src/features` into React components preserving existing contracts.
- [ ] T035 [P] Migrate shared password/session/permission boundaries and remove remaining direct DOM event wiring from `apps/frontend/src/components`.
- [x] T036 Use the same permission rules for menu entries and direct URLs in `app/routes.tsx` and `components/react-navigation.tsx`.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validar la entrega completa, retirar el legado y asegurar las puertas de calidad.

- [x] T037 [P] Remove obsolete manual HTML rendering modules after all consumers are migrated from `apps/frontend/src`.
- [ ] T038 [P] Add behavior-focused frontend tests for session, protected routes, forms, table states and error messages under `apps/frontend/src/**/*.test.tsx`.
- [ ] T039 [P] Add accessible responsive visual checks for desktop and narrow viewports under `apps/frontend/src` and the project validation workflow.
- [ ] T040 Run the TypeScript, lint, format and test quality gates defined in `specs/011-transformar-frontend-react/quickstart.md` and resolve all failures.
- [ ] T041 Run the end-to-end scenarios from `specs/011-transformar-frontend-react/quickstart.md` against the running services and document any release-blocking issue.
- [ ] T042 Review multi-tenant, RBAC, Spanish localization, date/currency formatting and error handling against `specs/011-transformar-frontend-react/spec.md` and `.specify/memory/constitution.md`.
- [ ] T043 Validate initial interactivity within 2 seconds and list performance with up to 1,000 records using the scenarios in `specs/011-transformar-frontend-react/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP shell.
- **User Story 2 (Phase 4)**: Depends on Foundational and shell contracts; can proceed in parallel with US1 after T012.
- **User Story 3 (Phase 5)**: Depends on Foundational and session context; can proceed in parallel with US2 after T007.
- **Remaining Views (Phase 6)**: Depends on the shell and shared API/form primitives.
- **Polish (Phase 7)**: Depends on all migrated views.

### User Story Dependencies

- **US1**: No dependency on other stories after Phase 2.
- **US2**: Uses session/permission context from Phase 2; independent of US3.
- **US3**: Uses session context from Phase 2; header integration follows US1 shell.

### Parallel Opportunities

- T001, T002, T004 can run in parallel.
- T014, T015 and T016 can run in parallel after T012.
- T020, T021, T022, T023 and T024 can be split among contributors after T012.
- T027, T028 and T029 can run in parallel after T007.
- T032, T033 and T034 can run in parallel after shared primitives exist.

## Implementation Strategy

1. Complete Setup and Foundational phases.
2. Build and validate the React shell, authentication and route protection.
3. Migrate clients and associates, then profile/account actions.
4. Migrate all remaining views before removing the legacy bootstrap.
5. Run all quality gates and end-to-end scenarios as one release candidate.
