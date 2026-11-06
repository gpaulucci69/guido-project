# Feature Specification: Mejorar selector de estado en modales

**Feature Branch**: `006-mejorar-selector-estado`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "mejorar el estilo del cuadro dropbox del campo estado las ventanas modales de edicion de clientes y edicion de contadores del estudio"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Editar el estado de un cliente (Priority: P1)

Como usuario autorizado para editar clientes, quiero que el selector del campo Estado tenga una presentación clara y consistente dentro del modal de edición para identificar y cambiar el estado sin confusión.

**Why this priority**: El estado es un dato visible y operativo del cliente; una presentación deficiente puede provocar selecciones incorrectas o dificultar la edición.

**Independent Test**: Abrir el modal de edición de un cliente con permiso de edición, desplegar el campo Estado, seleccionar una opción y comprobar que el valor seleccionado queda visible y puede guardarse según los permisos existentes.

**Acceptance Scenarios**:

1. **Given** un cliente existente y un usuario autorizado para abrir su edición, **When** se muestra el modal, **Then** el campo Estado presenta un selector visualmente integrado con el resto de los campos, con etiqueta legible, valor actual visible y una indicación clara de que es desplegable.
2. **Given** el selector de Estado abierto, **When** el usuario revisa sus opciones, **Then** las opciones se muestran completas, diferenciadas y sin quedar ocultas por el modal o fuera del área visible de la aplicación.
3. **Given** una opción de estado seleccionada, **When** el usuario cierra el selector sin guardar, **Then** el formulario conserva la selección durante la edición y no persiste ningún cambio hasta la acción de guardado existente.
4. **Given** un usuario con permiso de edición pero sin permiso de actualización, **When** abre el modal, **Then** el selector conserva el estilo mejorado pero permanece visualmente deshabilitado y no permite modificar el estado.

### User Story 2 - Editar el estado de un contador (Priority: P1)

Como usuario autorizado para editar contadores, quiero que el selector del campo Estado tenga la misma presentación y comportamiento que el de clientes para trabajar de forma consistente.

**Why this priority**: Los contadores y clientes se administran desde modales equivalentes; mantener el mismo patrón reduce errores y aprendizaje innecesario.

**Independent Test**: Abrir el modal de edición de un contador, revisar y desplegar el campo Estado, seleccionar una opción y comprobar su comportamiento con y sin permiso de actualización.

**Acceptance Scenarios**:

1. **Given** un contador existente y un usuario autorizado para abrir su edición, **When** se muestra el modal, **Then** el campo Estado usa la misma jerarquía visual, dimensiones, estados de foco y señal de desplegable que el selector de clientes.
2. **Given** el selector de Estado abierto, **When** el usuario selecciona una opción, **Then** la opción queda reflejada de forma inequívoca en el campo y el modal mantiene su estructura sin saltos visuales inesperados.
3. **Given** un usuario sin permiso de actualización, **When** abre el modal de edición de un contador, **Then** el selector es legible pero no interactivo y el botón de actualización mantiene el comportamiento existente.

### User Story 3 - Usar el selector con teclado y distintos tamaños de pantalla (Priority: P2)

Como usuario del estudio, quiero poder identificar y utilizar el selector de Estado con teclado y en el tamaño de ventana disponible para completar la edición sin obstáculos visuales.

**Why this priority**: La consistencia visual debe mantenerse en situaciones habituales de uso, no solamente en una ventana de tamaño ideal.

**Independent Test**: Probar ambos modales con navegación por teclado y con una ventana reducida, verificando foco, apertura, selección y cierre del selector.

**Acceptance Scenarios**:

1. **Given** el foco en el campo Estado, **When** el usuario usa el teclado para abrir, recorrer y elegir una opción, **Then** el foco y la opción activa se distinguen claramente y la selección se aplica al formulario.
2. **Given** un modal abierto en una ventana de tamaño reducido, **When** el usuario despliega el selector, **Then** las opciones siguen siendo accesibles y no provocan desbordamiento que oculte controles esenciales del modal.

### Edge Cases

