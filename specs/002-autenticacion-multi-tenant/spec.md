# Feature Specification: Autenticación y autorización multi-tenant

**Feature Branch**: `002-autenticacion-multi-tenant`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "Agregar autenticación y autorización multi-tenant a la aplicación. Requisitos: login y logout mediante Keycloak/OIDC; roles CLIENT_VIEWER, ACCOUNTANT, STUDIO_ADMIN y SUPER_ADMIN; obtener tenant_id, roles y sub desde el JWT; proteger todos los endpoints del backend; aplicar autorización por rol; limitar a los contadores responsables a sus clientes asignados; mostrar u ocultar acciones en el frontend según el rol; renovar tokens expirados; mantener un modo demo explícito solo para desarrollo local; probar aislamiento entre tenants y escalamiento de privilegios."

## Clarifications

### Session 2026-10-30

- Q: ¿Qué alcance exacto debe tener cada rol sobre los datos y acciones de la aplicación? → A: `CLIENT_VIEWER` solo sus obligaciones, pagos y saldo; `ACCOUNTANT` clientes asignados y sus operaciones; `STUDIO_ADMIN` todo su tenant y configuración; `SUPER_ADMIN` administración global.
- Q: ¿Cómo debe comportarse la aplicación cuando no puede renovar un token expirado durante una operación activa? → A: Rechazar la operación, limpiar la sesión local y redirigir al login.
- Q: ¿Cómo debe habilitarse el modo demo para evitar que se active accidentalmente? → A: Puede habilitarse en cualquier entorno mediante una bandera de configuración.
- Q: ¿Cómo debe determinar la aplicación los permisos efectivos del usuario? → A: Mediante atributos `route` y `action` de los client-roles incluidos en el token, sin nombres de roles hardcodeados.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Iniciar y cerrar sesión de forma segura (Priority: P1)

Como usuario de la plataforma, quiero iniciar y cerrar sesión mediante el proveedor corporativo de identidad para acceder de forma segura y finalizar mi sesión cuando corresponda.

**Why this priority**: Sin una identidad verificable no es posible proteger datos contables ni aplicar permisos por estudio.

**Independent Test**: Puede probarse iniciando sesión con un usuario válido, comprobando que accede a la aplicación con su identidad y tenant, y cerrando sesión para verificar que deja de poder utilizar las áreas protegidas.

**Acceptance Scenarios**:

1. **Given** un usuario registrado y habilitado, **When** selecciona iniciar sesión e ingresa credenciales válidas, **Then** vuelve a la aplicación autenticado y puede acceder únicamente a las funciones permitidas para su rol y tenant.
2. **Given** un usuario autenticado, **When** selecciona cerrar sesión, **Then** la sesión local finaliza, los tokens dejan de utilizarse y al volver a una pantalla protegida se solicita autenticación.
3. **Given** credenciales inválidas o un usuario deshabilitado, **When** intenta iniciar sesión, **Then** no obtiene acceso y recibe un mensaje claro sin revelar información sensible.

### User Story 2 - Aplicar identidad, tenant y roles en cada operación (Priority: P1)

Como responsable de seguridad, quiero que cada operación del backend se ejecute con la identidad, tenant y roles extraídos de una credencial válida, para impedir accesos no autenticados o fuera del estudio correspondiente.

**Why this priority**: Una omisión en un endpoint podría exponer información financiera de un estudio a otro o permitir acciones no autorizadas.

**Independent Test**: Puede probarse llamando cada grupo de endpoints sin credencial, con una credencial inválida, con un tenant ausente o con un rol insuficiente, y verificando que todos rechazan la solicitud antes de ejecutar la operación.

**Acceptance Scenarios**:

1. **Given** un endpoint protegido, **When** se invoca sin credencial o con una credencial inválida, **Then** la solicitud es rechazada y no modifica ni revela datos.
2. **Given** una credencial válida con `sub` y `authorization.client_id`, **When** se procesa una solicitud, **Then** la operación queda vinculada a esa identidad y tenant, exponiendo internamente el tenant como `tenantId`/`tenant_id` sin aceptar esos valores desde parámetros manipulables por el cliente; si no hay roles o permisos efectivos, no se concede ningún acceso.
3. **Given** un token vencido, **When** el usuario tiene una sesión renovable válida, **Then** la aplicación obtiene una credencial vigente y reintenta la operación de forma transparente; si no puede renovarla, solicita iniciar sesión nuevamente.

### User Story 3 - Restringir acciones según rol y cartera (Priority: P1)

