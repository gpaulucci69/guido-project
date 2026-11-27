# Feature Specification: Transformar frontend a React

**Feature Branch**: `011-transformar-frontend-react`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "transformar el frontend en una aplicación React"

## Clarifications

### Session 2026-11-20

- Q: ¿La migración debe realizarse de forma incremental, manteniendo la aplicación actual operativa mientras se reemplazan las pantallas una por una? → A: Reemplazo completo del frontend en una sola entrega.
- Q: ¿La primera versión React debe conservar exactamente la apariencia y los flujos actuales, permitiendo únicamente ajustes necesarios para adaptar componentes? → A: Migrar a React y aprovechar para rediseñar toda la experiencia.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Navegación y sesión en React (Priority: P1)

Como usuario autenticado, quiero utilizar el frontend migrado sin perder la navegación, permisos, contexto del cliente ni el estado de mi sesión.

**Why this priority**: Es la base de toda la aplicación y debe conservar el comportamiento actualmente aprobado.

**Independent Test**: Iniciar sesión con usuarios con permisos distintos, navegar por Inicio, Estado de cuenta, Clientes y Asociados, y comprobar que cada pantalla y permiso se comportan igual que antes.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado, **When** abre la aplicación, **Then** ve la pantalla de bienvenida, el nombre/logo del cliente y su avatar.
2. **Given** un usuario sin una ruta autorizada, **When** intenta acceder a ella, **Then** la pantalla permanece protegida y muestra un mensaje comprensible.
3. **Given** una sesión expirada, **When** el frontend detecta la expiración, **Then** muestra el diálogo correspondiente y permite volver al inicio de sesión.

### User Story 2 - Gestión de clientes y asociados (Priority: P1)

Como usuario autorizado, quiero crear, editar, filtrar y administrar clientes y asociados desde componentes consistentes.

**Why this priority**: Son los listados operativos principales del sistema.

**Independent Test**: Crear y editar un cliente y un asociado, filtrar por tipo, asignar rol, actualizar avatar y cambiar estado, verificando que los cambios persisten.

**Acceptance Scenarios**:

1. **Given** permisos suficientes, **When** el usuario abre Clientes del estudio o Asociados, **Then** ve el listado, sus acciones y sus estados.
2. **Given** un formulario abierto, **When** el usuario guarda datos válidos, **Then** el listado se actualiza sin perder el contexto de navegación.
3. **Given** un error de validación o conflicto, **When** la API responde, **Then** se muestra un mensaje funcional en el formulario.

### User Story 3 - Perfil y acciones de cuenta (Priority: P2)

Como usuario autenticado, quiero editar mi perfil, avatar y clave mediante modales claros y accesibles.

**Why this priority**: Completa las acciones personales ya disponibles en el frontend actual.

**Independent Test**: Abrir el menú del avatar, consultar roles, editar datos, actualizar avatar y cambiar la clave, comprobando mensajes de éxito y error.

**Acceptance Scenarios**:

1. **Given** el menú del avatar abierto, **When** el usuario lo consulta, **Then** ve primero sus client roles del cliente autenticado.
2. **Given** un avatar cargado, **When** se actualiza el perfil, **Then** el nuevo avatar aparece en el encabezado y donde corresponda.

### Edge Cases

- La aplicación debe mostrar una alternativa visual cuando el logo o avatar no está disponible.
- La aplicación debe conservar una interfaz usable con listados vacíos, errores de red y respuestas sin contenido.
- La migración no debe cambiar las reglas de autorización ni permitir acceder a rutas no autorizadas.
- La interfaz debe seguir funcionando en pantallas angostas sin solapamientos.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El frontend MUST ofrecer la misma navegación, rutas, permisos y estados de sesión que la versión actual.
- **FR-002**: El frontend MUST permitir completar las operaciones actuales de clientes, asociados, perfil, avatar y clave.
- **FR-003**: El frontend MUST conservar los mensajes funcionales para validaciones, conflictos, errores de red y sesiones expiradas.
- **FR-004**: El frontend MUST conservar el contexto visual del cliente autenticado, incluyendo nombre, descripción y logo cuando estén disponibles.
- **FR-005**: El frontend MUST mostrar tablas, filtros, acciones, modales y estados vacíos mediante una experiencia visual rediseñada, consistente y profesional.
- **FR-006**: El frontend MUST conservar la accesibilidad básica existente: nombres accesibles, foco, teclado y estados de diálogo.
- **FR-007**: El frontend MUST reutilizar los servicios y contratos existentes sin exigir cambios funcionales a los usuarios.
- **FR-008**: La entrega MUST retirar la generación manual de HTML y dejar una única aplicación React como frontend operativo.

### Key Entities

- **Sesión**: Identidad autenticada, permisos, roles y contexto del cliente.
- **Cliente del estudio**: Entidad contable con tipo, CUIT, estado y datos comerciales.
- **Asociado**: Usuario administrable con datos personales, rol, fechas, estado y avatar.
- **Perfil**: Datos personales, avatar y credenciales modificables del usuario autenticado.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de las rutas y acciones actualmente disponibles conserva el mismo resultado funcional después de la migración.
- **SC-002**: El 100% de los escenarios críticos de autenticación, navegación, clientes, asociados y perfil puede completarse sin errores de interfaz.
- **SC-003**: Los usuarios pueden completar una operación de creación o edición sin aprender un flujo nuevo ni realizar más pasos que en la versión actual.
- **SC-004**: El frontend mantiene una presentación usable en escritorio y pantallas angostas, sin solapamiento de controles en los flujos principales.
- **SC-005**: La migración no introduce cambios no autorizados en permisos, datos enviados ni aislamiento entre clientes.

## Assumptions

- Se conservarán los servicios backend, endpoints, contratos y configuración OIDC existentes.
- La migración se entregará como un reemplazo completo del frontend actual en una sola entrega.
- El soporte para navegadores será el mismo que el de la aplicación actual.
- La nueva experiencia visual puede rediseñar la interfaz, siempre que conserve las capacidades, permisos y datos actuales.
- La paginación de listados se considera una decisión de rendimiento y no modifica el alcance funcional de los listados.
