# Research: Transformar frontend a React

## Decision: React con Vite y TypeScript estricto

**Rationale**: El proyecto ya utiliza Vite, TypeScript y módulos ES. React reemplaza la generación manual de HTML por componentes declarativos sin cambiar la forma de servir la aplicación.

**Alternatives considered**: Mantener HTML manual, otro framework o un meta-framework. Se descartan por riesgo y por no aprovechar la configuración existente.

## Decision: Mantener servicios y contratos actuales

**Rationale**: La migración cambia presentación y composición, no dominio, autenticación ni aislamiento multi-tenant.

**Alternatives considered**: Reescribir APIs y autenticación simultáneamente. Se descarta por ampliar el riesgo de una entrega única.

## Decision: Estado local y contextos React por dominio

**Rationale**: Sesión, identidad, permisos, cliente activo y estados de carga/error pueden resolverse con contextos y hooks acotados sin incorporar otro store global.

**Alternatives considered**: Un store global nuevo o estado duplicado por pantalla; ambos agregan complejidad o riesgo de desincronización.

## Decision: TanStack Table Core para listados

**Rationale**: Ya existe y se usa en Asociados; se reutilizará para Clientes y tablas equivalentes.

**Alternatives considered**: Tablas manuales o una librería visual completa, descartadas para evitar duplicación y dependencias innecesarias.

## Decision: TanStack Query para estado remoto

**Rationale**: Las vistas dependen de datos remotos con cargas, errores, invalidación y refresco después de mutaciones. TanStack Query centraliza ese ciclo y evita duplicar estado de servidor en cada componente.

**Alternatives considered**: `useEffect` y estado local por pantalla. Se descartan porque duplican caché, reintentos e invalidación y aumentan el riesgo de datos obsoletos.

## Decision: Validación por capas

**Rationale**: El navegador ofrece feedback inmediato, pero el backend sigue siendo autoridad para permisos, tenant, formatos y conflictos.
