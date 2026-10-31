---
description: "Task list for attribute-based multi-tenant authentication and authorization"
---

# Tasks: Autorización multi-tenant basada en permisos de Keycloak

**Input**: Design documents from `/specs/002-autenticacion-multi-tenant/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/authorization.md](./contracts/authorization.md), [quickstart.md](./quickstart.md)

**Tests**: Incluidos porque la especificación exige pruebas de aislamiento entre tenants, escalamiento de privilegios, renovación y modo demo.

**Design prerequisite**: T049 debe completarse antes de iniciar la implementación de cualquier fase.

## Phase 0: Design Readiness Gate

**Purpose**: Confirmar que los artefactos de diseño son suficientemente precisos antes de preparar o implementar la infraestructura.

- [x] T049 Revisar la checklist de calidad de requisitos `specs/002-autenticacion-multi-tenant/checklists/security.md` y resolver cualquier ambigüedad restante en spec, plan o contratos antes de iniciar la implementación.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar dependencias y configuración reproducible de identidad.

- [x] T001 Revisar y alinear variables OIDC de frontend/backend (`OIDC_ISSUER`, audience, client ID, realm `saas-contable`) en `.env.example`, `docker-compose.yml` y `apps/frontend/src/`.
- [x] T002 [P] Agregar la dependencia OIDC del SPA y sus tipos en `package.json` y el workspace de `apps/frontend/package.json`.
- [x] T003 [P] Crear la estructura de configuración versionada de Keycloak en `infra/keycloak/README.md`, `infra/keycloak/realm-import.json` y `infra/keycloak/client-roles.json`.
- [x] T004 [P] Definir fixtures de usuarios, tenants, client-roles y atributos `route`/`action` para pruebas en `tests/fixtures/auth-fixtures.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Crear el contexto común que todas las historias necesitan.

**⚠️ CRITICAL**: Ninguna historia puede comenzar hasta completar esta fase.

- [x] T005 Implementar la verificación de firma, issuer, audience y vigencia del access token OIDC en `apps/identity-sync-service/src/auth/token-verifier.ts`.
- [x] T006 Implementar el parser y normalizador del claim de entrada `authorization.routes/actions` a `permissions: { type: "route" | "action", value: string }`, ignorando atributos vacíos o no soportados, en `apps/identity-sync-service/src/auth/permission-context.ts`.
- [x] T007 [P] Agregar pruebas unitarias de normalización para permisos repetidos, ausentes, inválidos y combinados en `apps/identity-sync-service/src/auth/permission-context.test.ts`.
- [x] T008 Implementar `IdentityContext` con `sub`, `tenantId` derivado exclusivamente de `authorization.client_id`, permisos normalizados opcionales, roles opcionales solo para auditoría, `traceId` e `isDemo` en `apps/identity-sync-service/src/auth/identity-context.ts`, rechazando credenciales sin ese identificador de tenant y aplicando denegación por defecto sin permisos.
- [x] T009 Implementar evaluación declarativa de permisos `route`/`action` con denegación por defecto en `apps/identity-sync-service/src/auth/permission-evaluator.ts`; no comparar nombres de roles.
- [x] T010 [P] Agregar pruebas unitarias del evaluador para permisos presentes/ausentes, rutas, acciones, `view/customers/all` y `view/customers/own` en `apps/identity-sync-service/src/auth/permission-evaluator.test.ts`.
- [x] T011 Implementar manejo común de respuestas `401`/`403` RFC 7807 sin revelar existencia de recursos cross-tenant en `packages/http/src/problem-details.ts` y `apps/identity-sync-service/src/auth/authorization-errors.ts`.
- [x] T012 Implementar guard de autenticación y guard de permiso para todos los servicios de negocio en `apps/identity-sync-service/src/auth/guards/authentication.guard.ts` y `apps/identity-sync-service/src/auth/guards/permission.guard.ts`.
- [x] T013 [P] Integrar el contexto tenant con RLS y la ejecución de transacciones en `packages/database/src/tenant-prisma.ts`, rechazando operaciones sin tenant válido.
- [x] T014 [P] Implementar el registro estructurado de eventos de autenticación/autorización en `packages/observability/src/security-events.ts`, incluyendo `sub`, `tenant_id` cuando exista, permiso requerido, `traceId` y resultado.

**Checkpoint**: Contexto, permisos declarativos, errores y guards están disponibles para las historias.

---

## Phase 3: User Story 1 - Iniciar y cerrar sesión de forma segura (Priority: P1) 🎯 MVP

**Goal**: Permitir login/logout OIDC y mantener una sesión válida con contexto de usuario y tenant.

**Independent Test**: Un usuario válido inicia sesión, llega a una vista protegida con su identidad/permisos; logout termina la sesión; credenciales inválidas no acceden.

