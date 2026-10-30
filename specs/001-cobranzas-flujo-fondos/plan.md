# Implementation Plan: Sistema de Gestión de Cobranzas y Flujo de Fondos v1.0

**Branch**: `001-cobranzas-flujo-fondos` | **Date**: 2026-10-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-cobranzas-flujo-fondos/spec.md`

## Summary

Sistema de cobranzas multi-tenant para estudios contables argentinos que centraliza el ciclo de vida completo de obligaciones de pago (Pendiente → Vencida → Pagada / Pago Parcial / Cancelado), automatiza el reclamo de deudas por correo electrónico con auditoría inmutable, gestiona rendiciones y validación de comprobantes (incluyendo pagos parciales, saldo a favor e imputación manual), y expone un reporte consolidado de flujo de fondos (cobrado vs. pendiente).

La arquitectura se descompone en cuatro microservicios NestJS/TypeScript sobre Kubernetes (K3s/Contabo), con aislamiento multi-tenant por RLS en PostgreSQL vía Prisma, mensajería asíncrona con NATS JetStream, identidad centralizada en Keycloak y frontend SPA con React/TypeScript.

## Technical Context

**Language/Version**: TypeScript 5.x — backend NestJS 10, frontend React 18

**Primary Dependencies**:

- Backend: NestJS, Prisma ORM, `@nestjs/microservices` (NATS transport), Pino logger, `@nestjs/terminus`, Zod
- Frontend: React 18, TanStack Query v5, TanStack Table v8, Zustand, `oidc-client-ts`, Tailwind CSS, Radix UI / Shadcn

**Storage**: PostgreSQL 16 (RLS habilitado) con Prisma ORM + MinIO / S3-compatible para almacenamiento de comprobantes de pago

**Testing**:

- Backend: Vitest / Jest + Testcontainers (PostgreSQL + NATS)
- Frontend: Vitest + React Testing Library; Playwright para E2E

**Target Platform**: Clúster K3s sobre VPS Contabo (Linux), contenedores Docker; Traefik como Ingress/Gateway

**Project Type**: Aplicación web SaaS multi-tenant (microservicios backend + SPA frontend)

**Performance Goals**:

- Validación de pago: en una cartera estándar de hasta 500 clientes, el 95% de las confirmaciones responde con estado del pago, nuevo saldo de obligación y saldo a favor si corresponde en < 2 segundos; ningún resultado exitoso supera 3 segundos (SC-010)
- Evaluación diaria de vencimientos: procesamiento en background, usando `America/Argentina/Buenos_Aires`, con transición idempotente a `Vencida` antes del despacho de reclamos y sin impacto en la UI (FR-003, SC-001)
- Reporte de flujo de fondos: tiempo de respuesta < 3 segundos con cartera estándar de hasta 500 clientes

**Constraints**:

- Memoria RAM por microservicio en reposo: ≤ 40 MB (optimización VPS Contabo)
- Almacenamiento de comprobantes: máximo 15 MB por archivo
- Zona horaria operativa: `America/Argentina/Buenos_Aires` (ART, UTC-3)
- Moneda exclusiva: AR$ (Pesos Argentinos, `DECIMAL(14,2)` sin punto flotante)
- Idioma de interfaz: español (es-AR)

**Scale/Scope**:

- Fase 1: hasta ~50 estudios contables; cada estudio con hasta ~500 clientes
- 4 microservicios + 1 SPA frontend + infraestructura de soporte (Keycloak, NATS, PostgreSQL, MinIO, Traefik)

## Constitution Check

_GATE pre-Phase 0 — re-verificado post-Phase 1_

| Principio Constitucional                     | Estado | Evidencia en este Plan                                                                                                                   |
| -------------------------------------------- | :----: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| I. SDD — Sin código sin spec aprobada        |   ✅   | Plan derivado del spec v1.0 + sesión de clarificación completada                                                                         |
| I. Fidelidad al Spec — Cero scope creep      |   ✅   | Todos los componentes mapeados a FR/HU del spec; sin adiciones especulativas                                                             |
| I. Criterios verificables por la aplicación  |   ✅   | quickstart.md define escenarios de validación observables E2E                                                                            |
| II. Aislamiento Multi-Tenant Absoluto        |   ✅   | RLS en PostgreSQL + `tenant_id` obligatorio en todas las entidades compartidas; Prisma Extension inyecta `SET LOCAL` en cada transacción |
| II. RBAC (4 roles no negociables)            |   ✅   | `SUPER_ADMIN`, `STUDIO_ADMIN`, `ACCOUNTANT`, `CLIENT_VIEWER` modelados en Keycloak y validados en Guards de NestJS                       |
| III. Observabilidad con contexto             |   ✅   | Pino JSON con `traceId`, `tenant_id`, `userId` en cada log; `/healthz`, `/livez`, `/readyz` vía `@nestjs/terminus`                       |
| IV. Testing con entornos reales + caja negra |   ✅   | Testcontainers (PostgreSQL con RLS + NATS); Playwright E2E sobre flujos críticos; criterios validados por comportamiento observable      |
| IV. Cobertura ≥ 80%                          |   ✅   | Quality gate en CI para lógica de negocio y servicios                                                                                    |
| V. SOLID en todos los servicios              |   ✅   | Inversión de dependencias via interfaces de repositorio en NestJS DI; SRP por microservicio; módulos cohesivos                           |
| VI. Simplicidad KISS/YAGNI                   |   ✅   | 4 microservicios alineados a dominios reales; sin capas de abstracción adicionales no justificadas por la spec                           |
| VII. Interfaz en Español + moneda AR$        |   ✅   | FR-017 + formateo `es-AR` centralizado en frontend; `DECIMAL(14,2)` en DB                                                                |

**Resultado del Gate**: ✅ APROBADO — Sin violaciones. Plan alineado con los 7 principios constitucionales.

## Project Structure

### Documentation (this feature)

```text
specs/001-cobranzas-flujo-fondos/
├── plan.md              # Este archivo
├── research.md          # Fase 0 — decisiones de diseño y justificaciones
├── data-model.md        # Fase 1 — modelo de datos, entidades, transiciones
├── quickstart.md        # Fase 1 — guía de validación E2E
├── contracts/           # Fase 1 — contratos de API REST y eventos NATS
│   ├── api-rest.md
│   └── events-nats.md
└── tasks.md             # Fase 2 — generado por /speckit-tasks (NO por este plan)
```

### Source Code (repository root)

```text
apps/
├── identity-sync-service/        # NestJS — integración Keycloak, validación tokens, RBAC
│   ├── src/
│   │   ├── auth/                 # Guards JWT, estrategias OIDC
│   │   ├── tenants/              # Gestión de membresías y cartera de clientes por tenant
│   │   └── main.ts
│   └── test/
│
├── accounting-client-service/    # NestJS — catálogo de clientes y parámetros del estudio
│   ├── src/
│   │   ├── clients/              # CRUD de clientes del estudio
│   │   ├── settings/             # Parámetros de notificación global del estudio
│   │   └── main.ts
│   └── test/
│
├── billing-workflow-service/     # NestJS — núcleo de obligaciones, pagos y saldos a favor
│   ├── src/
│   │   ├── obligations/          # Entidad y ciclo de vida de obligaciones de cobro
│   │   ├── payments/             # Rendición, validación y rechazo de pagos
│   │   ├── credit-balance/       # Saldo a favor: acreditación e imputación
│   │   ├── reports/              # Reporte de flujo de fondos
│   │   ├── storage/              # Carga y acceso a comprobantes (MinIO/S3)
│   │   └── main.ts
│   └── test/
│
├── notification-service/         # NestJS — plantillas de correo, cron de vencimientos, auditoría
│   ├── src/
│   │   ├── templates/            # Plantillas de correo (reclamo, rechazo, confirmación)
│   │   ├── scheduler/            # Cron diario de evaluación de vencimientos
│   │   ├── dispatch/             # Despacho de correos y reintentos
│   │   ├── audit/                # Historial inmutable de correos emitidos
│   │   └── main.ts
│   └── test/
│
└── frontend/                     # React 18 SPA — portal de contadores y portal de clientes
    ├── src/
    │   ├── features/
    │   │   ├── obligations/      # Listado, alta y detalle de obligaciones
    │   │   ├── payments/         # Rendición, validación y rechazo de pagos
    │   │   ├── credit-balance/   # Visualización e imputación de saldo a favor
    │   │   ├── reports/          # Panel de flujo de fondos con selector de fechas
    │   │   └── client-portal/    # Vista del cliente: sus obligaciones, rendiciones y saldo
    │   ├── lib/
    │   │   ├── api/              # Clientes HTTP + TanStack Query hooks
    │   │   ├── auth/             # oidc-client-ts, token refresh silencioso
    │   │   └── formatters/       # Formateo centralizado AR$ (Intl.NumberFormat es-AR)
    │   └── main.tsx
    └── test/

