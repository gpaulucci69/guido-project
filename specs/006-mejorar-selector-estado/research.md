# Research: Mejorar selector de estado en modales

## Decision 1: conservar el control nativo `select`

- **Decision**: Mantener el selector HTML nativo y mejorar su presentación mediante marcado semántico y CSS.
- **Rationale**: Ya existe un `<select>` funcional en el formulario compartido. Conserva teclado, foco, selección, accesibilidad del navegador y envío mediante `FormData`.
- **Alternatives considered**: Dropdown personalizado o biblioteca de select; ambos se descartan por aumentar complejidad, superficie de accesibilidad y dependencias para un cambio visual.

## Decision 2: aplicar un único patrón a clientes y contadores

- **Decision**: Ajustar `openPeopleForm`, que construye ambos modales según `options.type`, y usar clases específicas del selector Estado.
- **Rationale**: El mismo formulario compartido ya define el campo Estado para cualquier identidad en edición. Una única fuente evita divergencias visuales y de comportamiento.
- **Alternatives considered**: Dos implementaciones separadas o un componente genérico nuevo; ambas duplicarían lógica sin aportar valor en este alcance.

## Decision 3: resolver el espacio disponible con estilos del modal y selector

- **Decision**: Mantener el desplazamiento del modal existente y agregar estilos de ancho completo, foco, deshabilitado, apertura y error sin modificar la fuente de estados.
- **Rationale**: El modal ya tiene `max-height` y `overflow: auto`; el selector debe integrarse a ese comportamiento.
- **Alternatives considered**: Overlay o portal para las opciones; descartado porque complicaría el stacking y solo sería necesario para un dropdown custom.

## Decision 4: validación proporcional al cambio

- **Decision**: Ejecutar typecheck, lint, formato y suite de tests existente; complementar con validación manual del DOM y del modal en navegador.
- **Rationale**: La feature es principalmente visual, pero debe verificar regresión del modo solo lectura y del guardado existente.
- **Alternatives considered**: Solo inspección visual o una suite E2E completa nueva; la primera es insuficiente y la segunda es desproporcionada para este cambio acotado.
