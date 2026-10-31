# Implementation Plan: Autorización multi-tenant basada en permisos de Keycloak

**Branch**: `002-autenticacion-multi-tenant` | **Date**: 2026-10-30 | **Spec**: [spec.md](./spec.md)

## Summary

Implementar autenticación OIDC y autorización multi-tenant en el SPA y los servicios backend. Keycloak seguirá usando el realm compartido `saas-contable`; sus client-roles tendrán atributos declarativos `route` y `action`. Un custom mapper incluirá esos atributos en el JWT dentro de `authorization.routes/actions`, junto con `authorization.client_id`. La aplicación normalizará esos valores a permisos internos (`route`/`action`) y `tenantId`; no comparará nombres de roles como `CLIENT_VIEWER` o `ACCOUNTANT`.

La autorización se centralizará en un contexto de identidad compartido, guards de backend y un helper de permisos para frontend. El `client_id` de Keycloak identifica externamente al tenant; el backend lo resuelve mediante `Tenant.clientId` al UUID interno `Tenant.id`, que se expone a la lógica como `tenantId`. Para el entorno actual, el client id externo es `guido`. Los endpoints de negocio exigirán autenticación y permisos; la visibilidad de la UI será una conveniencia derivada del mismo contexto, nunca el control de seguridad.

## Technical Context

**Language/Version**: TypeScript, Node.js >=20, navegador moderno

**Primary Dependencies**: Keycloak 26.1 / OIDC, `oidc-client-ts` para el SPA, guards compatibles con los servicios existentes, Vitest, TypeScript strict

**Storage**: PostgreSQL 16 con `tenant_id` y RLS ya definidos; Keycloak usa PostgreSQL separado

**Testing**: Vitest unit/contract/integration, pruebas de seguridad de caja negra, mediciones de login/renovación y quickstart contra servicios levantados; cobertura mínima de 80% en lógica de negocio y servicios

**Target Platform**: SPA web y servicios Linux containerizados

**Project Type**: Monorepo web multi-servicio con frontend SPA

**Performance Goals**: Las decisiones de autorización locales no deben añadir una llamada de red por renderizado ni por endpoint; la renovación válida debe completar la operación sin relogin en al menos 95% de los casos

**Constraints**: Ningún endpoint de negocio anónimo; denegación por defecto; tenant resuelto desde `authorization.client_id` mediante `Tenant.clientId`; una operación requiere exactamente un permiso; rutas explícitas sin herencia implícita; permisos desconocidos generan advertencia y deniegan solo esa operación; nombres de roles no hardcodeados; demo permitido en cualquier entorno solo con bandera explícita; errores en español sin filtración cross-tenant

**Scale/Scope**: Hasta 50 estudios y aproximadamente 500 clientes por estudio en la primera fase; permisos extensibles sin cambiar código

## Constitution Check

### Pre-Phase 0

- **I. SDD y verificabilidad**: PASS. Hay contratos y escenarios observables para login, permisos, aislamiento y escalamiento.
- **II. Aislamiento y mínimo privilegio**: PASS. `authorization.client_id` se normaliza a `tenantId` y la cartera se verifica en backend; los permisos se deniegan por defecto.
- **III. Observabilidad**: PASS. Se auditarán autenticación, denegaciones, cross-tenant y demo con `sub`, `tenantId` cuando exista y `traceId`.
- **IV. Testing >=80%**: PASS condicionado a T052. Se planifican pruebas unitarias de normalización, seguridad E2E/contract y una puerta automatizada que exige al menos 80% de cobertura en lógica de negocio y servicios.
- **V. SOLID**: PASS. Contexto, normalizador y evaluadores serán módulos cohesivos.
- **VI. KISS/YAGNI**: PASS. Se usa un único modelo declarativo; no se crea una jerarquía de roles en la aplicación.
- **VII. Localización**: PASS. Los errores y estados visibles permanecen en español.

## Project Structure

```text
specs/002-autenticacion-multi-tenant/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/authorization.md

apps/identity-sync-service/src/
├── auth/
│   ├── identity-context.ts
│   ├── permission-context.ts
│   ├── permission-evaluator.ts
│   ├── token-verifier.ts
│   └── guards/
│       ├── authentication.guard.ts
│       ├── permission.guard.ts
│       └── portfolio.guard.ts
└── tenants/portfolio-authorization.service.ts

apps/*/src/              # aplicación de guards/contexto en cada servicio
apps/frontend/src/auth/  # OIDC, sesión y evaluación de permisos
infra/keycloak/          # realm, client-roles y custom mapper versionados
tests/security/          # aislamiento, permisos y escalamiento
```

**Structure Decision**: Se mantienen los límites actuales del monorepo. `identity-sync-service` será dueño del parsing, validación y normalización del contexto; cada servicio aplicará guards antes de sus casos de uso. El frontend compartirá un evaluador de permisos, pero el backend seguirá siendo autoritativo. La configuración reproducible de Keycloak se versionará bajo `infra/keycloak`.

## Phase 0: Research

Ver [research.md](./research.md). Las decisiones resueltas son: representación del permiso en el token, custom mapper de client-role attributes, validación de issuer/audience/firma, renovación OIDC y separación entre autorización declarativa y alcance de datos.

## Phase 1: Design

- Ver [data-model.md](./data-model.md) para el contexto de identidad, permisos, cartera y eventos de seguridad.
- Ver [contracts/authorization.md](./contracts/authorization.md) para el contrato de claims normalizados y respuestas de autorización.
- Ver [quickstart.md](./quickstart.md) para la validación end-to-end.

## Complexity Tracking

No hay violaciones constitucionales que justificar. El custom mapper es una dependencia explícita del requisito de extensibilidad de permisos y evita hardcodear una matriz de roles en múltiples capas.
