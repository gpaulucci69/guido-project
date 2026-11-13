# Tasks: Encabezado y validación de sesión

**Input**: Design documents from `/specs/009-encabezado-sesion/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/session.md, quickstart.md
**Tests**: Incluidos porque la especificación exige validar renovación, expiración, concurrencia, autorización y flujos observables.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Inventariar puntos de entrada autenticados y refrescos en `apps/frontend/src/main.ts` y `apps/frontend/src/lib/api/client.ts`, documentando el mapa en `specs/009-encabezado-sesion/quickstart.md`.
- [ ] T002 [P] Revisar contratos OIDC del realm `saas-contable` y cliente `guido` contra `cicd/keycloak/import_setup/realm-export.json`, registrando diferencias en `specs/009-encabezado-sesion/research.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T003 [P] Extender `apps/frontend/src/lib/auth/token-manager.ts` para expiración, margen preventivo de 30 segundos y sustitución del conjunto de tokens de Keycloak.
- [X] T004 Implementar deduplicación de renovaciones concurrentes en `apps/frontend/src/lib/auth/token-manager.ts`, con un único intento compartido y limpieza ante fallo (depende de T003).
- [X] T005 [P] Adaptar `apps/frontend/src/auth/oidc-client.ts` para renovación silenciosa, eliminación de usuario y errores normalizados sin sobrescribir el mensaje visible requerido.
- [ ] T006 Integrar `apps/frontend/src/auth/session.ts` con el gestor de tokens para reconstruir identidad y permisos desde el token renovado, preservando `authorization.client_id`, `routes` y `actions`.
- [X] T007 Integrar `apps/frontend/src/lib/api/client.ts` con el gestor de sesión para obtener un access token válido antes de cada request y no enviar requests cuando la renovación falla (depende de T003–T006).
- [X] T008 [P] Crear pruebas de margen, expiración, reemplazo de refresh token, fallo y concurrencia en `apps/frontend/src/lib/auth/token-manager.test.ts`.
- [ ] T009 [P] Ampliar pruebas de identidad y autorización renovada en `apps/frontend/src/auth/session.test.ts`, cubriendo tenant y permisos.

**Checkpoint**: El frontend dispone de una única fuente de verdad para tokens antes de cualquier historia visual.

---

## Phase 3: User Story 1 - Reordenar y compactar el encabezado (Priority: P1) 🎯 MVP

**Goal**: Encabezado más bajo con orden alias → notificaciones → avatar.
**Independent Test**: Abrir una pantalla autenticada y comprobar orden, altura, legibilidad y fallbacks.

### Tests for User Story 1

- [ ] T010 [P] [US1] Crear pruebas de estructura del encabezado en `apps/frontend/src/components/app-header.test.ts` para orden, alias vacío e imagen fallida.
- [ ] T011 [P] [US1] Añadir validación visual/responsive del encabezado en `apps/frontend/src/components/app-header.test.ts`, cubriendo reducción mínima del 20%, orden, ausencia de solapamiento y controles accesibles.

### Implementation for User Story 1

- [X] T012 [US1] Reordenar el markup de `apps/frontend/src/components/app-header.ts` para alias, notificaciones y avatar, conservando labels accesibles y menú.
- [X] T013 [US1] Reducir en al menos 20% la altura renderizada mediante `apps/frontend/src/styles.css`, manteniendo foco visible, fallback de iniciales y controles accesibles.
- [ ] T014 [US1] Ajustar `apps/frontend/src/components/navigation-layout.ts` y `apps/frontend/src/main.ts` para que todas las pantallas autenticadas usen el encabezado sin listeners duplicados.

**Checkpoint**: La historia visual funciona independientemente con una sesión autenticada.

---

## Phase 4: User Story 2 - Validar sesión antes de operar (Priority: P1)

**Goal**: Validar o renovar antes de cada acción y refresco usando Keycloak y margen de 30 segundos.
**Independent Test**: Ejecutar acciones y refrescos con token vigente, próximo a vencer, vencido y sesión no renovable.

### Tests for User Story 2

- [ ] T015 [P] [US2] Cubrir requests con token vigente, token con 30 segundos o menos, vencido y renovación exitosa en `apps/frontend/src/lib/api/client.test.ts`.
- [ ] T016 [P] [US2] Cubrir refresco de pantalla y navegación protegida en `apps/frontend/src/main.test.ts`, verificando validación previa y un único reintento.
- [ ] T017 [P] [US2] Añadir pruebas de integración del contrato `specs/009-encabezado-sesion/contracts/session.md` para rechazo de refresh token, límites SSO y cambios de claims.

### Implementation for User Story 2

