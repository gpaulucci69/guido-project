# Research: Iconos para acciones de listados

## Decision 1: SVG inline sin dependencia

- **Decision**: Usar tres SVG inline simples para editar, inactivar y activar dentro de botones existentes.
- **Rationale**: El proyecto ya usa SVG inline en navegación, no requiere red ni paquete adicional y permite controlar tamaño, trazo y `aria-hidden`.
- **Alternatives considered**: Biblioteca de iconos; descartada por alcance pequeño y dependencia innecesaria. Emoji; descartados por variación visual y accesibilidad inconsistente.

## Decision 2: conservar botones HTML

- **Decision**: Mantener `<button>` como elemento interactivo y cambiar solo su contenido visual.
- **Rationale**: Conserva foco, teclado, handlers y semántica de acción sin recrear comportamiento accesible.
- **Alternatives considered**: Enlaces o elementos `div`; descartados porque degradan la semántica y requieren lógica adicional.

## Decision 3: tooltip nativo complementado por nombre accesible

- **Decision**: Usar `title` para la ayuda contextual y `aria-label` para lectores de pantalla; el icono será `aria-hidden`.
- **Rationale**: Es la solución más pequeña compatible con el frontend actual y cubre puntero, teclado y tecnologías de asistencia básicas.
- **Alternatives considered**: Tooltip custom con posicionamiento y gestión de foco; descartado por complejidad no necesaria para este alcance.
