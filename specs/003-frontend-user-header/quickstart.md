# Quickstart: Encabezado, perfil y sesión

## Prerequisites

```bash
docker compose up -d postgres keycloak keycloak-setup minio frontend
npm ci
npm run typecheck
```

The Keycloak user profile must define `alias` and `avatar`. MinIO must be available to the profile service.

## Validation scenarios

1. Login with a user having `firstName`, `lastName` and `alias`; verify alias, circular avatar and notification icon.
2. Remove the avatar reference; verify initials from first and last name.
3. Open the avatar menu; verify logout, edit profile and password reset options.
4. Edit own name, surname, alias and image; verify the header updates after save.
5. Upload an invalid type or oversized image; verify Spanish error and no confirmed avatar change.
6. Attempt to update another user's profile; verify `403` and no Keycloak or MinIO mutation.
7. Logout; verify local session cleanup and return to login.
8. Open password reset; verify the official Keycloak flow is shown and no password is sent to the application.
9. Verify clicking notifications performs no request and changes no state.

## Automated validation

```bash
npm test
npm run typecheck
npm run lint
npm run test:coverage:business
```
