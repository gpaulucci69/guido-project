# Profile Contract

## GET `/api/v1/profile`

Requires the existing Bearer token and the `/view/profile` permission. The response contains only the authenticated user's profile in the tenant derived from `authorization.client_id`:

```json
{
  "sub": "user-id",
  "firstName": "Super",
  "lastName": "Admin",
  "alias": "super_admin",
  "avatar": "profiles/guido/user-id/avatar.png",
  "avatarUrl": "https://storage.example/profiles/user-id/avatar.png"
}
```

`avatar` is the complete, stable MinIO object key stored in Keycloak. The profile service constructs and validates this key from the authenticated tenant and `sub`; the browser cannot choose an arbitrary object key.

`avatarUrl` may be a short-lived authorized URL derived from `avatar`. It must not expose another tenant's or user's object.

## PATCH `/api/v1/profile`

Requires the existing Bearer token and the `/edit/profile` permission. Accepts a multipart profile update containing optional text fields and one optional image. The authenticated token determines `sub` and tenant from `authorization.client_id`; a client-provided identity, tenant or object key is ignored or rejected.

Success: `200` with the normalized profile.

Errors:

- `400`: invalid text, image type or image size.
- `401`: missing or invalid token.
- `403`: profile operation is not allowed for the identity, tenant or required permission.
- `409`: avatar reference conflict.
- `502`: Keycloak or MinIO unavailable; no partial success is reported.

## Logout

The frontend uses the existing OIDC logout flow and does not expose a backend credential operation.

## Password modal

The frontend requests the official Keycloak account password flow. The application never receives, logs or persists the password. If embedding is blocked, the modal reports the failure and offers to open the same official Keycloak flow in a separate browser navigation.
