# Data Model: Transformar frontend a React

La migración no agrega persistencia propia. React modela el estado necesario para representar los contratos existentes.

## SessionContext

- `user`: identidad autenticada, nombre, alias, avatar y tenant.
- `permissions`: rutas y acciones normalizadas.
- `roles`: client roles del cliente autenticado.
- `status`: loading, authenticated, unauthenticated o expired.

## ClientContext

- `clientId`, `name`, `description`, `logoUrl` y `tenantId`.

## ViewState<T>

- estado idle/loading/success/error;
- datos, mensaje funcional y operación de recarga.

## Relaciones

- `SessionContext` autoriza `ClientContext` y cada vista.
- `ClientContext` determina el tenant y cliente cuyos datos se muestran.
- Formularios consumen contratos existentes y actualizan el estado de su vista.
