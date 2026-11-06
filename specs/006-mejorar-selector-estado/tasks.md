# Tasks: Mejorar selector de estado en modales

**Input**: Design documents from `/specs/006-mejorar-selector-estado/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Technology constraint**: Mantener el `select` nativo, sin dependencias nuevas, sin modificar las opciones de estado, permisos, persistencia ni contratos externos.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar la revisión del formulario compartido y sus estilos existentes.

- [X] T001 [P] Inspeccionar `apps/frontend/src/features/people/people-form.ts` y `apps/frontend/src/styles.css`, documentando en el cambio los puntos de integración definidos en `specs/006-mejorar-selector-estado/plan.md`.
- [X] T002 [P] Confirmar que la validación base del frontend pasa con `npm run typecheck`, `npm run lint`, `npm run format` y `npm test` antes de modificar `apps/frontend/`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establecer el contrato visual común que usarán las tres historias.

- [X] T003 Definir en `apps/frontend/src/features/people/people-form.ts` el marcado semántico y las clases compartidas del campo Estado, conservando el valor inicial `person.enabled`, las opciones exactas `Activo`/`Inactivo` y el envío existente mediante `FormData`.
- [X] T004 Definir en `apps/frontend/src/styles.css` la base visual común del selector Estado —ancho, espaciado, borde, tipografía, indicador de apertura y alineación con los inputs— sin introducir una dependencia de dropdown personalizado.

**Checkpoint**: Existe una única estructura y un único patrón visual reutilizable para ambos modales, sin cambios funcionales.

---

## Phase 3: User Story 1 - Editar el estado de un cliente (Priority: P1) 🎯 MVP

**Goal**: Hacer claro, legible y usable el selector Estado dentro del modal de edición de clientes.

**Independent Test**: Con un cliente existente y permisos de edición/actualización, el selector muestra el valor actual, permite elegir `Activo` o `Inactivo`, conserva la selección hasta guardar y mantiene intacto el flujo de persistencia.

### Implementation for User Story 1

- [X] T005 [US1] Aplicar en `apps/frontend/src/features/people/people-form.ts` la estructura común del selector al modal de cliente, asegurando etiqueta `Estado`, valor seleccionado visible e indicador claro de apertura.
- [X] T006 [US1] Añadir en `apps/frontend/src/styles.css` los estados visuales del selector de cliente para reposo, foco, apertura, selección, error y deshabilitado, con señales que no dependan únicamente del color.
- [X] T007 [US1] Preservar en `apps/frontend/src/features/people/people-form.ts` el comportamiento de edición de cliente: selección local antes de guardar, cancelación sin persistencia y permanencia del valor ante error de guardado.

**Checkpoint**: La historia de edición de clientes cumple de forma independiente los escenarios de selección, error y persistencia de `spec.md`.

---

## Phase 4: User Story 2 - Editar el estado de un contador (Priority: P1)

**Goal**: Aplicar exactamente el mismo patrón visual y de interacción al modal de edición de contadores.

**Independent Test**: Con un contador existente, el selector tiene la misma presentación que el de clientes y respeta tanto la actualización autorizada como el modo solo lectura.

### Implementation for User Story 2

- [X] T008 [US2] Verificar y ajustar en `apps/frontend/src/features/people/people-form.ts` la variante `type=user` para que reutilice el mismo marcado del selector Estado, sin duplicar opciones ni reglas.
- [X] T009 [US2] Ajustar en `apps/frontend/src/styles.css` cualquier regla necesaria para garantizar dimensiones, jerarquía, foco y estados visuales idénticos entre los modales de clientes y contadores.
- [X] T010 [US2] Preservar y documentar en `apps/frontend/src/features/people/people-form.ts` el modo solo lectura: con `user/edit` sin `user/update`, el selector debe ser legible, deshabilitado y no persistir cambios.

**Checkpoint**: Clientes y contadores usan el mismo patrón UX y no presentan divergencias de estilo ni permisos.

---

## Phase 5: User Story 3 - Usar el selector con teclado y distintos tamaños de pantalla (Priority: P2)

**Goal**: Asegurar que el requisito visual también sea accesible y usable en ventanas reducidas.

**Independent Test**: En ambos modales, el selector puede enfocarse, abrirse, recorrerse, seleccionarse y cerrarse con teclado; en una ventana reducida no oculta opciones ni controles esenciales.

### Implementation for User Story 3

- [X] T011 [US3] Refinar en `apps/frontend/src/styles.css` los estilos de `:focus-visible`, `:disabled`, error y selección del selector para que cada estado sea perceptible sin depender solo del color y conserve contraste con el modal.
- [X] T012 [US3] Ajustar en `apps/frontend/src/styles.css` el comportamiento responsive del formulario y modal para que el campo Estado, sus opciones, mensajes y acciones principales permanezcan accesibles con el espacio disponible.
- [X] T013 [US3] Revisar en `apps/frontend/src/features/people/people-form.ts` que no se introduzcan atributos, listeners ni controles que interfieran con la navegación nativa por teclado o con la selección mediante `FormData`.

**Checkpoint**: El selector satisface los escenarios de teclado, responsive, foco y deshabilitado definidos en la historia P2.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar regresiones y cerrar la implementación con evidencia reproducible.

- [X] T014 [P] Ejecutar los comandos automatizados de `specs/006-mejorar-selector-estado/quickstart.md` y corregir cualquier regresión de tipos, lint, formato o tests.
- [X] T015 [P] Ejecutar la validación manual de `specs/006-mejorar-selector-estado/quickstart.md` en clientes y contadores, incluyendo permisos completos, solo lectura, teclado, error de guardado y ventana reducida.
- [X] T016 Revisar el diff de `apps/frontend/src/features/people/people-form.ts` y `apps/frontend/src/styles.css` contra `spec.md`, confirmando que no cambian estados, textos, autorización, guardado, cancelación ni manejo de errores fuera del estilo solicitado.
- [X] T017 Actualizar `specs/006-mejorar-selector-estado/checklists/ux.md` únicamente con observaciones del revisor de requisitos; no marcar ítems como implementación completada desde esta fase.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T001 y T002 pueden ejecutarse en paralelo.
- **Foundational (Phase 2)**: Depende de T001 y T002; T003 precede a T004 si el marcado define las clases finales.
- **US1 (Phase 3)**: Depende de Phase 2; constituye el MVP funcional y visual.
- **US2 (Phase 4)**: Depende de Phase 2; puede ejecutarse en paralelo con US1, aunque T008/T009 no deben editarse simultáneamente con T005/T006 en los mismos archivos.
- **US3 (Phase 5)**: Depende de US1 y US2 para validar ambos contextos.
- **Polish (Phase 6)**: Depende de las tres historias.

### User Story Dependencies

- **US1 (P1)**: Puede iniciar después de Phase 2 y es el MVP.
- **US2 (P1)**: Puede iniciar después de Phase 2; comparte implementación con US1, por lo que requiere coordinación de cambios.
- **US3 (P2)**: Requiere que el patrón común esté aplicado a clientes y contadores.

### Parallel Opportunities

- T001 y T002 pueden ejecutarse en paralelo.
- T006 y T009 son conceptualmente paralelizables por historia, pero deben coordinarse porque comparten `apps/frontend/src/styles.css`.
- T014 y T015 pueden ejecutarse en paralelo después de completar las historias.

## Parallel Example: User Story 1

```text
Task: "T005 [US1] Aplicar la estructura común del selector en people-form.ts"
Task: "T006 [US1] Añadir estados visuales del selector en styles.css"
```

T007 se ejecuta después de T005 porque verifica que el marcado continúe conectado al formulario existente.

## Implementation Strategy

### MVP First

1. Completar T001–T004.
2. Completar T005–T007 para el modal de clientes.
3. Ejecutar el checkpoint de US1 y validar la selección, cancelación, guardado y error.

### Incremental Delivery

1. Aplicar el patrón compartido.
2. Entregar US1 para clientes.
3. Completar US2 para contadores sin duplicar lógica.
4. Completar US3 para teclado y responsive.
5. Ejecutar la validación final y revisar el alcance.

## Notes

- Todas las tareas siguen el formato `- [ ] T### [P?] [US?] descripción con ruta`.
- No se agregan tareas de contratos, migraciones, backend ni dependencias porque la feature no modifica interfaces externas ni persistencia.
- Las pruebas automatizadas no se agregan como suite nueva obligatoria; la especificación exige validación observable y el quickstart reutiliza la infraestructura existente.
