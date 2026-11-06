# Implementation Plan: Activar e inactivar registros desde listados

**Branch**: `007-activar-inactivar-registros` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-activar-inactivar-registros/spec.md`

## Summary

Reemplazar la acción destructiva `Eliminar` de los listados de clientes y contadores por una acción contextual de cambio de estado. Los registros activos mostrarán `Inactivar`; los inactivos mostrarán `Activar`. La operación reutilizará la actualización existente del campo `enabled`, requerirá confirmación y conservará el registro, su identificador y sus datos.

## Technical Context

**Language/Version**: TypeScript 5.x, CSS, Node.js >=20

**Primary Dependencies**: Vite, TypeScript, Vitest, TanStack Table; API existente de personas

**Storage**: Keycloak a través del profile-service existente; no se agrega persistencia

**Testing**: Vitest, typecheck, ESLint, Prettier y escenarios manuales del quickstart

**Target Platform**: Navegador web moderno; servicios existentes del monorepo

**Project Type**: Aplicación web frontend con API backend existente

**Performance Goals**: Una actualización y una recarga del listado, sin llamadas adicionales innecesarias

**Constraints**: Interfaz en español; preservar aislamiento tenant, validación de tipo, autenticación y permisos; no borrar físicamente; reutilizar `PeopleUpdate.enabled`; confirmación explícita

**Scale/Scope**: Listados existentes de clientes (`type=client`) y contadores (`type=user`), principalmente `apps/frontend/src/features/people/`; revisar backend solo si el contrato actual bloquea actualizar `enabled`

## Constitution Check

_Gate: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. SDD y criterios verificables**: PASS. Las transiciones y resultados visibles están definidos en la especificación.
- **II. Aislamiento multi-tenant y seguridad**: PASS. Se conserva el flujo autenticado y se exige validar tipo y tenant antes de actualizar.
- **III. Observabilidad**: PASS. Se reutiliza la operación de actualización existente y su auditoría.
- **IV. Testing integral**: PASS. El quickstart cubre estados, confirmación, cancelación, errores, permisos y ausencia de eliminación física.
- **V. Calidad/SOLID**: PASS. Se reutiliza `updatePerson` y se parametriza la acción por estado.
- **VI. KISS/YAGNI**: PASS. No se agregan endpoints ni dependencias si el PATCH existente soporta `enabled`.
- **VII. Localización**: PASS. Acciones, confirmaciones y errores permanecen en español.

## Project Structure

```text
specs/007-activar-inactivar-registros/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── checklists/requirements.md

apps/frontend/src/features/people/
├── people-api.ts           # Reutilización de updatePerson para enabled
└── people-view.ts          # Acción contextual, confirmación y refresco

apps/profile-service/src/people/  # Solo si la autorización actual requiere ajuste
packages/contracts/people.ts      # PeopleUpdate.enabled ya existente
```

**Structure Decision**: La acción se implementará en la vista parametrizada existente, usando `row.original.enabled` para determinar la etiqueta y `updatePerson` para persistir `enabled: !enabled`. Clientes y contadores compartirán exactamente el mismo flujo.

## Phase 0: Research Summary

Las decisiones sobre reutilización del PATCH, permisos y reversibilidad están documentadas en [research.md](./research.md). No quedan decisiones técnicas pendientes.

## Phase 1: Design Summary

- [data-model.md](./data-model.md) documenta el estado y sus transiciones.
- No se crea contrato nuevo: `PeopleUpdate.enabled` ya existe; se verificará que el backend acepte el cambio con las autorizaciones vigentes.
- [quickstart.md](./quickstart.md) define validación automatizada y manual para ambos listados.

## Constitution Check — Post-Design

- **Alcance**: PASS. Se elimina la acción visible `Eliminar` de los listados incluidos y se limita la mutación a `enabled`.
- **Seguridad**: PASS. No se amplían permisos ni se omiten tenant/tipo.
- **Persistencia**: PASS. No se elimina ni recrea la identidad; se actualiza el campo existente.
- **Calidad y localización**: PASS. La lógica se centraliza y todos los textos definidos están en español.

No quedan gates fallidos.

## Complexity Tracking

No hay violaciones constitucionales ni complejidad adicional que justificar.
