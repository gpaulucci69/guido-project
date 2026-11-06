# Data Model: Mejorar selector de estado en modales

Esta feature no introduce entidades, campos ni persistencia nuevos. Documenta los datos existentes que el selector representa y los invariantes que deben preservarse.

## AdministrableIdentity

Identidad ya existente que se edita desde el formulario compartido.

| Campo | Tipo conceptual | Uso en esta feature | Regla |
|---|---|---|---|
| `id` | Identificador | Identifica el registro que se actualizaría | No se modifica |
| `type` | `client` o `user` | Determina si el modal corresponde a cliente o contador | No se modifica |
| `enabled` | Booleano | Valor actual del campo Estado | `true` se muestra como `Activo`; `false` como `Inactivo` |
| datos personales | Texto/email | Permanecen en el mismo formulario | Sin cambios de validación |

## Estado del formulario

- **Valor inicial**: se deriva de `person.enabled` al abrir el modal.
- **Opciones**: exactamente las existentes: `Activo` (`true`) e `Inactivo` (`false`). No se agregan ni renombran opciones.
- **Edición permitida**: solo si existe el permiso de actualización correspondiente (`client/update` o `user/update`).
- **Modo solo lectura**: si se puede abrir la edición pero falta el permiso de actualización, el selector permanece deshabilitado y el valor es legible.
- **Persistencia**: el valor solo se envía al flujo existente al activar `Actualizar`; cancelar o cerrar no persiste la selección.
- **Error**: un fallo de guardado conserva el formulario y su valor visual para permitir reintento o corrección.

## Relaciones

- `PeopleForm` representa tanto una identidad `client` como una `user`.
- El selector Estado es un campo de presentación del formulario; no crea una entidad independiente.
- La autorización existente determina la transición permitida del estado del formulario, no la lista de opciones.