### Tests for User Story 1

- [x] T015 [P] [US1] Crear pruebas de contrato para token válido, inválido, vencido, sin `sub`, sin `authorization.client_id` y sin permisos normalizables en `tests/security/authentication.security.spec.ts`.
- [x] T016 [P] [US1] Crear pruebas de flujo login/logout y renovación válida en `apps/frontend/src/auth/session.test.ts`.

### Implementation for User Story 1

- [x] T017 [US1] Implementar cliente OIDC con login, callback, logout, almacenamiento seguro de sesión y normalización del claim de entrada `authorization` a permisos internos en `apps/frontend/src/auth/oidc-client.ts`.
- [x] T018 [US1] Implementar estado de sesión, carga de identidad y renovación de tokens en `apps/frontend/src/auth/session.ts`.
- [x] T019 [US1] Integrar el token vigente en todas las solicitudes del cliente HTTP en `apps/frontend/src/lib/api/client.ts` y proteger las rutas de negocio en `apps/frontend/src/main.ts`.
- [x] T020 [US1] Aplicar autenticación y contexto tenant a los entrypoints HTTP de `apps/billing-workflow-service/src/main.ts`, `apps/accounting-client-service/src/main.ts` y `apps/notification-service/src/main.ts`, dejando públicos únicamente los health checks.
- [x] T021 [US1] Agregar estados visibles de autenticación, sesión expirada y error de login en español en `apps/frontend/src/auth/auth-view.ts` y `apps/frontend/src/styles.css`.

**Checkpoint**: Login, logout, validación de token y protección básica están operativos sin autorización por nombre de rol.

---

## Phase 4: User Story 2 - Aplicar identidad, tenant y permisos en cada operación (Priority: P1)

**Goal**: Hacer que todos los endpoints de negocio exijan contexto válido, permiso declarativo y aislamiento de tenant.

**Independent Test**: Solicitudes sin token, con token inválido, permiso faltante, tenant manipulado o recurso de otro tenant son rechazadas antes de operar.

### Tests for User Story 2

- [x] T022 [P] [US2] Crear pruebas de contrato para respuestas `401`, `403`, permisos requeridos y errores sin filtración de recursos en `tests/security/authorization.security.spec.ts`.
- [x] T023 [P] [US2] Crear pruebas cross-tenant para lecturas y mutaciones con identificadores válidos de otro tenant en `tests/security/tenant-isolation.security.spec.ts`.
- [x] T024 [P] [US2] Crear pruebas de escalamiento que alteren nombres de roles sin agregar permisos `route`/`action` en `tests/security/privilege-escalation.security.spec.ts`.

### Implementation for User Story 2

- [x] T025 [US2] Aplicar el guard de autenticación y permisos requeridos a cada controlador de `apps/billing-workflow-service/src/`, `apps/accounting-client-service/src/` y `apps/notification-service/src/`.
- [x] T026 [US2] Aplicar en los controladores las declaraciones de permisos requeridos por operación ya definidas en `specs/002-autenticacion-multi-tenant/contracts/authorization.md`, usando valores declarativos sin nombres de roles; cualquier cambio contractual debe hacerse antes de iniciar esta fase.
- [x] T053 [US2] Definir y probar explícitamente las operaciones de configuración de tenant permitidas a `STUDIO_ADMIN` y las operaciones globales reservadas a `SUPER_ADMIN`, incluyendo rechazos de acceso cruzado en `tests/security/administrative-scope.security.spec.ts`.
- [x] T027 [US2] Garantizar que los repositorios y casos de uso reciben el `tenantId` del `IdentityContext` y no de parámetros confiados del cliente en `apps/billing-workflow-service/src/` y `apps/accounting-client-service/src/`.
- [x] T028 [US2] Registrar denegaciones de autenticación, permiso y tenant en los entrypoints y guards mediante `packages/observability/src/security-events.ts`.
- [x] T029 [US2] Documentar y provisionar el custom mapper que transforma atributos de client-roles en `authorization.routes/actions`, incluyendo `authorization.client_id`, en `infra/keycloak/realm-import.json`, `infra/keycloak/client-roles.json` e `infra/keycloak/README.md`.

**Checkpoint**: Todos los endpoints de negocio son autenticados, autorizados por atributos y aislados por tenant.

---

## Phase 5: User Story 3 - Restringir acciones según permisos y cartera (Priority: P1)

**Goal**: Controlar páginas, menús, botones y acceso a clientes según permisos declarativos y cartera persistida.

**Independent Test**: Cambiar atributos `route`/`action` cambia la UI y el backend rechaza la acción equivalente cuando falta el permiso; `own` nunca accede a clientes no asignados.

