---
description: "Task list for the collections and cash-flow feature"
---

# Tasks: Sistema de Gestión de Cobranzas y Flujo de Fondos

**Input**: Design documents from `specs/001-cobranzas-flujo-fondos/`

**Prerequisites**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md), [contracts/api-rest.md](./contracts/api-rest.md), [contracts/events-nats.md](./contracts/events-nats.md), [quickstart.md](./quickstart.md)

**Tests**: Included because the constitution requires unit, integration, contract, and E2E verification with a minimum of 80% coverage for business logic and services.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the monorepo, service boundaries, local dependencies, and quality tooling described in `plan.md`.

- [x] T001 Create the monorepo workspace and application directories in `apps/` and infrastructure directories in `infra/` according to `plan.md`
- [x] T002 Initialize TypeScript 5.x, NestJS 10, React 18, Prisma, Zod, Pino, TanStack Query/Table, Zustand, OIDC, and shared tooling in `package.json` and workspace configuration
- [x] T003 [P] Configure strict TypeScript, ESLint, Prettier, import boundaries, and no-implicit-any rules in `tsconfig*.json`, `eslint.config.*`, and `.prettierrc*`
- [x] T004 [P] Add local development orchestration for PostgreSQL 16, NATS JetStream, MinIO, Keycloak, and the frontend in `docker-compose.yml` and `.env.example`
- [x] T005 [P] Create service bootstrap files and health endpoint stubs in `apps/*/src/main.ts` and `apps/*/src/health/health.controller.ts`
- [x] T006 [P] Create CI workflows for lint, type-check, tests, coverage, Docker builds, and deployment in `.github/workflows/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the shared security, persistence, messaging, error, observability, and money primitives required by every story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Define the Prisma schema and migrations for Tenant, StudioNotificationSettings, AccountingClient, PaymentObligation, PaymentSubmission, CustomerCreditBalance, CreditBalanceMovement, DebtClaimHistory, QuickActionToken, and ChangeAuditEntry in `infra/migrations/prisma/schema.prisma`
- [x] T008 Configure PostgreSQL `DECIMAL(14,2)`, fixed `ARS` currency, required foreign keys, unique constraints, enum values, and field constraints from `data-model.md` in `infra/migrations/prisma/migrations/`
- [x] T009 Implement tenant context extraction from JWT claims (`tenant_id`, `roles`, `sub`) and request correlation from `X-Trace-Id` in `apps/identity-sync-service/src/auth/tenant-context.ts`
- [x] T010 Implement RLS bootstrap policies requiring `app.current_tenant` for every tenant-scoped table in `infra/migrations/prisma/rls.sql`
- [x] T011 Implement the Prisma transaction extension that sets `SET LOCAL app.current_tenant` before every tenant-scoped operation in `packages/database/src/tenant-prisma.ts`
- [x] T012 [P] Implement JWT authentication guards and RBAC guards for `SUPER_ADMIN`, `STUDIO_ADMIN`, `ACCOUNTANT`, and `CLIENT_VIEWER` in `apps/identity-sync-service/src/auth/guards/`
- [x] T013 [P] Implement accountant portfolio authorization and client-to-representative lookup in `apps/identity-sync-service/src/tenants/portfolio-authorization.service.ts`
- [x] T014 [P] Implement RFC 7807 error serialization and validation error mapping in `packages/http/src/problem-details.ts`
- [x] T015 [P] Implement structured Pino logging with `traceId`, `tenant_id`, and `userId`, plus `/healthz`, `/livez`, and `/readyz` checks in `packages/observability/src/`
- [x] T016 [P] Implement exact ARS money parsing, arithmetic, rounding, and `es-AR` display formatting in `packages/money/src/ars-money.ts` and `apps/frontend/src/lib/formatters/ars.ts`
- [x] T017 Configure NATS JetStream stream `SAAS_BILLING`, `billing.>` subjects, 30-day/10-GB limits, 1 MB message limit, and event envelope validation in `infra/nats/` and `packages/events/src/`
- [x] T018 [P] Implement S3-compatible receipt storage abstraction and tenant-scoped object keys in `apps/billing-workflow-service/src/storage/receipt-storage.port.ts`
- [x] T019 [P] Create shared API client, auth token refresh, pagination, and RFC 7807 handling in `apps/frontend/src/lib/api/` and `apps/frontend/src/lib/auth/`
- [x] T020 Add database, NATS, and authentication integration test fixtures using Testcontainers in `tests/fixtures/`

**Checkpoint**: Foundation ready; user stories can now proceed independently.

---

## Phase 3: User Story 1 - Emisión y Registro de Obligaciones de Cobro (Priority: P1) 🎯 MVP

**Goal**: Allow an authorized accountant to create, list, view, and logically cancel ARS payment obligations with strict validation and portfolio visibility.

**Independent Test**: Execute Quickstart Scenario 1 with an `ACCOUNTANT` token: invalid zero amount returns RFC 7807 `400`; valid creation returns `201`, `PENDING`, `ARS`, and the full initial balance; an out-of-portfolio client is denied.

### Tests for User Story 1

- [x] T021 [P] [US1] Add contract tests for `POST /obligations`, `GET /obligations`, `GET /obligations/{id}`, and `POST /obligations/{id}/cancel` in `apps/billing-workflow-service/test/contract/obligations.contract.spec.ts`
- [x] T022 [P] [US1] Add integration tests for period/date, positive `DECIMAL(14,2)` amount, fixed `ARS`, cancellation reason, and portfolio/RLS authorization in `apps/billing-workflow-service/test/integration/obligations.integration.spec.ts`
- [x] T023 [P] [US1] Add Playwright/API E2E coverage for Quickstart Scenario 1 in `tests/e2e/obligations.e2e.spec.ts`

### Implementation for User Story 1

- [x] T024 [P] [US1] Create obligation domain types, status transition rules, and validation schemas in `apps/billing-workflow-service/src/obligations/domain/`
- [x] T025 [P] [US1] Implement tenant-scoped obligation repository using Prisma in `apps/billing-workflow-service/src/obligations/infrastructure/obligation.repository.ts`
- [x] T026 [US1] Implement obligation creation, pagination/filtering, detail retrieval, and logical cancellation use cases in `apps/billing-workflow-service/src/obligations/application/obligation.service.ts`
- [x] T027 [US1] Implement obligation REST controller and RFC 7807 responses in `apps/billing-workflow-service/src/obligations/presentation/obligation.controller.ts`
- [x] T028 [US1] Implement obligation list/detail/cancel screens with Spanish labels, ARS formatting, pagination, and role-aware visibility in `apps/frontend/src/features/obligations/`
- [x] T029 [US1] Record obligation creation, edits, and logical cancellation in `apps/billing-workflow-service/src/audit/change-audit.service.ts`

**Checkpoint**: User Story 1 is independently functional and is the MVP increment.

---

## Phase 4: User Story 2 - Notificación, Rendición y Validación de Pagos (Priority: P1)

**Goal**: Let clients and accountants report payments with receipts, keep debt unchanged until explicit validation, and notify the responsible accountant.

**Independent Test**: Execute Quickstart Scenario 2: reject a receipt over 15 MB with `413`; accept a valid multipart submission as `PENDING_VALIDATION`; confirm the obligation balance is unchanged until a permitted accountant resolves it.

### Tests for User Story 2

- [x] T030 [P] [US2] Add contract tests for payment submission, payment listing, validation, rejection, and receipt download endpoints in `apps/billing-workflow-service/test/contract/payments.contract.spec.ts`
- [x] T031 [P] [US2] Add integration tests for 15 MB file limit, allowed MIME types, multiple pending submissions, no pre-validation balance reduction, idempotent resolution, and tenant isolation in `apps/billing-workflow-service/test/integration/payments.integration.spec.ts`
- [x] T032 [P] [US2] Add event contract tests for `billing.payment.reported`, `billing.payment.validated`, and `billing.payment.rejected` in `packages/events/test/payment-events.contract.spec.ts`
- [x] T033 [P] [US2] Add Playwright/API E2E coverage for Quickstart Scenarios 2 and 3 in `tests/e2e/payments.e2e.spec.ts`

### Implementation for User Story 2

- [x] T034 [P] [US2] Create payment submission domain types and state transition rules for `PENDING_VALIDATION`, `VALIDATED`, `REJECTED`, and `CANCELLED`, including `PENDING_VALIDATION → CANCELLED` with automatic credit movement when the obligation is canceled, in `apps/billing-workflow-service/src/payments/domain/`
- [x] T035 [P] [US2] Implement multipart receipt validation, storage, metadata capture, and tenant-scoped access in `apps/billing-workflow-service/src/payments/receipt.service.ts`
- [x] T036 [US2] Implement payment report, list, validate, reject, and idempotency use cases in `apps/billing-workflow-service/src/payments/application/payment.service.ts`
- [x] T037 [US2] Implement payment REST controllers and RFC 7807 mappings in `apps/billing-workflow-service/src/payments/presentation/payment.controller.ts`
- [x] T038 [US2] Publish payment reported/validated/rejected events with the required envelope and ARS string amounts in `apps/billing-workflow-service/src/payments/events/payment-events.publisher.ts`
- [x] T039 [US2] Consume `billing.payment.reported`, `billing.payment.validated`, and `billing.payment.rejected` to send Spanish notifications in `apps/notification-service/src/payment-notifications/`
- [x] T040 [US2] Implement client payment portal, accountant review, validation, rejection, and receipt views in `apps/frontend/src/features/payments/` and `apps/frontend/src/features/client-portal/`
- [x] T041 [US2] Add payment and resolution audit entries with actor, timestamps, old/new state, and rejection reason in `apps/billing-workflow-service/src/audit/change-audit.service.ts`
- [x] T076 [P] [US2] Add contract and integration coverage for logical payment cancellation, required non-empty reason, cancellation eligibility only from `PENDING_VALIDATION`, automatic crediting of pending payment amounts, and preservation of payment history in `apps/billing-workflow-service/test/integration/payment-cancellation.integration.spec.ts`
- [x] T077 [US2] Implement logical payment cancellation with audit fields for reason, actor, timestamp, previous state, and new `CANCELLED` state, including automatic credit movement without reducing the canceled obligation balance in `apps/billing-workflow-service/src/payments/application/cancel-payment.service.ts`
- [x] T078 [US2] Expose the authorized payment-cancellation endpoint and Spanish RFC 7807 errors for resolved payments or missing reasons in `apps/billing-workflow-service/src/payments/presentation/payment.controller.ts`
- [x] T084 [P] [US2] Add E2E coverage proving a canceled obligation leaves its balance unchanged while each pending payment becomes `CANCELLED`, creates customer credit, and remains auditable in `tests/e2e/payment-cancellation-credit.e2e.spec.ts`

**Checkpoint**: User Stories 1 and 2 are independently testable; reported payments remain pending until explicit validation.

---

## Phase 5: User Story 3 - Gestión e Imputación de Saldos a Favor (Priority: P2)

**Goal**: Create exact customer credit for validated payment surpluses and allow authorized accountants to apply it atomically to obligations.

**Independent Test**: Execute Quickstart Scenario 3 and 4: validate ARS 85,000 against ARS 80,000, observe ARS 5,000 credit, then apply it to another obligation and observe both balances change in one operation.

### Tests for User Story 3

- [x] T042 [P] [US3] Add contract tests for credit balance retrieval and `POST /obligations/{id}/apply-credit` in `apps/billing-workflow-service/test/contract/credit-balance.contract.spec.ts`
- [x] T043 [P] [US3] Add integration tests for exact surplus, insufficient credit, over-application, concurrent application, atomic rollback, and tenant/role authorization in `apps/billing-workflow-service/test/integration/credit-balance.integration.spec.ts`
- [x] T044 [P] [US3] Add Playwright/API E2E coverage for Quickstart Scenario 4 in `tests/e2e/credit-balance.e2e.spec.ts`

### Implementation for User Story 3

- [x] T045 [P] [US3] Implement credit balance and credit movement domain types with immutable movement rules in `apps/billing-workflow-service/src/credit-balance/domain/`
- [x] T046 [US3] Implement transactional surplus accreditation during payment validation in `apps/billing-workflow-service/src/credit-balance/application/accredit-surplus.service.ts`
- [x] T047 [US3] Implement transactional credit application that updates `balance_due`, obligation status, available credit, movement history, and audit entry atomically in `apps/billing-workflow-service/src/credit-balance/application/apply-credit.service.ts`
- [x] T048 [US3] Implement credit balance REST endpoints and conflict/error responses in `apps/billing-workflow-service/src/credit-balance/presentation/credit-balance.controller.ts`
- [x] T049 [US3] Add customer credit warning, read-only client balance, and accountant application UI in `apps/frontend/src/features/credit-balance/` and `apps/frontend/src/features/client-portal/`

**Checkpoint**: Validated surplus and manual credit application are independently verifiable without changing the original submission history.

---

## Phase 6: User Story 4 - Automatización y Envío de Reclamos de Deuda (Priority: P2)

**Goal**: Automatically and manually dispatch Spanish debt claims with BCC, one-time quick-action links, retries, visible failure alerts, global settings, and immutable history.

**Independent Test**: Execute Quickstart Scenario 5 and the scheduled overdue flow: trigger a manual claim, verify BCC and audit history, then simulate mail failure and verify at least one retry followed by `FAILED` history and a visible alert.

### Tests for User Story 4

- [x] T050 [P] [US4] Add contract tests for manual claims, notification settings, claim history, and quick-action token endpoints in `apps/notification-service/test/contract/claims.contract.spec.ts`
- [x] T051 [P] [US4] Add integration tests for ART midnight expiry, grace/interval settings, BCC fallback, one-time token use, retry, failure alert, and immutable claim history in `apps/notification-service/test/integration/claims.integration.spec.ts`
- [x] T052 [P] [US4] Add event contract tests for `billing.claim.triggered` and `billing.claim.failed` in `packages/events/test/claim-events.contract.spec.ts`
- [x] T053 [P] [US4] Add Playwright/API E2E coverage for manual claim, quick-action submission, and failure alert in `tests/e2e/claims.e2e.spec.ts`

### Implementation for User Story 4

- [x] T054 [P] [US4] Implement notification settings validation with `grace_after_due_days` range 0–30 and `reminder_interval_days` range 1–60 in `apps/accounting-client-service/src/settings/`
- [x] T055 [P] [US4] Implement one-time `QuickActionToken` creation, expiry, atomic consumption, and obligation binding in `apps/notification-service/src/quick-actions/`
- [x] T056 [US4] Implement ART-aware overdue scheduler and automatic claim eligibility in `apps/notification-service/src/scheduler/`
- [x] T057 [US4] Implement manual claim endpoint, `billing.claim.triggered` publication, Spanish templates, BCC selection, and token URL generation in `apps/notification-service/src/claims/`
- [x] T058 [US4] Implement mail dispatch with at least one automatic retry, `DebtClaimHistory` persistence, `billing.claim.failed` publication, and visible alert creation in `apps/notification-service/src/dispatch/`
- [x] T059 [US4] Implement settings, claim history, manual dispatch, quick-action payment form, and failure-alert UI in `apps/frontend/src/features/notifications/` and `apps/frontend/src/features/client-portal/`
- [x] T060 [US4] Add immutable audit records for settings changes, claim attempts, token consumption, and failures in `apps/notification-service/src/audit/`
- [x] T079 [P] [US4] Add integration and E2E coverage proving ART day-boundary transition to `OVERDUE`, idempotent re-evaluation, transition completion before automatic claim dispatch, and 24-hour/one-use quick-action token expiry in `apps/notification-service/test/integration/overdue-transition.integration.spec.ts` and `tests/e2e/overdue-transition.e2e.spec.ts`
- [x] T080 [US4] Implement the daily overdue transition so obligations with `balance_due > 0` entering the day after `due_date` become `OVERDUE` exactly once before claim eligibility evaluation in `apps/notification-service/src/scheduler/overdue-transition.service.ts`
- [x] T083 [P] [US4] Implement quick-action token expiration at 24 hours, atomic one-use consumption, and rejection of expired or already-used tokens in `apps/notification-service/src/quick-actions/`

**Checkpoint**: Automatic/manual claims, recovery behavior, and quick-action reporting are independently testable.

---

## Phase 7: User Story 5 - Panel y Reporte de Flujo de Fondos (Priority: P3)

**Goal**: Provide date-filtered consolidated cash-flow metrics while respecting administrator and representative portfolios.

**Independent Test**: Execute Quickstart Scenario 6 with representative and administrator tokens; the representative sees only assigned clients, while the administrator sees the complete tenant and can filter by representative.

### Tests for User Story 5

- [x] T061 [P] [US5] Add contract tests for cash-flow report filters, pagination/limits, and representative filtering in `apps/billing-workflow-service/test/contract/cash-flow.contract.spec.ts`
- [x] T062 [P] [US5] Add integration tests for charged, collected, overdue, pending, date-boundary, empty, 500-client, and portfolio-isolation calculations in `apps/billing-workflow-service/test/integration/cash-flow.integration.spec.ts`
- [x] T063 [P] [US5] Add Playwright/API E2E coverage for Quickstart Scenario 6 and the <3-second standard portfolio target in `tests/e2e/cash-flow.e2e.spec.ts`

### Implementation for User Story 5

- [x] T064 [P] [US5] Define cash-flow report query schemas and exact ARS metric types in `apps/billing-workflow-service/src/reports/domain/`
- [x] T065 [US5] Implement tenant and representative-scoped cash-flow aggregation for invoiced/committed, collected, and pending debt in `apps/billing-workflow-service/src/reports/application/cash-flow.service.ts`
- [x] T066 [US5] Implement `GET /reports/cash-flow` with date and representative filters, authorization, pagination metadata, and RFC 7807 errors in `apps/billing-workflow-service/src/reports/presentation/cash-flow.controller.ts`
- [x] T067 [US5] Implement cash-flow dashboard, date selector, representative filter, empty states, Spanish labels, and ARS formatting in `apps/frontend/src/features/reports/`

**Checkpoint**: Cash-flow reporting is independently observable and portfolio isolation is enforced in both detail and aggregate views.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Complete the quality gates and end-to-end delivery requirements across all stories.

- [x] T068 [P] Add cross-service event correlation, dead-letter/error handling, and idempotent consumer behavior in `packages/events/src/` and `apps/*/src/`
- [x] T069 [P] Add accessibility, Spanish localization, ARS/date/timezone review, and responsive UI checks across `apps/frontend/src/`
- [x] T070 [P] Add security tests for cross-tenant reads/mutations, missing tenant claims, role escalation, expired tokens, and receipt access in `tests/security/`
- [x] T071 [P] Add observability dashboards and alerts for latency, mail failures, queue lag, health, and tenant-correlated errors in `infra/observability/`
- [x] T072 Run lint, strict type-check, unit/integration/contract/E2E suites, and enforce ≥80% coverage for business logic/services in `.github/workflows/ci.yml`
- [x] T073 Run every scenario in `specs/001-cobranzas-flujo-fondos/quickstart.md` against the local stack and record results in `docs/validation/cobranzas-v1.md`
- [x] T074 Review all generated API/event schemas against `contracts/`, update OpenAPI/event documentation in `docs/contracts/`, and resolve drift
- [x] T075 Build and publish service/frontend images and validate Kubernetes manifests, Prisma migration job, secrets, probes, ingress, and resource limits in `infra/k8s/`
- [x] T081 [P] Add payment-validation performance tests for the 95th-percentile `<2s` target and hard `<3s` ceiling with up to 500 clients, asserting observable payment status, obligation balance, and credit response in `tests/performance/payment-validation.perf.ts`
- [x] T082 Update the quickstart validation guide for overdue transition ordering, logical payment cancellation, consolidated claim rules, and payment-validation latency in `specs/001-cobranzas-flujo-fondos/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T003–T006 can run in parallel after T001/T002 establish the workspace.
- **Foundational (Phase 2)**: Depends on Setup; T012–T019 can run in parallel where they touch separate packages, while T010–T011 depend on T007–T008.
- **User Stories (Phases 3–7)**: All depend on Foundational completion. US1 and US2 can start in parallel; US3 depends logically on US2 payment validation; US4 can start after foundational event/auth infrastructure; US5 can start after the reporting data model and US1/US2 data are available.
- **Polish (Phase 8)**: Depends on all desired user stories and their checkpoints.

### User Story Dependencies

- **US1 (P1)**: Depends only on Phase 2; MVP scope.
- **US2 (P1)**: Depends on Phase 2 and the obligation contract/repository from US1 (T024–T027).
- **US3 (P2)**: Depends on US2 validation and payment entities (T034–T038), but its credit tests can be prepared in parallel.
- **US4 (P2)**: Depends on Phase 2 and obligation/payment events; can proceed in parallel with US3 after T017.
- **US5 (P3)**: Depends on foundational tenant/portfolio authorization and the obligation/payment data produced by US1–US2.
- **New change coverage**: T076–T078 and T084 extend US2 cancellation behavior; T079–T080 and T083 extend US4 overdue/token behavior; T081–T082 cover the updated SC-010 and quickstart validation. These tasks do not alter unrelated story scope.

### Task ID Policy

Task IDs are stable append-only identifiers for traceability. Story phase placement defines execution grouping and dependencies; newly added tasks retain their original IDs so existing references remain valid.

### Parallel Opportunities

- Setup linting, local infrastructure, service bootstraps, and CI configuration can proceed in parallel once the workspace exists.
- Foundational auth, error handling, observability, money formatting, storage, and frontend API primitives can proceed in parallel after schema decisions are fixed.
- Within each story, contract tests, integration tests, and E2E scaffolding can proceed in parallel; domain types and repositories can also proceed in parallel when files are separate.
- After Phase 2, US1 and US4 can be staffed in parallel; US2 can proceed alongside US1 after its endpoint contracts are stable.

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1.
2. Complete Phase 2, including RLS, authentication, RFC 7807 errors, money primitives, and test fixtures.
3. Complete US1.
4. Run Quickstart Scenario 1 and the US1 contract/integration/E2E tests.
5. Stop for validation/demo before adding payment workflows.

### Incremental Delivery

1. Add US2 for payment reporting and explicit validation.
2. Add US3 for surplus and credit application.
3. Add US4 for automatic/manual claims and recovery.
4. Add US5 for consolidated reporting.
5. Complete Phase 8 and run the full quickstart and CI quality gates.

## Notes

- Every task uses the required `- [ ] T### [P?] [US?]` format and includes an actionable repository path.
- `[P]` means separate files and no dependency on unfinished work in the same phase.
- Tests validate observable contracts and behavior; implementation-private details are not acceptance criteria.
- Currency values are persisted and exchanged as exact decimal strings; UI displays use `es-AR` formatting.
