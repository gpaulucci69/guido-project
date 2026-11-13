# Tasks: Gestión de clientes por tipo

**Input**: Design documents from `/specs/010-gestion-clientes-estudio/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md)

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 [P] Definir `ClientType`, `ClientStatus`, `ClientSummary`, `ClientCreate` y `ClientUpdate` en `packages/contracts/clients.ts`, usando exactamente `INDIVIDUAL | LEGAL_ENTITY` y `ACTIVE | INACTIVE`.
- [X] T002 [P] Crear la estructura de módulos bajo `apps/accounting-client-service/src/clients/` para validación, autorización, servicio, repositorio y controlador.
- [ ] T003 [P] Crear archivos base de pruebas en `tests/contract/clients-management.contract.spec.ts`, `tests/integration/clients-management.integration.spec.ts`, `tests/security/clients-management.security.spec.ts` y `tests/e2e/clients-management.e2e.spec.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T004 Actualizar `packages/database/prisma/schema.prisma` para extender `AccountingClient` con `type`, `firstName`, `lastName`, `legalName`, `tradeName`, `taxAddress`, `legalRepresentativeName` y `legalRepresentativeTaxId`, manteniendo relaciones existentes y campos opcionales según `data-model.md`.
- [X] T005 Crear la migración Prisma en `infra/migrations/prisma/` con transición segura desde `businessName`/`cuit`, valores por defecto compatibles y unicidad compuesta `(tenantId, cuit)`.
- [X] T006 [P] Implementar validación en `apps/accounting-client-service/src/clients/client.validation.ts`: CUIT argentino normalizado y válido, textos, email, tipo, campos condicionales y campos opuestos vacíos.
- [X] T007 [P] Implementar autorización en `apps/accounting-client-service/src/clients/client.authorization.ts` para separar consulta, alta, edición y cambio de estado.
- [X] T008 [P] Implementar auditoría en `apps/accounting-client-service/src/clients/client.audit.ts` para `CREATE`, `UPDATE`, `DEACTIVATE`, `ACTIVATE` y `UPDATE_REJECTED`, incluyendo tenant, usuario, entidad y cambios sin secretos.
- [ ] T009 Implementar `apps/accounting-client-service/src/clients/client.repository.ts` con todas las consultas y mutaciones restringidas por `tenantId`, listado opcional por tipo, búsqueda por id y unicidad de CUIT.
- [ ] T010 Actualizar `apps/accounting-client-service/src/main.ts` para enrutar `/api/v1/clients`, mantener RFC 7807 y derivar tenant/usuario exclusivamente de `authenticateHeaders`.
- [X] T011 [P] Documentar contratos en `specs/010-gestion-clientes-estudio/contracts/clients.md` y escenarios ejecutables en `specs/010-gestion-clientes-estudio/quickstart.md`.

---

## Phase 3: User Story 1 - Registrar una persona física (Priority: P1) 🎯 MVP

**Goal**: Crear y editar clientes `INDIVIDUAL` con nombre, apellido y CUIT válidos, sin exigir datos opcionales.

**Independent Test**: Crear una persona física válida, consultarla, editar un dato opcional y comprobar que conserva tipo y CUIT; repetir con campos faltantes, CUIT inválido y CUIT duplicado.

### Tests for User Story 1

- [ ] T012 [P] [US1] Agregar pruebas de validación en `apps/accounting-client-service/src/clients/client.validation.test.ts` para nombre/apellido obligatorios, CUIT válido e inválido y campos de persona moral no permitidos.
- [ ] T013 [P] [US1] Agregar pruebas de contrato para POST y PATCH de `INDIVIDUAL` en `tests/contract/clients-management.contract.spec.ts`, cubriendo 201, 400 y 409.
- [ ] T014 [P] [US1] Agregar prueba de integración de alta y edición en `tests/integration/clients-management.integration.spec.ts`, verificando persistencia en tenant correcto y auditoría.

### Implementation for User Story 1

