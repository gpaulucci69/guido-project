# Feature Specification: Encabezado y validación de sesión

**Feature Branch**: `009-encabezado-sesion`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "reduce la altura del encabezado central. Cambia el orden de los elementos en el encabezado colocando el alias primero, luego el ícono de notificación y finalmente el avatar. Valida la sesión con cada acción que se ejecuta o refresco de pantalla y si el token no es válido, refrescarlo y si la sesión ya no es válida, enviar un mensaje 'Su sesión ha expirado, por favor, vuelva a autenticarse para validar su identidad'"

## Clarifications

### Session 2026-11-13

- Q: ¿El mensaje de sesión expirada debe mostrarse como un diálogo modal bloqueante con un único botón “Aceptar” y redirigir al login únicamente después de pulsarlo? → A: Sí; usar un diálogo modal bloqueante con un único botón “Aceptar” y redirigir al login después de pulsarlo.
- Q: ¿Con cuánta anticipación al vencimiento del access token debe intentarse la renovación preventiva? → A: 30 segundos; el cliente renueva cuando restan 30 segundos o menos y también cuando el token ya venció.

## Keycloak Session Policy

La gestión de la sesión debe respetar la política configurada para el realm `saas-contable` y el cliente OIDC público `guido`:

| Configuración | Valor | Aplicación funcional |
| --- | ---: | --- |
| `accessTokenLifespan` del realm | 300 segundos (5 minutos) | El access token debe considerarse vencido al superar este plazo, según sus claims de emisión y expiración. |
| `ssoSessionIdleTimeout` del realm | 1800 segundos (30 minutos) | La sesión puede dejar de renovarse tras 30 minutos sin actividad. |
| `ssoSessionMaxLifespan` del realm | 36000 segundos (10 horas) | La sesión no puede extenderse más allá de 10 horas desde su inicio. |
| `revokeRefreshToken` del realm | `false` | La renovación no se trata como una revocación global del refresh token por configuración del realm. |
| `refreshTokenMaxReuse` del realm | `0` | No se permite reutilizar un refresh token cuando Keycloak lo considere consumido o inválido. |
| `clientSessionIdleTimeout` del realm | `0` | No hay un límite de inactividad específico por cliente; se aplican los límites SSO del realm. |
| `clientSessionMaxLifespan` del realm | `0` | No hay una duración máxima específica por cliente; se aplica la duración máxima SSO del realm. |
| `use.refresh.tokens` del cliente `guido` | `true` | El cliente utiliza refresh tokens para obtener nuevos access tokens. |
| `publicClient` del cliente `guido` | `true` | El cliente no debe manejar secretos confidenciales para renovar la sesión. |

Los valores anteriores son la referencia de comportamiento para esta funcionalidad. Si se modifican en Keycloak, la aplicación debe respetar los nuevos valores entregados por los tokens y por la respuesta de renovación; no debe reemplazarlos con una duración fija propia.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Reordenar y compactar el encabezado (Priority: P1)

Como usuario autenticado, quiero un encabezado central más compacto y con la información ordenada de forma natural para identificar rápidamente mi alias, mis notificaciones y mi perfil.

**Why this priority**: Es el cambio visual principal y afecta la experiencia de uso en todas las pantallas autenticadas.

**Independent Test**: Abrir cualquier pantalla autenticada y comprobar visualmente que el encabezado tiene menor altura y que los elementos aparecen en el orden alias, notificaciones y avatar.

**Acceptance Scenarios**:

1. **Given** una pantalla autenticada con encabezado visible, **When** se carga la pantalla, **Then** el encabezado ocupa menos altura que la versión actual sin ocultar ni superponer sus elementos.
2. **Given** el encabezado visible, **When** el usuario lo inspecciona de izquierda a derecha, **Then** encuentra primero el alias, luego el ícono de notificaciones y finalmente el avatar.
3. **Given** una ventana con un ancho compatible con la aplicación, **When** se muestra el encabezado, **Then** los tres elementos siguen siendo identificables y utilizables.

