# Quickstart: Validar encabezado y sesión

## Prerrequisitos

1. Levantar Keycloak y su base de datos con la configuración del proyecto.
2. Usar el realm `saas-contable` y el cliente público `guido`.
3. Tener un usuario autenticable y permisos para una pantalla protegida.
4. Iniciar el frontend y los servicios API.

## Validaciones automatizadas

Ejecutar desde la raíz:

```bash
npm test -- apps/frontend/src/lib/auth/token-manager.test.ts apps/frontend/src/auth/session.test.ts
```

Comprobar además las suites de integración/E2E del frontend configuradas por el proyecto.

## Escenarios manuales

1. **Encabezado**: iniciar sesión y verificar menor altura y orden alias → notificaciones → avatar.
2. **Token vigente**: ejecutar una acción y refrescar; no debe haber renovación innecesaria.
3. **Margen preventivo**: usar un token con 30 segundos o menos restantes; verificar una sola renovación y continuidad automática.
4. **Access token vencido**: con SSO vigente, verificar que el refresh token obtiene un token nuevo y la operación continúa una sola vez.
5. **Sesión expirada**: superar el idle timeout o invalidar la sesión; verificar que la operación no se envía, aparece el modal exacto y `Aceptar` lleva al login.
6. **Concurrencia**: disparar varias acciones durante una renovación; verificar un único intento compartido.
7. **Autorización**: renovar y verificar que los permisos siguen siendo los emitidos por Keycloak.

Los contratos detallados están en [contracts/session.md](contracts/session.md) y el estado conceptual en [data-model.md](data-model.md).