Como usuario del estudio, quiero ver y ejecutar solo las acciones que corresponden a mi rol y, si soy contador responsable, solo trabajar con los clientes asignados a mi cartera.

**Why this priority**: El control de permisos debe ser comprensible para el usuario y coherente entre la interfaz y el backend.

**Independent Test**: Puede probarse con usuarios de cada rol sobre un mismo tenant y con contadores que tengan carteras diferentes, verificando tanto los controles visibles como el resultado de intentar acciones no permitidas.

**Acceptance Scenarios**:

1. **Given** un usuario con rol `CLIENT_VIEWER`, **When** navega por la aplicación, **Then** solo ve sus operaciones de cliente y las acciones habilitadas para informar pagos o consultar su información.
2. **Given** un usuario con rol `ACCOUNTANT`, **When** consulta o modifica clientes y operaciones, **Then** solo puede acceder a los clientes asignados a su cartera.
3. **Given** un usuario con rol `STUDIO_ADMIN`, **When** administra su estudio, **Then** puede gestionar la información y configuración de su tenant, pero no administrar tenants de otros estudios.
4. **Given** un usuario con rol `SUPER_ADMIN`, **When** realiza una operación global autorizada, **Then** puede operar sobre el ámbito global definido para la plataforma, con auditoría de la acción.
5. **Given** un usuario sin permiso para una acción, **When** intenta ejecutarla mediante la interfaz o directamente contra el backend, **Then** la interfaz no ofrece la acción y el backend la rechaza igualmente.

### User Story 4 - Usar un modo demo controlado en desarrollo (Priority: P2)

Como desarrollador, quiero poder ejecutar la aplicación con identidades demo explícitas para probar flujos sin un proveedor externo, sin que ese mecanismo pueda activarse accidentalmente.

**Why this priority**: Facilita las pruebas controladas, pero no debe activarse accidentalmente cuando no existe autorización operativa explícita.

**Independent Test**: Puede probarse activando el modo demo mediante la bandera explícita y verificando su funcionamiento, y luego intentando usarlo sin esa configuración.

**Acceptance Scenarios**:

1. **Given** un entorno con la bandera explícita de demo activa, **When** el desarrollador selecciona una identidad demo disponible, **Then** puede probar los roles y tenants documentados.
2. **Given** un entorno sin la bandera explícita de demo activa, **When** se intenta habilitar el modo demo o enviar una identidad demo, **Then** la aplicación lo rechaza y exige autenticación real.
3. **Given** el modo demo activo, **When** se ejecuta una prueba, **Then** la interfaz identifica claramente que se trata de una sesión demo.

### Edge Cases

- Un token válido pero sin `sub` o `authorization.client_id` debe rechazarse como credencial incompleta. La ausencia de roles o permisos efectivos no invalida la credencial, pero produce denegación por defecto para toda operación protegida.
- Un token cuyo `authorization.client_id` no tiene un `Tenant.clientId` activo o no coincide con el recurso solicitado debe rechazarse sin filtrar si el recurso existe.
- Un usuario con múltiples roles debe recibir la unión de permisos explícitamente definidos, sin que un rol de menor alcance eleve sus privilegios.
- Cada ruta debe declararse explícitamente; una ruta padre no concede acceso automático a rutas hijas.
- Un permiso `route` o `action` desconocido debe registrar una advertencia y denegar solo esa operación, sin invalidar el resto del contexto.
- Un contador sin clientes asignados debe poder autenticarse, pero no debe ver ni modificar clientes u operaciones de cartera.
- Una sesión abierta en varias pestañas debe manejar una renovación o cierre de sesión coherente y no reutilizar tokens inválidos.
- Los fallos del proveedor de identidad no deben convertirse en acceso anónimo ni en activación automática del modo demo.

### Resolved authorization rules

