# Feature Specification: Navegación principal y bienvenida del frontend

**Feature Branch**: `main`

**Created**: 2026-10-31

**Status**: Draft

**Input**: Alinear el encabezado, agregar una pantalla de bienvenida y un menú lateral con acceso autorizado al estado de cuenta.

## Clarifications

### Session 2026-10-31

- Q: ¿De dónde debe obtenerse el nombre visible del cliente en el encabezado cuando no viene incluido en el token? → A: Resolverlo mediante backend usando `authorization.client_id`; el token solo identifica al cliente.
- Q: ¿Qué nombre debe utilizarse en el mensaje `Bienvenido <nombre>` cuando el usuario tiene alias y el cliente también tiene un nombre descriptivo? → A: Mostrar el nombre y apellido de la identidad autenticada.
- Q: Para un contador asociado a varios clientes del estudio, ¿qué nombre debe mostrar el encabezado a la izquierda? → A: Utilizar el campo `name` del cliente de Keycloak dentro del realm; no se utilizará el nombre de un cliente contable.

## User Scenarios & Testing

### User Story 1 - Encabezado alineado y cliente visible (Priority: P1)

Como usuario autenticado, quiero ver claramente el nombre del cliente de Keycloak y mis controles de cuenta para reconocer el contexto activo.

**Independent Test**: Iniciar sesión y comprobar que el nombre del cliente aparece a la izquierda del encabezado y que los controles actuales permanecen alineados a la derecha.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado asociado al cliente Keycloak activo, **When** carga cualquier pantalla principal, **Then** el encabezado muestra a la izquierda el valor `name` configurado para ese cliente dentro del realm.
2. **Given** el encabezado visible, **When** el usuario observa el extremo derecho, **Then** el alias, notificaciones y avatar permanecen agrupados y alineados a la derecha.
3. **Given** que el nombre del cliente no está disponible, **When** se renderiza el encabezado, **Then** se muestra un texto de contexto seguro y no se rompe la navegación.

### User Story 2 - Pantalla de bienvenida (Priority: P1)

Como usuario o cliente autenticado, quiero acceder a una pantalla inicial que me identifique y me permita comenzar la navegación.

**Independent Test**: Iniciar sesión y comprobar que la página inicial muestra el mensaje de bienvenida y el menú Inicio.

**Acceptance Scenarios**:

1. **Given** cualquier usuario o cliente autenticado, **When** accede a la aplicación, **Then** se muestra una pantalla de bienvenida con el texto `Bienvenido <nombre>`.
2. **Given** un usuario o cliente autenticado, **When** se construye el mensaje, **Then** se utiliza su nombre y apellido; si faltan datos, se utiliza un texto genérico seguro.
3. **Given** la pantalla de bienvenida, **When** el usuario selecciona `Inicio`, **Then** permanece o regresa a la pantalla de bienvenida sin solicitar permisos adicionales.

### User Story 3 - Menú lateral y estado de cuenta autorizado (Priority: P1)

Como usuario autorizado, quiero consultar el estado de cuenta desde un menú lateral; como usuario no autorizado, no quiero ver ni poder abrir esa opción.

**Independent Test**: Probar dos tokens, uno con `/home/client/services` y otro sin esa ruta, y comprobar la visibilidad y protección de la opción.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado cuyo token contiene `authorization.routes` con `/home/client/services`, **When** abre el menú lateral, **Then** ve el ítem `Estado de cuenta`.
2. **Given** un usuario autenticado cuyo token no contiene `/home/client/services`, **When** abre el menú lateral, **Then** no ve el ítem `Estado de cuenta`.
3. **Given** un usuario autorizado, **When** selecciona `Estado de cuenta`, **Then** se muestra la página existente de `Obligaciones` con su listado y estados.
4. **Given** un usuario no autorizado que intenta navegar directamente a la ruta del estado de cuenta, **When** se procesa la navegación, **Then** se deniega el acceso y se conserva la pantalla de bienvenida.
5. **Given** el menú lateral visible, **When** el usuario lo colapsa, **Then** se conserva el acceso mediante un control accesible y se ocultan las etiquetas sin perder el contexto de los íconos.

