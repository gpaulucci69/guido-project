# Research: Encabezado y validación de sesión

## Decisión 1: expiración y margen preventivo

- **Decision**: Evaluar `expires_at`/`exp` y renovar cuando el token esté vencido o le queden 30 segundos o menos. Keycloak sigue siendo la autoridad para aceptar o rechazar el refresh token.
- **Rationale**: `accessTokenLifespan` define la vida del token, pero no el umbral preventivo; separar ambos respeta cambios del realm.
- **Alternatives considered**: Renovar solo ante `401` deja acciones iniciadas con credencial vencida; usar una duración fija contradice la configuración efectiva.

## Decisión 2: reutilizar OIDC existente

- **Decision**: Mantener `oidc-client-ts`, `UserManager`, `signinSilent`, `WebStorageStateStore` y `TokenManager`.
- **Rationale**: El repositorio ya tiene renovación silenciosa y pruebas del gestor; una segunda implementación produciría estados divergentes.
- **Alternatives considered**: Implementar directamente el endpoint de token de Keycloak o guardar manualmente refresh tokens aumenta complejidad y exposición.

## Decisión 3: una renovación concurrente

- **Decision**: Las solicitudes concurrentes esperan la misma promesa de renovación; un fallo limpia la sesión una sola vez.
- **Rationale**: Evita carreras y reutilización inválida con `refreshTokenMaxReuse=0`.
- **Alternatives considered**: Renovar por request puede invalidar refresh tokens concurrentes; serializar toda la aplicación degrada la UX.

## Decisión 4: expiración visible

- **Decision**: Ante rechazo definitivo, bloquear con modal accesible, mostrar el texto exacto, limpiar el usuario OIDC y navegar al login después de “Aceptar”.
- **Rationale**: Impide continuar viendo o ejecutando contenido protegido.
- **Alternatives considered**: Redirección automática no respeta la aceptación requerida; un toast no bloquea la pantalla.

## Decisión 5: encabezado compacto

- **Decision**: Renderizar alias, notificaciones y avatar en ese orden, reduciendo padding vertical y conservando el menú del avatar.
- **Rationale**: Es el cambio mínimo que satisface la especificación y conserva accesibilidad.
- **Alternatives considered**: Rediseñar todo el encabezado o esconder elementos en pantallas estrechas amplía innecesariamente el alcance.