---

### User Story 2 - Validar sesión antes de operar (Priority: P1)

Como usuario autenticado, quiero que la aplicación valide mi sesión antes de cada acción y cada refresco para evitar ejecutar operaciones con credenciales vencidas.

**Why this priority**: Protege las operaciones autenticadas y evita que la interfaz muestre un estado que ya no representa una identidad válida.

**Independent Test**: Ejecutar una acción y refrescar una pantalla usando un token vigente, vencido o inválido, y comprobar que la aplicación renueva o rechaza la sesión según corresponda antes de continuar.

**Acceptance Scenarios**:

1. **Given** una sesión válida, **When** el usuario ejecuta una acción o refresca la pantalla, **Then** la aplicación valida la sesión y permite continuar sin interrumpir el flujo.
2. **Given** un token vencido pero una sesión renovable, **When** el usuario ejecuta una acción o refresca la pantalla, **Then** la aplicación intenta refrescar el token y repite la validación antes de continuar.
3. **Given** un token inválido o una sesión que no puede renovarse, **When** el usuario ejecuta una acción o refresca la pantalla, **Then** la aplicación no ejecuta la acción protegida ni muestra contenido autenticado adicional.
4. **Given** un access token próximo a vencer, **When** el usuario ejecuta una acción o refresca la pantalla, **Then** la aplicación evalúa su expiración declarada y renueva el token antes de continuar si todavía existe una sesión Keycloak renovable.

---

### User Story 3 - Informar la expiración de sesión (Priority: P1)

Como usuario cuya sesión dejó de ser válida, quiero recibir un mensaje claro que explique que debo volver a autenticarme para continuar.

**Why this priority**: Permite recuperar el acceso sin ambigüedad y comunica explícitamente el motivo del bloqueo.

**Independent Test**: Invalidar la sesión y ejecutar una acción o refrescar la pantalla; comprobar que aparece exactamente el mensaje requerido y que se ofrece el flujo de autenticación nuevamente.

**Acceptance Scenarios**:

1. **Given** una sesión no renovable, **When** la aplicación termina la validación, **Then** muestra un diálogo modal bloqueante con exactamente: `Su sesión ha expirado, por favor, vuelva a autenticarse para validar su identidad` y un único botón “Aceptar”.
2. **Given** que se muestra el diálogo modal de expiración, **When** el usuario pulsa “Aceptar”, **Then** la aplicación dirige al usuario a la pantalla de login sin ejecutar la operación protegida.
3. **Given** que varias acciones detectan simultáneamente una sesión inválida, **When** la aplicación procesa los resultados, **Then** muestra un único estado de expiración y evita mensajes o redirecciones duplicados.

### Edge Cases

