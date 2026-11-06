# Feature Specification: Activar e inactivar registros desde listados

**Feature Branch**: `007-activar-inactivar-registros`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "en todos los listados, cambia la acción 'Eliminar' por 'Inactivar' y esta acción en lugar de borrar el registro, solo cambiará el estado de activo a inactivo. También cuando el registro esté en estado 'Inactivo' en lugar de mostrar la acción 'Inactivar' deberá mostrar la acción 'Activar' la cual pasará el registro del estado 'Inactivo' a 'Activo'."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Inactivar registros activos (Priority: P1)

Como usuario autorizado para administrar un listado, quiero inactivar un registro activo para retirarlo de operación sin perder su información.

**Why this priority**: La inactivación reemplaza la eliminación y conserva el historial y los datos del estudio.

**Independent Test**: En los listados de clientes y contadores, localizar un registro activo, usar `Inactivar`, confirmar la acción y comprobar que permanece como `Inactivo` sin ser eliminado.

**Acceptance Scenarios**:

1. **Given** un registro activo en un listado y un usuario con el permiso de inactivación correspondiente, **When** observa las acciones del registro, **Then** se muestra `Inactivar` y no se muestra `Eliminar`.
2. **Given** un registro activo, **When** el usuario selecciona `Inactivar` y confirma, **Then** el registro permanece en el listado, cambia a estado `Inactivo` y sus datos se conservan.
3. **Given** un registro activo, **When** el usuario cancela la confirmación, **Then** el registro permanece activo y no se modifica.

### User Story 2 - Activar registros inactivos (Priority: P1)

Como usuario autorizado para administrar un listado, quiero activar un registro inactivo para devolverlo a operación sin recrearlo.

**Why this priority**: El ciclo reversible permite corregir una inactivación y evita altas duplicadas.

**Independent Test**: En los listados de clientes y contadores, localizar un registro inactivo, usar `Activar`, confirmar la acción y comprobar que vuelve a estado `Activo`.

**Acceptance Scenarios**:

1. **Given** un registro inactivo en un listado y un usuario con el permiso de activación correspondiente, **When** observa las acciones del registro, **Then** se muestra `Activar` y no se muestra `Inactivar`.
2. **Given** un registro inactivo, **When** el usuario selecciona `Activar` y confirma, **Then** el registro permanece en el listado y cambia a estado `Activo`.
3. **Given** un registro inactivo, **When** el usuario cancela la confirmación, **Then** el registro permanece inactivo y no se modifica.

### User Story 3 - Mantener autorización y separación de listados (Priority: P1)

Como administrador del estudio, quiero que activar o inactivar respete los permisos existentes y el tipo de listado para evitar modificaciones no autorizadas o cruces entre clientes y contadores.

**Why this priority**: El cambio de etiqueta no debe ampliar privilegios ni permitir operar sobre identidades de otro tipo o tenant.

**Independent Test**: Revisar las acciones con permisos presentes y ausentes en ambos listados y comprobar que cada operación afecta únicamente al registro autorizado del tipo correspondiente.

**Acceptance Scenarios**:

1. **Given** un usuario sin permiso de cambio de estado, **When** observa un listado, **Then** no puede ejecutar `Inactivar` ni `Activar`, sin perder los permisos de las demás acciones autorizadas.
2. **Given** un cliente o contador, **When** se solicita cambiar su estado, **Then** la operación valida el tipo y tenant del registro antes de persistirla.
3. **Given** un fallo de actualización, **When** la operación no puede completarse, **Then** se muestra un mensaje en español y el listado no presenta un estado falso como si el cambio hubiera sido exitoso.

### Edge Cases

