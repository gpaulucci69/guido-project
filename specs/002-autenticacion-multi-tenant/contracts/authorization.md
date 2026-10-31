# Authorization Contract

## Validated identity context

```ts
type Permission = {
  type: "route" | "action";
  value: string;
};

type IdentityContext = {
  sub: string;
  tenantId: string;
  permissions: readonly Permission[];
  roles: readonly string[]; // audit only; never authorization input
  traceId: string;
  isDemo: boolean;
};
```

El `tenantId` interno se obtiene resolviendo `authorization.client_id` contra `Tenant.clientId` en PostgreSQL. Para el entorno actual, el valor externo canónico es `guido`; el resultado interno es el UUID de `Tenant.id` y es el único valor que se expone a casos de uso, persistencia y RLS como `tenant_id`. Los roles y permisos pueden estar ausentes; en ese caso el contexto es auténtico pero no tiene acceso efectivo a ninguna operación protegida.

## Permission checks

- `route` controls page/menu visibility, for example `/home/users`.
- Cada ruta debe declararse explícitamente; una ruta padre no concede acceso automático a sus rutas hijas.
- `action` controls an operation, for example `add/customer`.
- Un permiso desconocido se registra como advertencia y se deniega únicamente esa ruta u operación; no invalida el resto del contexto.
- A missing permission is denied by default.
- `view/customers/all` allows all customers within `tenantId`.
- `view/customers/own` allows only customers assigned to the authenticated accountant; it is not a substitute for the persisted portfolio check.

## HTTP behavior

| Condition                               | Response                                   |
| --------------------------------------- | ------------------------------------------ |
| Missing/invalid/expired token           | `401` problem response                     |
| Valid token without required permission | `403` problem response                     |
| Tenant/resource mismatch                | `403` without revealing resource existence |
| Accountant outside assigned portfolio   | `403`                                      |
| Public health endpoint                  | `200` without business data                |

## Keycloak mapper contract

The custom mapper must emit an `authorization` claim containing `client_id`, `routes`, and `actions`, assembled from the client and attributes of client-roles assigned to the user. The application normalizes this input into the internal `permissions` array. It must preserve valid repeated attributes, discard unsupported keys with a warning, and produce no permission when an attribute is absent. Permission versioning is out of scope for this version. The mapper configuration and sample roles belong in `infra/keycloak/` and must be validated in the quickstart.
