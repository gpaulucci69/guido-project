# Research: Autorización multi-tenant basada en permisos

## Decisión 1: realm compartido y client-roles con atributos

**Decision**: Mantener el realm `saas-contable` compartido. Configurar client-roles con atributos repetibles `route` y `action`; un custom mapper los proyectará a un claim de permisos del JWT.

**Rationale**: Coincide con la decisión previa del proyecto: el tenant es contexto de negocio y no un realm independiente. Los permisos declarativos permiten agregar una pantalla o acción sin modificar condicionales por nombre de rol.

**Alternatives considered**: Un realm por tenant aumenta el costo operativo y no resuelve por sí solo la cartera; comparar nombres de roles duplica la política y obliga a desplegar código para cambios de permisos.

## Decisión 2: claim normalizado de permisos

**Decision**: Normalizar el mapper a un claim `permissions` con objetos `{ type: "route" | "action", value: string }`. El evaluador deduplica valores y rechaza entradas vacías o inválidas.

**Rationale**: Backend y frontend no dependen de la forma interna de los atributos de Keycloak. La configuración conserva ejemplos como `/home/users`, `/home/clients`, `add/user`, `add/customer`, `view/customers/all` y `view/customers/own`.

**Alternatives considered**: Exponer atributos separados requiere más formas de claim; conservar el objeto administrativo completo de Keycloak acopla consumidores a una respuesta interna.

## Decisión 3: autorización en dos dimensiones

**Decision**: El permiso declara la capacidad; el backend aplica además `tenant_id` y, para `own`, la relación de cartera. `view/customers/all` nunca permite cruzar el tenant autenticado.

**Rationale**: Un permiso de pantalla no debe convertirse en bypass de aislamiento. La cartera es una regla de datos y no solo una opción de menú.

**Alternatives considered**: Codificar la cartera en atributos de rol no sustituye la comprobación persistida y puede quedar desactualizado.

## Decisión 4: renovación de tokens

**Decision**: El SPA usa renovación OIDC; ante fallo, cancela la operación, limpia la sesión y redirige al login. El backend nunca acepta un access token vencido.

## Decisión 5: demo

**Decision**: El modo demo se habilita únicamente mediante una bandera explícita y se marca visiblemente; la ausencia de la bandera fuerza OIDC real.

**Rationale**: Es la decisión aclarada por el usuario. La custodia de la bandera debe ser una medida operativa del entorno donde se habilite.