- Si el refresco del token falla por falta de conectividad, la sesión se considera no renovable y se muestra el mensaje de expiración sin ejecutar la acción protegida.
- Si una acción ya está en curso cuando vence el token, la aplicación debe validar antes de enviarla o revalidar la respuesta de autenticación antes de aceptar el resultado.
- Si el usuario refresca repetidamente durante una renovación, las solicitudes concurrentes deben reutilizar el mismo intento de renovación y no generar múltiples flujos de autenticación.
- Si el access token vence a los 5 minutos, la aplicación no debe asumir que la sesión terminó: debe intentar usar el refresh token mientras la sesión SSO siga dentro de su tiempo de inactividad y de su duración máxima.
- Si se alcanza el límite de inactividad de 30 minutos o la duración máxima de 10 horas, la renovación debe tratarse como imposible y debe iniciar el flujo de expiración definido.
- Si Keycloak devuelve un refresh token nuevo, la aplicación debe reemplazar el anterior y no reutilizar un refresh token que Keycloak haya invalidado o marcado como no reutilizable.
- Si los tiempos configurados en Keycloak cambian, la aplicación debe basar la decisión en la expiración del token y en la respuesta del endpoint de renovación, sin imponer los valores de desarrollo como constantes de negocio.
- Si el alias, el ícono de notificaciones o el avatar no tienen datos disponibles, el encabezado conserva el orden y muestra un estado visual neutro sin romper el layout.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema MUST reducir al menos un 20% la altura renderizada del encabezado central respecto de la versión vigente, manteniendo legibles y utilizables sus elementos.
- **FR-002**: El sistema MUST presentar los elementos del encabezado, de izquierda a derecha, en este orden: alias, ícono de notificaciones y avatar.
- **FR-003**: El sistema MUST validar la vigencia de la sesión antes de ejecutar cada acción autenticada.
- **FR-004**: El sistema MUST validar la vigencia de la sesión antes de completar cada refresco de pantalla autenticada.
- **FR-005**: Cuando el token no sea válido pero la sesión pueda renovarse, el sistema MUST intentar renovar el token antes de ejecutar la acción o completar el refresco.
- **FR-006**: El sistema MUST reintentar la operación pendiente una sola vez después de una renovación exitosa del token.
- **FR-007**: Cuando la renovación no sea posible, el sistema MUST impedir la acción protegida y el acceso a contenido autenticado adicional.
- **FR-008**: Cuando la sesión ya no sea válida, el sistema MUST mostrar exactamente el mensaje `Su sesión ha expirado, por favor, vuelva a autenticarse para validar su identidad`.
- **FR-009**: El sistema MUST mostrar el mensaje de expiración como un diálogo modal bloqueante con un único botón “Aceptar”.
- **FR-010**: Después de que el usuario acepte el mensaje de expiración, el sistema MUST dirigirlo a la pantalla de login.
- **FR-011**: El sistema MUST limpiar o invalidar el estado local de autenticación antes de mostrar la pantalla de login.
- **FR-012**: El sistema MUST evitar que el usuario vuelva a la pantalla protegida mediante el historial del navegador sin autenticarse nuevamente.
- **FR-013**: El sistema MUST evitar duplicar renovaciones, mensajes o redirecciones cuando varias acciones detecten simultáneamente la misma sesión inválida.
- **FR-014**: El sistema MUST mantener el orden del encabezado y un estado visual usable cuando falte el alias, la información de notificaciones o el avatar.
- **FR-015**: El sistema MUST conservar la separación entre autenticación y autorización: renovar una sesión válida no concede permisos que no estén presentes en la identidad autenticada.
- **FR-016**: El sistema MUST interpretar la expiración del access token usando los valores efectivos emitidos por Keycloak (`exp`/`expires_at`). Los 300 segundos configurados actualmente en el realm `saas-contable` se consideran únicamente el valor de referencia vigente y no deben hardcodearse como política independiente de la aplicación.
- **FR-017**: El sistema MUST intentar la renovación mediante el refresh token cuando el access token esté vencido o cuando le resten 30 segundos o menos de validez, siempre que la sesión Keycloak todavía pueda renovarse.
- **FR-018**: El sistema MUST respetar el límite de inactividad SSO de 1800 segundos y el límite máximo SSO de 36000 segundos configurados para el realm actual; alcanzado cualquiera de ellos, debe tratar la sesión como no renovable.
- **FR-019**: El sistema MUST usar la capacidad de renovación habilitada para el cliente `guido` y aceptar el refresh token emitido por Keycloak como reemplazo del anterior cuando corresponda.
- **FR-020**: El sistema MUST tratar como fallida la renovación cuando Keycloak rechace el refresh token por expiración, revocación, reutilización no permitida, sesión inexistente o cualquier otra respuesta de autenticación inválida.
- **FR-021**: El sistema MUST ejecutar como máximo un intento concurrente de renovación por sesión y compartir su resultado con las acciones o refrescos que estén esperando.
- **FR-022**: El sistema MUST aplicar los tiempos efectivos recibidos de Keycloak cuando la configuración del realm o del cliente cambie, sin mantener una política paralela incompatible.
- **FR-023**: El diálogo modal de expiración MUST mantener el foco dentro del diálogo mientras esté abierto, ofrecer un nombre accesible para el mensaje y permitir activar “Aceptar” mediante teclado.
- **FR-024**: El sistema MUST conservar el orden alias → notificaciones → avatar y reducir al menos un 20% la altura del encabezado en los anchos de pantalla soportados, sin solapamientos ni controles inaccesibles.

