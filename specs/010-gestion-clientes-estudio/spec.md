# Feature Specification: Gestión de clientes por tipo

**Feature Branch**: `010-gestion-clientes-estudio`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "necesito poder gestionar dos tipos distintos de clientes del estudio (personas físicas y personas morales) con un conjunto de atributos propios y distintos uno del otro."

## Clarifications

### Session 2026-11-13

- Q: ¿Qué datos deben ser obligatorios para cada tipo de cliente? → A: Identidad fiscal y nombre obligatorios; contacto, domicilio y representante legal pueden completarse después según corresponda.
- Q: ¿El tipo de cliente debe poder cambiarse después de su creación? → A: No; el tipo es inmutable y una corrección requiere crear un nuevo cliente.
- Q: ¿La identificación fiscal debe ser única dentro del estudio sin importar el tipo de cliente? → A: Sí; el CUIT es único por estudio, independientemente del tipo.
- Q: ¿Qué jurisdicción fiscal debe regir los tipos y formatos de identificación fiscal? → A: Argentina.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Registrar una persona física (Priority: P1)

Como contador o administrador del estudio, quiero registrar un cliente que sea una persona física con sus datos particulares, para mantener su información fiscal y de contacto completa.

**Why this priority**: Permite gestionar el primer tipo de cliente requerido y constituye el flujo mínimo de alta.

**Independent Test**: Se puede probar creando una persona física con todos sus datos obligatorios, consultándola en el listado y verificando que sus atributos propios se conserven.

**Acceptance Scenarios**:

1. **Given** un usuario autorizado en un estudio, **When** selecciona “Persona física” y completa nombre, apellido y CUIT válido, **Then** el sistema crea el cliente y lo muestra identificado como persona física.
2. **Given** un formulario de persona física incompleto o con un CUIT inválido, **When** el usuario intenta guardar, **Then** el sistema informa los campos que deben corregirse y no crea el cliente.
3. **Given** una persona física existente, **When** el usuario autorizado edita sus datos, **Then** el sistema conserva el tipo persona física y actualiza únicamente los atributos permitidos.

### User Story 2 - Registrar una persona moral (Priority: P1)

Como contador o administrador del estudio, quiero registrar un cliente que sea una persona moral con sus datos particulares, para administrar correctamente empresas y otras entidades jurídicas.

**Why this priority**: Permite gestionar el segundo tipo de cliente requerido, cuyos datos y responsabilidades son diferentes de los de una persona física.

**Independent Test**: Se puede probar creando una persona moral con sus atributos obligatorios, consultándola en el listado y verificando que sus datos distintivos se conserven.

**Acceptance Scenarios**:

1. **Given** un usuario autorizado en un estudio, **When** selecciona “Persona moral” y completa razón social y CUIT válido, **Then** el sistema crea el cliente y lo muestra identificado como persona moral.
2. **Given** un formulario de persona moral incompleto o con un CUIT inválido, **When** el usuario intenta guardar, **Then** el sistema informa los campos que deben corregirse y no crea el cliente.
3. **Given** una persona moral existente, **When** el usuario autorizado edita sus datos, **Then** el sistema conserva el tipo persona moral y actualiza únicamente los atributos permitidos.

### User Story 3 - Consultar y distinguir clientes (Priority: P2)

Como usuario del estudio, quiero consultar y distinguir rápidamente ambos tipos de clientes, para aplicar el tratamiento correcto a cada uno y evitar confusiones.

**Why this priority**: La diferenciación visible es necesaria para que la gestión diaria sea segura y operable después del alta.

**Independent Test**: Se puede probar con un listado que contenga ambos tipos, verificando que cada registro muestre su clasificación y los datos de identificación correspondientes.

**Acceptance Scenarios**:

1. **Given** clientes de ambos tipos pertenecientes al estudio, **When** el usuario consulta el listado, **Then** cada cliente muestra claramente si es persona física o persona moral.
2. **Given** clientes de ambos tipos, **When** el usuario filtra por tipo, **Then** el sistema muestra únicamente los clientes de la clasificación elegida.
3. **Given** un usuario sin permisos para administrar clientes, **When** intenta crear o modificar un cliente, **Then** el sistema rechaza la operación sin exponer ni alterar información.

### Edge Cases

