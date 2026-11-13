# Session Contract

## Precondition for authenticated work

Antes de cada acción autenticada, refresco de pantalla protegido o request API protegido, el cliente obtiene un access token vigente desde el gestor de sesión.

## Renewal behavior

- Si quedan más de 30 segundos, usa el access token actual.
- Si quedan 30 segundos o menos, o ya venció, intenta renovación silenciosa mediante el refresh token.
- Si tiene éxito, reemplaza el conjunto de tokens y repite la operación pendiente una sola vez.
- Si otra operación ya está renovando, espera el mismo resultado.

## Expired-session behavior

Cuando Keycloak rechaza la renovación o no existe una sesión renovable:

1. No enviar ni reintentar la operación protegida.
2. Mostrar un modal bloqueante con el texto exacto: `Su sesión ha expirado, por favor, vuelva a autenticarse para validar su identidad`.
3. El único control del modal es `Aceptar`.
4. Al aceptar, limpiar el estado OIDC y navegar a login sin permitir volver a la pantalla protegida mediante historial.

## Identity and authorization invariant

La renovación no concede permisos nuevos. La identidad y permisos se reconstruyen desde el token renovado y siguen sujetos a `authorization.client_id`, `routes` y `actions`.
