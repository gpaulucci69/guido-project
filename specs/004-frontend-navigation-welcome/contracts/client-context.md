# Client Context Contract

## GET `/api/v1/client-context`

Requires the existing Bearer token and a valid tenant context. The backend obtains `client_id` from the authenticated `authorization.client_id`; the browser cannot provide or override it.

Success: `200`

```json
{
  "clientId": "guido",
  "name": "Guido Estudio Contable",
  "tenantId": "tenant-internal-id"
}
```

Errors:

- `401`: missing or invalid token.
- `403`: invalid tenant or client context.
- `502`: Keycloak unavailable.

The response must not expose Keycloak administrative credentials, tokens or unrelated client data.

## Navigation authorization

The frontend may render `Estado de cuenta` only when the normalized authorization context contains the exact route `/home/client/services`. The backend obligations endpoint remains protected independently.
