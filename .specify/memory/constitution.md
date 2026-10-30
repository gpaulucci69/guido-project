<!--
# SYNC IMPACT REPORT
Version change: 1.1.0 → 2.0.0
Modified principles:
  - II. Aislamiento Multi-Tenant Absoluto y Seguridad en Profundidad (RLS + Keycloak) → II. Aislamiento Multi-Tenant Absoluto y Seguridad en Profundidad (despojado de tecnologías específicas)
  - VI. Observabilidad Estructurada y Telemetría Obligatoria → III. Observabilidad Estructurada y Telemetría Operativa (despojado de herramientas específicas)
  - VII. Testing Integral, Verificabilidad de Comportamiento y Cobertura >= 80% → IV. Testing Integral, Verificabilidad de Comportamiento y Cobertura >= 80% (despojado de frameworks específicos)
  - VIII. Calidad de Código, Mantenibilidad y Principios SOLID → V. Calidad de Código, Mantenibilidad y Principios SOLID
  - IX. Simplicidad Radical y Pragmatismo (KISS & YAGNI) → VI. Simplicidad Radical y Pragmatismo (KISS & YAGNI)
  - X. Localización y Estándares de Presentación (Español y AR$) → VII. Localización y Estándares de Presentación (Español y AR$)
Added principles: None
Removed principles:
  - III. Microservicios Desacoplados, NATS JetStream y Estándar RFC 7807 (especificación técnica y arquitectónica)
  - IV. Segregación Estricta de Estado en Frontend y Headless Data Grids (especificación técnica y de librerías frontend)
  - V. Migraciones Seguras y Despliegue Cloud-Native de Bajo Consumo (K3s/Contabo) (especificación de infraestructura y despliegue)
Added sections:
  - Políticas de Seguridad Multi-Tenant, Calidad y Localización (reemplaza la sección técnica de restricciones arquitectónicas)
Removed sections:
  - Restricciones Arquitectónicas y Estándares de Seguridad Multi-Tenant (subsecciones de modelos Prisma/PostgreSQL, Keycloak, NATS JetStream y estado React/Zustand)
Follow-up TODOs: None (Todos los placeholders y directivas de gobernanza han sido resueltos de forma concreta)
-->

# SaaS Multi-tenant para Estudios Contables Constitution

## Core Principles

### I. Spec-Driven Development (SDD), Fidelidad Estricta a la Especificación y Criterios Verificables

El desarrollo de software en este proyecto está estrictamente gobernado por especificaciones ejecutables, contratos formales y criterios de éxito observables por el usuario.

- **SDD Obligatorio**: Ningún agente de IA ni desarrollador humano escribirá código productivo sin una especificación aprobada (`spec.md`), un plan de diseño validado (`plan.md`) y un desglose de tareas ordenado (`tasks.md`).
- **Fidelidad Absoluta al Spec (Cero Scope Creep)**: Queda terminantemente prohibido implementar cualquier funcionalidad, campo, interfaz o flujo que no esté explícitamente redactado y aprobado en la especificación activa.
- **Proponer sin Construir**: Si durante la planificación, diseño o codificación surge una nueva idea, optimización o funcionalidad adyacente, el desarrollador o agente DEBE registrarla como una propuesta (RFC, comentario o sugerencia de spec), pero BAJO NINGÚN CONCEPTO implementarla en la iteración en curso.
- **Criterios de Éxito Verificables a través de la Aplicación**: Cada criterio de éxito de una historia o tarea DEBE ser comprobable de forma directa mediante la interacción con la aplicación en ejecución (interfaz gráfica de usuario, contratos de API o herramientas de línea de comandos). Queda estrictamente prohibido definir o validar criterios basados en "leer o inspeccionar código fuente" (ej. verificar que una clase, archivo o función exista). La validación es puramente de caja negra y orientada al comportamiento observable.
- **Límites de los Agentes de Codificación**: Los agentes deben operar exclusivamente dentro de los alcances definidos en cada tarea. Queda estrictamente prohibido introducir cambios especulativos, dependencias no documentadas o refactorizaciones fuera de especificación.
- **Guardarraíles Inmutables en el Desarrollo**: Toda asistencia generativa o desarrollo manual debe combinarse obligatoriamente con tipado estricto, reglas de linters sin omisiones, validación rigurosa de esquemas y suites de pruebas automatizadas antes de cualquier commit.
- **Razón**: Evita la degradación arquitectónica, previene alucinaciones y desvíos de alcance en modelos de lenguaje, elimina la sobreingeniería no requerida por el negocio y garantiza que el valor entregado sea comprobable por los usuarios reales del sistema.