- [ ] T018 [US2] Aplicar la precondición de sesión válida a llamadas autenticadas desde `apps/frontend/src/main.ts` y `apps/frontend/src/lib/api/client.ts`.
- [ ] T019 [US2] Implementar renovación preventiva con 30 segundos o menos y renovación inmediata al vencer, respetando `exp`/`expires_at` de Keycloak en `apps/frontend/src/lib/auth/token-manager.ts`.
- [ ] T020 [US2] Reintentar una sola vez la operación pendiente tras renovación exitosa y evitar reintentos infinitos en `apps/frontend/src/lib/api/client.ts` y `apps/frontend/src/main.ts`.
- [ ] T021 [US2] Recalcular identidad, permisos y tenant desde el token renovado en `apps/frontend/src/auth/session.ts`, sin conceder permisos nuevos.

**Checkpoint**: Acciones y refrescos autenticados respetan el contrato de sesión independientemente del encabezado.

---

## Phase 5: User Story 3 - Informar la expiración de sesión (Priority: P1)

**Goal**: Bloquear ante sesión no renovable, mostrar el mensaje exacto y llevar al usuario al login tras aceptar.
**Independent Test**: Forzar rechazo, comprobar modal bloqueante y verificar limpieza, login e historial.

### Tests for User Story 3

- [ ] T022 [P] [US3] Crear pruebas del diálogo en `apps/frontend/src/components/session-expired-modal.test.ts`, verificando texto exacto, bloqueo, único botón y accesibilidad.
- [ ] T023 [P] [US3] Añadir pruebas de salida, limpieza e historial en `apps/frontend/src/auth/session.test.ts` y `apps/frontend/src/main.test.ts`.
- [ ] T024 [P] [US3] Añadir prueba E2E del flujo token rechazado → modal → aceptar → login en la suite E2E del frontend.

### Implementation for User Story 3

- [X] T025 [US3] Crear `apps/frontend/src/components/session-expired-modal.ts` con modal bloqueante, texto exacto, un único botón “Aceptar”, nombre accesible, foco atrapado y activación por teclado.
- [X] T026 [US3] Integrar sesión expirada con `apps/frontend/src/main.ts` para impedir acciones/contenido protegido, mostrar un único modal y evitar redirecciones duplicadas.
- [X] T027 [US3] Implementar en `apps/frontend/src/auth/oidc-client.ts` y `apps/frontend/src/auth/session.ts` la limpieza del usuario OIDC antes de navegar a `/login` después de aceptar.
- [X] T028 [US3] Añadir estilos accesibles y responsive del modal en `apps/frontend/src/styles.css`, manteniendo textos en español.
- [X] T029 [US3] Ajustar el historial en `apps/frontend/src/main.ts` para impedir volver a pantallas protegidas sin autenticarse.

**Checkpoint**: La sesión no renovable termina en un flujo único, seguro y recuperable mediante login.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T030 [P] Actualizar `specs/009-encabezado-sesion/quickstart.md` con comandos y escenarios finales disponibles.
- [ ] T031 [P] Revisar `specs/009-encabezado-sesion/contracts/session.md` y `specs/009-encabezado-sesion/data-model.md` para consistencia con la implementación.
- [ ] T032 Ejecutar lint, type-check y pruebas del frontend y corregir regresiones en archivos afectados.
- [ ] T033 Ejecutar escenarios del quickstart y registrar resultados observables en la revisión de la feature.
- [ ] T034 Revisar que los cambios no alteren aislamiento multi-tenant ni autorización declarativa de `route`/`action`.

## Dependencies & Execution Order

- **Phase 1**: Sin dependencias.
- **Phase 2**: Depende de Phase 1 y bloquea todas las historias.
- **US1**: Depende de Phase 2; puede entregarse como MVP visual.
- **US2**: Depende de Phase 2; establece el flujo de sesión usado por US3.
- **US3**: Depende de los estados de renovación/fallo de Phase 2 y se integra con US2.
- **Phase 6**: Depende de las historias seleccionadas.

### Parallel Opportunities

- T001/T002; T003/T005/T008/T009; T010/T011; T015/T016/T017; T022/T023/T024; y T030/T031 pueden ejecutarse en paralelo cuando no modifiquen el mismo archivo simultáneamente. T004 comienza después de T003.

## Implementation Strategy

1. Completar Phase 1 y Phase 2.
2. Entregar US1 como MVP y validarlo de forma independiente.
3. Agregar US2 para proteger acciones y refrescos con renovación Keycloak.
4. Agregar US3 para completar expiración, modal y login.
5. Ejecutar Phase 6 y validar el quickstart completo.

**Formato**: Todas las tareas usan checkbox, ID secuencial, etiquetas `[P]`/`[USn]` cuando corresponden y una ruta concreta.
