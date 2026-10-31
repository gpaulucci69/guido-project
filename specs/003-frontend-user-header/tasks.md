---
description: "Task list for frontend user header and profile"
---

# Tasks: Encabezado de usuario y perfil del frontend

**Input**: Design documents from `/specs/003-frontend-user-header/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/profile.md, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar contratos, configuración y dependencias compartidas.

- [x] T001 [P] Definir los tipos compartidos `UserProfile`, `ProfileUpdate` y errores del contrato en `packages/contracts/profile.ts` a partir de `specs/003-frontend-user-header/contracts/profile.md`.
- [x] T002 [P] Documentar las variables de entorno de Keycloak y MinIO requeridas para el servicio de perfil en `.env.example`.
- [ ] T003 [P] Agregar la configuración reproducible de los atributos `alias` y `avatar` al realm de Keycloak en `infra/keycloak/README.md` y `infra/keycloak/realm-import.json`.
- [x] T004 Crear la estructura inicial del servicio de perfil y su comando de ejecución en `apps/profile-service/src/main.ts` y `docker-compose.yml`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establecer autenticación, validación y almacenamiento seguros antes de las historias de usuario.

**⚠️ CRITICAL**: Ninguna historia debe implementarse antes de completar esta fase.

- [x] T005 [P] Implementar la interfaz de almacenamiento de avatar y el adaptador MinIO en `apps/profile-service/src/profile/avatar-storage.adapter.ts`, usando el object key `profiles/{tenant_id}/{sub}/avatar.{extension}` y sin exponer credenciales al navegador.
- [x] T006 [P] Implementar el adaptador de actualización de atributos propios de Keycloak en `apps/profile-service/src/profile/keycloak-profile.adapter.ts`, persistiendo el object key completo en `avatar` y rechazando cualquier identidad o tenant distinto del autenticado.
- [x] T007 [P] Crear validadores de texto, MIME, extensión, magic bytes y nombre seguro de archivo en `apps/profile-service/src/profile/profile.validation.ts`, aceptando únicamente JPEG, PNG y WebP de hasta 5 MB.
- [x] T008 Implementar el servicio de perfil en `apps/profile-service/src/profile/profile.service.ts`, coordinando Keycloak y MinIO, aplicando permisos y tenant desde el contexto autenticado, ejecutando compensación del objeto nuevo si Keycloak falla y registrando errores sin secretos.
- [x] T009 [P] Crear pruebas unitarias de validación y coordinación MinIO/Keycloak en `apps/profile-service/src/profile/profile.service.test.ts` y `apps/profile-service/src/profile/profile.validation.test.ts`, incluyendo rollback ante fallos de cada dependencia.

**Checkpoint**: contratos, identidad propia, almacenamiento y validaciones están definidos.

---

## Phase 3: User Story 1 - Identidad visible y menú de usuario (Priority: P1) 🎯 MVP

**Goal**: Mostrar el encabezado autenticado con alias, avatar o iniciales, notificaciones visuales y menú de cuenta.

**Independent Test**: Con una sesión válida, el encabezado muestra la identidad y el menú presenta exactamente logout, edición de perfil y restablecimiento de clave.

### Tests for User Story 1

- [x] T010 [P] [US1] Crear pruebas de normalización de alias, nombre, apellido, avatar e iniciales en `apps/frontend/src/auth/profile-normalization.test.ts`.
- [ ] T011 [P] [US1] Crear pruebas de requisitos del encabezado y menú, incluyendo estado vacío y error de imagen, en `apps/frontend/src/components/app-header.test.ts`.

### Implementation for User Story 1

- [x] T012 [P] [US1] Implementar la carga y normalización del perfil autenticado en `apps/frontend/src/auth/profile.ts`, usando el contexto OIDC existente.
- [x] T013 [US1] Implementar el encabezado con alias, avatar circular, iniciales, ícono de notificaciones sin solicitudes y menú de cuenta en `apps/frontend/src/components/app-header.ts`.
- [x] T014 [US1] Integrar el encabezado en la página principal y actualizar los estilos responsive en `apps/frontend/src/main.ts` y `apps/frontend/src/styles.css`.
- [x] T015 [US1] Implementar logout con limpieza local y redirección al login usando `apps/frontend/src/auth/oidc-client.ts` y `apps/frontend/src/auth/auth-view.ts`.

**Checkpoint**: la página principal muestra identidad y acciones de cuenta sin implementar aún la edición.

---

## Phase 4: User Story 2 - Editar perfil y avatar (Priority: P1)

**Goal**: Permitir que cada usuario actualice exclusivamente su propio nombre, apellido, alias y avatar.

**Independent Test**: Abrir el modal, guardar datos válidos y verificar que el encabezado refleja el perfil actualizado; los archivos inválidos deben rechazarse.

### Tests for User Story 2

- [x] T016 [P] [US2] Crear pruebas de contrato para `GET /api/v1/profile` y `PATCH /api/v1/profile` en `apps/profile-service/src/profile/profile.contract.test.ts`.
- [x] T017 [P] [US2] Crear pruebas de seguridad para impedir edición de otra identidad, acceso cross-tenant y exposición de credenciales en `tests/security/profile-security.spec.ts`.

### Implementation for User Story 2

- [x] T018 [US2] Implementar el controlador HTTP de perfil con respuestas `200`, `400`, `401`, `403`, `409` y `502` en `apps/profile-service/src/profile/profile.controller.ts` según `contracts/profile.md`.
- [x] T019 [US2] Integrar el cliente de API de perfil y el refresco de identidad en `apps/frontend/src/auth/profile.ts` y `apps/frontend/src/lib/api/client.ts`.
- [x] T020 [US2] Implementar el modal de edición con nombre, apellido, alias, selección de imagen, estados idle/editing/saving/saved/error y mensajes en español en `apps/frontend/src/components/profile-modal.ts`.
- [x] T021 [US2] Conectar “Editar perfil” del menú con el modal y actualizar el encabezado después de una respuesta exitosa en `apps/frontend/src/components/app-header.ts` y `apps/frontend/src/main.ts`.

**Checkpoint**: el usuario puede editar su propio perfil y avatar con validación y rollback visible ante error.

---

## Phase 5: User Story 3 - Logout y restablecimiento de clave (Priority: P1)

**Goal**: Cerrar sesión de forma segura y ofrecer el flujo oficial de cambio de clave de Keycloak dentro del modal.

**Independent Test**: Logout devuelve a login; el modal de clave inicia el flujo oficial sin que la aplicación reciba o persista la contraseña.

### Tests for User Story 3

- [ ] T022 [P] [US3] Crear pruebas del menú para logout, cancelación y cierre del modal de clave en `apps/frontend/src/components/password-modal.test.ts` y `apps/frontend/src/components/app-header.test.ts`.
- [ ] T023 [P] [US3] Crear prueba de integración del flujo oficial de cambio de clave y bloqueo de credenciales en `tests/integration/profile-password.integration.spec.ts`.

### Implementation for User Story 3

- [x] T024 [US3] Implementar el modal del flujo oficial de cambio de clave con estados de carga, éxito, cancelación y bloqueo por navegador en `apps/frontend/src/components/password-modal.ts`.
- [x] T025 [US3] Conectar “Reestablece tu clave” al flujo oficial de Keycloak y ofrecer navegación externa al mismo flujo únicamente cuando el embebido sea bloqueado en `apps/frontend/src/auth/oidc-client.ts` y `specs/003-frontend-user-header/contracts/profile.md`.
- [x] T026 [US3] Verificar que logout limpia menú, modales, tokens y contexto protegido antes de redirigir a login en `apps/frontend/src/auth/session.ts`, `apps/frontend/src/auth/oidc-client.ts` y `apps/frontend/src/main.ts`.

**Checkpoint**: logout y cambio de clave no dejan una sesión o credencial expuesta.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar calidad, accesibilidad, documentación y escenarios completos.

- [x] T027 [P] Revisar accesibilidad de encabezado, menú, avatar, botones y modales en `apps/frontend/src/components/` y `apps/frontend/src/styles.css`, incluyendo foco, teclado, Escape, roles semánticos y etiquetas `aria-label`.
- [x] T028 [P] Actualizar los textos visibles y mensajes de error en español en `apps/frontend/src/`.
- [x] T029 [P] Ejecutar y ajustar pruebas de cobertura de lógica de perfil y servicios hasta superar el umbral del 80% en `vitest.config.ts`.
- [x] T030 Ejecutar todos los escenarios de `specs/003-frontend-user-header/quickstart.md` con Keycloak, MinIO, frontend y profile-service levantados.
- [x] T031 Ejecutar `npm run typecheck`, `npm run lint`, `npm run format` y `npm test`, corrigiendo regresiones de la feature.
- [x] T032 [P] Implementar logging estructurado con `traceId`, `tenant_id` y `userId`, sin tokens ni secretos, en `apps/profile-service/src/`.
- [x] T033 [P] Implementar el health check del `profile-service`, incluyendo disponibilidad de Keycloak y MinIO, y conectarlo a `docker-compose.yml`.
- [ ] T034 [P] Verificar en pruebas de integración reales el aislamiento por tenant, los permisos `/view/profile` y `/edit/profile`, y el umbral mínimo del 80% para lógica de negocio y servicios.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) no tiene dependencias.
- Foundational (Phase 2) depende de Setup y bloquea todas las historias.
- US1 (Phase 3) depende de Foundational y es el MVP.
- US2 (Phase 4) depende de US1 para reutilizar el encabezado y el menú.
- US3 (Phase 5) depende de US1 y puede ejecutarse en paralelo con US2 después de T015.
- Polish (Phase 6) depende de las historias implementadas.

### Parallel Opportunities

- T001–T003 pueden ejecutarse en paralelo.
- T005–T007 y T009 pueden ejecutarse en paralelo después de T004.
- T010 y T011 pueden ejecutarse en paralelo.
- T016 y T017 pueden ejecutarse en paralelo.
- T022 y T023 pueden ejecutarse en paralelo.
- T027–T029 pueden ejecutarse en paralelo después de las historias.

## Implementation Strategy

### MVP First

1. Completar Setup y Foundational.
2. Completar US1 para disponer de encabezado, alias, avatar fallback y menú.
3. Validar US1 de forma independiente.

### Incremental Delivery

1. Agregar US2 para edición de perfil y avatar.
2. Agregar US3 para logout y cambio de clave.
3. Ejecutar Polish y quickstart completo.

### Parallel Team Strategy

Después de Foundational, un desarrollador puede trabajar en US1, otro en el servicio de perfil de US2 y otro en el flujo de clave de US3, coordinando la integración del menú.