### II. Aislamiento Multi-Tenant Absoluto y Seguridad en Profundidad

El aislamiento de datos entre estudios contables es absoluto, inmutable e impermeable en todas las capas del sistema.

- **Inviolabilidad del Inquilino**: Cada entidad, dato persistido, transacción y mensaje en tránsito debe pertenecer inequívocamente a un inquilino (`tenant_id`). Queda prohibida cualquier consulta o flujo que permita el acceso o visibilidad cruzada de información entre diferentes estudios contables.
- **Autenticación y Autorización Contextual**: Toda petición al sistema debe validar de forma estricta la identidad del usuario y su pertenencia al estudio contable correspondiente. Peticiones sin un inquilino válido o con credenciales insuficientes deben ser rechazadas inmediatamente.
- **Control de Acceso Basado en Roles (RBAC)**: El sistema aplica de forma no negociable cuatro roles fundamentales:
  1. `SUPER_ADMIN`: Gestión global de la plataforma SaaS.
  2. `STUDIO_ADMIN`: Contador titular/administrador de estudio (administra membresías, clientes y configuraciones de su propio tenant).
  3. `ACCOUNTANT`: Contador operativo (gestiona y ejecuta tareas impositivas y laborales de clientes asignados).
  4. `CLIENT_VIEWER`: Cliente final del estudio (acceso de solo lectura a su documentación/estado y carga de comprobantes).
- **Principio de Mínimo Privilegio**: Ningún usuario ni componente del sistema debe poseer privilegios más allá de los estrictamente necesarios para cumplir su función de negocio.
- **Razón**: En el ámbito contable y tributario, una fuga o mezcla de información entre estudios acarrea consecuencias legales, penales y de negocio devastadoras. El aislamiento debe garantizarse estructuralmente sin depender de filtros manuales ad-hoc.

### III. Observabilidad Estructurada y Telemetría Operativa

Todo componente del sistema en ejecución debe ser diagnosticable de forma autónoma, auditable y en tiempo real.

- **Logging Estructurado con Contexto**: Todo registro de eventos del sistema debe emitirse en formato estructurado, incluyendo obligatoriamente metadatos de contexto: identificador de traza (`traceId`), identificador de inquilino (`tenant_id`) e identificador de usuario (`userId`).
- **Métricas de Operación y Rendimiento**: El sistema debe recolectar y exponer métricas operativas clave para supervisar la disponibilidad, latencia de respuestas y consumo de recursos.
- **Chequeos de Salud (Health Checks)**: Todo servicio debe contar con mecanismos de verificación de estado y disponibilidad para permitir la autorreparación y la supervisión automatizada de la plataforma.
- **Razón**: En un sistema multi-tenant, la observabilidad granular por inquilino y la correlación mediante trazas son indispensables para la auditoría, la resolución rápida de incidentes y el cumplimiento de acuerdos de nivel de servicio (SLA).

### IV. Testing Integral, Verificabilidad de Comportamiento y Cobertura >= 80%

La confianza en los despliegues se sustenta en pruebas verificables contra entornos reales y en la validación de comportamiento de extremo a extremo, no en dobles de prueba frágiles ni inspecciones superficiales de código.

