# Feature Specification: Gestión de clientes y contadores del estudio

**Feature Branch**: `main`

**Created**: 2026-10-31

**Status**: Draft

**Input**: Crear pantallas CRUD para clientes y contadores del estudio identificados por el atributo `type` de Keycloak.

## Clarifications

### Session 2026-10-31

- Q: ¿La presencia de las rutas de clientes y contadores habilita también todas las operaciones CRUD? → A: Las rutas solo habilitan el acceso a las pantallas; crear, editar, actualizar y eliminar requieren acciones separadas.
- Q: ¿Cuál debe ser la diferencia funcional entre las acciones `edit` y `update`? → A: `edit` habilita abrir/modificar el formulario y `update` habilita guardar; ambas son necesarias para completar la modificación.
- Q: ¿Qué debe ocurrir cuando existe `edit` pero falta `update`? → A: Se permite abrir el modal, pero los campos y el botón de actualización quedan grisados y en modo solo lectura; aplica de forma análoga a clientes y contadores.
- Q: ¿Cómo se asocia una identidad administrada con el tenant? → A: Mediante el atributo Keycloak `client_id`, cuyo valor coincide con `authorization.client_id` (por ejemplo, `client_id=guido`).

## User Scenarios & Testing

### User Story 1 - Listar clientes del estudio (Priority: P1)

Como contador autorizado, quiero consultar los clientes del estudio para administrar sus datos desde una pantalla dedicada.

**Why this priority**: La gestión de clientes es una operación central del estudio y requiere acceso controlado.

**Independent Test**: Iniciar sesión con un token que contenga `/home/client/list`, abrir `Clientes del estudio` y verificar que se muestran únicamente identidades cuyo `type` es `client`.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado cuyo token contiene `authorization.routes` con `/home/client/list`, **When** observa el menú, **Then** ve la opción `Clientes del estudio`.
2. **Given** un usuario autorizado, **When** abre `Clientes del estudio`, **Then** la pantalla lista nombre, apellido, alias, email y estado de cada identidad con `type=client`.
3. **Given** un usuario cuyo token no contiene `/home/client/list`, **When** carga la aplicación o intenta acceder directamente a la ruta, **Then** no ve la opción y el acceso es denegado.

### User Story 2 - Administrar clientes del estudio (Priority: P1)

Como contador autorizado, quiero crear, editar y eliminar clientes del estudio para mantener actualizada la información de las personas que atiende el estudio.

**Why this priority**: Sin operaciones de mantenimiento, el listado no permite administrar el padrón real del estudio.

**Independent Test**: Desde la pantalla autorizada, ejecutar crear, editar y eliminar sobre un cliente y comprobar que cada cambio persiste y se refleja en el listado.

**Acceptance Scenarios**:

1. **Given** un usuario con `/client/add` y acceso a la pantalla, **When** crea un cliente con datos válidos, **Then** el sistema crea una identidad Keycloak con `type=client` y la muestra en el listado.
2. **Given** un cliente existente y un usuario con `/client/edit`, **When** abre el modal, **Then** puede visualizar el formulario; si además tiene `/client/update`, los campos y el botón permiten guardar cambios, y si no la tiene, permanecen grisados y en solo lectura.
3. **Given** un cliente existente y un usuario con `/client/delete`, **When** el usuario confirma su eliminación, **Then** la identidad deja de aparecer y no puede autenticarse.
4. **Given** datos inválidos o incompletos, **When** se guarda el formulario, **Then** se informa el error en español y no se persiste el cambio.

### User Story 3 - Listar y administrar contadores del estudio (Priority: P1)

Como administrador autorizado, quiero consultar y administrar los contadores del estudio para controlar quién puede operar en la aplicación.

**Why this priority**: Los contadores son las identidades operativas del estudio y requieren el mismo ciclo de vida que los clientes.

**Independent Test**: Iniciar sesión con un token que contenga `/home/users/list`, abrir `Contadores del estudio` y verificar listado y CRUD exclusivamente sobre identidades `type=user`.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado cuyo token contiene `authorization.routes` con `/home/users/list`, **When** observa el menú, **Then** ve la opción `Contadores del estudio`.
2. **Given** un usuario autorizado, **When** abre `Contadores del estudio`, **Then** la pantalla lista únicamente identidades con `type=user`.
3. **Given** un usuario con `/user/edit`, **When** abre el modal de un contador, **Then** puede visualizar el formulario; si además tiene `/user/update`, los campos y el botón permiten guardar cambios, y si no la tiene, permanecen grisados y en solo lectura.
4. **Given** un usuario cuyo token no contiene `/home/users/list`, **When** intenta acceder a la pantalla, **Then** no ve la opción y el acceso es denegado.

## Edge Cases

