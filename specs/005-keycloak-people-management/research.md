# Research: Gestión de clientes y contadores del estudio

## Decisión 1: Keycloak como fuente única de identidades

- **Decision**: Leer, crear, actualizar y eliminar identidades mediante la API administrativa de Keycloak; PostgreSQL solo resuelve el tenant interno asociado al `authorization.client_id`.
- **Rationale**: La especificación establece que `type`, nombre, email, estado y credenciales pertenecen a Keycloak. Duplicar usuarios en la base local introduciría divergencia y riesgos de aislamiento.
- **Alternatives considered**: Persistir un catálogo local de usuarios; rechazado porque requeriría sincronización y no sería la fuente autorizada.

## Decisión 2: Autorización en dos niveles

- **Decision**: Evaluar la ruta para visibilidad/acceso y las acciones para cada mutación. El backend repite las validaciones aunque el frontend oculte botones.
- **Rationale**: Cumple mínimo privilegio y evita que un cliente manipule la interfaz para ejecutar acciones no autorizadas.
- **Alternatives considered**: Usar únicamente roles o únicamente rutas; rechazado porque no permite diferenciar consulta, alta, edición y baja.

## Decisión 3: Separación entre `edit` y `update`

- **Decision**: `edit` permite abrir y modificar el formulario; `update` permite guardar. Ambas acciones son necesarias para completar una edición.
- **Rationale**: Refleja exactamente la decisión funcional de la especificación y permite otorgar acceso de edición sin habilitar persistencia accidental.
- **Alternatives considered**: Tratar ambas acciones como sinónimos; rechazado porque pierde la separación aprobada.

## Decisión 4: Vista reutilizable por tipo

- **Decision**: Una vista parametrizada por `client` o `user`, con columnas y formularios compartidos, y permisos derivados del tipo.
- **Rationale**: Los dos flujos tienen el mismo ciclo de vida y solo cambian rutas, acciones y filtro `type`; evita duplicación sin crear una abstracción genérica innecesaria.
- **Alternatives considered**: Dos pantallas totalmente independientes; rechazado por duplicación de validaciones y estados.

## Decisión 5: Protección de eliminación

- **Decision**: Confirmación explícita en UI y validación de invariantes en backend: no eliminar al operador actual ni dejar el tenant sin administrador activo.
- **Rationale**: Evita pérdida accidental de acceso administrativo y cumple los casos borde definidos.
- **Alternatives considered**: Eliminación inmediata; rechazada por riesgo operativo.
