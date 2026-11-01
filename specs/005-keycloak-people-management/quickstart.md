# Quickstart: Gestión de clientes y contadores

## Prerrequisitos

- Keycloak, PostgreSQL, profile-service, obligaciones y frontend levantados con Docker Compose.
- Cliente Keycloak configurado con las rutas y acciones de prueba.
- Usuario de prueba con `authorization.routes` y `authorization.actions` conocidos.

## Preparación de permisos

Para validar ambos flujos, usar un token con:

- Rutas: `/home/client/list`, `/home/users/list`.
- Acciones: `/client/add`, `/client/edit`, `/client/update`, `/client/delete`, `/user/add`, `/user/edit`, `/user/update`, `/user/delete`.

## Escenarios

1. Iniciar sesión y confirmar que aparecen `Clientes del estudio` y `Contadores del estudio`.
2. Abrir clientes y confirmar que ningún registro mostrado tiene `type=user`.
3. Crear un cliente, verificar que aparece con `type=client`, editarlo y confirmar que el cambio persiste.
4. Eliminar el cliente con confirmación y verificar que desaparece.
5. Repetir los pasos 2–4 para un contador con `type=user`.
6. Iniciar sesión con un token sin `/home/client/list`; confirmar que clientes no aparece y que `/home/client/list` redirige a bienvenida o devuelve acceso denegado.
7. Iniciar sesión con un token sin `/home/users/list`; repetir la validación para contadores.
8. Retirar `/client/delete` y confirmar que el listado permanece disponible pero la eliminación está oculta o deshabilitada.
9. Retirar `/client/update` manteniendo `/client/edit`; confirmar que se puede abrir el formulario pero no guardar.
10. Forzar indisponibilidad de Keycloak y verificar un error en español sin datos parciales.

## Validación automatizada

Ejecutar desde la raíz:

```bash
npm run typecheck
npm run lint
npm run format
npm test
```

La cobertura de lógica de negocio y servicios debe permanecer por encima del 80% antes de integrar.
