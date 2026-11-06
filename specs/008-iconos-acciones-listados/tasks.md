---
description: "Task list for iconos para acciones de listados"
---

# Tasks: Iconos para acciones de listados

**Input**: Design documents from `/specs/008-iconos-acciones-listados/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Technology constraint**: Mantener botones HTML y handlers existentes; usar SVG inline sin dependencias nuevas.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Revisar el marcado y estilos actuales antes de sustituir la representación visual.

- [X] T001 [P] Inspeccionar `apps/frontend/src/features/people/people-view.ts` y `apps/frontend/src/styles.css`, identificando los botones de `Editar`, `Inactivar` y `Activar` y sus selectores actuales.
- [X] T002 [P] Confirmar la línea base con `npm run typecheck`, `npm run lint`, `npm run format` y `npm test` antes de cambiar el marcado de acciones.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Definir el patrón común de iconos accesibles para ambas pantallas.

- [X] T003 Definir en `apps/frontend/src/features/people/people-view.ts` tres SVG inline reutilizables para editar, inactivar y activar, con `aria-hidden="true"`, trazos consistentes y sin texto dependiente del idioma dentro del SVG.
- [X] T004 Definir en `apps/frontend/src/styles.css` el patrón visual común de botones de icono: tamaño, alineación, separación, hover, foco visible y diferenciación no basada únicamente en color.

**Checkpoint**: Existe un patrón único de icono y botón que puede usarse en los dos listados sin cambiar handlers ni permisos.

---

## Phase 3: User Story 1 - Identificar acciones mediante iconos (Priority: P1) 🎯 MVP

**Goal**: Reemplazar el texto visible de las tres acciones por iconos en clientes y contadores.

**Independent Test**: Ambos listados muestran iconos para las acciones disponibles y mantienen el significado contextual de editar, inactivar y activar.

### Implementation for User Story 1

- [X] T005 [US1] Sustituir en `apps/frontend/src/features/people/people-view.ts` el contenido textual visible de `Editar` por el SVG de edición, conservando `data-edit` y su handler existente.
- [X] T006 [US1] Sustituir en `apps/frontend/src/features/people/people-view.ts` el contenido textual visible de `Inactivar` y `Activar` por sus SVG contextuales, conservando `data-status`, `data-enabled` y el handler existente.
- [X] T007 [US1] Mantener en `apps/frontend/src/features/people/people-view.ts` la derivación por estado, permisos y separación entre clientes y contadores sin cambiar el contenido de la tabla ni los flujos de persistencia.

**Checkpoint**: Los dos listados presentan únicamente iconos para las acciones autorizadas, sin alterar su funcionamiento.

---

## Phase 4: User Story 2 - Comprender y utilizar iconos accesibles (Priority: P1)

**Goal**: Hacer que cada icono sea comprensible mediante tooltip, nombre accesible y teclado.

**Independent Test**: Cada icono tiene tooltip y nombre accesible en español, recibe foco visible y activa el mismo flujo existente.

### Implementation for User Story 2

- [X] T008 [US2] Añadir en `apps/frontend/src/features/people/people-view.ts` `aria-label` y `title` en español para cada botón: `Editar`, `Inactivar` o `Activar` según la acción contextual.
- [X] T009 [US2] Asegurar en `apps/frontend/src/features/people/people-view.ts` que los SVG sean decorativos para lectores de pantalla y que el nombre accesible provenga del botón, sin duplicar el anuncio.
- [X] T010 [US2] Ajustar en `apps/frontend/src/styles.css` `:focus-visible`, tamaño táctil/visual y estados hover/focus/disabled de los botones de icono para que sean perceptibles sin depender solo del color.

**Checkpoint**: Un usuario de teclado, puntero o lector de pantalla puede identificar y activar cada acción.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validar regresiones y cerrar la mejora visual.

- [X] T011 [P] Ejecutar `npx prettier --check apps/frontend/src/features/people/people-view.ts apps/frontend/src/styles.css`, `npm run typecheck`, `npm run lint` y `npm test`; corregir regresiones.
- [X] T012 [P] Ejecutar la validación manual de `specs/008-iconos-acciones-listados/quickstart.md` en ambos listados, incluyendo tooltips, teclado, permisos parciales y ventana reducida.
- [X] T013 Revisar el diff de `apps/frontend/src/features/people/people-view.ts` y `apps/frontend/src/styles.css`, confirmando que solo cambia la representación visual y accesible de las acciones.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T001 y T002 pueden ejecutarse en paralelo.
- **Foundational (Phase 2)**: Depende de Setup; T003 precede a T005/T006 y T004 precede a T010.
- **US1 (Phase 3)**: Depende de Phase 2 y constituye el MVP.
- **US2 (Phase 4)**: Depende de US1 porque añade accesibilidad al marcado final.
- **Polish (Phase 5)**: Depende de US1 y US2.

### Parallel Opportunities

- T001 y T002 pueden ejecutarse en paralelo.
- T003 y T004 pueden ejecutarse en paralelo por afectar lógica de marcado y estilos separados.
- T011 y T012 pueden ejecutarse en paralelo después de completar la implementación.

## Parallel Example: User Story 1

```text
Task: "T005 [US1] Sustituir el icono de Editar en people-view.ts"
Task: "T006 [US1] Sustituir los iconos de Inactivar y Activar en people-view.ts"
```

T005 y T006 comparten el mismo template; deben coordinarse o ejecutarse como una única edición secuencial.

## Implementation Strategy

### MVP First

1. Completar T001–T004.
2. Completar T005–T007 para mostrar los tres iconos.
3. Validar visualmente ambos listados.

### Incremental Delivery

1. Definir SVG y estilos comunes.
2. Reemplazar las tres acciones manteniendo handlers.
3. Añadir labels, tooltips y foco.
4. Ejecutar validaciones automáticas y manuales.

## Notes

- Todas las tareas siguen el formato `- [ ] T### [P?] [US?] descripción con ruta`.
- No se modifican API, permisos, estados ni persistencia.
- No se crean tareas de backend o contratos porque el cambio es exclusivamente de presentación accesible.
