# Data Model: Contexto de autenticación y permisos

## IdentityContext

Contexto inmutable derivado de una credencial validada.

| Campo         | Tipo         | Reglas                                                                                                   |
| ------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| `sub`         | string       | Obligatorio; identificador estable del usuario                                                           |
| `tenantId`    | string       | Obligatorio; se deriva de `authorization.client_id` de Keycloak y coincide con el `client_id` del tenant |
| `permissions` | Permission[] | Puede ser vacío; nunca implica acceso por defecto                                                        |
| `roles`       | string[]     | Solo diagnóstico/auditoría; no se usa para autorizar                                                     |
| `traceId`     | string       | Generado o propagado para correlación                                                                    |
| `isDemo`      | boolean      | True solo con demo explícitamente habilitado                                                             |

## Permission

| Campo   | Tipo              | Reglas                                                                   |
| ------- | ----------------- | ------------------------------------------------------------------------ |
| `type`  | `route \| action` | Obligatorio                                                              |
| `value` | string            | No vacío; route comienza con `/`, action usa segmentos separados por `/` |

Ejemplos: `{ type: "route", value: "/home/clients" }`, `{ type: "action", value: "add/customer" }`.

## PortfolioAssignment

`Tenant.id` es el UUID interno usado por PostgreSQL, RLS y las entidades de negocio. `Tenant.clientId` es el identificador externo único del cliente de Keycloak (por ejemplo, `guido`) y es la única clave aceptada desde `authorization.client_id`. El backend resuelve `Tenant.clientId -> Tenant.id` antes de ejecutar casos de uso; nunca persiste directamente el valor externo como `tenant_id`.

La relación entre `tenantId`, `accountantUserId` y `clientId` se verifica contra PostgreSQL. Para una consulta `own`, el backend exige que exista la cartera del contador y que los registros pertenezcan al tenant autenticado.

## SecurityEvent

Registro de autenticación/autorización con `eventType`, `sub` opcional, `tenantId` opcional, `requiredPermission` opcional, `resourceId` opcional, `traceId`, timestamp y resultado. Debe registrar denegaciones por token, permiso, tenant, cartera y uso de demo.

## Token claim shape

```json
{
  "sub": "user-123",
  "authorization": {
    "client_id": "guido",
    "routes": ["/home/clients"],
    "actions": ["/view/customers/own"]
  }
}
```

La aplicación normaliza ese claim a:

```json
{
  "tenant_id": "guido",
  "permissions": [
    { "type": "route", "value": "/home/clients" },
    { "type": "action", "value": "view/customers/own" }
  ]
}
```

La aplicación no toma decisiones a partir de roles por nombre. Esos datos pueden preservarse para auditoría, pero el claim normalizado es la entrada del evaluador.
