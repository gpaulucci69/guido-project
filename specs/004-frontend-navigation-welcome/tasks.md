---
description: "Task list for frontend navigation and welcome screen"
---

# Tasks: Navegación principal y bienvenida del frontend

**Input**: Design documents from `/specs/004-frontend-navigation-welcome/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/client-context.md, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar contratos, configuración y puntos de integración compartidos.

- [x] T001 [P] Definir los tipos `ClientContext` y `NavigationState` en `packages/contracts/navigation.ts` según `data-model.md` y `contracts/client-context.md`.
- [x] T002 [P] Documentar `VITE_PROFILE_API_URL` y las variables de resolución del cliente Keycloak en `.env.example`.
- [x] T003 [P] Documentar el nombre `name` del cliente Keycloak y el uso de `authorization.client_id` en `infra/keycloak/README.md`.
- [x] T004 Preparar el punto de entrada de contexto de cliente en `apps/profile-service/src/client-context/client-context.service.ts` y `apps/profile-service/src/client-context/client-context.controller.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Asegurar que la navegación reutilice la identidad y autorización existentes.

**⚠️ CRITICAL**: Ninguna historia debe implementarse antes de completar esta fase.

- [x] T005 [P] Implementar la función de normalización de rutas exactas en `apps/frontend/src/auth/permission-evaluator.ts`, aceptando `/home/client/services` y `home/client/services` como el mismo valor.
- [x] T006 [P] Crear pruebas de normalización y coincidencia exacta de rutas en `apps/frontend/src/auth/permission-evaluator.test.ts`, incluyendo ausencia de `authorization.routes` y coincidencias parciales.
- [x] T007 Implementar la resolución autenticada del nombre del cliente Keycloak mediante `GET /api/v1/client-context` en `apps/profile-service/src/client-context/client-context.service.ts`, sin aceptar `client_id` desde el navegador.
- [x] T008 Implementar la respuesta HTTP y los errores `200`, `401`, `403` y `502` en `apps/profile-service/src/client-context/client-context.controller.ts` y registrar fallos sin tokens.
- [ ] T009 [P] Crear prueba contractual del contexto de cliente en `apps/profile-service/src/client-context/client-context.contract.test.ts`.

**Checkpoint**: La autorización de rutas y el contexto descriptivo del cliente están disponibles sin crear una segunda sesión.

---

## Phase 3: User Story 1 - Encabezado alineado y cliente visible (Priority: P1) 🎯 MVP

**Goal**: Mostrar el nombre del cliente Keycloak a la izquierda y conservar los controles de cuenta a la derecha.

**Independent Test**: Con una sesión válida, verificar el nombre del cliente en el extremo izquierdo y alias, notificaciones y avatar agrupados a la derecha.

### Tests for User Story 1

- [x] T010 [P] [US1] Crear pruebas de normalización del contexto y fallback del nombre del cliente en `apps/frontend/src/auth/client-context.test.ts`.
- [ ] T011 [P] [US1] Crear pruebas de requisitos de alineación del encabezado en `apps/frontend/src/components/app-header.test.ts`.

### Implementation for User Story 1

- [x] T012 [P] [US1] Implementar el cliente frontend de contexto en `apps/frontend/src/auth/client-context.ts`, usando el token OIDC existente.
- [ ] T013 [US1] Actualizar `apps/frontend/src/components/app-header.ts` para recibir y mostrar el nombre del cliente Keycloak a la izquierda sin alterar el menú de cuenta.
- [x] T014 [US1] Ajustar `apps/frontend/src/main.ts` y `apps/frontend/src/styles.css` para separar visualmente el contexto de cliente a la izquierda y los controles de cuenta a la derecha.

**Checkpoint**: El encabezado alineado funciona independientemente de las pantallas de bienvenida y obligaciones.

---

## Phase 4: User Story 2 - Pantalla de bienvenida (Priority: P1)

**Goal**: Presentar una pantalla inicial común con el nombre y apellido de la identidad autenticada.

**Independent Test**: Iniciar sesión con usuario y cliente autenticados y verificar `Bienvenido <nombre y apellido>` junto con el acceso `Inicio`.

### Tests for User Story 2

- [x] T015 [P] [US2] Crear pruebas del nombre de bienvenida con nombre, apellido faltante y ambos faltantes en `apps/frontend/src/features/welcome/welcome-view.test.ts`.
- [ ] T016 [P] [US2] Crear prueba de navegación inicial a `/home/welcome` en `tests/integration/navigation.integration.spec.ts`.

### Implementation for User Story 2

