# Implementation Plan: Iconos para acciones de listados

**Branch**: `008-iconos-acciones-listados` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-iconos-acciones-listados/spec.md`

## Summary

Reemplazar el texto visible de las acciones `Editar`, `Inactivar` y `Activar` en los listados de clientes y contadores por iconos SVG inline, conservando botones HTML, handlers, permisos y confirmaciones. Cada botón tendrá `aria-label`, `title` y foco visible; no se incorporará una dependencia de iconos.

## Technical Context

**Language/Version**: TypeScript 5.x, CSS, Node.js >=20

**Primary Dependencies**: Vite, TypeScript, Vitest, TanStack Table; SVG inline y DOM nativo

**Storage**: N/A; no se modifica persistencia

**Testing**: Typecheck, ESLint, Prettier, Vitest y validación manual de tooltip/teclado

**Target Platform**: Navegador web moderno, desktop y ventanas reducidas

**Project Type**: Aplicación web frontend

**Performance Goals**: Sin dependencias nuevas ni llamadas adicionales; la interacción conserva la latencia actual

**Constraints**: Textos accesibles y tooltips en español; conservar permisos y handlers; iconos distinguibles sin depender solo del color; sin cambiar estado, confirmaciones o persistencia

**Scale/Scope**: Acciones de las filas de `apps/frontend/src/features/people/people-view.ts` y estilos relacionados en `apps/frontend/src/styles.css`

## Constitution Check

_Gate: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. SDD y criterios verificables**: PASS. La especificación define iconos, nombres accesibles, tooltips y foco observable.
- **II. Seguridad multi-tenant**: PASS. No se modifican permisos, datos ni requests.
- **III. Observabilidad**: PASS. Se conservan los handlers y operaciones existentes.
- **IV. Testing integral**: PASS. Se validan regresiones, teclado, foco y tooltip.
- **V. Calidad/SOLID**: PASS. Se centralizan los SVG en el módulo de la vista sin duplicar flujos.
- **VI. KISS/YAGNI**: PASS. SVG inline evita una biblioteca nueva para tres iconos.
- **VII. Localización**: PASS. `aria-label`, `title` y mensajes continúan en español.

## Project Structure

```text
specs/008-iconos-acciones-listados/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── checklists/requirements.md

apps/frontend/src/features/people/
└── people-view.ts       # SVG inline, labels y marcado de acciones

apps/frontend/src/styles.css
                         # tamaño, separación, hover y foco de iconos
```

**Structure Decision**: La vista existente seguirá renderizando botones para preservar teclado y activación; cada botón contendrá un SVG `aria-hidden="true"` y conservará el texto de acción en `aria-label`/`title`, mientras CSS oculta únicamente el texto visual si se conserva como fallback.

## Phase 0: Research Summary

Las decisiones de iconografía, accesibilidad y tooltip están documentadas en [research.md](./research.md). No quedan decisiones pendientes.

## Phase 1: Design Summary

- [data-model.md](./data-model.md) documenta las acciones y su relación con el estado del registro.
- No se crean contratos ni cambios de API.
- [quickstart.md](./quickstart.md) define la validación automática y manual.

## Constitution Check — Post-Design

- **Alcance**: PASS. Solo cambia la representación de tres acciones existentes.
- **Accesibilidad**: PASS. Los botones siguen siendo enfocables, tienen nombre accesible, tooltip y foco visible.
- **Regresión funcional**: PASS. No se cambian selectores de datos, permisos, handlers ni payloads.
- **Simplicidad**: PASS. No se añade dependencia externa.

No quedan gates fallidos.

## Complexity Tracking

No hay violaciones constitucionales ni complejidad adicional que justificar.
