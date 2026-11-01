---
description: "Task list for gestión de clientes y contadores del estudio"
---

# Tasks: Gestión de clientes y contadores del estudio

**Input**: Design documents from `/specs/005-keycloak-people-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Technology constraint**: Las listas de clientes y contadores DEBEN utilizar TanStack Table. La dependencia y su versión deben quedar registradas en `package.json`/lockfile antes de implementar las tablas.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar la dependencia de tablas y contratos compartidos.

- [x] T001 [P] Agregar `@tanstack/table-core` en `package.json` y actualizar el lockfile para construir las dos tablas sin duplicar lógica.
- [x] T002 [P] Definir los tipos `AdministrableIdentity`, `PeopleType` y payloads CRUD en `packages/contracts/people.ts`, respetando `type` exacto `client | user`, campos requeridos y `id`/`username` inmutables.
- [x] T003 Documentar en `specs/005-keycloak-people-management/plan.md` la dependencia TanStack Table y la decisión de una vista parametrizada por tipo.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Crear la frontera autenticada y las reglas comunes de autorización, tenant y Keycloak.

- [x] T004 [P] Implementar `apps/profile-service/src/people/keycloak-admin.adapter.ts` para listar, crear, actualizar y eliminar usuarios Keycloak preservando atributos existentes y sin administrar contraseñas.
- [x] T005 [P] Implementar validadores en `apps/profile-service/src/people/people.validation.ts` para nombre, apellido, alias, email y valores exactos `client | user`.
- [x] T006 Implementar `apps/profile-service/src/people/people.service.ts` con resolución de tenant desde `authorization.client_id`, filtro obligatorio por `type` y `client_id`, y aislamiento antes de cada operación.
- [x] T007 Implementar `apps/profile-service/src/people/people.authorization.ts` para exigir ruta de pantalla, acciones CRUD por tipo y simultáneamente `edit` + `update` al guardar ediciones.
- [x] T008 Implementar `apps/profile-service/src/people/people.controller.ts` con los contratos `GET`, `POST`, `PATCH` y `DELETE` de `contracts/people-management.md`, incluyendo estados `401`, `400`, `403`, `404`, `409` y `502`.
- [x] T009 Integrar las rutas `/api/v1/people` en `apps/profile-service/src/main.ts`, manteniendo CORS, autenticación existente y respuestas RFC 7807.
- [x] T010 [P] Agregar logging estructurado de altas, modificaciones y bajas con `traceId`, `tenant_id`, `userId`, identidad afectada, tipo y resultado en `apps/profile-service/src/people/`.
- [x] T011 [P] Crear pruebas unitarias de autorización y validación en `apps/profile-service/src/people/people.authorization.test.ts` y `apps/profile-service/src/people/people.validation.test.ts`.

**Checkpoint**: Los contratos backend validan tenant, tipo, ruta y acciones sin depender de controles del frontend.

---

## Phase 3: User Story 1 - Listar clientes del estudio (Priority: P1) 🎯 MVP

**Goal**: Mostrar una tabla TanStack Table con identidades `type=client`, protegida por `/home/client/list`.

**Independent Test**: Con un token que incluya `/home/client/list`, se visualiza la opción y una tabla con solo clientes; sin la ruta, la opción y el acceso directo se deniegan.

### Tests for User Story 1

- [ ] T012 [P] [US1] Crear prueba contractual de `GET /api/v1/people?type=client` en `apps/profile-service/src/people/people.contract.test.ts`, incluyendo `401`, `403`, `502` y ausencia de identidades de tipo `user`.
- [ ] T013 [P] [US1] Crear prueba de seguridad de visibilidad y navegación de clientes en `tests/security/people-management.security.spec.ts`, incluyendo ruta ausente y coincidencia parcial.
- [ ] T014 [P] [US1] Crear pruebas de configuración de columnas y estados vacío/carga/error de clientes en `apps/frontend/src/features/people/people-view.test.ts`.

### Implementation for User Story 1

- [x] T015 [P] [US1] Agregar el ítem `Clientes del estudio` en `apps/frontend/src/components/side-menu.ts`, visible solo con `/home/client/list` y protegido contra navegación directa.
- [x] T016 [US1] Implementar `apps/frontend/src/features/people/people-view.ts` como vista reutilizable que configure TanStack Table con columnas nombre, apellido, alias, email y estado, filtrando `type=client`.
- [x] T017 [US1] Implementar `apps/frontend/src/features/people/people-api.ts` para consumir el listado de clientes usando el token OIDC existente y mapear errores en español.
- [x] T018 [US1] Integrar la ruta `/home/client/list` en `apps/frontend/src/main.ts` y actualizar únicamente `#page-content` mediante la navegación SPA existente.
- [x] T019 [US1] Agregar estilos responsive de la tabla de clientes en `apps/frontend/src/styles.css`, incluyendo estados vacío, carga, error y foco accesible.

**Checkpoint**: La pantalla de clientes lista exclusivamente `type=client` y no es accesible sin `/home/client/list`.

---

## Phase 4: User Story 2 - Administrar clientes del estudio (Priority: P1)

**Goal**: Completar alta, edición y baja de clientes usando acciones separadas.

**Independent Test**: Un usuario con `/client/add`, `/client/edit`, `/client/update` y `/client/delete` puede completar el CRUD; al retirar una acción solo esa operación queda oculta o deshabilitada.

### Tests for User Story 2