- [x] T017 [P] [US2] Implementar la vista de bienvenida en `apps/frontend/src/features/welcome/welcome-view.ts` con textos en español y fallback seguro.
- [x] T018 [US2] Implementar el layout de navegación en `apps/frontend/src/components/navigation-layout.ts`, mostrando `Inicio` para cualquier identidad autenticada.
- [x] T019 [US2] Integrar `/home/welcome` como ruta inicial en `apps/frontend/src/main.ts` sin consultar permisos adicionales.

**Checkpoint**: Todo usuario autenticado puede acceder a una bienvenida funcional aunque no tenga acceso a obligaciones.

---

## Phase 5: User Story 3 - Menú lateral y estado de cuenta autorizado (Priority: P1)

**Goal**: Mostrar el menú lateral colapsable y reutilizar obligaciones solo cuando exista `/home/client/services`.

**Independent Test**: Comparar tokens con y sin `/home/client/services`, verificando visibilidad del ítem y protección de navegación directa.

### Tests for User Story 3

- [ ] T020 [P] [US3] Crear pruebas del menú expandido, colapsado y accesible en `apps/frontend/src/components/side-menu.test.ts`.
- [ ] T021 [P] [US3] Crear pruebas de visibilidad exacta de `Estado de cuenta` para tokens con y sin `/home/client/services` en `tests/security/navigation.security.spec.ts`.
- [ ] T022 [P] [US3] Crear prueba de contrato de navegación directa denegada hacia `/home/client/services` sin permiso en `tests/integration/navigation.integration.spec.ts`.

### Implementation for User Story 3

- [x] T023 [US3] Implementar el menú lateral colapsable en `apps/frontend/src/components/side-menu.ts`, con `Inicio`, `Estado de cuenta`, foco, teclado y etiquetas accesibles.
- [x] T024 [US3] Integrar la visibilidad de `Estado de cuenta` mediante la ruta exacta `/home/client/services` en `apps/frontend/src/components/navigation-layout.ts`.
- [ ] T025 [US3] Reutilizar la vista actual de obligaciones como destino de `Estado de cuenta` en `apps/frontend/src/features/obligations/obligation-view.ts` sin duplicar listado ni autorización.
- [x] T026 [US3] Implementar la guarda de navegación directa y retorno a `/home/welcome` con mensaje en español en `apps/frontend/src/main.ts`.
- [ ] T027 [US3] Manejar estados vacío, error y carga de obligaciones sin bloquear la bienvenida en `apps/frontend/src/features/obligations/obligation-view.ts`.

**Checkpoint**: La navegación protegida está disponible para usuarios autorizados y ausente para el resto.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar calidad, accesibilidad, responsive y escenarios completos.

- [x] T028 [P] Revisar responsive del encabezado y menú lateral en `apps/frontend/src/styles.css` para pantallas estrechas.
- [x] T029 [P] Verificar que todos los textos, errores, estados vacíos y mensajes de acceso denegado estén en español en `apps/frontend/src/`.
- [x] T030 [P] Agregar logging estructurado del contexto de cliente con `traceId`, `tenant_id` y `userId` en `apps/profile-service/src/client-context/`.
- [ ] T031 [P] Ejecutar cobertura de lógica de navegación y contexto hasta superar el 80% en `vitest.config.ts`.
- [ ] T032 Ejecutar todos los escenarios de `specs/004-frontend-navigation-welcome/quickstart.md` con Keycloak, frontend, profile-service y obligaciones levantados.
- [x] T033 Ejecutar `npm run typecheck`, `npm run lint`, `npm run format` y `npm test`, corrigiendo regresiones.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) no tiene dependencias.
- Foundational (Phase 2) depende de Setup y bloquea todas las historias.
- US1 depende de Foundational.
- US2 depende de Foundational y puede desarrollarse en paralelo con US1 después de T009.
- US3 depende de Foundational y reutiliza el layout de US2; se implementa después de T018 o coordinando integración.
- Polish depende de las tres historias implementadas.

### Parallel Opportunities

- T001–T003 pueden ejecutarse en paralelo.
- T005, T006 y T009 pueden ejecutarse en paralelo después de T004.
- T010 y T011 pueden ejecutarse en paralelo.
- T015 y T016 pueden ejecutarse en paralelo.
- T020–T022 pueden ejecutarse en paralelo.
- T028–T031 pueden ejecutarse en paralelo después de las historias.

## Implementation Strategy

### MVP First

1. Completar Setup y Foundational.
2. Completar US1 para alinear el encabezado y mostrar el cliente Keycloak.
3. Completar US2 para disponer de la bienvenida y `Inicio`.
4. Validar ambos flujos antes de agregar `Estado de cuenta`.

### Incremental Delivery

1. Entregar encabezado con contexto de cliente.
2. Entregar bienvenida común.
3. Entregar menú lateral y ruta protegida de obligaciones.
4. Ejecutar polish, accesibilidad y quickstart completo.
