# Research: Encabezado de usuario y perfil

## Decisión 1: Actualización del perfil propio

- **Decision**: El frontend llamará a un servicio de perfil con el token OIDC del usuario; el servicio validará `sub` y actualizará únicamente la identidad autenticada.
- **Rationale**: Evita exponer credenciales administrativas de Keycloak al navegador y permite aplicar validaciones, auditoría y límites de archivo en un único punto.
- **Alternatives considered**: Actualizar atributos directamente desde el navegador con la API administrativa de Keycloak; rechazado porque requeriría privilegios incompatibles con una SPA.

## Decisión 2: Almacenamiento del avatar

- **Decision**: Usar el MinIO existente para guardar el objeto y persistir en el atributo `avatar` de Keycloak el object key completo y estable con formato `profiles/{tenant_id}/{sub}/avatar.{extension}`.
- **Rationale**: El almacenamiento de objetos sobrevive a reinicios y separa identidad de binarios.
- **Alternatives considered**: Filesystem local del contenedor; rechazado por pérdida potencial al recrear el contenedor. Servicio nuevo de archivos; rechazado por alcance innecesario.

- **Security constraint**: El object key se construye exclusivamente con el tenant y `sub` autenticados; nunca se acepta una ruta de almacenamiento proporcionada por el navegador.

## Decisión 3: Cambio de clave

- **Decision**: Mostrar el flujo oficial de Keycloak dentro del modal cuando sea permitido por las políticas del navegador.
- **Rationale**: Keycloak conserva el control completo de la credencial y la aplicación nunca procesa la clave.
- **Alternatives considered**: Formulario propio; rechazado por riesgo de exposición. Redirección completa; se conserva como fallback operativo documentado si el embebido es bloqueado.

## Decisión 4: Fallback visual

- **Decision**: Mostrar la foto si la referencia carga correctamente; en cualquier ausencia o error mostrar iniciales derivadas de nombre y apellido.
- **Rationale**: El encabezado siempre conserva una identificación visual sin revelar datos adicionales.
- **Alternatives considered**: Avatar genérico fijo; rechazado porque no identifica al usuario.
