# Implementation Plan: Mejorar selector de estado en modales

**Branch**: `006-mejorar-selector-estado` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-mejorar-selector-estado/spec.md`

## Summary

Mejorar la presentación y accesibilidad visual del campo Estado en los modales compartidos de edición de clientes y contadores. La solución mantiene el elemento `select` nativo para conservar navegación por teclado y comportamiento de formulario, agrega una estructura de presentación identificable para el selector y centraliza sus estilos en la hoja global existente. No cambia las opciones, permisos, validación ni persistencia.

## Technical Context

**Language/Version**: TypeScript 5.x, CSS, Node.js >=20

**Primary Dependencies**: Vite, TypeScript, Vitest; UI basada en DOM nativo sin framework

**Storage**: N/A para esta feature; el estado continúa persistiendo mediante el flujo existente de personas

**Testing**: Vitest para pruebas automatizadas; validación manual/E2E del modal en navegador mediante el quickstart

**Target Platform**: Navegador web moderno en desktop y ventanas reducidas

**Project Type**: Aplicación web frontend dentro de un monorepo

**Performance Goals**: El selector debe abrirse y reflejar la selección sin latencia perceptible en el formulario existente; no se agregan llamadas de red

**Constraints**: Interfaz en español; preservar permisos `edit`/`update`; preservar estados y flujo de guardado; foco visible; opciones no recortadas por el modal; sin dependencias nuevas

**Scale/Scope**: Un componente de formulario compartido por los modales de edición de clientes y contadores; cambios limitados a `apps/frontend/src/features/people/people-form.ts` y `apps/frontend/src/styles.css`, más pruebas si resultan necesarias

## Constitution Check

_Gate: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. SDD y criterios verificables**: PASS. El plan deriva de `spec.md` y define validación observable del selector en ambos modales.
- **II. Aislamiento multi-tenant y seguridad**: PASS. No se modifican datos, permisos, autenticación ni llamadas de backend.
- **III. Observabilidad**: PASS. No se agrega una operación de negocio ni un nuevo evento; se conserva el flujo existente.
- **IV. Testing integral**: PASS. Se cubren comportamiento visual, permisos, teclado, tamaños reducidos y regresión del guardado mediante pruebas del frontend y validación manual.
- **V. Calidad/SOLID**: PASS. Se reutiliza el formulario compartido y se evita duplicar lógica para clientes y contadores.
- **VI. KISS/YAGNI**: PASS. Se conserva el `select` nativo y se evita incorporar un componente o dependencia de dropdown.
- **VII. Localización**: PASS. Se conserva el texto en español y se mantienen las etiquetas `Activo` e `Inactivo`.

## Project Structure

### Documentation (this feature)

```text
specs/006-mejorar-selector-estado/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── contracts/              # No aplica: no se modifican interfaces externas
```

### Source Code (repository root)

```text
apps/frontend/
├── src/
│   ├── features/people/
│   │   └── people-form.ts  # Marcado del selector Estado compartido
│   └── styles.css          # Estilos del selector, estados y responsive
└── ...
```

**Structure Decision**: Se selecciona la estructura de aplicación web frontend existente. La edición de clientes y contadores converge en `openPeopleForm`, por lo que una sola modificación cubre ambos modales sin crear abstracciones adicionales. Los estilos globales existentes son el lugar actual para los controles de formulario y el modal.

## Phase 0: Research Summary

Las decisiones y alternativas evaluadas están documentadas en [research.md](./research.md). No quedan decisiones técnicas sin resolver.

## Phase 1: Design Summary

- [data-model.md](./data-model.md) documenta las entidades existentes y los invariantes que deben conservarse.
- No se genera contrato en `contracts/`: la feature no expone ni modifica una API o contrato externo.
- [quickstart.md](./quickstart.md) define la validación automatizada y manual de los criterios de aceptación.

## Constitution Check — Post-Design

- **SDD y alcance**: PASS. El diseño cubre únicamente FR-001 a FR-011 y no agrega estados, APIs ni acciones CRUD.
- **Seguridad y tenant**: PASS. No se toca la fuente de datos ni se relajan permisos; el modo deshabilitado queda explícitamente preservado.
- **Calidad y pruebas**: PASS. El quickstart incluye typecheck, lint, formato, tests y comprobación manual de teclado, responsive y regresión.
- **Simplicidad y mantenibilidad**: PASS. Se reutiliza el formulario común y el `select` nativo, sin dependencias ni abstracciones nuevas.
- **Localización**: PASS. Las etiquetas y mensajes existentes permanecen en español.

No quedan gates fallidos ni decisiones técnicas pendientes.

## Complexity Tracking

No hay violaciones constitucionales ni complejidad adicional que justificar.
