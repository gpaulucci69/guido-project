# Feature Specification: Encabezado de usuario y perfil del frontend

**Feature Branch**: `feature/fronend-header`

**Created**: 2026-10-31

**Status**: Draft

**Input**: User description: "Agregar en la página principal un encabezado con avatar, alias, notificaciones, logout, edición de perfil y restablecimiento de clave integrado con Keycloak."

## Clarifications

### Session 2026-10-31

- Q: ¿Dónde debe almacenarse físicamente el archivo del avatar? → A: Usar el servicio MinIO existente; Keycloak conserva únicamente la referencia del archivo.
- Q: ¿Quién puede editar el perfil mostrado en el encabezado? → A: Cada usuario o cliente solo puede editar su propio perfil.
- Q: ¿Cómo debe abrirse el cambio de clave de Keycloak desde la opción “Reestablece tu clave”? → A: Mostrar el flujo oficial de Keycloak dentro del modal, sin que el frontend vea ni almacene la clave.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Identidad visible y menú de usuario (Priority: P1)

Como usuario autenticado, quiero identificar rápidamente mi sesión desde el encabezado y acceder a las opciones de cuenta.

**Why this priority**: El encabezado es el punto principal para reconocer la sesión activa y cerrarla de forma segura.

**Independent Test**: Con una sesión válida, verificar que la página principal muestra el alias, el avatar o sus iniciales y el ícono de notificaciones; al seleccionar el avatar, se abre el menú con las tres opciones requeridas.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado con atributo `alias`, **When** carga la página principal, **Then** el alias aparece a la izquierda del avatar y el avatar queda alineado a la derecha del encabezado.
2. **Given** un usuario sin foto de avatar, **When** carga la página principal, **Then** se muestran la primera letra del nombre y la primera letra del apellido dentro de un avatar circular.
3. **Given** el encabezado visible, **When** el usuario observa el área junto al avatar, **Then** ve un ícono de notificaciones sin acciones asociadas en esta versión.
4. **Given** el menú de usuario abierto, **When** el usuario lo cierra o hace clic fuera, **Then** el menú desaparece sin modificar la sesión.

### User Story 2 - Editar perfil y avatar (Priority: P1)

Como usuario autenticado, quiero actualizar mis datos visibles y mi foto para mantener mi perfil al día.

**Why this priority**: El perfil controla la identidad mostrada en el encabezado y debe ser editable sin abandonar la aplicación.

**Independent Test**: Abrir “Editar perfil”, modificar uno o más datos, guardar, cerrar la ventana y verificar que el encabezado refleja los cambios.

**Acceptance Scenarios**:

1. **Given** el menú de usuario abierto, **When** el usuario selecciona “Editar perfil”, **Then** aparece una ventana modal con nombre, apellido, alias y selector de avatar.
2. **Given** datos válidos en el modal, **When** el usuario guarda, **Then** nombre, apellido y alias se actualizan en Keycloak y la foto se guarda en el almacenamiento de archivos configurado.
3. **Given** un avatar nuevo guardado correctamente, **When** el usuario vuelve al encabezado, **Then** se muestra la nueva foto y no las iniciales.
4. **Given** un error de validación o almacenamiento, **When** el usuario intenta guardar, **Then** se muestra un mensaje en español, se conservan los valores editados y no se presenta el cambio como exitoso.

### User Story 3 - Cerrar sesión y restablecer clave (Priority: P1)

Como usuario autenticado, quiero cerrar mi sesión o cambiar mi clave desde el menú de usuario.

**Why this priority**: Son controles esenciales de seguridad y deben estar disponibles desde cualquier pantalla principal.

**Independent Test**: Seleccionar logout y comprobar el regreso a login; seleccionar “Reestablece tu clave”, cambiar la clave mediante el flujo de Keycloak y verificar el resultado informado.

**Acceptance Scenarios**:

1. **Given** el menú de usuario abierto, **When** el usuario selecciona “Logout”, **Then** la sesión local se limpia, se cierra la sesión del proveedor y se redirige a la pantalla de login.
2. **Given** el menú de usuario abierto, **When** el usuario selecciona “Reestablece tu clave”, **Then** aparece una ventana modal para iniciar el cambio de clave con Keycloak.
3. **Given** el cambio de clave completado, **When** Keycloak confirma la operación, **Then** el modal informa el éxito y la aplicación conserva solo una sesión válida.
4. **Given** un cambio de clave cancelado o rechazado, **When** el proveedor devuelve el resultado, **Then** el modal informa el error sin cerrar ni degradar silenciosamente la sesión actual.

## Edge Cases