### Tests for User Story 3

- [x] T030 [P] [US3] Crear pruebas de contrato para rutas y acciones declarativas en `apps/frontend/src/auth/permission-evaluator.test.ts`.
- [x] T031 [P] [US3] Crear pruebas de integración para `view/customers/all` y `view/customers/own`, incluyendo contador sin cartera, en `apps/identity-sync-service/test/portfolio-authorization.integration.spec.ts`.
- [x] T032 [P] [US3] Crear pruebas E2E de visibilidad y acceso directo a acciones en `tests/security/role-attribute-authorization.security.spec.ts`.

### Implementation for User Story 3

- [x] T033 [US3] Implementar el evaluador de permisos compartido del frontend para `canRoute` y `canAction` en `apps/frontend/src/auth/permission-evaluator.ts`.
- [x] T034 [US3] Implementar componentes de protección de rutas, menús y acciones en `apps/frontend/src/components/permission-boundary.ts` y `apps/frontend/src/main.ts`.
- [x] T035 [US3] Implementar guard de cartera que diferencie `view/customers/all` y `view/customers/own` en `apps/identity-sync-service/src/auth/guards/portfolio.guard.ts` y `apps/identity-sync-service/src/tenants/portfolio-authorization.service.ts`.
- [x] T036 [US3] Aplicar restricciones de cartera a clientes, obligaciones, pagos, reclamos y reportes en `apps/accounting-client-service/src/`, `apps/billing-workflow-service/src/` y `apps/notification-service/src/`, resolviendo `authorization.client_id` mediante `Tenant.clientId` al UUID interno `Tenant.id` y verificando `AccountingClient.representativeAccountantId` desde PostgreSQL.
- [x] T037 [US3] Sustituir la lógica de demo/rol fija del frontend por permisos declarativos en `apps/frontend/src/main.ts` y `apps/frontend/src/auth/session.ts`.

**Checkpoint**: La UI y el backend usan los mismos permisos declarativos, con la cartera aplicada como restricción de datos.

---

## Phase 6: User Story 4 - Usar un modo demo controlado (Priority: P2)

**Goal**: Permitir identidades demo únicamente mediante bandera explícita, con identificación visible y sin activación implícita.

**Independent Test**: Con la bandera activa funciona la sesión demo; sin ella o con una credencial demo no autorizada, se exige OIDC real.

### Tests for User Story 4

- [x] T038 [P] [US4] Crear pruebas de aceptación para bandera activa/inactiva, identificación visible y rechazo de credencial demo en `tests/security/demo-mode.security.spec.ts`.
- [x] T039 [P] [US4] Crear pruebas de renovación fallida que verifiquen cancelación, limpieza de sesión y redirección a login en `apps/frontend/src/auth/session.test.ts`.

### Implementation for User Story 4

- [x] T040 [US4] Implementar validación centralizada de la bandera demo y creación del `IdentityContext` demo en `apps/identity-sync-service/src/auth/demo-context.ts`.
- [x] T041 [US4] Mostrar indicador visible de sesión demo y bloquear su uso cuando la bandera no esté activa en `apps/frontend/src/auth/session.ts` y `apps/frontend/src/auth/auth-view.ts`.
- [x] T042 [US4] Implementar la ruta de fallo de renovación para cancelar la solicitud, limpiar tokens y redirigir al login en `apps/frontend/src/auth/oidc-client.ts` y `apps/frontend/src/lib/api/client.ts`.
- [x] T043 [US4] Registrar el uso del modo demo y los fallos de renovación en `packages/observability/src/security-events.ts`.

**Checkpoint**: Demo y recuperación de sesión funcionan de forma explícita y auditable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Endurecer, documentar y validar todo el alcance.