infra/
├── k8s/
│   ├── traefik/                  # IngressRoute, middlewares JWT, TLS
│   ├── keycloak/                 # Deployment, realm config, client OIDC por tenant
│   ├── nats/                     # StatefulSet NATS JetStream
│   ├── postgres/                 # StatefulSet PostgreSQL + ConfigMap RLS bootstrap
│   └── minio/                    # Deployment MinIO (S3-compatible)
└── migrations/
    └── prisma/                   # Schema Prisma + job K8s para prisma migrate deploy
```

**Structure Decision**: Monorepo multi-aplicación con `apps/` separados por microservicio. Cada servicio es desplegable e iterable de forma independiente. El frontend SPA opera como aplicación separada. La infraestructura declarativa vive en `infra/`.

## Implementation Phases

### Fase 1 — Cimientos e Infraestructura (K8s + Keycloak + NATS + MinIO)

Despliegue declarativo de la infraestructura base sobre K3s/Contabo. Sin lógica de negocio.

- Manifiestos K8s: Traefik (Ingress + middleware JWT), Keycloak (Realm + Client OIDC por tenant), NATS JetStream (StatefulSet), PostgreSQL (StatefulSet + RLS bootstrap), MinIO.
- Verificación: health endpoints de cada componente accesibles y responden antes de avanzar.

### Fase 2 — Modelo de Datos y RLS (Prisma + PostgreSQL)

Definición del esquema de datos y políticas de aislamiento.

- Schema Prisma con todas las entidades del módulo de cobranzas.
- Políticas RLS activadas por tabla (`ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`).
- Prisma Client Extension con `SET LOCAL app.current_tenant` inyectado en cada operación.
- Kubernetes Job `prisma migrate deploy` ejecutado en pre-deployment.

### Fase 3 — Servicios de Dominio NestJS

Implementación de la lógica de negocio en los tres servicios de dominio.

- `identity-sync-service`: Guards JWT, extracción de claims, asignación de cartera.
- `accounting-client-service`: CRUD de clientes, parámetros globales de reclamo del estudio.
- `billing-workflow-service`: Ciclo de vida de obligaciones, rendición/validación/rechazo/cancelación lógica de pagos, acreditación automática como saldo a favor de pagos pendientes cuando se cancela una obligación, imputación, carga de comprobantes a MinIO, reporte de flujo de fondos y auditoría de cancelaciones sin eliminación física (FR-009, FR-014, SC-006).

### Fase 4 — Automatización y Notificaciones

- `notification-service`: cron diario en ART que actualiza obligaciones vencidas de forma idempotente antes de despachar reclamos, plantillas de correo, reclamo manual (evento NATS), rechazo de pago (evento NATS), enlaces de acción rápida de un solo uso con expiración a las 24 horas, reintento ante fallos, historial de auditoría inmutable y alertas de fallo (FR-003–FR-007, FR-008b, SC-001–SC-002).

### Fase 5 — Frontend SPA

- Portal de contadores: gestión de obligaciones, validación/rechazo de pagos, imputación de saldo a favor, reporte de flujo de fondos.
- Portal de clientes: listado de obligaciones, rendición de pagos con comprobante, visualización de saldo a favor.
- Enlace de acción rápida (token de uso único, válido durante 24 horas o hasta su primer uso) desde correos de reclamo → formulario de rendición sin login completo.

### Fase 6 — Pruebas y CI/CD

- Tests de integración con Testcontainers (PostgreSQL con RLS activado + NATS).
- Tests E2E con Playwright para flujos críticos de negocio.
- Pruebas E2E y de rendimiento para transición idempotente a `Vencida`, cancelación lógica de obligaciones y pagos, acreditación automática de pagos pendientes como saldo a favor al cancelar una obligación, expiración de tokens a las 24 horas, reglas consolidadas de reclamos y latencia de validación de pagos (FR-003, FR-009, FR-014, SC-001, SC-002, SC-006, SC-010).
- GitHub Actions: lint + type-check + test + build Docker + push registry + deploy K8s.
- Quality gate CI: cobertura ≥ 80% en lógica de negocio.

## Complexity Tracking

> Sin violaciones constitucionales en este plan. No requiere justificaciones de complejidad.
