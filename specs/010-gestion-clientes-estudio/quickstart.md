# Quickstart: Gestión de clientes por tipo

1. Aplicar `infra/migrations/prisma/20261113_client_types.sql` en la base de datos de prueba.
2. Ejecutar `npm run typecheck`, `npm run lint` y `npm test`.
3. Con un usuario autorizado, crear una persona física con nombre, apellido y CUIT válido.
4. Crear una persona moral con razón social y CUIT válido.
5. Filtrar por cada tipo y verificar que no aparecen atributos del tipo opuesto.
6. Intentar repetir un CUIT dentro del mismo estudio y confirmar el error `409`.
7. Intentar operar sobre un cliente de otro estudio y confirmar que no se revela su existencia.
8. Inactivar un cliente y confirmar que permanece auditable.