- [ ] T015 [US1] Implementar `createIndividual` y `updateIndividual` en `apps/accounting-client-service/src/clients/client.service.ts`, aplicando tipo inmutable, validación condicional y normalización de CUIT.
- [ ] T016 [US1] Implementar POST y PATCH para `INDIVIDUAL` en `apps/accounting-client-service/src/clients/client.controller.ts`, traduciendo validación, conflicto, autorización y aislamiento a errores en español.
- [ ] T017 [US1] Implementar formulario condicional en `apps/frontend/src/features/clients/client-form.ts`, mostrando obligatorios nombre, apellido y CUIT y ocultando campos de persona moral.
- [ ] T018 [US1] Implementar cliente HTTP y vista inicial en `apps/frontend/src/features/clients/clients-api.ts` y `apps/frontend/src/features/clients/clients-view.ts`, con feedback y mensajes en español.

---

## Phase 4: User Story 2 - Registrar una persona moral (Priority: P1)

**Goal**: Crear y editar clientes `LEGAL_ENTITY` con razón social y CUIT, permitiendo completar posteriormente nombre comercial y representante legal.

**Independent Test**: Crear una persona moral válida, consultarla y completar un dato opcional; comprobar que no se exigen atributos de persona física y que el tipo no cambia.

### Tests for User Story 2

- [ ] T019 [P] [US2] Ampliar `apps/accounting-client-service/src/clients/client.validation.test.ts` con razón social obligatoria, atributos opcionales legales y rechazo de identidad de persona física.
- [ ] T020 [P] [US2] Agregar casos de contrato para `LEGAL_ENTITY` en `tests/contract/clients-management.contract.spec.ts`, cubriendo alta, representante legal y rechazo de modificar `type` o `cuit`.
- [ ] T021 [P] [US2] Agregar prueba de integración en `tests/integration/clients-management.integration.spec.ts`, verificando campos específicos y auditoría por campo.

### Implementation for User Story 2

- [ ] T022 [US2] Implementar `createLegalEntity` y `updateLegalEntity` en `apps/accounting-client-service/src/clients/client.service.ts`, exigiendo `legalName` y dejando atributos adicionales opcionales.
- [ ] T023 [US2] Completar `apps/accounting-client-service/src/clients/client.controller.ts` para serializar persona moral sin campos de persona física y rechazar cambio de `type`.
- [ ] T024 [US2] Completar `apps/frontend/src/features/clients/client-form.ts` para persona moral, mostrando razón social, nombre comercial y representante legal solo para `LEGAL_ENTITY`.
- [ ] T025 [US2] Completar `apps/frontend/src/features/clients/clients-view.ts` con presentación diferenciada de persona moral, estado, razón social y CUIT.

---

## Phase 5: User Story 3 - Consultar y distinguir clientes (Priority: P2)

**Goal**: Listar, distinguir y filtrar ambos tipos, con control de acceso y estados visibles.

**Independent Test**: Con clientes de ambos tipos, listar sin filtro, filtrar cada tipo y comprobar que un usuario sin permiso no puede consultar o mutar información.

### Tests for User Story 3

- [ ] T026 [P] [US3] Agregar pruebas de listado y filtro en `tests/contract/clients-management.contract.spec.ts`, verificando exclusión de campos del tipo opuesto.
- [ ] T027 [P] [US3] Agregar pruebas de aislamiento y autorización en `tests/security/clients-management.security.spec.ts` para tenant incorrecto, rol sin permiso y cliente ajeno.
- [ ] T028 [P] [US3] Agregar escenario E2E en `tests/e2e/clients-management.e2e.spec.ts` para crear ambos tipos, filtrar, cambiar estado y validar mensajes en español.

### Implementation for User Story 3