- **Pruebas Unitarias de Alta Cohesión**: Pruebas automáticas exhaustivas para lógica de dominio pura, cálculos contables/tributarios, máquinas de estado de tareas y validadores de contratos.
- **Pruebas de Integración Reales**: Las pruebas de persistencia, integración y mensajería deben ejecutarse contra entornos reales y bases de datos con aislamiento multi-tenant activado, prohibiéndose dobles en memoria que oculten incompatibilidades de concurrencia o aislamiento.
- **Pruebas de Flujos Completos de Usuario (E2E)**: Los flujos críticos de negocio (autenticación, gestión de clientes, creación y cambio de estado de tareas) deben estar cubiertos con pruebas automatizadas de extremo a extremo.
- **Verificación de Criterios mediante la Aplicación**: Los tests automatizados deben validar el cumplimiento de criterios mediante interfaces y comportamientos públicos (llamadas API, eventos y vistas de usuario), simulando el uso real. Ningún test debe dar por cumplido un criterio de aceptación evaluando detalles de implementación privada o comentarios.
- **Puerta de Calidad (Quality Gate)**: Se exige un mínimo de **80% de cobertura de código** en lógica de negocio y servicios para habilitar la integración del código. Los tests deben ser mantenibles, independientes y con aserciones semánticas claras.
- **Razón**: Validar comportamiento observable garantiza que las refactorizaciones internas no rompan la funcionalidad entregada al usuario y previene regresiones silenciosas en entornos productivos.

### V. Calidad de Código, Mantenibilidad y Principios SOLID

El diseño y la implementación de todo el código base deben regirse estrictamente por los principios SOLID, buscando la máxima cohesión, bajo acoplamiento y legibilidad a largo plazo.

- **S - Responsabilidad Única (Single Responsibility Principle)**: Cada clase, servicio, módulo o componente DEBE tener una única responsabilidad y una sola razón de cambio. Se prohíben módulos "Dios" que mezclen lógica de negocio, persistencia, validación de entrada y comunicación externa.
- **O - Abierto/Cerrado (Open/Closed Principle)**: El diseño debe permitir la extensión de funcionalidades sin modificar el código fuente existente ya probado y estabilizado, recurriendo a polimorfismo, inyección de dependencias y composición.
- **L - Sustitución de Liskov (Liskov Substitution Principle)**: Cualquier subtipo o implementación de una interfaz o clase base DEBE poder sustituir a su tipo base sin que el sistema falle ni altere los contratos o invariantes esperados por los consumidores.
- **I - Segregación de Interfaces (Interface Segregation Principle)**: Las interfaces y contratos DEBEN ser específicos, cohesivos y granulares. Ningún cliente o consumidor debe verse forzado a implementar o depender de métodos o propiedades que no utiliza.
- **D - Inversión de Dependencias (Dependency Inversion Principle)**: Los módulos de alto nivel (casos de uso y reglas de negocio) NO deben depender de módulos de bajo nivel (bases de datos, clientes HTTP, SDKs específicos). Ambos deben depender de abstracciones (interfaces y puertos).
- **Mantenibilidad y Código Limpio**: El código debe priorizar la legibilidad humana sobre trucos sintácticos ingeniosos. Nombres semánticos estandarizados, funciones pequeñas y enfocadas, y tipado estricto sin tipos permisivos o indefinidos.
- **Razón**: En aplicaciones SaaS contables y financieras de ciclo de vida prolongado, la adherencia a SOLID previene la fragilidad ante cambios regulatorios, facilita la prueba de componentes aislados y reduce drásticamente el costo de mantenimiento.

### VI. Simplicidad Radical y Pragmatismo (KISS & YAGNI)

La simplicidad es un requisito de diseño no negociable en toda la ingeniería del proyecto.