- Si `alias` no existe o está vacío, se muestra un texto de identificación derivado del nombre y apellido; si tampoco existen, se usa un texto genérico no sensible.
- Si solo existe nombre o solo apellido, las iniciales se construyen con la información disponible sin producir un avatar vacío.
- Un archivo que no sea una imagen, exceda el tamaño permitido o no pueda almacenarse debe rechazarse antes de actualizar el atributo `avatar`.
- Si la foto indicada por `avatar` no está disponible, se muestran las iniciales y se conserva el valor de perfil restante.
- El menú no debe quedar abierto después de logout ni permitir acciones protegidas mientras la sesión está cerrándose.
- La función de notificaciones no debe realizar solicitudes ni mostrar contenido en esta fase.
- El cambio de clave nunca debe enviar ni persistir la clave en el frontend de la aplicación.
- Si el proveedor no permite mostrar su flujo dentro del modal por restricciones de seguridad del navegador, la aplicación debe informar el problema y no sustituirlo por un formulario propio no autorizado.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: La página principal DEBE mostrar un encabezado para usuarios autenticados.
- **FR-002**: El encabezado DEBE mostrar un ícono de notificaciones a la izquierda del avatar, sin comportamiento funcional en esta versión.
- **FR-003**: El encabezado DEBE mostrar el alias del usuario a la izquierda del avatar cuando exista.
- **FR-004**: El avatar DEBE ser circular, estar alineado a la derecha y mostrar la foto seleccionada por el usuario cuando esté disponible.
- **FR-005**: Si no existe una foto válida, el avatar DEBE mostrar la primera letra del nombre y la primera letra del apellido.
- **FR-006**: Al seleccionar el avatar, el sistema DEBE mostrar un menú con “Logout”, “Editar perfil” y “Reestablece tu clave”.
- **FR-007**: “Logout” DEBE cerrar la sesión local y la sesión del proveedor de identidad, y redirigir a login.
- **FR-008**: “Editar perfil” DEBE abrir un modal para modificar nombre, apellido, alias y avatar del usuario autenticado; no debe permitir editar el perfil de otra identidad.
- **FR-009**: El nombre y apellido DEBEN actualizarse como atributos del perfil del usuario en Keycloak.
- **FR-010**: El alias DEBE corresponder al atributo de usuario `alias` definido en el perfil de usuarios del realm de Keycloak.
- **FR-011**: El atributo `avatar` del usuario en Keycloak DEBE contener el object key completo y estable del objeto almacenado en MinIO; no debe contener únicamente el nombre original del archivo.
- **FR-012**: El archivo de imagen DEBE almacenarse en el servicio MinIO existente, separado de Keycloak, y el object key persistido en `avatar` DEBE permitir recuperar únicamente el avatar del tenant y usuario autenticados.
- **FR-013**: El sistema DEBE validar tipo, tamaño y resultado de almacenamiento antes de confirmar un avatar nuevo.
- **FR-014**: “Reestablece tu clave” DEBE mostrar dentro de un modal el flujo oficial de cambio de clave de Keycloak, sin gestionar ni persistir la clave en el frontend.
- **FR-015**: Los modales DEBEN poder cerrarse explícitamente y mediante una acción accesible de cancelación.
- **FR-016**: Los errores y confirmaciones visibles DEBEN estar redactados en español y no revelar secretos ni tokens.
- **FR-017**: El encabezado DEBE conservar las reglas existentes de autorización; ocultar opciones visualmente no reemplaza la autorización del backend.
- **FR-018**: `GET /api/v1/profile` DEBE requerir el permiso `/view/profile` y `PATCH /api/v1/profile` DEBE requerir el permiso `/edit/profile`.
- **FR-019**: Toda operación de perfil DEBE validar el tenant derivado de `authorization.client_id` y el `sub` autenticados; no se aceptará identidad ni tenant desde el cuerpo de la solicitud.
- **FR-020**: El sistema DEBE aceptar únicamente imágenes JPEG, PNG o WebP de hasta 5 MB, validando MIME type, extensión y magic bytes.
- **FR-021**: El menú y los modales DEBEN ser operables mediante teclado, administrar el foco, permitir cierre con Escape y exponer etiquetas accesibles.

### Key Entities

- **Perfil de usuario**: Nombre, apellido, alias y referencia de avatar asociados a la identidad autenticada.
- **Avatar**: Imagen seleccionada por el usuario, almacenada en MinIO; su object key completo y estable se persiste en el atributo `avatar`.
- **Menú de cuenta**: Acciones de logout, edición de perfil y restablecimiento de clave.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de las sesiones autenticadas muestra alias o fallback de identidad y un avatar con foto o iniciales.
- **SC-002**: El 100% de los usuarios puede abrir y cerrar el menú de cuenta sin abandonar la página principal.
- **SC-003**: Al menos el 95% de las actualizaciones válidas de perfil se refleja en el encabezado en menos de 3 segundos.
- **SC-004**: El 100% de los logout probados elimina el acceso a la pantalla protegida y redirige a login.
- **SC-005**: El 100% de los intentos de cambiar clave se ejecuta mediante el proveedor de identidad y ninguna clave queda registrada por la aplicación.
- **SC-006**: El 100% de archivos inválidos o fallas de almacenamiento informa el error sin mostrar un avatar no persistido como definitivo.
- **SC-007**: El ícono de notificaciones realiza cero solicitudes y no cambia el estado de la aplicación en esta primera versión.

## Assumptions

- Keycloak continúa siendo la autoridad para identidad, atributos de perfil, logout y cambio de clave.
- El usuario ya está autenticado mediante el flujo OIDC existente.
- `alias` y `avatar` estarán definidos como atributos de usuario en `Realm Settings > User Profile`.
- El almacenamiento de imágenes utilizará el servicio MinIO existente, aislado del proveedor de identidad; Keycloak conservará solamente la referencia del archivo.
- La referencia tendrá el formato `profiles/{tenant_id}/{sub}/avatar.{extension}` y nunca será una ruta proporcionada directamente por el navegador.
- El tenant del perfil se deriva del `authorization.client_id` normalizado del token; para esta instalación el valor esperado es `guido`.
- El nombre y apellido se mapean a los campos estándar `firstName` y `lastName` de Keycloak, que originan los claims OIDC `given_name` y `family_name`.
- El límite de avatar es de 5 MB y los tipos permitidos son JPEG, PNG y WebP.
- El archivo se limita a una imagen de avatar por usuario y la aplicación conservará una referencia estable en Keycloak.
- Cada usuario o cliente solo podrá modificar su propio perfil; la administración de perfiles de terceros queda fuera de esta feature.
- Las notificaciones quedan fuera de alcance funcional en esta versión.
- El diseño debe funcionar en escritorio y mantener una disposición usable en pantallas estrechas.