- [ ] T020 [P] [US2] Crear pruebas contractuales de `POST`, `PATCH` y `DELETE` para `type=client` en `apps/profile-service/src/people/people.contract.test.ts`, incluyendo acciones ausentes, conflictos y validación.
- [ ] T021 [P] [US2] Crear pruebas de seguridad de separación de tipo y aislamiento tenant en `tests/security/people-management.security.spec.ts`.
- [ ] T022 [P] [US2] Crear pruebas de formulario y visibilidad de acciones CRUD de clientes en `apps/frontend/src/features/people/people-form.test.ts`.

### Implementation for User Story 2

- [x] T023 [US2] Implementar `apps/frontend/src/features/people/people-form.ts` para alta/edición de clientes, validación en español, permisos `client/add`, `client/edit` y `client/update`, sin campos de contraseña; con `/client/edit` abrir el modal y, cuando falte `/client/update`, mostrar campos y botón de actualización grisados, visibles y de solo lectura/deshabilitados.
- [x] T024 [US2] Integrar el botón de alta y acciones de edición en `apps/frontend/src/features/people/people-view.ts`, usando la tabla TanStack Table sin duplicar columnas ni reglas de filtrado.
- [x] T025 [US2] Integrar eliminación con confirmación explícita y permiso `/client/delete`, mostrando errores de invariantes sin retirar el listado.
- [x] T026 [US2] Actualizar la tabla después de alta, edición o baja sin reconstruir el encabezado ni el menú lateral.

**Checkpoint**: El CRUD de clientes funciona de manera independiente y cada operación respeta su acción específica.

---

## Phase 5: User Story 3 - Listar y administrar contadores del estudio (Priority: P1)

**Goal**: Reutilizar la vista y formulario para identidades `type=user`, protegidos por `/home/users/list` y acciones `/user/*`.

**Independent Test**: Con `/home/users/list` y las acciones correspondientes, se lista y administra únicamente contadores; sin la ruta, el acceso se deniega.

### Tests for User Story 3

- [ ] T027 [P] [US3] Crear prueba contractual de listado y CRUD de `type=user` en `apps/profile-service/src/people/people.contract.test.ts`, incluyendo rechazo de `type=client`.
- [ ] T028 [P] [US3] Crear prueba de seguridad para `/home/users/list` y acciones `/user/add`, `/user/edit`, `/user/update`, `/user/delete` en `tests/security/people-management.security.spec.ts`.
- [ ] T029 [P] [US3] Crear prueba de integración del flujo de contadores en `tests/integration/people-management.integration.spec.ts`.

### Implementation for User Story 3

- [x] T030 [US3] Agregar el ítem `Contadores del estudio` en `apps/frontend/src/components/side-menu.ts`, visible solo con `/home/users/list`.
- [x] T031 [US3] Integrar la ruta `/home/users/list` en `apps/frontend/src/main.ts`, pasando `type=user` a la vista TanStack Table reutilizable.
- [x] T032 [US3] Adaptar `people-view.ts` y `people-form.ts` para usar acciones `/user/*`, textos `Contadores del estudio` y filtro exacto `type=user` sin duplicar la implementación; con `/user/edit` abrir el modal y, cuando falte `/user/update`, mostrar campos y botón de actualización grisados, visibles y de solo lectura/deshabilitados.
- [ ] T033 [US3] Aplicar las invariantes de no autoeliminación y no eliminación del último administrador activo en el servicio y mostrar mensajes en español.

**Checkpoint**: Ambas pantallas CRUD operan de forma independiente y no cruzan identidades entre clientes y contadores.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar calidad, accesibilidad, rendimiento y escenarios completos.

- [x] T034 [P] Agregar estados accesibles de tabla, formulario, confirmación, error y vacío en `apps/frontend/src/features/people/`.
- [x] T035 [P] Revisar responsive y navegación por teclado de ambas tablas TanStack Table en `apps/frontend/src/styles.css` y componentes de people.
- [x] T036 [P] Añadir la guía de permisos de prueba y los atributos `type` y `client_id` a `infra/keycloak/README.md` y `.env.example` si corresponde.
- [ ] T037 Ejecutar los escenarios de `specs/005-keycloak-people-management/quickstart.md` con Keycloak, PostgreSQL, profile-service y frontend levantados.
- [x] T038 Ejecutar `npm run typecheck`, `npm run lint`, `npm run format`, `npm test` y `npm run test:coverage:business`, corrigiendo regresiones y verificando cobertura mínima del 80%.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup**: No dependencies; T001–T003 pueden ejecutarse en paralelo salvo T003 después de decidir la dependencia instalada.
- **Foundational**: Depende de Setup y bloquea todas las historias.
- **US1**: Depende de Foundational y constituye el MVP.
- **US2**: Depende de US1 porque reutiliza la tabla y la navegación de clientes.
- **US3**: Depende de Foundational; puede comenzar en paralelo con US1/US2 si se estabilizan primero los componentes compartidos.
- **Polish**: Depende de las tres historias.

### Parallel Opportunities

- T004, T005, T010 y T011 pueden ejecutarse en paralelo después de T002.
- T012, T013 y T014 pueden ejecutarse en paralelo.
- T020, T021 y T022 pueden ejecutarse en paralelo.
- T027, T028 y T029 pueden ejecutarse en paralelo.
- T034–T036 pueden ejecutarse en paralelo después de completar las historias.

## Implementation Strategy

### MVP First

1. Completar Setup y Foundational.
2. Implementar US1: menú, endpoint de listado y TanStack Table de clientes.
3. Validar US1 con un token con y sin `/home/client/list`.
4. Continuar con CRUD de clientes y luego contadores.

### Incremental Delivery

1. Entregar listado de clientes autorizado.
2. Entregar CRUD de clientes con acciones separadas.
3. Reutilizar el mismo componente para contadores.
4. Ejecutar quickstart, cobertura y validación responsive.
