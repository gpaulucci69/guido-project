# Feature Specification: Iconos para acciones de listados

**Feature Branch**: `008-iconos-acciones-listados`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "en las pantallas de 'Clientes del estudio' y 'Contadores del estudio' cambia los botones 'Editar', 'Inactivar' y 'Activar' por íconos"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Identificar acciones mediante iconos (Priority: P1)

Como usuario del estudio, quiero ver iconos para editar, inactivar y activar registros en los listados de clientes y contadores para reconocer rápidamente las acciones disponibles y reducir el ruido visual.

**Why this priority**: Las acciones son frecuentes y aparecen en dos listados equivalentes; una representación compacta mejora la lectura sin cambiar el flujo.

**Independent Test**: Abrir ambos listados y comprobar que las acciones se representan con iconos equivalentes, conservan su significado y siguen siendo distinguibles según el estado del registro.

**Acceptance Scenarios**:

1. **Given** un registro en `Clientes del estudio` o `Contadores del estudio`, **When** el usuario observa la columna Acciones, **Then** `Editar` se representa con un icono de edición y no con un botón de texto visible.
2. **Given** un registro activo, **When** el usuario observa sus acciones, **Then** `Inactivar` se representa con un icono contextual y no con un botón de texto visible.
3. **Given** un registro inactivo, **When** el usuario observa sus acciones, **Then** `Activar` se representa con un icono contextual y no con un botón de texto visible.

### User Story 2 - Comprender y utilizar iconos accesibles (Priority: P1)

Como usuario del estudio, quiero que cada icono tenga una etiqueta accesible y una ayuda contextual para saber qué acción ejecutará antes de seleccionarlo.

**Why this priority**: Ocultar el texto no debe eliminar la comprensión de la acción ni perjudicar a usuarios de teclado, lectores de pantalla o usuarios que no reconozcan un icono.

**Independent Test**: Navegar por las acciones con teclado y puntero, verificando foco visible, tooltip y nombre accesible para cada acción.

**Acceptance Scenarios**:

1. **Given** un icono de acción, **When** el puntero permanece sobre él, **Then** aparece una ayuda contextual en español con el texto `Editar`, `Inactivar` o `Activar` según corresponda.
2. **Given** un icono de acción enfocado por teclado o interpretado por un lector de pantalla, **When** se consulta su nombre accesible, **Then** comunica la acción completa en español.
3. **Given** un usuario autorizado, **When** selecciona un icono, **Then** se ejecuta el mismo flujo existente de edición, inactivación o activación, incluida la confirmación cuando corresponda.

### Edge Cases

- El icono de un registro activo debe comunicar `Inactivar` y el de un registro inactivo debe comunicar `Activar`; no deben intercambiarse.
- La ausencia de permiso debe conservar la visibilidad de las demás acciones permitidas y no mostrar iconos ejecutables no autorizados.
- Los iconos no deben depender únicamente del color para diferenciar acciones.
- El foco debe permanecer visible en ventanas reducidas y con navegación exclusivamente por teclado.
- La sustitución visual no debe modificar permisos, confirmaciones, estados, errores ni persistencia.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: En `Clientes del estudio` y `Contadores del estudio`, la acción `Editar` DEBE representarse visualmente mediante un icono en lugar de texto visible.
- **FR-002**: La acción contextual `Inactivar` DEBE representarse mediante un icono en registros activos y `Activar` mediante un icono en registros inactivos.
- **FR-003**: Cada icono DEBE conservar la acción y el flujo funcional existente al seleccionarse.
- **FR-004**: Cada icono DEBE tener un nombre accesible en español que comunique `Editar`, `Inactivar` o `Activar`.
- **FR-005**: Cada icono DEBE ofrecer una ayuda contextual visible al apuntarlo, con el nombre de la acción en español.
- **FR-006**: Los iconos DEBEN ser enfocables y mostrar un estado de foco perceptible al navegar con teclado.
- **FR-007**: La representación por iconos NO DEBE depender exclusivamente del color para comunicar el significado.
- **FR-008**: La visibilidad de cada icono DEBE respetar los permisos existentes de edición y cambio de estado.
- **FR-009**: El cambio DEBE conservar las confirmaciones de `Inactivar`/`Activar`, los mensajes de error, la actualización del listado y la persistencia actual.
- **FR-010**: Todo tooltip, nombre accesible y mensaje asociado DEBE estar en español.

### Key Entities

- **Acción de listado**: Operación existente de editar, inactivar o activar un registro.
- **Icono de acción**: Representación visual accesible de una acción, con nombre y ayuda contextual.
- **Registro administrable**: Cliente o contador cuyo estado determina si corresponde `Inactivar` o `Activar`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de las acciones `Editar`, `Inactivar` y `Activar` de ambos listados se muestra como icono sin texto de botón visible.
- **SC-002**: El 100% de los iconos tiene nombre accesible y tooltip en español con la acción correcta.
- **SC-003**: El 100% de las acciones conserva su flujo funcional existente, incluyendo confirmaciones y errores.
- **SC-004**: El 100% de los iconos puede enfocarse y activarse mediante teclado con indicador de foco visible.
- **SC-005**: En pruebas de regresión no se modifican permisos, estados ni persistencia.

## Assumptions

- El alcance se limita a los listados existentes de clientes y contadores.
- Se reutilizará el sistema visual existente y no se agregará una biblioteca de iconos salvo que el plan determine que no existe una alternativa compatible.
- El tooltip puede implementarse con el mecanismo accesible más simple compatible con la aplicación, siempre que sea visible y esté en español.
- Las acciones seguirán usando sus permisos y handlers actuales.
