# Implementation Plan: Encabezado y validación de sesión

**Branch**: `009-encabezado-sesion` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

## Summary

Compactar y reordenar el encabezado autenticado y centralizar la validación de sesión antes de acciones y refrescos. Se reutilizarán `oidc-client-ts`, `UserManager` y el `TokenManager` existente, con margen preventivo de 30 segundos, renovación silenciosa, deduplicación de renovaciones y modal de expiración antes de navegar al login.

## Technical Context

**Language/Version**: TypeScript, navegador moderno, Node.js del monorepo

**Primary Dependencies**: `oidc-client-ts`, Vite, Vitest, Keycloak OIDC (`saas-contable` / cliente `guido`)

**Storage**: `localStorage` mediante `WebStorageStateStore`; sin almacenamiento nuevo

**Testing**: Vitest y pruebas de integración/E2E del frontend contra Keycloak y la API

**Target Platform**: SPA web en navegador; Keycloak 26.1

**Project Type**: Aplicación web frontend con servicios backend autenticados

**Performance Goals**: La validación local no añade una llamada de red con token vigente; solicitudes concurrentes comparten una sola renovación.

**Constraints**: margen preventivo de 30 s; access token de referencia 300 s; SSO idle 1800 s; SSO máximo 36000 s; no ejecutar acciones protegidas con renovación fallida; textos visibles en español.

**Scale/Scope**: Todas las pantallas y acciones autenticadas del frontend, refrescos de navegación y llamadas API.

## Constitution Check

* **PASS** — Cumple el ciclo SDD y los criterios son observables mediante UI, API y pruebas de flujo.
* **PASS** — Mantiene aislamiento multi-tenant y mínimo privilegio al reconstruir identidad y permisos desde el token renovado.
* **PASS** — Incluye pruebas unitarias, integración y E2E para renovación, expiración, concurrencia y redirección.
* **PASS** — Reutiliza el cliente OIDC y el gestor de tokens existentes; no agrega persistencia ni dependencias innecesarias.
* **PASS** — Mensajes y controles nuevos estarán en español y el modal será accesible.

## Project Structure

```text
apps/frontend/src/
├── auth/oidc-client.ts       # ciclo OIDC, renovación y salida
├── auth/session.ts            # identidad y estado autenticado
├── components/app-header.ts   # orden y acciones del encabezado
├── components/session-expired-modal.ts
├── lib/api/client.ts          # token vigente antes de cada request
├── lib/auth/token-manager.ts  # margen y deduplicación
├── main.ts                    # navegación/refresco protegido
└── styles.css                 # encabezado y modal

apps/frontend/src/**/*.test.ts
tests/security/
```

**Structure Decision**: Mantener la lógica en `apps/frontend/src/auth` y `apps/frontend/src/lib/auth`, sin crear un servicio paralelo. El modal será un componente aislado; `main.ts` coordinará navegación y el cliente API obtendrá el access token desde el gestor central.

## Complexity Tracking

No hay violaciones constitucionales que justificar.
