# Implementation Plan: Encabezado de usuario y perfil del frontend

**Branch**: `feature/fronend-header` | **Date**: 2026-10-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Agregar un encabezado autenticado al frontend con alias, avatar, notificaciones visuales y menú de cuenta. El frontend consumirá un contrato de perfil propio para actualizar nombre, apellido, alias y avatar; Keycloak seguirá siendo la autoridad para identidad y cambio de clave, mientras MinIO almacenará los archivos de imagen.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript, Node.js >=20, navegador moderno

**Primary Dependencies**: frontend existente, `oidc-client-ts`, Keycloak OIDC/Account, MinIO/S3-compatible storage, Vitest

**Storage**: Atributos de perfil en Keycloak (`firstName`, `lastName`, `alias`, `avatar`) y objetos de avatar en MinIO

**Testing**: Vitest unit/contract/integration y validación E2E observable del frontend

**Target Platform**: SPA web en Chrome y navegadores modernos, servicios Linux containerizados

**Project Type**: Monorepo web multi-servicio con frontend SPA

**Performance Goals**: Perfil guardado y reflejado en el encabezado en menos de 3 segundos en condiciones normales; menú sin navegación adicional

**Constraints**: No almacenar claves en el frontend; autorización del backend obligatoria; avatar limitado a imágenes válidas; textos en español; notificaciones sin solicitudes en esta fase

**Scale/Scope**: Perfil propio de usuarios autenticados; un avatar activo por usuario; sin administración de perfiles de terceros

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Antes de investigación**

- I. SDD y verificabilidad: PASS. La spec define historias, escenarios y criterios observables.
- II. Aislamiento y mínimo privilegio: PASS. Solo se edita el perfil de la identidad autenticada.
- III. Observabilidad: PASS condicionado a registrar errores de perfil, almacenamiento y cambio de clave sin secretos.
- IV. Testing >=80%: PASS condicionado a pruebas de la lógica de perfil, validación de archivos y sesión.
- V. SOLID: PASS. El encabezado, perfil, almacenamiento y Keycloak se separan por contratos.
- VI. KISS/YAGNI: PASS. Las notificaciones no se implementan en esta fase.
- VII. Localización: PASS. Toda la interfaz y retroalimentación será en español.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
apps/frontend/src/
├── auth/
│   ├── oidc-client.ts
│   ├── session.ts
│   ├── profile.ts
│   └── profile.test.ts
├── components/
│   ├── app-header.ts
│   ├── profile-modal.ts
│   └── password-modal.ts
└── main.ts

apps/profile-service/src/
├── profile/
│   ├── profile.service.ts
│   ├── profile.controller.ts
│   ├── keycloak-profile.adapter.ts
│   └── avatar-storage.adapter.ts
└── main.ts

packages/contracts/profile.ts
tests/security/profile-security.spec.ts
tests/integration/profile.integration.spec.ts
```

**Structure Decision**: Se mantiene el frontend existente y se agrega un servicio de perfil dedicado para aislar las credenciales de integración y las operaciones de actualización. El navegador nunca recibe credenciales administrativas de Keycloak ni claves de MinIO. El contrato de perfil acepta únicamente la identidad autenticada del token y el servicio valida que la identidad solicitante coincida con el usuario actualizado.

## Design decisions

- El encabezado consume el contexto OIDC existente y no crea una segunda sesión.
- `alias` y `avatar` se leen desde los atributos del perfil de Keycloak.
- El servicio de perfil guarda el archivo en MinIO con el object key estable `profiles/{tenant_id}/{sub}/avatar.{extension}` y persiste ese object key completo en Keycloak como referencia de avatar. El navegador nunca puede elegir una ruta arbitraria.
- La actualización de nombre, apellido y alias se realiza en una única operación lógica. Para el avatar, el servicio sube primero el objeto a MinIO, actualiza Keycloak y elimina el objeto nuevo como compensación si Keycloak falla; el avatar anterior solo se elimina después de confirmar la nueva referencia.
- El servicio deriva el tenant desde `authorization.client_id` del contexto autenticado, aplica `/view/profile` o `/edit/profile` según la operación y registra `traceId`, `tenant_id` y `userId` sin secretos.
- El servicio expone un health check que verifica su proceso y la disponibilidad de sus dependencias necesarias.
- Logout reutiliza `signoutRedirect` y limpia la sesión local antes de renderizar login.
- El cambio de clave usa la pantalla oficial de cuenta de Keycloak dentro del modal. Si el navegador bloquea el contenido embebido, el modal informa el bloqueo y ofrece abrir el mismo flujo oficial en una navegación externa; nunca se implementa un formulario alternativo.
- El botón de notificaciones es presentacional y no ejecuta solicitudes ni cambia el estado.

## Phase 0: Research

Las decisiones quedan documentadas en [research.md](./research.md): actualización de perfiles propios en Keycloak, almacenamiento de objetos en MinIO, restricciones de contenido embebido del flujo de clave y validación de archivos.

## Phase 1: Design

- [data-model.md](./data-model.md): perfil, avatar y estados de actualización.
- [contracts/profile.md](./contracts/profile.md): contrato de lectura/actualización de perfil y errores.
- [quickstart.md](./quickstart.md): escenarios ejecutables de encabezado, perfil, logout, avatar y cambio de clave.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
