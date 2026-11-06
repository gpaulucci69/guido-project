---
description: "Task list for activar e inactivar registros desde listados"
---

# Tasks: Activar e inactivar registros desde listados

**Input**: Design documents from `/specs/007-activar-inactivar-registros/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Technology constraint**: Reutilizar `PeopleUpdate.enabled` y `updatePerson`; no borrar físicamente, no crear endpoints nuevos ni agregar dependencias.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificar el contrato existente y la autorización disponible antes de retirar la acción destructiva de la interfaz.

- [X] T001 [P] Inspeccionar `apps/frontend/src/features/people/people-view.ts`, `apps/frontend/src/features/people/people-api.ts` y `packages/contracts/people.ts`, confirmando que `PeopleUpdate.enabled` permite ambas transiciones.
- [X] T002 [P] Revisar en `apps/profile-service/src/people/` la autorización y el servicio de actualización para confirmar que `client/update` y `user/update` permiten cambiar únicamente `enabled` con validación de tipo y tenant.
- [X] T003 [P] Ejecutar `npm run typecheck`, `npm run lint`, `npm run format` y `npm test` como línea base antes de modificar el flujo de listados.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Preparar una operación de cambio de estado común para clientes y contadores.

- [X] T004 Implementar o ajustar en `apps/frontend/src/features/people/people-api.ts` una operación explícita de cambio de estado que delegue en `updatePerson(id, type, { enabled })` y no invoque `DELETE`.
- [X] T005 Definir en `apps/frontend/src/features/people/people-view.ts` la derivación contextual `enabled=true → Inactivar` y `enabled=false → Activar`, junto con el texto de confirmación correspondiente.
- [X] T006 Si la revisión de T002 lo requiere, ajustar únicamente la autorización o validación de `apps/profile-service/src/people/` para permitir el cambio de `enabled` con el tenant y tipo correctos, sin debilitar las invariantes de seguridad.

**Checkpoint**: El contrato y la operación común permiten una transición reversible y no destructiva.

---

## Phase 3: User Story 1 - Inactivar registros activos (Priority: P1) 🎯 MVP

**Goal**: Reemplazar `Eliminar` por `Inactivar` para registros activos en clientes y contadores.

**Independent Test**: Un registro activo muestra `Inactivar`; al confirmar cambia a `Inactivo` y permanece visible con sus datos e identificador.

### Implementation for User Story 1

- [X] T007 [US1] Reemplazar en `apps/frontend/src/features/people/people-view.ts` el botón `Eliminar` por `Inactivar` para filas con `row.original.enabled === true`, sin mostrar simultáneamente `Activar`.
- [X] T008 [US1] Implementar en `apps/frontend/src/features/people/people-view.ts` la confirmación contextual de `Inactivar`, la actualización de `enabled` a `false` y el refresco mediante `options.onChanged` únicamente después de una respuesta exitosa.
- [X] T009 [US1] Mostrar en `apps/frontend/src/features/people/people-view.ts` el error de inactivación en español, sin retirar la fila ni presentar un estado no confirmado como exitoso.

**Checkpoint**: La inactivación confirmada conserva el registro y la cancelación no produce ningún cambio.

---

## Phase 4: User Story 2 - Activar registros inactivos (Priority: P1)

**Goal**: Mostrar `Activar` y revertir el estado de registros inactivos.

**Independent Test**: Un registro inactivo muestra `Activar`; al confirmar cambia a `Activo` y permanece visible con sus datos e identificador.

### Implementation for User Story 2

- [X] T010 [US2] Renderizar en `apps/frontend/src/features/people/people-view.ts` el botón `Activar` para filas con `row.original.enabled === false`, sin mostrar `Inactivar` en la misma fila.
- [X] T011 [US2] Implementar en `apps/frontend/src/features/people/people-view.ts` la confirmación contextual de `Activar`, la actualización de `enabled` a `true` y el refresco mediante `options.onChanged` tras éxito.
- [X] T012 [US2] Manejar en `apps/frontend/src/features/people/people-view.ts` la cancelación y los errores de activación en español, conservando el estado anterior cuando la operación no se confirma o falla.

**Checkpoint**: El ciclo Inactivo → Activo es reversible, confirmado y consistente con la acción mostrada.

---

## Phase 5: User Story 3 - Mantener autorización y separación de listados (Priority: P1)

**Goal**: Conservar permisos, aislamiento tenant y separación exacta entre clientes y contadores.

**Independent Test**: Usuarios sin permiso no pueden ejecutar el cambio; cada operación usa el tipo del listado y no afecta identidades de otro tipo o tenant.

### Implementation for User Story 3

- [X] T013 [US3] Cambiar en `apps/frontend/src/features/people/people-view.ts` la visibilidad de la acción para depender de `${options.type}/update`, retirando la dependencia de `${options.type}/delete` y manteniendo disponibles las demás acciones autorizadas.
- [X] T014 [US3] Verificar o ajustar en `apps/profile-service/src/people/` la validación de tipo, tenant, identidad protegida y último administrador activo para cambios de `enabled`, conservando mensajes y respuestas de error en español.
- [X] T015 [US3] Eliminar del flujo de listados en `apps/frontend/src/features/people/people-view.ts` toda llamada a `deletePerson` y toda etiqueta, atributo o confirmación asociada a `Eliminar`.

**Checkpoint**: Ningún listado muestra ni ejecuta eliminación física; los cambios de estado respetan autorización y aislamiento.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar el ciclo completo y evitar regresiones.

- [X] T016 [P] Ejecutar los comandos automatizados de `specs/007-activar-inactivar-registros/quickstart.md` y corregir regresiones en tipos, lint, formato o tests.
- [X] T017 [P] Ejecutar la validación manual de `specs/007-activar-inactivar-registros/quickstart.md` en clientes y contadores, incluyendo confirmación, cancelación, error, permisos y reversibilidad.
- [X] T018 Revisar el diff de `apps/frontend/src/features/people/people-view.ts`, `apps/frontend/src/features/people/people-api.ts` y cualquier archivo de servicio contra FR-001–FR-014, confirmando que no se elimina ni recrea ningún registro.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T001–T003 pueden ejecutarse en paralelo.
- **Foundational (Phase 2)**: Depende de T001–T003; T004 y T005 pueden comenzar en paralelo, T006 depende de la conclusión de T002.
- **US1 (Phase 3)**: Depende de Phase 2 y constituye el MVP.
- **US2 (Phase 4)**: Depende de T004–T005; puede compartir la implementación de US1 si se coordina el mismo archivo.
- **US3 (Phase 5)**: Depende de US1 y US2 para revisar el flujo final de permisos y ausencia de `Eliminar`.
- **Polish (Phase 6)**: Depende de las tres historias.

### User Story Dependencies

- **US1 (P1)**: Puede iniciar después de Phase 2; MVP.
- **US2 (P1)**: Puede iniciar después de Phase 2, pero comparte el renderer y handler con US1.
- **US3 (P1)**: Depende de la integración de ambas transiciones para validar la autorización final.

### Parallel Opportunities

- T001, T002 y T003 pueden ejecutarse en paralelo.
- T016 y T017 pueden ejecutarse en paralelo después de completar las historias.
- La revisión backend de T014 puede realizarse en paralelo con la revisión final del frontend, si no requiere cambios de contrato.

## Parallel Example: User Story 1

```text
Task: "T007 [US1] Reemplazar Eliminar por Inactivar en people-view.ts"
Task: "T009 [US1] Mostrar errores de inactivación en español en people-view.ts"
```

T008 debe integrarse de forma secuencial con T007 porque ambos modifican el handler de la misma acción.

## Implementation Strategy

### MVP First

1. Completar T001–T006.
2. Completar T007–T009 para inactivar registros activos.
3. Validar que el registro permanezca visible y cambie a `Inactivo`.

### Incremental Delivery

1. Reutilizar el PATCH existente y retirar la operación DELETE del listado.
2. Entregar Inactivar para registros activos.
3. Entregar Activar para registros inactivos.
4. Cerrar permisos, aislamiento y validación de errores.
5. Ejecutar quickstart y revisión final de alcance.

## Notes

- Todas las tareas siguen el formato `- [ ] T### [P?] [US?] descripción con ruta`.
- No se generan contratos nuevos salvo que T002 demuestre que el backend no admite el payload existente.
- Las pruebas automatizadas nuevas no son obligatorias por la especificación; el quickstart exige validar la regresión con la suite existente y escenarios observables.