## Edge Cases

- Si el nombre del cliente contiene espacios o caracteres especiales, se muestra como texto seguro sin alterar el diseño.
- Si el token no contiene `authorization`, todas las opciones protegidas se ocultan y solo queda disponible `Inicio`.
- Si `routes` usa una variante sin barra inicial, debe normalizarse al formato `/home/client/services` antes de evaluarse.
- Si las obligaciones no pueden cargarse, la pantalla informa el error en español sin afectar la bienvenida ni el menú.
- El colapso del menú debe funcionar en pantallas estrechas y mediante teclado.
- La navegación no debe crear una segunda sesión ni modificar el token.

## Requirements

### Functional Requirements

- **FR-001**: El encabezado DEBE mostrar a la izquierda el nombre descriptivo del cliente resuelto por backend a partir de `authorization.client_id`.
- **FR-002**: El contenido de cuenta existente DEBE mantenerse alineado a la derecha del encabezado.
- **FR-003**: La aplicación DEBE mostrar una pantalla de bienvenida a todo usuario o cliente autenticado.
- **FR-004**: La bienvenida DEBE mostrar `Bienvenido <nombre y apellido>` usando la identidad autenticada; si faltan datos, debe usar un fallback seguro.
- **FR-005**: La aplicación DEBE mostrar un menú lateral izquierdo colapsable.
- **FR-006**: El menú DEBE mostrar `Inicio` para todo usuario autenticado.
- **FR-007**: El menú y la página `Estado de cuenta` DEBEN mostrarse únicamente cuando `authorization.routes` contenga `/home/client/services`.
- **FR-008**: `Estado de cuenta` DEBE abrir la página existente de `Obligaciones` sin duplicar su listado ni sus reglas de autorización.
- **FR-009**: La navegación directa a una pantalla protegida DEBE volver a denegarse si el permiso de ruta no está presente.
- **FR-010**: Las rutas DEBEN normalizar barras iniciales antes de compararse y no deben aceptar coincidencias parciales.
- **FR-011**: El menú colapsable DEBE ser accesible mediante teclado y conservar etiquetas accesibles para sus íconos.
- **FR-012**: Los errores de navegación o carga DEBEN mostrarse en español y no revelar tokens ni secretos.

### Key Entities

- **Contexto del cliente Keycloak**: Nombre visible configurado en el campo `name` del cliente activo dentro del realm.
- **Ruta autorizada**: Valor normalizado de `authorization.routes` usado para habilitar navegación.
- **Pantalla de bienvenida**: Vista inicial común para usuarios autenticados.
- **Estado de cuenta**: Vista existente de obligaciones y estados.

## Success Criteria

- **SC-001**: El 100% de los usuarios autenticados ve la pantalla de bienvenida y el ítem `Inicio`.
- **SC-002**: El 100% de los tokens con `/home/client/services` muestra `Estado de cuenta` y permite abrir obligaciones.
- **SC-003**: El 100% de los tokens sin `/home/client/services` oculta y bloquea `Estado de cuenta`.
- **SC-004**: El usuario puede colapsar y expandir el menú lateral en menos de 1 segundo sin navegación involuntaria.
- **SC-005**: El nombre del cliente aparece correctamente en el encabezado en el 100% de las sesiones con contexto de cliente válido.
- **SC-006**: Los errores de carga de obligaciones no impiden acceder a la bienvenida ni al menú.

## Assumptions

- El backend resolverá el nombre descriptivo usando el campo `name` del cliente Keycloak identificado por `authorization.client_id`; el frontend no consultará la API administrativa de Keycloak. Este nombre no representa al cliente contable del estudio.
- En el dominio funcional, un usuario es un contador del estudio y un cliente es un cliente del estudio; ambos se autentican mediante Keycloak, pero no se consideran sinónimos.
- La ruta funcional de bienvenida será `/home/welcome` y la de estado de cuenta será `/home/client/services`.
- La normalización de permisos existente seguirá siendo la fuente única para evaluar `authorization.routes`.
- La página de obligaciones actual se reutilizará sin modificar su modelo de datos.
- La autenticación OIDC existente continúa siendo obligatoria para todas las pantallas.
