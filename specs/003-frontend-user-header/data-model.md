# Data Model: Perfil y avatar

## UserProfile

| Campo       | Tipo conceptual | Reglas                                                                                      |
| ----------- | --------------- | ------------------------------------------------------------------------------------------- |
| `sub`       | Identificador   | Identidad autenticada; no editable por el usuario                                           |
| `firstName` | Texto           | Nombre visible; opcional según datos existentes                                             |
| `lastName`  | Texto           | Apellido visible; opcional según datos existentes                                           |
| `alias`     | Texto           | Identificador visible en el encabezado; vacío usa fallback                                  |
| `avatar`    | Object key      | Clave completa y estable del objeto en MinIO, por ejemplo `profiles/guido/{sub}/avatar.png` |

## AvatarObject

| Campo         | Tipo conceptual | Reglas                                                |
| ------------- | --------------- | ----------------------------------------------------- |
| `ownerSub`    | Identificador   | Debe coincidir con el usuario autenticado             |
| `objectKey`   | Referencia      | No debe permitir traversal ni colisión entre usuarios |
| `contentType` | Tipo            | Solo imagen permitida por el contrato                 |
| `size`        | Entero          | No supera el límite configurado                       |

## ProfileUpdate

La actualización puede modificar cualquier subconjunto de `firstName`, `lastName`, `alias` y `avatar`. El servicio construye el object key a partir del tenant derivado de `authorization.client_id` y `sub` autenticados, y no acepta rutas, tenant ni `sub` de la solicitud como autoridad. `firstName` y `lastName` corresponden a los campos estándar de Keycloak y originan `given_name` y `family_name` en OIDC.

## Estados

- `idle`: modal cerrado.
- `editing`: formulario abierto con cambios locales.
- `saving`: actualización en curso; se bloquea el envío duplicado.
- `saved`: cambios confirmados y encabezado actualizado.
- `error`: se informa el error y se conservan los cambios locales.
