# Quickstart: Navegación y bienvenida

## Prerequisites

- Keycloak, PostgreSQL, frontend y servicios existentes levantados.
- Un usuario autenticado con nombre y apellido.
- Un token con `/home/client/services` y otro sin esa ruta.
- El cliente Keycloak `guido` con nombre descriptivo configurado.

## Scenarios

1. Iniciar sesión con cualquier usuario y verificar `Bienvenido <nombre y apellido>` y el menú `Inicio`.
2. Verificar que el nombre del cliente Keycloak aparece a la izquierda del encabezado y los controles de cuenta a la derecha.
3. Colapsar y expandir el menú lateral; verificar que no se realizan solicitudes nuevas.
4. Con un token que contenga `/home/client/services`, verificar que aparece `Estado de cuenta` y abre `Obligaciones`.
5. Con un token sin `/home/client/services`, verificar que `Estado de cuenta` no aparece.
6. Navegar directamente a `/home/client/services` sin permiso y verificar que se vuelve a `/home/welcome` con un mensaje en español.
7. Simular indisponibilidad de obligaciones y verificar que la bienvenida y el menú siguen disponibles.

## Commands

```bash
npm run typecheck
npm run lint
npm test
```

La validación manual debe comprobar el comportamiento observable en el navegador; los detalles del contrato están en `contracts/client-context.md`.