### Key Entities

- **Sesión autenticada**: Estado de autenticación del usuario, incluyendo la vigencia del token, la posibilidad de renovación y el estado de expiración.
- **Acción autenticada**: Operación o interacción que requiere una sesión válida antes de ejecutarse.
- **Encabezado central**: Área de interfaz que presenta alias, notificaciones y avatar en el orden definido.
- **Aviso de expiración**: Mensaje visible que informa que el usuario debe volver a autenticarse.
- **Política de sesión Keycloak**: Conjunto de límites del realm y del cliente que determina la vida útil del access token, la inactividad SSO, la duración máxima de la sesión y la posibilidad de renovarla.
- **Refresh token**: Credencial temporal usada por el cliente `guido` para solicitar a Keycloak un nuevo access token mientras la sesión siga siendo válida.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: En el 100% de las pantallas autenticadas revisadas, el encabezado presenta alias, notificaciones y avatar en ese orden.
- **SC-002**: La altura renderizada del encabezado se reduce al menos un 20% respecto de la versión vigente sin pérdida de legibilidad, superposición ni controles inaccesibles.
- **SC-003**: El 100% de las acciones autenticadas y refrescos de pantalla ejecutados con token vencido intentan validar o renovar la sesión antes de continuar.
- **SC-004**: El 100% de las sesiones no renovables bloquea la operación protegida y muestra el mensaje exacto de expiración.
- **SC-005**: Las solicitudes concurrentes ante una misma expiración producen como máximo un intento de renovación y un aviso visible de expiración por ciclo de sesión.
- **SC-006**: Una acción con renovación exitosa continúa una sola vez y no requiere que el usuario la repita manualmente.
- **SC-007**: En el 100% de los casos en que el usuario acepta el mensaje de sesión expirada, la aplicación muestra la pantalla de login y no permite continuar en la pantalla protegida sin autenticarse nuevamente.
- **SC-008**: Con el access token vencido o con 30 segundos o menos de validez restante y la sesión SSO vigente, el 100% de las acciones y refrescos elegibles obtiene un token nuevo y continúa una sola vez sin pedir credenciales nuevamente.
- **SC-009**: Al superar 30 minutos de inactividad o 10 horas desde el inicio de la sesión, el 100% de los intentos de renovación fallidos termina en el diálogo de expiración y no ejecuta la operación protegida.
- **SC-010**: Si Keycloak cambia los tiempos de expiración, la aplicación utiliza los tiempos efectivos de los tokens y de la renovación sin requerir un cambio de código para cada ajuste de configuración.

## Assumptions

- La aplicación ya dispone de un mecanismo de autenticación con token y capacidad de renovación cuando la sesión del proveedor todavía es válida.
- La validación se aplica a las acciones y refrescos que requieren autenticación; los recursos públicos quedan fuera de alcance.
- El mensaje se mostrará en un mecanismo visible de la aplicación y el usuario será dirigido al flujo de autenticación existente.
- La pantalla de login forma parte del flujo de autenticación existente y es el destino requerido después de aceptar la expiración.
- La altura exacta del encabezado se definirá durante la planificación mediante comparación con la versión actual, priorizando legibilidad y uso en pantallas pequeñas.
- La autorización vigente se conserva después de renovar el token y se vuelve a evaluar con las credenciales renovadas.
- Los valores indicados en `Keycloak Session Policy` corresponden al export actual del realm `saas-contable` y del cliente `guido`; no son valores universales de Keycloak.
- El margen preventivo de 30 segundos es una decisión del cliente de la aplicación; no corresponde a un parámetro configurable del realm o del client en Keycloak.
- El cliente dispone de un refresh token válido mientras Keycloak mantenga vigente la sesión SSO y acepte la renovación.