- Cada operación protegida declara exactamente un permiso requerido: un `route` para navegación o un `action` para la operación. No se combinan permisos con reglas AND/OR en esta versión.
- Las rutas son cadenas absolutas con `/` inicial, por ejemplo `/home/customers`. Las acciones son nombres declarativos sin `/` inicial, por ejemplo `view/customers/all`.
- Una ruta padre no concede acceso a rutas hijas. Toda ruta se declara explícitamente.
- Los valores vacíos, malformados o duplicados se descartan o deduplican durante la normalización. Un `route` o `action` desconocido registra una advertencia y deniega únicamente esa operación.
- La ausencia de permisos no invalida la identidad, pero produce denegación por defecto.
- `authorization.client_id` se resuelve mediante `Tenant.clientId`; solo el UUID de `Tenant.id` se utiliza en RLS, consultas y casos de uso.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema DEBE permitir iniciar y cerrar sesión usando el proveedor de identidad configurado mediante OIDC.
- **FR-002**: Keycloak DEBE definir los roles de negocio como client-roles y sus atributos DEBEN expresar permisos efectivos mediante claves como `route` y `action`; los nombres `CLIENT_VIEWER`, `ACCOUNTANT`, `STUDIO_ADMIN` y `SUPER_ADMIN` pueden utilizarse como convenciones de configuración.
- **FR-003**: El sistema DEBE validar la autenticidad, vigencia e integridad de la credencial antes de procesar cualquier endpoint protegido.
- **FR-004**: El sistema DEBE obtener de la credencial validada el identificador de usuario (`sub`) y el identificador externo del tenant (`authorization.client_id`). DEBE resolver ese valor contra `Tenant.clientId` y exponer a la lógica de negocio únicamente el UUID interno `Tenant.id` como `tenantId`/`tenant_id`. Los roles y permisos efectivos PUEDEN estar ausentes; cuando no existan, el sistema DEBE denegar por defecto toda operación protegida. Solo DEBE rechazar la credencial por contexto mínimo faltante cuando no contenga `sub` o `authorization.client_id`.
- **FR-005**: Todos los endpoints de negocio del backend DEBEN estar protegidos por autenticación; los únicos endpoints públicos permitidos DEBEN limitarse a salud, disponibilidad y los flujos explícitamente necesarios para iniciar autenticación.
- **FR-006**: El sistema DEBE aplicar autorización por atributos de permiso en el backend para cada operación protegida y DEBE rechazar cualquier acción cuyo `route` o `action` requerido no esté presente en el contexto autorizado del usuario.
- **FR-007**: El sistema DEBE asociar cada lectura, creación, modificación y eliminación lógica al tenant autenticado, sin confiar en un `tenant_id` enviado libremente por el cliente.
- **FR-008**: El sistema DEBE impedir que un usuario autenticado acceda o modifique datos pertenecientes a otro tenant, incluso si conoce identificadores válidos del recurso.
- **FR-009**: El sistema DEBE limitar a los usuarios `ACCOUNTANT` a los clientes asignados a su cartera, tanto en listados como en consultas, altas, modificaciones, pagos, reclamos y reportes relacionados.
- **FR-010**: El sistema DEBE permitir a `STUDIO_ADMIN` consultar y administrar todos los clientes, obligaciones, pagos, reportes y configuración de su propio tenant, y DEBE reservar las operaciones globales para `SUPER_ADMIN`.
- **FR-011**: La interfaz DEBE mostrar u ocultar menús, páginas y acciones según los atributos de permiso `route` y `action` del usuario, sin tratar esa visibilidad como sustituto de la autorización del backend.
- **FR-018**: Un custom mapper de Keycloak DEBE incluir en el token `authorization.client_id`, `authorization.routes` y `authorization.actions`, derivados de los atributos de los client-roles asociados al usuario, y el backend y frontend DEBEN consumir ese conjunto normalizado de permisos.
- **FR-019**: Esta política de permisos declarativos es obligatoria en backend y frontend: ninguna condición de autorización DEBE comparar nombres de roles hardcodeados; todas DEBEN evaluar permisos normalizados y rutas/acciones requeridas.
- **FR-020**: Los permisos de alcance de cartera, como `view/customers/all` y `view/customers/own`, DEBEN distinguir entre acceso global al tenant y acceso limitado a relaciones asignadas, aplicándose además las restricciones de tenant.
- **FR-012**: La aplicación DEBE renovar credenciales vencidas cuando exista una sesión renovable válida; ante una renovación fallida DEBE rechazar la operación activa, limpiar la sesión local, cerrar el contexto protegido y redirigir al inicio de sesión.
- **FR-013**: El modo demo DEBE requerir una bandera de configuración explícita, DEBE poder habilitarse en cualquier entorno únicamente cuando esa bandera esté activa y DEBE mostrar una identificación visible de sesión demo.
- **FR-014**: El sistema DEBE rechazar el modo demo y cualquier credencial demo cuando la bandera explícita no esté activa.
- **FR-015**: El sistema DEBE registrar los eventos de autenticación, cierre de sesión, rechazo por credencial inválida, denegación por permiso, intento de acceso cross-tenant y uso del modo demo, incluyendo usuario, tenant cuando esté disponible y fecha/hora.
- **FR-016**: Los mensajes de error visibles para el usuario DEBEN estar redactados en español y no DEBEN revelar datos sobre recursos o tenants a los que no tiene acceso.
- **FR-017**: La configuración de identidad DEBE permitir un realm compartido para la plataforma y clientes OIDC asociados a tenants, manteniendo el tenant de negocio como contexto de autorización y no como un permiso implícito del cliente OIDC.