- [ ] T029 [US3] Implementar listado y filtro por tipo en `apps/accounting-client-service/src/clients/client.service.ts` y `client.repository.ts`, ordenando por nombre visible y limitando campos contractuales.
- [ ] T030 [US3] Implementar `PATCH /api/v1/clients/{id}/status` en `apps/accounting-client-service/src/clients/client.controller.ts`, sin borrado físico y con auditoría.
- [ ] T031 [US3] Completar `apps/frontend/src/features/clients/clients-view.ts` con filtro, estados vacío/carga/error, acciones por permisos y confirmación de inactivación.
- [ ] T032 [US3] Integrar navegación en `apps/frontend/src/components/side-menu.ts` y `apps/frontend/src/components/navigation-layout.ts`, conservando permisos y textos en español.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T033 [P] Actualizar consumidores de `AccountingClient` en `apps/billing-workflow-service/` para usar nombre visible por tipo sin romper obligaciones, pagos, créditos ni reportes.
- [ ] T034 [P] Añadir regresiones de relaciones existentes en `tests/integration/clients-management.integration.spec.ts`, verificando obligaciones y aislamiento.
- [ ] T035 [P] Revisar `apps/frontend/src/styles.css` para accesibilidad de etiquetas, foco, errores y formato argentino de fechas.
- [ ] T036 Ejecutar typecheck, lint, formato, cobertura y escenarios de `specs/010-gestion-clientes-estudio/quickstart.md`; corregir regresiones.
- [ ] T037 Revisar `specs/010-gestion-clientes-estudio/checklists/clients-quality.md` y registrar requisitos pendientes antes de ampliar alcance.
- [ ] T038 [P] Medir en `tests/e2e/clients-management.e2e.spec.ts` que el alta válida de cada tipo pueda completarse en menos de 3 minutos bajo condiciones documentadas, cubriendo SC-001.
- [ ] T039 [P] Añadir en `tests/e2e/clients-management.e2e.spec.ts` una medición con al menos 100 clientes precargados y una muestra de usuarios que valide que al menos el 95% filtra cada tipo en menos de 10 segundos, cubriendo SC-004.
- [ ] T040 [P] Añadir en `tests/e2e/clients-management.e2e.spec.ts` una medición de primer intento para el alta de ambos tipos que valide una tasa mínima del 95% de finalización correcta, cubriendo SC-006.
- [ ] T041 Documentar en `specs/010-gestion-clientes-estudio/quickstart.md` el protocolo de medición, tamaño de muestra, datos precargados y criterio de aprobación para SC-001, SC-004 y SC-006.
- [ ] T042 [P] Agregar validación y pruebas de dependencia entre representante legal y CUIT en `apps/accounting-client-service/src/clients/client.validation.ts` y `client.validation.test.ts`.
- [ ] T043 [P] Documentar y probar la matriz de permisos por rol y operación en `tests/security/clients-management.security.spec.ts`.
- [ ] T044 [P] Implementar auditoría de `UPDATE_REJECTED` en `apps/accounting-client-service/src/clients/client.audit.ts` para permisos, tenant, cliente inexistente, CUIT duplicado y tipo inmutable.
- [ ] T045 Implementar control de concurrencia mediante `updatedAt` en `apps/accounting-client-service/src/clients/client.service.ts` y cubrir cliente inactivado o modificado durante edición en `tests/integration/clients-management.integration.spec.ts`.
- [ ] T046 [P] Cubrir estados de carga, lista vacía, error recuperable, validación inline y navegación por teclado en `apps/frontend/src/features/clients/clients-view.ts`, `client-form.ts` y `tests/e2e/clients-management.e2e.spec.ts`.
- [ ] T047 Implementar motivo y relación auditada entre cliente original y nuevo cliente en correcciones de tipo en `apps/accounting-client-service/src/clients/client.service.ts` y `client.audit.ts`.

---

## Dependencies & Execution Order

- **Setup**: T001–T003 no tienen dependencias entre sí.
- **Foundational**: T004–T010 bloquean todas las historias; T011 puede documentarse en paralelo después de definir contratos.
- **US1 (MVP)**: Depende de Foundational y no depende de otra historia.
- **US2**: Depende de Foundational; comparte servicio y formulario con US1.
- **US3**: Depende de registros de ambos tipos, por lo que sigue a US1 y US2 para validación completa.
- **Polish**: Depende de las historias seleccionadas para entrega.

### Parallel Opportunities

- T001–T003 pueden ejecutarse en paralelo.
- T006–T008 pueden ejecutarse en paralelo tras T002.
- T012–T014, T019–T021 y T026–T028 pueden ejecutarse en paralelo dentro de cada historia.
- T033–T035 pueden ejecutarse en paralelo durante Polish.

## Implementation Strategy

1. Completar Setup y Foundational.
2. Implementar US1 y validarla como MVP independiente.
3. Añadir US2 y comprobar que no rompe US1.
4. Añadir US3 para listado, filtro, permisos y estados.
5. Ejecutar Polish, regresiones y quickstart completo.

Todas las tareas siguen el formato requerido: checkbox, identificador secuencial, marcador `[P]` solo cuando aplica, etiqueta `[US#]` en fases de historia y ruta de archivo explícita.
