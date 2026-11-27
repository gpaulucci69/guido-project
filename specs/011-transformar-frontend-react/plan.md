# Implementation Plan: Transformar frontend a React

**Branch**: `011-transformar-frontend-react` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

## Summary

Reemplazar el frontend actual basado en generación manual de HTML por una aplicación React completa, con una nueva experiencia visual, manteniendo los contratos de API, autenticación OIDC, aislamiento por tenant, permisos y capacidades operativas existentes.

## Technical Context

**Language/Version**: TypeScript, Node.js >= 20

**Primary Dependencies**: React, React DOM, Vite, `oidc-client-ts`, TanStack Query, TanStack Table Core, Vitest

**Storage**: Sin almacenamiento adicional en frontend; PostgreSQL, Keycloak y MinIO permanecen detrás de los servicios actuales

**Testing**: TypeScript estricto, ESLint, Prettier, Vitest y pruebas de flujos observables contra los servicios existentes

**Target Platform**: Navegadores modernos, frontend servido por Vite/Docker

**Project Type**: Aplicación web frontend con servicios backend existentes

**Performance Goals**: La pantalla inicial debe ser interactiva dentro de 2 segundos después de disponer de la sesión; las tablas deben permanecer fluidas con hasta 1.000 registros cargados. La paginación podrá utilizarse como decisión de rendimiento.

**Constraints**: Una sola entrega de reemplazo; textos en español; fechas en formato argentino; no modificar reglas de autorización ni contratos backend sin justificación explícita

**Scale/Scope**: Todas las vistas y flujos existentes en `apps/frontend/src`, incluyendo autenticación, bienvenida, navegación, clientes, asociados, perfil, avatar, clave, obligaciones, pagos, reportes, notificaciones y portal

## Constitution Check

- **I. SDD**: PASS — spec y plan preceden a la implementación; los criterios se validarán por comportamiento observable.
- **II. Multi-tenant/RBAC**: PASS — React consumirá la identidad y permisos existentes.
- **III. Observabilidad**: PASS — se conservan los errores de API y sesión existentes.
- **IV. Testing**: PASS — se planifican pruebas unitarias, integración y flujos críticos; cobertura objetivo >=80%.
- **V. SOLID**: PASS — componentes, hooks, clientes API y vistas tendrán responsabilidades separadas.
- **VI. KISS/YAGNI**: PASS — se incorporarán solo dependencias necesarias.
- **VII. Localización**: PASS — interfaz en español y formato `es-AR`.

## Project Structure

```text
apps/frontend/
├── src/
│   ├── app/                 # composición, rutas y providers
│   ├── auth/                # sesión OIDC, identidad y permisos
│   ├── components/          # layout y componentes compartidos
│   ├── features/            # dominios de la aplicación
│   ├── lib/                 # cliente API y utilidades
│   ├── styles/              # estilos globales y tokens
│   ├── App.tsx
│   └── main.tsx
└── tests/

packages/contracts/          # contratos compartidos
apps/profile-service/         # perfil, roles, avatares y contexto
apps/accounting-client-service/ # clientes
apps/billing-workflow-service/  # obligaciones y operaciones
```

**Structure Decision**: Se conserva el frontend en `apps/frontend`, pero se reemplaza su punto de entrada y organización interna por componentes React agrupados por dominio. Los servicios backend permanecen como dependencias de contrato.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Reemplazo completo en una entrega | Decisión explícita del usuario | La migración incremental fue descartada durante clarification |
