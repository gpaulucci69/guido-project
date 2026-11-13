# Data Model: Encabezado y validación de sesión

## OIDC Session State

| Campo | Tipo conceptual | Reglas |
| --- | --- | --- |
| `accessToken` | string | Se usa para requests autenticadas; no se envía si no hay sesión válida. |
| `expiresAt` | timestamp | Se compara con el reloj actual y un margen de 30 segundos. |
| `refreshToken` | string opcional | Se usa para renovar y se reemplaza cuando Keycloak entrega uno nuevo. |
| `status` | `valid \| refreshing \| expired` | `expired` bloquea acciones y dispara el modal una sola vez. |
| `renewal` | operación compartida opcional | Permite que solicitudes concurrentes esperen una sola renovación. |

## Keycloak Session Policy

La política efectiva procede del realm `saas-contable` y del cliente `guido`: access token de referencia 300 s, SSO idle 1800 s, SSO máximo 36000 s, `use.refresh.tokens=true`, `publicClient=true`, `refreshTokenMaxReuse=0` y sin overrides de sesión específicos por cliente (`0`). Los valores del token recibido y las respuestas de Keycloak prevalecen si cambian.

## Header View State

| Campo | Tipo conceptual | Reglas |
| --- | --- | --- |
| `alias` | string | Se muestra primero; usa fallback de identidad si el perfil no devuelve alias. |
| `notifications` | control visual | Se muestra segundo; estado neutro si no hay datos. |
| `avatar` | imagen o iniciales | Se muestra tercero; fallback a iniciales si la imagen falla. |

## State transitions

```text
valid --(≤30 s o vencido)--> refreshing
refreshing --(Keycloak acepta)--> valid
refreshing --(Keycloak rechaza/falla)--> expired
expired --(Aceptar)--> login
```