- Un registro activo nunca debe mostrar simultáneamente `Inactivar` y `Activar`.
- Un registro inactivo nunca debe mostrar simultáneamente `Activar` e `Inactivar`.
- La confirmación debe describir la acción correcta, distinguiendo activar de inactivar.
- La operación debe ser reversible y no crear un registro nuevo ni cambiar su identificador.
- Si el listado se actualiza mientras se procesa la operación, el resultado visible debe reflejar el estado confirmado por el servidor.
- Las restricciones de seguridad existentes para no modificar identidades protegidas o el último administrador activo deben conservarse.
- No debe existir una acción visible `Eliminar` en los listados alcanzados por esta especificación.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: En todos los listados administrables de clientes y contadores, la acción visible para un registro `Activo` DEBE llamarse `Inactivar` y no `Eliminar`.
- **FR-002**: Al confirmar `Inactivar`, el sistema DEBE cambiar únicamente el estado del registro de `Activo` a `Inactivo` y conservar todos sus demás datos e identificador.
- **FR-003**: En todos los listados administrables, la acción visible para un registro `Inactivo` DEBE llamarse `Activar` y no `Inactivar`.
- **FR-004**: Al confirmar `Activar`, el sistema DEBE cambiar únicamente el estado del registro de `Inactivo` a `Activo` y conservar todos sus demás datos e identificador.
- **FR-005**: Las acciones `Inactivar` y `Activar` DEBEN requerir confirmación explícita antes de persistir el cambio.
- **FR-006**: La cancelación de la confirmación DEBE dejar el registro y su estado sin cambios.
- **FR-007**: La etiqueta de acción DEBE derivarse del estado actual del registro y nunca mostrar `Activar` para un registro activo ni `Inactivar` para uno inactivo.
- **FR-008**: Las acciones de cambio de estado DEBEN respetar los permisos existentes de administración para clientes y contadores, sin conceder permisos adicionales.
- **FR-009**: La operación DEBE validar el tipo exacto (`client` o `user`) y el tenant del registro antes de cambiarlo.
- **FR-010**: Un error de actualización DEBE mostrarse en español y no DEBE presentar el cambio como exitoso ni eliminar el registro del listado.
- **FR-011**: Después de una actualización exitosa, el listado DEBE reflejar el nuevo estado y la acción opuesta correspondiente.
- **FR-012**: El sistema NO DEBE eliminar físicamente ni deshabilitar definitivamente un registro como consecuencia de `Inactivar`.
- **FR-013**: Los mensajes de confirmación, éxito, error y permisos DEBEN estar en español.
- **FR-014**: Las invariantes de seguridad existentes para autoeliminación, último administrador activo, aislamiento multi-tenant y autenticación DEBEN mantenerse para el cambio de estado.

### Key Entities

- **Registro administrable**: Cliente o contador listado, con identificador, tipo, tenant, datos personales y estado `Activo`/`Inactivo`.
- **Estado del registro**: Valor booleano o equivalente existente que determina la etiqueta visible y la transición permitida.
- **Acción de cambio de estado**: Operación contextual `Inactivar` o `Activar`, determinada por el estado actual.
- **Permiso de administración**: Autorización existente que permite modificar el registro dentro del tenant y tipo correspondientes.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de los registros activos en los listados de clientes y contadores muestra `Inactivar` y ningún registro muestra `Eliminar`.
- **SC-002**: El 100% de los registros inactivos muestra `Activar` y no muestra `Inactivar`.
- **SC-003**: El 100% de las operaciones confirmadas cambia el estado correcto, conserva el registro y refleja la acción opuesta en el listado actualizado.
- **SC-004**: El 100% de las operaciones canceladas conserva el estado original y no genera cambios persistidos.
- **SC-005**: El 100% de los usuarios sin permiso de cambio de estado carece de una acción ejecutable para activar o inactivar.
- **SC-006**: El 100% de los errores de actualización se informa en español sin mostrar un estado incorrecto como confirmado.
- **SC-007**: En pruebas de regresión no se elimina físicamente ningún registro mediante las acciones de los listados.

## Assumptions

- “Todos los listados” se refiere a los listados administrables existentes de `Clientes del estudio` y `Contadores del estudio`.
- El estado existente (`enabled`) es la fuente de verdad para determinar `Activo` e `Inactivo`.
- La actualización se realizará mediante el flujo existente de modificación de identidades y no requiere un nuevo campo de datos.
- Los permisos actuales de modificación se reutilizarán; no se crea un permiso nuevo salvo que el diseño determine que la separación sea necesaria para mantener el control existente.
- La interfaz, confirmaciones y mensajes continuarán en español.
- La eliminación física, si existiera como capacidad administrativa independiente fuera de estos listados, no forma parte de esta especificación.
