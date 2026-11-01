# Data Model: Gestión de clientes y contadores del estudio

## AdministrableIdentity

Representa una identidad Keycloak del tenant activo visible en uno de los listados.

| Campo       | Tipo             | Reglas                                                                         |
| ----------- | ---------------- | ------------------------------------------------------------------------------ |
| `id`        | string           | Identificador inmutable de Keycloak; requerido para editar/eliminar            |
| `type`      | `client \| user` | Exactamente uno de los dos valores; determina el listado                       |
| `firstName` | string           | Requerido al crear y actualizar; texto validado                                |
| `lastName`  | string           | Requerido al crear y actualizar; texto validado                                |
| `alias`     | string           | Opcional; se conserva como atributo Keycloak                                   |
| `email`     | string           | Requerido y validado como email                                                |
| `enabled`   | boolean          | Estado de autenticación visible y modificable solo dentro del alcance aprobado |
| `username`  | string           | Identificador de acceso; no cambia durante edición                             |
| `client_id` | string           | Atributo Keycloak obligatorio; debe coincidir con `authorization.client_id`    |

## PeopleQuery

| Campo      | Tipo             | Reglas                                                          |
| ---------- | ---------------- | --------------------------------------------------------------- |
| `type`     | `client \| user` | Filtro obligatorio impuesto por la ruta                         |
| `tenantId` | string           | Derivado del token y resolución PostgreSQL; nunca del navegador |

## Permission mapping

| Tipo     | Ruta                | Alta          | Abrir/modificar | Guardar          | Baja             |
| -------- | ------------------- | ------------- | --------------- | ---------------- | ---------------- |
| Cliente  | `/home/client/list` | `/client/add` | `/client/edit`  | `/client/update` | `/client/delete` |
| Contador | `/home/users/list`  | `/user/add`   | `/user/edit`    | `/user/update`   | `/user/delete`   |

## Invariants

- Una operación de clientes solo puede seleccionar identidades `type=client`.
- Una operación de contadores solo puede seleccionar identidades `type=user`.
- El tenant se deriva de la identidad autenticada y se verifica antes de consultar Keycloak.
- Una edición no modifica `id` ni `username`.
- La eliminación requiere confirmación y no puede eliminar al operador actual ni al último administrador activo.
