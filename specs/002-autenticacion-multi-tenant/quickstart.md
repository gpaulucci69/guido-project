# Quickstart: autenticación y autorización por atributos

## Prerequisitos

```bash
docker compose up -d postgres keycloak keycloak-setup
npm ci
npm run typecheck
```

Configurar en el realm `saas-contable` un client OIDC para la SPA y client-roles con atributos:

- `route=/home/users`
- `route=/home/clients`
- `action=add/user`
- `action=add/customer`
- `action=view/customers/all`
- `action=view/customers/own`

El custom mapper debe producir `authorization.client_id`, `authorization.routes` y `authorization.actions`; la aplicación los normaliza al claim interno `permissions` descrito en [authorization.md](contracts/authorization.md).

## Validaciones

1. Iniciar sesión con `route=/home/clients` y `action=add/customer`. Verificar que se ve clientes y alta, pero no usuarios ni alta de usuarios.
2. Quitar `action=add/customer`, renovar la sesión y verificar que el botón desaparece y un `POST` directo devuelve `403`.
3. Emitir `view/customers/own` para un contador con cartera asignada. Verificar que ve solo sus clientes; otro cliente devuelve `403`.
4. Emitir `view/customers/all` para un administrador. Verificar todos los clientes del tenant; un identificador de otro tenant sigue devolviendo `403`.
5. Repetir sin token, con token vencido y con `authorization.client_id` ausente. Verificar `401`, sin lectura ni mutación.
6. Alterar o quitar un permiso del token y repetir una acción. Verificar que no se concede acceso por nombre de rol.
7. Forzar fallo de renovación en el SPA. Verificar cancelación, limpieza de sesión y regreso al login.
8. Activar demo mediante su bandera explícita. Verificar el indicador visible; desactivarla y comprobar rechazo de la identidad demo.

## Pruebas automatizadas

```bash
npm test
npm run lint
npm run format
```

Las pruebas de seguridad deben comprobar aislamiento cross-tenant, permisos ausentes, manipulación de `tenant_id`, escalamiento por nombre de rol y restricciones `own`/`all` mediante interfaces públicas.

## Resultado de validación

Validado el 31-10-2026 con `keycloak`, `billing-workflow` y PostgreSQL levantados mediante Docker Compose:

| Escenario                                       | Evidencia                                                            | Resultado    |
| ----------------------------------------------- | -------------------------------------------------------------------- | ------------ |
| Login con Keycloak y acceso autorizado          | Password grant del cliente `guido` + `GET /api/v1/obligations`       | PASS (`200`) |
| Sin token o token inválido                      | Requests HTTP contra billing                                         | PASS (`401`) |
| Tenant desde `authorization.client_id`          | Resolución `guido -> Tenant.id` en PostgreSQL                        | PASS         |
| Permisos `all`/`own` y contador sin cartera     | `portfolio-authorization.integration.spec.ts` y pruebas de seguridad | PASS         |
| Aislamiento cross-tenant y escalamiento por rol | Suite `tests/security/*`                                             | PASS         |
| Renovación y fallo de renovación                | `apps/frontend/src/auth/session.test.ts`                             | PASS         |
| Modo demo con bandera explícita                 | `tests/security/demo-mode.security.spec.ts`                          | PASS         |
| Salud pública                                   | `GET /healthz`                                                       | PASS (`200`) |

La validación HTTP real confirmó `healthz=200`, acceso autenticado `200`, ausencia de credencial `401` y token inválido `401`. Los escenarios de cartera, demo y renovación se ejecutan mediante las pruebas automatizadas versionadas porque requieren perfiles y estados de sesión que no están provisionados como usuarios productivos en Keycloak.