- Si el registro no tiene un estado actual, el campo debe mostrar un valor vacío o indicación neutral claramente distinguible, sin presentar una opción válida como si estuviera seleccionada.
- Si la lista de estados contiene varias opciones, el selector debe permitir distinguir la opción seleccionada de las demás sin depender únicamente del color.
- Si el modal está en modo solo lectura, no deben aparecer estilos de foco o interacción que sugieran que el campo puede modificarse.
- Si se produce un error al guardar, la selección realizada debe permanecer visible para permitir corregir o reintentar, sin indicar falsamente que el cambio se persistió.
- El estilo mejorado no debe alterar los estados disponibles, sus textos, el valor inicial ni las reglas de autorización existentes.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema DEBE presentar el campo Estado del modal de edición de clientes con un selector visualmente claro, legible y coherente con el diseño vigente del formulario.
- **FR-002**: El sistema DEBE presentar el campo Estado del modal de edición de contadores con el mismo patrón visual y de interacción que el selector de clientes.
- **FR-003**: El selector DEBE mostrar de forma distinguible la etiqueta del campo, el valor actual, el control de apertura y la opción seleccionada.
- **FR-004**: Las opciones desplegadas DEBEN permanecer visibles, legibles y asociadas al modal mientras el selector está abierto, sin quedar recortadas por sus límites.
- **FR-005**: El selector DEBE conservar la selección dentro del formulario hasta que el usuario guarde o descarte la edición, respetando el flujo existente de persistencia.
- **FR-006**: El selector DEBE respetar exactamente los permisos existentes: con permiso de edición y sin permiso de actualización se mostrará en modo solo lectura/deshabilitado; con ambos permisos permitirá modificarlo.
- **FR-007**: El selector DEBE ofrecer estados visuales diferenciables para reposo, foco, apertura, selección, deshabilitado y error, sin depender únicamente del color.
- **FR-008**: El selector DEBE poder utilizarse mediante teclado y mantener un indicador de foco perceptible.
- **FR-009**: El selector DEBE adaptarse al espacio disponible del modal sin ocultar el valor seleccionado, las opciones, los mensajes de validación ni los controles principales.
- **FR-010**: El cambio DEBE conservar sin alteraciones los estados disponibles, sus etiquetas, la validación, la autorización, el guardado, la cancelación y el manejo de errores de ambos modales.
- **FR-011**: Todo texto visible asociado al selector DEBE estar en español y respetar el estilo de presentación del resto de la aplicación.

### Key Entities

- **Modal de edición de cliente**: Formulario existente para editar los datos de una identidad clasificada como cliente.
- **Modal de edición de contador**: Formulario existente para editar los datos de una identidad clasificada como contador del estudio.
- **Campo Estado**: Dato existente de la identidad que permite elegir uno de los estados actualmente definidos por la aplicación.
- **Permiso de actualización**: Autorización existente que determina si el campo puede modificarse y guardarse.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El selector de Estado presenta el mismo patrón visual y de interacción en el 100% de los modales de edición de clientes y contadores.
- **SC-002**: En una prueba de los flujos de edición, el 100% de las opciones disponibles se visualiza completa y seleccionable sin quedar recortada u oculta por el modal.
- **SC-003**: Al menos el 95% de los usuarios de prueba puede identificar el valor actual, abrir el selector y seleccionar un nuevo estado en menos de 15 segundos y sin asistencia.
- **SC-004**: El 100% de las pruebas con usuarios sin permiso de actualización mantiene el campo no editable y no permite persistir un cambio de estado.
- **SC-005**: El 100% de las pruebas de teclado permite enfocar, abrir, recorrer, seleccionar y cerrar el selector sin requerir el puntero.
- **SC-006**: Las pruebas de regresión confirman que no cambian los estados disponibles, las reglas de autorización ni el resultado de guardado y cancelación.

## Assumptions

- El campo Estado y sus opciones ya existen en ambos modales; el alcance se limita a su presentación, accesibilidad y comportamiento visual.
- El diseño mejorado reutilizará los patrones visuales y componentes de formulario ya presentes en la aplicación cuando sean compatibles.
- La aplicación se utiliza principalmente en español y en ventanas de escritorio o tamaños equivalentes al layout actual.
- Las reglas de permisos y persistencia definidas en la especificación de gestión de clientes y contadores permanecen vigentes.
- No se agregan estados, filtros, búsquedas, cambios de modelo de datos ni nuevas acciones CRUD en esta versión.
