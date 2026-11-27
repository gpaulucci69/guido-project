# Quickstart: Validar frontend React

## Prerequisites

- Node.js >= 20
- Dependencias instaladas con `npm ci`
- Keycloak, PostgreSQL, MinIO y servicios disponibles

## Run

```bash
npm run dev
```

Abrir `http://localhost:5173` y autenticar un usuario de prueba.

## Validation scenarios

1. Iniciar sesión y comprobar bienvenida, nombre/logo, avatar y roles.
2. Navegar solo por rutas autorizadas y comprobar el bloqueo de una ruta no autorizada.
3. Crear, editar y filtrar un cliente.
4. Crear y editar un asociado, incluyendo rol, avatar, Ingreso y Nacimiento.
5. Abrir el menú de cuenta, actualizar perfil/avatar y cambiar la clave.
6. Verificar errores de validación, conflicto de CUIT, respuesta sin contenido y sesión expirada.
7. Repetir en viewport angosto y comprobar que no hay controles superpuestos.

Para las operaciones de escritura, usá cuentas y registros de prueba. Para validar el rendimiento, medí desde que la sesión está disponible hasta que la navegación responde y repetí la carga y búsqueda con 1.000 registros. La prueba de tabla con datos sintéticos comprueba el renderizado, mientras que el objetivo de 2 segundos se comprueba en el navegador.

## Quality gates

```bash
npm run typecheck
npm run lint
npm run format
npm test
```
