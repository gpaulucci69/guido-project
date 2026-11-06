# Data Model: Activar e inactivar registros desde listados

La feature no agrega entidades ni columnas. Usa el modelo existente de identidad administrable.

## Registro administrable

| Campo | Tipo | Uso | Invariante |
|---|---|---|---|
| `id` | Identificador | Registro que se actualiza | No cambia durante la transición |
| `type` | `client` o `user` | Listado y autorización | No cruza tipos |
| `enabled` | Booleano | Estado actual | `true` = `Activo`; `false` = `Inactivo` |
| datos personales | Texto/email | Información conservada | No cambia al activar/inactivar |
| tenant | Contexto | Aislamiento de la operación | Coincide con el tenant del operador |

## Transiciones

```text
Activo --[confirmar Inactivar]--> Inactivo
Inactivo --[confirmar Activar]--> Activo
```

- Cancelar no produce transición.
- Un error no produce una transición confirmada.
- Cada transición conserva `id`, `type`, tenant y datos personales.
- La acción mostrada siempre es la transición opuesta al estado actual.

## Autorización

- Cliente: `client/update`.
- Contador: `user/update`.
- El servidor vuelve a validar tipo y tenant.
- Se mantienen las restricciones existentes para administradores protegidos.