- **KISS (Keep It Simple, Stupid)**: La solución más simple que satisfaga completamente los requisitos de la especificación es siempre la solución correcta. Se prohíbe introducir capas de abstracción innecesarias, patrones de diseño prematuros o complejidades si una solución directa y limpia resuelve el problema.
- **YAGNI (You Aren't Gonna Need It)**: Queda terminantemente prohibido programar lógica especulativa "por si acaso se necesita en el futuro". Solo se implementa lo estrictamente necesario para satisfacer las tareas y especificaciones activas.
- **Evitar la Sobreingeniería**: Si un caso de uso no tiene al menos dos implementaciones reales inmediatas, no se deben crear interfaces genéricas complejas ni jerarquías intrincadas.
- **Razón**: La complejidad innecesaria incrementa exponencialmente los defectos, ralentiza la velocidad de iteración y dificulta la colaboración entre humanos y agentes de IA.

### VII. Localización y Estándares de Presentación (Español y AR$)

Toda interfaz de usuario, comunicación con el usuario final y gestión monetaria del sistema debe alinearse a los estándares del mercado contable de la República Argentina.

- **Interfaz de Usuario en Español**: Todos los textos visibles para el usuario en la interfaz gráfica (formularios, tablas, etiquetas, mensajes de retroalimentación, diálogos, alertas y textos de ayuda) DEBEN estar redactados exclusivamente en idioma español (español formal y profesional para estudios contables).
- **Mensajes al Usuario en Español**: Las notificaciones, errores amigables y comunicaciones dirigidas al usuario final DEBEN estar expresadas en español claro y comprensible.
- **Moneda Oficial AR$ (Pesos Argentinos)**: Toda expresión monetaria en el sistema representa Pesos Argentinos (código de moneda `ARS`, símbolo habitual `$` o `AR$`).
- **Formato Numérico y Monetario Regional**:
  - Los importes monetarios deben formatearse según el estándar argentino (`es-AR`): separador de miles con punto (`.`) y separador de decimales con coma (`,`). Ejemplo: `$ 1.250.500,50` o `AR$ 1.250.500,50`.
  - La precisión para importes monetarios contables debe utilizar tipos numéricos exactos de punto fijo, prohibiendo estrictamente el uso de números de punto flotante para transacciones y cálculos financieros.
- **Formato de Fechas y Zona Horaria**: Fechas presentadas en formato argentino `DD/MM/AAAA` (o `DD/MM/YYYY`) en vistas de usuario, y cómputos de vencimientos tributarios sincronizados con la zona horaria oficial `America/Argentina/Buenos_Aires` (ART, UTC-3).
- **Razón**: Los estudios contables argentinos operan bajo normativas tributarias nacionales. Una interfaz en otro idioma o con monedas y formatos foráneos genera rechazo operativo, errores graves en la liquidación impositiva y fricción en la adopción del producto.

## Políticas de Seguridad Multi-Tenant, Calidad y Localización

### 1. Directivas de Aislamiento Multi-Tenant y Control de Acceso

- Todo esquema o almacén de datos debe garantizar la estricta segregación por `tenant_id`.
- Los mecanismos de consulta deben exigir la presencia explícita del contexto del inquilino antes de ejecutar cualquier operación de lectura o mutación.
- Queda prohibida cualquier operación administrativa que omita la verificación de permisos por rol (`SUPER_ADMIN`, `STUDIO_ADMIN`, `ACCOUNTANT`, `CLIENT_VIEWER`).

### 2. Estándares de Localización, Moneda AR$ y Formateo Regional

- Todos los componentes de presentación deben utilizar formateo regional centralizado correspondiente a la configuración regional argentina (`es-AR`).
- Las entradas de importes deben aceptar formato local y validar que no existan inconsistencias de redondeo financiero.
- Queda prohibido hardcodear textos o etiquetas en idiomas distintos al español o símbolos de moneda foráneos en vistas orientadas al usuario.

### 3. Directivas de Calidad de Código y Principios SOLID

- **Abstracción e Inversión de Dependencias**: Los módulos de negocio deben interactuar con dependencias externas mediante interfaces abstractas, facilitando la sustitución en pruebas y el desacoplamiento.
- **Complejidad Controlada**: Las rutinas y funciones deben mantener un tamaño reducido y un único propósito, evitando anidamientos excesivos y bifurcaciones complejas.
- **Tipado Estricto**: Todo modelo de dominio, contrato de datos y evento debe contar con tipos rigurosos y validación de esquemas en tiempo de ejecución.

## Flujo de Trabajo SDD, Control de Alcance y Puertas de Calidad

### 1. Ciclo de Vida Spec-Driven Development y Validación de Criterios

1. **Especificación (`/speckit-specify`)**: Se capturan requerimientos funcionales, historias de usuario, modelos de datos conceptuales y criterios de aceptación sin ambigüedades. Cada criterio de aceptación DEBE ser verificable a través del comportamiento observable de la aplicación.
2. **Clarificación (`/speckit-clarify`)**: Se resuelven casos borde, restricciones fiscales y particularidades de flujos antes de escribir el diseño.
3. **Planificación (`/speckit-plan`)**: Se define el diseño de componentes, contratos de comunicación y modelos de datos aplicando principios SOLID y simplicidad KISS.
4. **Tareas (`/speckit-tasks`)**: Se crea la lista exhaustiva, granular y ordenada de tareas independientes.
5. **Implementación (`/speckit-implement`)**: Los agentes y desarrolladores toman tarea por tarea de forma atómica respetando las directivas inmutables de esta constitución.

### 2. Control Anti-Scope Creep: Proponer antes de Implementar

- Durante cualquier fase de desarrollo, si un desarrollador o agente identifica una mejora potencial, un campo adicional o un requerimiento complementario que no figure en la especificación activa:
  - **Acción Permitida**: Documentar la sugerencia en la sección de propuestas o emitir un comentario/RFC para el usuario.
  - **Acción Prohibida**: Desarrollar, codificar o crear pruebas para la funcionalidad no especificada dentro del alcance actual.
- Las tareas solo se consideran finalizadas cuando cumplen exactamente lo especificado, ni más ni menos.

### 3. Prácticas de Codificación Responsable

- Se fomenta la agilidad y asistencia de herramientas de IA, pero ningún código es aceptable sin pasar por los siguientes filtros obligatorios:
  1. Compilación y chequeo estricto de tipos sin advertencias ni tipos permisivos.
  2. Aprobación de linter y formateador de código sin excepciones silenciadas.
  3. Ejecución exitosa de pruebas automatizadas con verificación de criterios de aceptación de caja negra.

### 4. Puertas de Integración Continua (CI Quality Gates)

- **Verificación Estricta y Linting**: Bloqueante en cada Pull Request.
- **Cumplimiento SOLID & Simplicidad**: Revisión obligatoria de que no se introduzcan dependencias circulares, módulos monolíticos o complejidad injustificada.
- **Pruebas Automatizadas**: 100% de suites en estado exitoso.
- **Cobertura Mínima**: 80% en lógica de negocio y servicios reportada en CI.
- **Auditoría de Dependencias**: Análisis automatizado de seguridad y vulnerabilidades en dependencias externas.

## Governance

1. **Supremacía Constitucional**: Esta constitución constituye la norma suprema de ingeniería del proyecto. Prevalece sobre cualquier sugerencia de agentes de IA, convención de bibliotecas o decisión apresurada en flujos de trabajo de desarrollo.
2. **Procedimiento de Enmiendas**:
   - Toda modificación a los principios fundamentales o directivas de gobernanza requiere la creación de un Issue / RFC técnico detallando: motivación, impacto en aislamiento multi-tenant y plan de migración.
   - La enmienda debe registrarse actualizando este documento, incrementando la versión semántica y documentando el cambio en el `SYNC IMPACT REPORT`.
3. **Política de Versionado Semántico**:
   - **MAJOR (X.0.0)**: Cambios incompatibles en gobernanza, eliminación o redefinición de principios fundamentales (ej. cambio en el modelo de aislamiento multi-tenant, remoción de principios de calidad SOLID, o cambio radical de paradigma de desarrollo).
   - **MINOR (1.X.0)**: Incorporación de nuevos principios, adición de secciones de gobernanza o ampliación material de directivas de calidad y procesos.
   - **PATCH (1.0.X)**: Correcciones de redacción, precisiones tipográficas o refinamientos que no alteran la semántica ni las directivas de gobernanza.
4. **Auditoría y Cumplimiento**: En cada Pull Request o revisión de código, los revisores (humanos y agentes) deben verificar explícitamente el cumplimiento de los principios I a VII. Toda violación detectada invalida la integración hasta su subsanación.

**Version**: 2.0.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-30