- [x] T044 [P] Actualizar `docs/validation/cobranzas-v1.md` con escenarios de permisos declarativos, custom mapper, tenant isolation y demo.
- [x] T045 [P] Actualizar `infra/observability/README.md` y `infra/observability/alerts.yaml` con métricas y alertas de denegaciones, fallos OIDC y uso de demo.
- [x] T046 [P] Revisar todos los textos visibles de auth/authz para español y ausencia de detalles sensibles en `apps/frontend/src/`.
- [x] T047 Ejecutar `npm run typecheck`, `npm run lint`, `npm run format` y `npm test`, corrigiendo regresiones de la funcionalidad en los archivos afectados.
- [x] T048 Ejecutar todos los escenarios de `specs/002-autenticacion-multi-tenant/quickstart.md` contra Keycloak y servicios levantados.
- [x] T050 Ejecutar una prueba de aceptación con al menos 20 inicios de sesión válidos y verificar que al menos el 95% llega a su pantalla autorizada en menos de 30 segundos, registrando los resultados observables del entorno de validación.
- [x] T051 Ejecutar una prueba de aceptación con al menos 20 renovaciones de sesión válidas y verificar que al menos el 95% conserva la navegación y completa la operación protegida sin relogin.
- [x] T052 Configurar el comando de cobertura para lógica de negocio y servicios, ejecutar la suite con cobertura y hacer fallar la validación si cualquier métrica relevante queda por debajo de 80%, dejando el umbral verificable en CI.
- [x] T054 [US1] Agregar pruebas de sesión multi-pestaña para renovación y logout coherentes, invalidación de tokens reutilizados y fallos del proveedor sin acceso anónimo ni activación demo en `apps/frontend/src/auth/session.test.ts`.
- [x] T055 [US2] Agregar pruebas para tenant inexistente o deshabilitado, múltiples roles con unión de permisos sin escalamiento y contador sin cartera en `tests/security/identity-edge-cases.security.spec.ts`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Pre-implementation gate**: T049 debe completarse antes de iniciar Setup; cualquier ambigüedad encontrada debe resolverse en los artefactos de diseño antes de implementar.
- **Setup (Phase 1)**: depende de T049; T001–T004 pueden ejecutarse en paralelo salvo la revisión de variables compartidas.
- **Foundational (Phase 2)**: depende de Setup y bloquea todas las historias.
- **US1 y US2 (Phases 3–4)**: dependen de Foundational; US2 puede comenzar tras T012–T014 y requiere T017–T020 para validar flujos reales.
- **US3 (Phase 5)**: depende de US1 y de los guards de US2.
- **US4 (Phase 6)**: depende de US1; puede ejecutarse en paralelo con US3 después de T018.
- **Polish (Phase 7)**: depende de las historias seleccionadas.

### User Story Dependencies

- **US1 (P1)**: independiente después de Foundational; MVP recomendado.
- **US2 (P1)**: depende de la sesión/contexto de US1 para pruebas end-to-end, aunque sus evaluadores unitarios pueden desarrollarse en paralelo.
- **US3 (P1)**: depende de US1 y US2 porque combina sesión, permisos declarativos y autorización de datos.
- **US4 (P2)**: depende de US1; no depende de US3.

### Parallel Opportunities

- T002–T004 pueden ejecutarse en paralelo.
- T007, T010, T013 y T014 pueden ejecutarse en paralelo luego de definir los tipos base.
- T015–T016 pueden ejecutarse en paralelo.
- T022–T024 pueden ejecutarse en paralelo.
- T030–T032 pueden ejecutarse en paralelo.
- T038–T039 pueden ejecutarse en paralelo.
- T044–T046 pueden ejecutarse en paralelo.
- T050–T051 pueden ejecutarse en paralelo después de T016, T018 y T048.
- T052 depende de T047 y debe ejecutarse antes de considerar completada la validación de calidad.
- T053 depende de T026 y de los contratos aprobados antes de iniciar US2.
- T054 depende de T016 y T018.
- T055 depende de T015, T023 y T024.

## Parallel Example: User Story 2

```text
Task T022: pruebas de contrato 401/403 en tests/security/authorization.security.spec.ts
Task T023: pruebas cross-tenant en tests/security/tenant-isolation.security.spec.ts
Task T024: pruebas de escalamiento en tests/security/privilege-escalation.security.spec.ts
```

## Implementation Strategy

### MVP First (US1 + Foundational)

1. Completar Setup y Foundational.
2. Completar US1: login/logout, token validado, contexto tenant y renovación.
3. Validar login y logout independientemente.
4. Continuar con US2 antes de exponer operaciones de negocio en entornos compartidos.

### Incremental Delivery

1. Foundation + US1: sesión autenticada.
2. US2: backend protegido y aislamiento.
3. US3: permisos declarativos visibles y cartera.
4. US4: demo controlado y recuperación de sesión.
5. Polish: quickstart, observabilidad y quality gates.

### Definition of Done

- Cada tarea está asociada a un archivo concreto y a una historia cuando corresponde.
- Ninguna condición de autorización compara nombres de roles.
- Los endpoints de negocio rechazan contexto inválido o permiso ausente.
- Las pruebas cubren aislamiento cross-tenant, `own/all`, escalamiento y demo.
- Typecheck, lint, formato y suite de pruebas pasan.
- La cobertura de líneas, funciones, declaraciones y ramas en lógica de negocio y servicios es igual o superior a 80%, verificada por el comando de cobertura y CI.
- Las operaciones de configuración de tenant y alcance global están cubiertas por pruebas de autorización administrativa.
- Los casos borde de sesiones multi-pestaña, tenants inválidos, múltiples roles y carteras vacías están cubiertos por pruebas observables.
