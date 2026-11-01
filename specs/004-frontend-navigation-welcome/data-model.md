# Data Model: Navegación y contexto del cliente

## ClientContext

| Campo      | Tipo  | Regla                                                           |
| ---------- | ----- | --------------------------------------------------------------- |
| `clientId` | Texto | Debe coincidir con `authorization.client_id` autenticado.       |
| `name`     | Texto | Campo descriptivo `name` del cliente dentro del realm Keycloak. |
| `tenantId` | Texto | Tenant resuelto por el contexto de identidad existente.         |

## NavigationState

| Campo                  | Tipo     | Regla                                                                 |
| ---------------------- | -------- | --------------------------------------------------------------------- |
| `currentRoute`         | Texto    | `/home/welcome` o `/home/client/services`.                            |
| `isMenuCollapsed`      | Booleano | Cambia localmente sin solicitudes.                                    |
| `canViewAccountStatus` | Booleano | True únicamente cuando existe la ruta exacta `/home/client/services`. |

## DisplayIdentity

| Campo         | Tipo  | Regla                                                        |
| ------------- | ----- | ------------------------------------------------------------ |
| `firstName`   | Texto | Nombre de la identidad autenticada.                          |
| `lastName`    | Texto | Apellido de la identidad autenticada.                        |
| `welcomeName` | Texto | `firstName + lastName`, con fallback seguro si faltan ambos. |

## Relationships

- `ClientContext.clientId` se obtiene del contexto OIDC normalizado.
- `NavigationState.canViewAccountStatus` se deriva de `FrontendIdentity.permissions`.
- `DisplayIdentity` se deriva del usuario autenticado y no del cliente Keycloak.