- El sistema debe impedir duplicar dentro del mismo estudio un CUIT, independientemente del tipo de cliente.
- Un mismo CUIT puede existir en estudios distintos sin mezclar ni revelar información entre ellos.
- Si se detecta que el tipo de un cliente fue registrado incorrectamente, el sistema debe impedir editarlo para convertirlo en el otro tipo; el usuario debe poder desactivar el registro incorrecto y crear uno nuevo, conservando la trazabilidad de ambas acciones.
- Si se abandona el formulario o falla la validación, no debe quedar creado un registro parcial.
- Los mensajes de validación deben indicar el campo a corregir en español y no deben revelar datos de otros clientes.
- El nombre y CUIT del representante legal deben completarse juntos o quedar ambos vacíos.
- Una edición concurrente debe preservar la última versión válida y rechazar la versión obsoleta con un mensaje accionable.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema MUST permitir crear, consultar, editar y listar clientes asociados exclusivamente al estudio del usuario autenticado.
- **FR-002**: El sistema MUST permitir seleccionar exactamente uno de dos tipos de cliente: persona física o persona moral.
- **FR-003**: El sistema MUST mostrar para una persona física los atributos propios: nombres, apellidos, CUIT, datos de contacto y domicilio fiscal.
- **FR-004**: El sistema MUST mostrar para una persona moral los atributos propios: razón social, nombre comercial opcional, CUIT, datos de contacto, domicilio fiscal y representante legal.
- **FR-005**: El sistema MUST exigir al crear cualquier cliente su tipo, CUIT y nombre o razón social; los datos de contacto, domicilio fiscal y representante legal podrán completarse posteriormente según corresponda, y no debe exigir atributos exclusivos del otro tipo.
- **FR-005a**: Para una persona moral, el nombre del representante legal y su CUIT son opcionales durante el alta; si se informa uno de los dos, el sistema MUST exigir también el otro.
- **FR-006**: El sistema MUST validar que el CUIT tenga un formato válido para Argentina y que no esté duplicado dentro del mismo estudio, independientemente del tipo.
- **FR-007**: El sistema MUST permitir editar los atributos de un cliente sin permitir cambiar su tipo; una corrección del tipo requiere desactivar el registro y crear uno nuevo.
- **FR-008**: El sistema MUST permitir filtrar y distinguir clientes por tipo en las consultas y listados.
- **FR-009**: El sistema MUST aplicar el siguiente control de acceso: `STUDIO_ADMIN` puede consultar, crear, editar y activar/inactivar cualquier cliente de su estudio; `ACCOUNTANT` puede realizar esas operaciones solo sobre clientes dentro de su alcance; `CLIENT_VIEWER` no puede consultar ni gestionar este módulo; ningún rol puede operar fuera de su estudio.
- **FR-010**: El sistema MUST registrar quién creó, modificó o intentó modificar un cliente y cuándo ocurrió cada acción relevante.
- **FR-011**: El sistema MUST presentar etiquetas, instrucciones, validaciones y mensajes de error en español, usando formato regional argentino para fechas y datos de contacto cuando corresponda.
- **FR-012**: El sistema MUST evitar la exposición de atributos exclusivos de un tipo cuando el cliente pertenece al otro tipo.
- **FR-013**: El sistema MUST rechazar una edición cuyo cliente haya sido inactivado o modificado después de cargarse para edición, informar que la información cambió y exigir que el usuario recargue el registro antes de reintentar.
- **FR-014**: Si el contexto de autenticación, tenant o permisos no está disponible o es inválido, el sistema MUST rechazar la operación sin consultar ni mutar clientes.
- **FR-015**: Los rechazos por permisos insuficientes, tenant incorrecto, cliente inexistente, CUIT duplicado o intento de modificar el tipo MUST registrarse como `UPDATE_REJECTED` sin guardar secretos ni el contenido completo de la solicitud.
- **FR-016**: Cuando se corrija un tipo mediante inactivación y alta nueva, el sistema MUST exigir un motivo y registrar en la auditoría la relación entre el cliente inactivado y el nuevo cliente.

### Key Entities

- **Cliente**: Registro administrable por un estudio, con identificador, tipo, estado, CUIT argentino, datos de contacto, domicilio fiscal y metadatos de auditoría.
- **Persona física**: Especialización de Cliente que representa a un individuo; agrega nombres y apellidos.
- **Persona moral**: Especialización de Cliente que representa a una entidad jurídica; agrega razón social, nombre comercial opcional y representante legal.
- **Representante legal**: Persona responsable de actuar en nombre de una persona moral, con sus datos de identificación y contacto requeridos.
- **Estudio**: Inquilino propietario de los clientes y límite de aislamiento de la información.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Un usuario autorizado puede completar el alta de una persona física o moral válida en menos de 3 minutos, sin asistencia externa.
- **SC-002**: El 100% de los clientes nuevos queda asociado a un único estudio y muestra exactamente uno de los dos tipos permitidos.
- **SC-003**: El 100% de los intentos de alta con campos obligatorios faltantes, tipo de CUIT o CUIT inválido, o CUIT duplicado recibe un mensaje accionable y no crea un cliente.
- **SC-004**: En una prueba con al menos 100 clientes mezclados y datos precargados, al menos el 95% de los usuarios de prueba puede identificar y filtrar cada tipo en menos de 10 segundos.
- **SC-005**: Ninguna consulta o acción de un estudio permite visualizar o modificar clientes pertenecientes a otro estudio.
- **SC-006**: Al menos el 95% de los usuarios de prueba completa correctamente el alta del tipo de cliente elegido en el primer intento.
- **SC-007**: El 100% de las operaciones sin autenticación, tenant válido o permiso suficiente se rechaza sin leer ni modificar datos de clientes.

## Assumptions

- Los roles y el contexto de estudio existentes en la plataforma se reutilizan; esta feature no redefine autenticación ni permisos globales.
- La jurisdicción fiscal de esta feature es Argentina; el identificador fiscal utilizado es el CUIT y la validación de regímenes adicionales queda fuera de alcance.
- Un cliente tiene un único tipo en un momento dado; no se modelan conversiones societarias como un caso fiscal independiente.
- La eliminación física de clientes queda fuera del alcance; el estado vigente de la plataforma se utiliza para desactivar registros cuando corresponda.
- Los campos de contacto y domicilio se consideran datos compartidos por ambos tipos, mientras que los atributos de identidad se mantienen separados.
- La interfaz debe incluir estados de carga, lista vacía, error recuperable y validación inline para cada formulario; los controles deben ser utilizables con teclado y sus mensajes deben estar asociados al campo correspondiente.
- Las ediciones usan control de concurrencia basado en la fecha de actualización del registro; una versión obsoleta se rechaza y no sobrescribe cambios posteriores.
