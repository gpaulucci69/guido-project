# UI Contracts: Transformar frontend a React

## Application shell

- Renderiza autenticación, layout, navegación, encabezado y contenido.
- Solo ofrece rutas presentes en los permisos de la sesión.
- La sesión expirada muestra el diálogo existente y permite volver a autenticarse.

## Domain views

- Welcome: saludo, contexto del cliente y perfil.
- Clients: listar, filtrar, crear, editar y cambiar estado.
- People: listar, crear, editar, asignar rol, administrar avatar y cambiar estado.
- Profile: editar datos, avatar y clave.
- Financial and operational views: conservar obligaciones, pagos, reportes, notificaciones y portal.

## API boundary

Los clientes API son la única frontera con los servicios. Cada petición incluye el token actual, acepta `204 No Content`, convierte errores a mensajes en español y gestiona sesión expirada.

## Accessibility contract

- Cada modal tiene nombre accesible, foco inicial y cierre por Escape.
- Botones y controles tienen etiquetas en español.
- Los estados de carga, error, vacío y éxito son comprensibles.