### Key Entities

- **Identidad autenticada**: Usuario representado por `sub`, con roles y pertenencia a un tenant.
- **Tenant**: Estudio contable que delimita los datos y permisos de negocio de sus usuarios.
- **Rol de Keycloak**: Client-role configurado en Keycloak cuyos atributos declaran permisos efectivos; su nombre no es una condición de autorización en la aplicación.
- **Permiso**: Atributo normalizado de un rol, expresado como `route` para acceso a pantallas o `action` para operaciones.
- **Asignación de cartera**: Relación entre un contador responsable y los clientes que puede consultar y gestionar.
- **Sesión demo**: Contexto de autenticación explícitamente habilitado mediante configuración y claramente identificado en la interfaz.
- **Evento de seguridad**: Registro de autenticación, autorización o intento de acceso relevante para auditoría.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de los endpoints de negocio rechaza solicitudes sin credencial válida o con contexto de tenant incompleto.
- **SC-002**: El 100% de los intentos de lectura o modificación cross-tenant y de escalamiento de privilegios son rechazados y auditados durante las pruebas de seguridad.
- **SC-003**: En una prueba de aceptación con al menos 20 inicios de sesión válidos consecutivos, realizada con los servicios levantados en el entorno de validación y condiciones normales de red, al menos el 95% de los usuarios llega a su pantalla autorizada en menos de 30 segundos desde el inicio de la autenticación.
- **SC-004**: En una prueba de aceptación con al menos 20 renovaciones de sesión válidas, al menos el 95% se completa sin repetir el inicio de sesión, perder la navegación actual ni fallar la operación protegida en curso.
- **SC-005**: En pruebas con los cuatro roles, la interfaz oculta el 100% de las acciones fuera del rol y el backend rechaza el 100% de los intentos directos equivalentes.
- **SC-006**: En pruebas con contadores de carteras distintas, el 100% de los listados, detalles, mutaciones y reportes excluye clientes no asignados.
- **SC-007**: El modo demo funciona cuando está explícitamente habilitado mediante configuración y el 100% de los intentos de usarlo sin esa habilitación es rechazado.
- **SC-008**: Los usuarios reciben mensajes de autorización claros en español y no se filtra información sobre recursos de otros tenants en ningún flujo probado.

## Assumptions

- Keycloak es el proveedor de identidad existente y la plataforma utiliza un realm compartido `saas-contable`, con clientes OIDC por tenant según la configuración definida por el proyecto.
- Los usuarios, tenants, client-roles, atributos de permisos y asignaciones de cartera se gestionan o sincronizan fuera de esta especificación; esta funcionalidad consume ese contexto de identidad y lo aplica a las operaciones.
- La autorización se basa exclusivamente en permisos normalizados desde atributos de client-roles (`route` y `action`); los nombres de roles son metadatos de administración y no una API interna de permisos.
- El JWT validado por Keycloak es la fuente confiable del `sub` y `authorization.client_id`. Los roles se conservan solo como metadatos de auditoría y pueden estar ausentes. `authorization.client_id` es la clave externa canónica; el backend la resuelve contra `Tenant.clientId` y expone internamente el UUID de `Tenant.id` como `tenantId`/`tenant_id`.
- Las reglas de permisos no especificadas se resuelven mediante mínimo privilegio: se deniega el acceso por defecto.
- Los endpoints de salud y disponibilidad pueden ser públicos únicamente si no exponen datos de negocio ni información sensible.
- Una renovación fallida no debe reintentar la operación protegida ni conservar una sesión local utilizable.
- El soporte para múltiples tenants simultáneos en una misma sesión no forma parte de esta versión; una sesión activa opera sobre el tenant indicado por su credencial.
- La recuperación de contraseña, el registro de usuarios y la administración completa de Keycloak quedan fuera de alcance.
- La aplicación debe conservar la localización en español definida por el proyecto.
- El versionado o compatibilidad entre nombres antiguos y nuevos de permisos queda fuera de alcance en esta versión.
- El modo demo puede habilitarse en producción únicamente mediante la bandera explícita de configuración.
