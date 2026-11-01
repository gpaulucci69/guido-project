# Research: Navegación principal y bienvenida

## Decisión 1: Nombre del cliente Keycloak

- **Decision**: Resolver server-side el campo `name` del cliente Keycloak usando el `authorization.client_id` autenticado.
- **Rationale**: El access token identifica el cliente mediante `client_id`, pero no garantiza incluir su nombre descriptivo. El navegador no debe recibir credenciales administrativas.
- **Alternatives considered**: Agregar el nombre al token; descartado porque aumenta el acoplamiento del mapper y requiere renovar tokens para cambios de nombre. Mostrar `client_id`; descartado porque no es el nombre comercial configurado.

## Decisión 2: Autorización de Estado de cuenta

- **Decision**: Habilitar y proteger la navegación únicamente con la ruta exacta `/home/client/services`, normalizando una barra inicial antes de comparar.
- **Rationale**: Reutiliza el modelo existente de permisos y evita que ocultar un ítem sea la única protección.
- **Alternatives considered**: Autorizar por rol; descartado porque la especificación exige una ruta del objeto `authorization.routes`. Coincidencia parcial; descartada por riesgo de habilitar rutas no aprobadas.

## Decisión 3: Pantalla inicial

- **Decision**: La pantalla inicial será la bienvenida para todo autenticado; `Estado de cuenta` será una ruta secundaria protegida.
- **Rationale**: Permite que usuarios sin permisos contables tengan una entrada funcional y evita mostrar obligaciones sin autorización.
- **Alternatives considered**: Mantener obligaciones como pantalla inicial; descartado porque impediría una bienvenida común y puede fallar para usuarios sin la ruta requerida.

## Decisión 4: Menú lateral

- **Decision**: El menú lateral será un componente presentacional con estado colapsado/expandido, accesible por teclado y sin solicitudes al alternar.
- **Rationale**: Reduce complejidad y mantiene la navegación local y predecible.
- **Alternatives considered**: Biblioteca de navegación nueva; descartada por KISS y por el alcance reducido.