- Si el token no contiene `authorization`, ambas opciones se ocultan y solo permanecen las rutas públicas para identidades autenticadas.
- Si una ruta llega sin barra inicial, se normaliza antes de evaluar el permiso; no se aceptan coincidencias parciales.
- Si una identidad no tiene `type`, no se incluye en ninguno de los listados administrables.
- Si el `type` no es exactamente `client` o `user`, no se incluye y se registra una advertencia sin bloquear el otro listado.
- Si Keycloak no está disponible, la pantalla muestra un error en español y no presenta datos parciales como si fueran definitivos.
- Un contador no puede eliminarse a sí mismo ni eliminar al último administrador activo sin una confirmación y validación de seguridad.
- Las operaciones destructivas requieren confirmación explícita.
- Los formularios no deben mostrar ni permitir editar contraseñas; la administración de credenciales queda en el flujo existente de Keycloak.

## Requirements

### Functional Requirements

- **FR-001**: El sistema DEBE interpretar el claim `type` de la identidad Keycloak con los valores exactos `client` y `user`.
- **FR-002**: El menú DEBE mostrar `Clientes del estudio` únicamente cuando `authorization.routes` contenga `/home/client/list`.
- **FR-003**: El menú DEBE mostrar `Contadores del estudio` únicamente cuando `authorization.routes` contenga `/home/users/list`.
- **FR-004**: El acceso directo a cada pantalla DEBE volver a validar su ruta autorizada y denegar el acceso cuando falte el permiso.
- **FR-005**: La pantalla de clientes DEBE listar únicamente identidades cuyo `type` sea `client`.
- **FR-006**: La pantalla de contadores DEBE listar únicamente identidades cuyo `type` sea `user`.
- **FR-007**: Cada listado DEBE mostrar como mínimo nombre, apellido, alias, email y estado de la identidad.
- **FR-008**: La acción `/client/add` DEBE autorizar la creación de clientes y `/user/add` DEBE autorizar la creación de contadores.
- **FR-009**: `/client/edit` y `/user/edit` DEBEN habilitar respectivamente la apertura del modal de edición. `/client/update` y `/user/update` DEBEN habilitar respectivamente la modificación y el guardado. Cuando exista `edit` pero falte `update`, los campos y el botón de actualización DEBEN permanecer visibles, grisados y en modo solo lectura/deshabilitado.
- **FR-010**: Las acciones `/client/delete` y `/user/delete` DEBEN autorizar respectivamente la eliminación de clientes y contadores, siempre después de una confirmación explícita.
- **FR-011**: La ausencia de una acción CRUD DEBE ocultar o deshabilitar únicamente esa operación, sin bloquear el acceso autorizado a la pantalla ni a las demás operaciones permitidas.
- **FR-012**: El sistema DEBE impedir que una operación de clientes modifique una identidad `user` y viceversa.
- **FR-013**: El sistema DEBE validar nombre, apellido, alias y email antes de persistirlos.
- **FR-014**: Los mensajes de carga, validación, error, vacío y confirmación DEBEN estar en español.
- **FR-015**: El sistema DEBE mantener aislamiento por tenant y no permitir administrar identidades de otro cliente Keycloak.
- **FR-015a**: Cada identidad administrable DEBE tener el atributo Keycloak `client_id`; su valor DEBE coincidir exactamente con `authorization.client_id` del operador autenticado.
- **FR-016**: Las operaciones DEBEN ejecutarse mediante la autenticación existente y no crear una segunda sesión.
- **FR-017**: Las acciones de creación, modificación y eliminación DEBEN registrar identidad afectada, tenant, usuario operador y resultado.

### Key Entities

- **Identidad administrable**: Usuario de Keycloak perteneciente al tenant activo, con `type`, nombre, apellido, alias, email, estado e identificador.
- **Tipo de identidad**: Clasificación exacta `client` para clientes del estudio o `user` para contadores del estudio.
- **Ruta autorizada**: Permiso de navegación que habilita la pantalla correspondiente.

## Success Criteria

### Measurable Outcomes

- **SC-001**: El 100% de los tokens con `/home/client/list` muestra y permite abrir la pantalla de clientes, y el 100% de los tokens sin esa ruta no la muestra ni permite abrirla.
- **SC-002**: El 100% de los tokens con `/home/users/list` muestra y permite abrir la pantalla de contadores, y el 100% de los tokens sin esa ruta no la muestra ni permite abrirla.
- **SC-003**: El 100% de los registros mostrados en cada pantalla pertenece al tipo correspondiente, sin cruces entre clientes y contadores.
- **SC-004**: Un usuario autorizado puede completar una operación de creación o edición en menos de 2 minutos cuando dispone de datos válidos.
- **SC-005**: El 100% de las eliminaciones requiere confirmación explícita y deja de mostrar la identidad eliminada en el listado actualizado.
- **SC-006**: El 100% de los errores de validación o indisponibilidad se comunica en español sin exponer tokens, contraseñas ni secretos.

## Assumptions

- Keycloak es la fuente autorizada de las identidades, sus atributos y su estado.
- El atributo `type` estará configurado en el perfil de usuario de Keycloak y se incluirá en los claims cuando corresponda.
- Las operaciones CRUD se aplicarán solamente dentro del tenant identificado por el cliente Keycloak del token autenticado.
- La contraseña no forma parte del CRUD de esta versión y continuará administrándose mediante Keycloak.
- La interfaz reutilizará el layout, navegación y patrones visuales existentes del frontend.
- Las rutas funcionales serán `/home/client/list` y `/home/users/list`.
