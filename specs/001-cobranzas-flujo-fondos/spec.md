# Feature Specification: Sistema de Gestión de Cobranzas y Flujo de Fondos para Estudios Contables v1.0

**Feature Branch**: `001-cobranzas-flujo-fondos`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "Sistema de Gestión de Cobranzas y Flujo de Fondos para Estudios Contables v1.0: sistematizar el control de obligaciones de pago, automatizar avisos preventivos y reclamos de deudas por correo electrónico con copia a contadores responsables, centralizar rendición y validación de comprobantes de pago (con pagos parciales y saldos a favor) y brindar panel de control de flujo de fondos (cobrado vs. adeudado)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Emisión y Registro de Obligaciones de Cobro (Priority: P1)

Como Contador Administrador o Contador Representante, quiero registrar una obligación de cobro para un cliente indicando el concepto del servicio, el período facturado, el importe y la fecha límite de pago, para formalizar el compromiso de pago del servicio prestado y disponer de una base de control de deudas.

**Why this priority**: Es la entidad y flujo fundacional del módulo. Sin obligaciones de pago formalizadas en el sistema, no es posible registrar cobranzas, computar deudas, despachar avisos ni alimentar el reporte de flujo de fondos.

**Independent Test**: Puede probarse de manera independiente registrando una obligación para un cliente y verificando en la aplicación que la obligación aparece listada en estado `Pendiente`, con su importe en AR$, fechas límite y saldo adeudado exacto.

**Acceptance Scenarios**:

1. **Given** un Contador autenticado en la plataforma con clientes en su cartera, **When** completa el formulario de registro de obligación indicando cliente, descripción del servicio, período (inicio y fin), importe mayor a AR$ 0 y fecha de vencimiento, **Then** la obligación se guarda exitosamente en estado `Pendiente` con saldo deudor remanente igual al total emitido.
2. **Given** un Contador en la pantalla de alta de obligación, **When** intenta guardar dejando vacío el importe, la fecha de vencimiento o indicando un importe menor o igual a AR$ 0, **Then** la aplicación bloquea el guardado y resalta los campos obligatorios con mensajes de error claros en español.
3. **Given** un Contador Representante, **When** intenta emitir una obligación, **Then** la aplicación solo le permite seleccionar clientes asignados a su cartera.

---

### User Story 2 - Notificación, Rendición y Validación de Pagos (Priority: P1)

Como Cliente o Contador, quiero informar un pago realizado (adjuntando comprobante si soy cliente), y como Contador quiero validar o rechazar dicho pago informado con su correspondiente impacto financiero y notificación, para asegurar la cancelación fidedigna de las obligaciones.

**Why this priority**: Representa el ciclo de vida del dinero. Permite que el estudio contable valide los ingresos reales antes de acreditarlos o cancelar deudas, asegurando la integridad de los datos financieros.

**Independent Test**: Puede probarse de manera independiente informando un pago sobre una obligación pendiente: verificar que nace en estado `Pendiente de Validación` sin reducir la deuda; luego, al confirmarse la validación por un contador, verificar que el saldo adeudado disminuye de inmediato y el estado de la obligación cambia según corresponda.

**Acceptance Scenarios**:

1. **Given** una obligación en estado `Pendiente`, `Vencida` o `Pago Parcial`, **When** el Cliente informa un pago adjuntando un comprobante válido (menor o igual a 15 MB), **Then** el pago queda registrado en estado `Pendiente de Validación` y el saldo adeudado de la obligación permanece inalterado hasta la revisión del contador.
2. **Given** un Cliente intentando informar un pago, **When** no adjunta ningún archivo o adjunta un archivo mayor a 15 MB, **Then** la aplicación bloquea la rendición y muestra una advertencia indicando la obligatoriedad y el tamaño máximo permitido.
3. **Given** un Contador informando un pago en nombre de un cliente, **When** ingresa fecha, medio e importe sin adjuntar archivo, **Then** la aplicación permite registrar el pago exitosamente.
4. **Given** un pago en estado `Pendiente de Validación`, **When** un Contador presiona "Validar Pago", **Then** el pago pasa a estado `Validado`, el importe se imputa a la deuda y el estado de la obligación se actualiza a `Pagada` (si cubre el 100%) o `Pago Parcial` (si cubre un importe inferior).
5. **Given** un pago en estado `Pendiente de Validación`, **When** un Contador decide rechazarlo e ingresa un motivo obligatorio, **Then** el pago pasa a estado `Rechazado`, no afecta la deuda de la obligación y el sistema despacha un correo al cliente informando el motivo del rechazo.
6. **Given** un pago en estado `Pendiente de Validación`, **When** el Contador intenta rechazarlo sin ingresar un motivo, **Then** la aplicación bloquea la acción hasta que se especifique la justificación.
7. **Given** una obligación o un pago existente, **When** un usuario autorizado solicita anularlo indicando un motivo, **Then** el registro conserva su historial, cambia a estado `Cancelado`, y la aplicación muestra el motivo, usuario y fecha de la anulación; ningún usuario puede eliminarlo físicamente.
8. **Given** una obligación con pagos `Pendiente de Validación`, **When** un usuario autorizado cancela la obligación, **Then** cada pago pendiente se acredita automáticamente como saldo a favor del cliente, deja de estar pendiente de validación y conserva la relación con la obligación cancelada y el asiento de auditoría correspondiente.

---

### User Story 3 - Gestión e Imputación de Saldos a Favor (Priority: P2)

Como Contador, quiero que los pagos que excedan la deuda generen saldo a favor del cliente y poder imputar ese saldo a favor disponible contra deudas pendientes, para gestionar cobros en exceso y facilitar la cancelación de obligaciones sin requerir transferencias redundantes.

**Why this priority**: Resuelve una situación financiera habitual en estudios contables (pagos duplicados, redondeos a favor o anticipos de honorarios) asegurando la coherencia en la cuenta corriente del cliente.

**Independent Test**: Puede probarse validando un pago superior a la deuda remanente de una obligación, verificando que la obligación pasa a `Pagada` y que el excedente se acredita como saldo a favor; luego, en otra obligación impaga del mismo cliente, verificar la advertencia de saldo disponible y ejecutar la imputación.

**Acceptance Scenarios**:

1. **Given** una obligación con deuda remanente de AR$ 20.000, **When** el Contador valida un pago por AR$ 25.000, **Then** la aplicación emite una advertencia de excedente, la obligación pasa a estado `Pagada` (deuda AR$ 0) y se acreditan automáticamente AR$ 5.000 como saldo a favor en la ficha del cliente.
2. **Given** un cliente con saldo a favor de AR$ 15.000 y una obligación con deuda de AR$ 40.000, **When** el Contador abre el detalle de la obligación, **Then** la aplicación expone visiblemente una advertencia indicando la existencia del saldo a favor y un control para imputarlo.
3. **Given** la advertencia de saldo a favor en una obligación impaga, **When** el Contador confirma la imputación de AR$ 10.000 de dicho saldo, **Then** la deuda remanente de la obligación se reduce en AR$ 10.000 (pasando a `Pago Parcial` por AR$ 30.000) y el saldo a favor disponible del cliente disminuye a AR$ 5.000.
4. **Given** una opción de imputación de saldo a favor, **When** el Contador intenta imputar un monto superior al saldo a favor disponible o superior al saldo adeudado, **Then** la aplicación bloquea la operación e indica que el monto excede el límite aplicable.

---

### User Story 4 - Automatización y Envío de Reclamos de Deuda (Priority: P2)

Como Contador Representante o Administrador, quiero que el sistema despache automáticamente avisos de vencimiento por correo electrónico y permita forzar reclamos manuales con registro auditable, para reducir la morosidad sin sobrecargar la gestión operativa diaria.

**Why this priority**: Automatiza una tarea repetitiva y crítica para el flujo de fondos, garantizando trazabilidad y manteniendo informados a los contadores responsables mediante copias ocultas.

**Independent Test**: Puede probarse configurando una obligación vencida y ejecutando el proceso de reclamo (o presionando "Enviar Reclamo Manual"), verificando que el correo llega al cliente con copia oculta (BCC) al contador representante asignado y que queda registrado en la pestaña de historial de reclamos de la obligación.

**Acceptance Scenarios**:

1. **Given** una obligación impaga cuya fecha límite de pago expiró ayer, **When** el sistema ejecuta la evaluación diaria de deudas, **Then** el estado de la obligación cambia automáticamente a `Vencida` y se despacha un correo de aviso de deuda al cliente con copia oculta (BCC) a la casilla del contador representante asignado.
2. **Given** una obligación vencida que continúa impaga, **When** transcurre el intervalo configurado de reiteración (por defecto: 7 días desde el último aviso), **Then** el sistema emite automáticamente un nuevo reclamo reiterativo por correo electrónico.
3. **Given** una obligación en estado `Vencida` o `Pago Parcial`, **When** el Contador presiona "Enviar Reclamo Manual", **Then** el sistema despacha inmediatamente el correo de reclamo al cliente con copia oculta al contador y muestra confirmación de envío exitoso.
4. **Given** cualquier correo de reclamo despachado (automático o manual), **When** el Contador consulta la pestaña de auditoría de la obligación, **Then** visualiza la entrada en el historial con fecha y hora exacta, asunto, cuerpo del mensaje y destinatarios.
5. **Given** un cliente sin contador representante asignado con una obligación vencida, **When** se emite el reclamo, **Then** el correo se despacha al cliente y la copia oculta (BCC) se redirige a la casilla de correo general de los Contadores Administradores.

---

### User Story 5 - Panel y Reporte de Flujo de Fondos (Priority: P3)

Como Contador Administrador o Contador Representante, quiero consultar un reporte financiero filtrable por fechas que consolide lo efectivamente cobrado contra lo pendiente de cobro, para proyectar la liquidez del estudio y evaluar el desempeño de cobranza por cartera.

**Why this priority**: Proporciona la visibilidad analítica global para la toma de decisiones financieras y estratégicas de los socios y contadores del estudio contable.

**Independent Test**: Puede probarse seleccionando un rango de fechas en el panel de flujo de fondos y verificando que la suma de cobros validados en el rango coincida exactamente con la métrica de `Cobrado`, y que las obligaciones impagas vencidas antes o durante el rango sumen en `Pendiente de Cobro`.

**Acceptance Scenarios**:

1. **Given** un Contador en el panel de flujo de fondos, **When** accede a la sección, **Then** la aplicación carga por defecto el rango desde el primer día del mes actual hasta la fecha corriente y muestra las métricas de Total Facturado/Comprometido, Total Cobrado y Total Pendiente de Cobro.
2. **Given** el reporte de flujo de fondos, **When** existen pagos validados con fecha de cobro dentro del rango consultado, **Then** dichos montos se totalizan en la métrica `Cobrado`.
3. **Given** obligaciones con saldo adeudado vencidas antes del inicio del rango o que vencen dentro del rango, **When** se visualiza el reporte, **Then** dichos saldos se totalizan en la métrica `Pendiente de Cobro`.
4. **Given** un Contador Administrador consultando el reporte, **When** selecciona un filtro por Contador Representante, **Then** los totales se recalculan mostrando exclusivamente las métricas correspondientes a los clientes asignados a dicho profesional.
5. **Given** un Contador Representante consultando el reporte, **When** ingresa al panel, **Then** los datos se encuentran automáticamente acotados a su cartera asignada, sin opción de ver métricas de otros contadores.
6. **Given** una consulta sobre un rango de fechas sin movimientos ni vencimientos, **When** se procesa la consulta, **Then** la aplicación muestra todos los totales en AR$ 0,00 de forma ordenada y sin errores.

---

### Edge Cases

- **CL-001 (Carga en el límite exacto de archivo)**: Si un comprobante adjunto pesa exactamente 15.00 MB (15.728.640 bytes), el sistema DEBE aceptarlo; si pesa 15.01 MB o más, el sistema DEBE rechazarlo informando claramente el límite máximo de 15 MB.
- **CL-002 (Validación concurrente de pagos)**: Si dos contadores abren simultáneamente el mismo pago en estado `Pendiente de Validación` y uno lo valida mientras el otro lo rechaza, la primera acción confirmada prevalece; la segunda acción DEBE ser desestimada informando al usuario que el pago ya fue resuelto previamente.
- **CL-007 (Múltiples pagos pendientes en una misma obligación)**: Cuando una obligación acumula más de un pago en estado `Pendiente de Validación`, el contador DEBE visualizarlos listados individualmente. La validación de uno de ellos que cubra el 100% de la deuda remanente no invalida automáticamente los restantes; el contador DEBE resolverlos explícitamente (validar o rechazar) para evitar acreditaciones duplicadas no intencionadas.
- **CL-003 (Importe en cero o negativo)**: El sistema DEBE bloquear el registro o edición de cualquier obligación con importe menor o igual a AR$ 0,00, exigiendo un valor numérico positivo.
- **CL-004 (Cliente transitoriamente sin representante)**: Si un cliente no posee un contador representante asignado al momento de emitir un reclamo automático o manual, la copia oculta (BCC) DEBE ser enviada a la casilla de correo general de los Administradores del estudio.
- **CL-005 (Período sin movimientos en Flujo de Fondos)**: Al consultar un período sin cobros ni obligaciones, la aplicación DEBE responder de forma limpia mostrando `$ 0,00` en todas las métricas sin fallos de cálculo.
- **CL-006 (Intento de eliminación física)**: Ningún usuario ni rol del sistema puede eliminar físicamente registros de obligaciones o pagos. Cualquier anulación DEBE realizarse mediante cambio de estado a `Cancelado`, exigiendo un motivo explícito y registrando fecha y usuario en el historial de auditoría.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema DEBE permitir el registro de obligaciones de cobro requiriendo: cliente destinatario, descripción del servicio, período comprendido (fecha inicio y fin), moneda (AR$), importe total positivo y fecha límite de pago.
- **FR-002**: Toda obligación de pago DEBE encontrarse en uno de los siguientes estados excluyentes: `Pendiente`, `Vencida`, `Pagada`, `Pago Parcial` o `Cancelado`.
- **FR-003**: El sistema DEBE ejecutar diariamente, usando la zona horaria `America/Argentina/Buenos_Aires`, una evaluación que actualice automáticamente a estado `Vencida` toda obligación con saldo adeudado mayor a cero al comenzar el día posterior a su fecha límite de pago. La evaluación DEBE ser idempotente: una obligación ya `Vencida`, `Pagada` o `Cancelada` no puede generar una transición duplicada ni alterar su historial.
- **FR-004**: El sistema DEBE evaluar diariamente las deudas y despachar avisos automáticos de reclamo por correo electrónico según los parámetros globales configurados por el Contador Administrador para todo el estudio (por defecto: primer aviso al día siguiente del vencimiento; reiteraciones cada 7 días). La configuración DEBE ser un único conjunto de parámetros que aplica uniformemente a todos los clientes del estudio, sin excepciones por cliente individual.
- **FR-005**: Todo correo de reclamo DEBE enviarse al cliente con copia oculta (BCC) a los contadores representantes asignados al cliente (o a la casilla de los administradores si no hay representante asignado).
- **FR-006**: El sistema DEBE permitir a los contadores forzar el envío inmediato de un reclamo manual sobre cualquier obligación en estado `Vencida` o `Pago Parcial`.
- **FR-007**: El sistema DEBE registrar en un historial inmutable de auditoría cada correo emitido, almacenando: fecha y hora de despacho, asunto, cuerpo del mensaje, destinatarios y resultado del envío (`Enviado` o `Fallido`). Si el envío falla, el sistema DEBE reintentar automáticamente al menos una vez adicional antes de marcar el reclamo como `Fallido` y generar una alerta visible en la plataforma para el contador responsable.
- **FR-008**: El sistema DEBE permitir registrar pagos informados con: fecha de pago, importe cobrado, medio de pago y archivo de comprobante opcional u obligatorio según el actor:
  - Si el pago lo informa un Cliente: el archivo de comprobante es obligatorio (máximo 15 MB).
  - Si el pago lo informa un Contador: el archivo de comprobante es opcional.
- **FR-008b**: Los Clientes DEBEN poder acceder a la plataforma mediante dos canales complementarios:
  1. **Portal web autenticado**: sesión con credenciales propias donde el Cliente visualiza sus obligaciones propias, el estado de cada rendición de pago que haya informado y su saldo a favor disponible (como dato de solo lectura). Desde este portal puede también informar nuevos pagos adjuntando comprobantes. La imputación del saldo a favor es potestad exclusiva de los Contadores.
  2. **Enlace de acción rápida (token de uso único)**: incluido en cada correo de reclamo despachado, permite al Cliente informar el pago de esa obligación puntual sin necesidad de iniciar sesión manualmente. El token DEBE expirar a las 24 horas de su emisión o inmediatamente después de su primer uso, lo que ocurra primero.
- **FR-009**: Todo pago informado DEBE crearse en estado `Pendiente de Validación` y no modificar el saldo deudor de la obligación hasta su validación explícita. Una misma obligación PUEDE tener múltiples pagos simultáneos en estado `Pendiente de Validación`; el contador los revisa y resuelve individualmente en el orden que considere apropiado. Excepcionalmente, si la obligación se cancela mientras existen pagos pendientes, dichos pagos DEBEN acreditarse automáticamente como saldo a favor del cliente sin validación adicional, sin reducir el saldo de la obligación cancelada.
- **FR-010**: El sistema DEBE permitir a los contadores validar pagos pendientes. Al validarse, el pago pasa a estado `Validado`, reduce el saldo adeudado de la obligación y actualiza su estado a `Pagada` (si cubre el 100%) o `Pago Parcial` (si cubre un importe inferior).
- **FR-011**: El sistema DEBE permitir a los contadores rechazar un pago pendiente exigiendo un motivo obligatorio. Al confirmarse, el pago pasa a estado `Rechazado`, no altera la deuda y despacha un correo al cliente detallando el motivo del rechazo.
- **FR-012**: Si un pago validado supera el saldo adeudado de la obligación, el sistema DEBE emitir una advertencia antes de confirmar y acreditar el excedente como saldo a favor en la ficha del cliente.
- **FR-013**: Al visualizar una obligación con deuda de un cliente que posee saldo a favor, el sistema DEBE advertir la disponibilidad de dicho saldo y permitir su imputación manual total o parcial, reduciendo la deuda de la obligación y el saldo a favor disponible.
- **FR-014**: El sistema DEBE prohibir la eliminación física de obligaciones y pagos. Las cancelaciones DEBEN ser lógicas bajo el estado `Cancelado`, exigir un motivo no vacío y conservar el registro consultable. La cancelación directa de un pago solo puede realizarse mientras se encuentre `Pendiente de Validación`; cuando se cancela la obligación asociada, los pagos pendientes siguen conservando su historial, pero se acreditan automáticamente como saldo a favor y dejan de requerir validación. La cancelación de una obligación no puede borrar sus pagos ni reclamos históricos. Cualquier alteración de importes, fechas, estados o cancelaciones DEBE registrar un asiento de auditoría con fecha, usuario, valor anterior, valor nuevo y motivo cuando corresponda.
- **FR-015**: El sistema DEBE generar un reporte de Flujo de Fondos configurable por rango de fechas (por defecto: primer día del mes actual a la fecha corriente) que exponga:
  - Total Cobrado (pagos validados con fecha de cobro en el rango).
  - Total Pendiente de Cobro (deudas vencidas antes del rango y deudas con vencimiento en el rango, no saldadas).
  - Métricas consolidadas de facturado/comprometido, cobrado y adeudado.
- **FR-016**: El sistema DEBE aplicar delimitación estricta de visibilidad: el Contador Representante solo accede a clientes, obligaciones y métricas de su cartera asignada; el Contador Administrador accede a todos los clientes del estudio y dispone de filtro por contador responsable.
- **FR-017**: Todos los textos, mensajes de error y etiquetas visibles en la interfaz de usuario DEBEN estar redactados en idioma español formal (`es-AR`), y todos los importes monetarios DEBEN expresarse en moneda AR$ con formateo argentino (`$ 1.250.500,50`).

### Key Entities

- **Obligación de Cobro (`PaymentObligation`)**: Representa la deuda o compromiso de pago formalizado para un cliente por un servicio profesional en un período específico. Contiene: identificador único, identificador del cliente, descripción del servicio, fecha de inicio del período, fecha de fin del período, fecha límite de pago, importe total emitido (AR$), saldo adeudado remanente (AR$), estado actual (`Pendiente`, `Vencida`, `Pagada`, `Pago Parcial`, `Cancelado`), fecha de creación y auditoría de cambios.
- **Rendición de Pago (`PaymentSubmission`)**: Representa la declaración de un pago efectuado por un cliente o registrado por un contador. Contiene: identificador único, identificador de la obligación asociada, fecha del pago, importe informado (AR$), medio de pago utilizado, archivo de comprobante adjunto (opcional para contadores, obligatorio para clientes), estado (`Pendiente de Validación`, `Validado`, `Rechazado`, `Cancelado`), motivo de rechazo o cancelación cuando corresponda, fecha de resolución o cancelación y contador que validó/rechazó/canceló. Si la obligación asociada se cancela mientras el pago está `Pendiente de Validación`, el estado del pago pasa a `Cancelado` y su importe se acredita automáticamente como saldo a favor sin validación adicional.
- **Saldo a Favor del Cliente (`CustomerCreditBalance`)**: Representa el crédito disponible acumulado por un cliente debido a pagos validados con importes superiores a la deuda remanente. Contiene: identificador del cliente, importe total disponible (AR$), historial de acreditaciones (origen del excedente) e historial de imputaciones (obligaciones donde se aplicó).
- **Historial de Reclamos (`DebtClaimHistory`)**: Registro inmutable de los avisos y reclamos de deuda emitidos por correo electrónico (automáticos o manuales). Contiene: identificador único, identificador de la obligación, fecha y hora de emisión, tipo de reclamo (`Automático` o `Manual`), dirección de correo del cliente (destinatario principal), direcciones en copia oculta (BCC), asunto del correo, cuerpo del mensaje despachado y resultado del envío (`Enviado` o `Fallido`).
- **Parámetros de Configuración del Estudio (`StudioNotificationSettings`)**: Conjunto único de parámetros globales de reclamo automático para todo el estudio. Contiene: días de gracia tras vencimiento para el primer aviso (por defecto: 1), intervalo en días entre reiteraciones (por defecto: 7), y fecha de última modificación con el usuario que realizó el cambio. Solo modificable por el Contador Administrador.
- **Asiento de Auditoría (`ChangeAuditEntry`)**: Registro inmutable de modificaciones sobre obligaciones y pagos. Contiene: identificador del registro afectado, tipo de entidad, campo modificado, valor anterior, nuevo valor, fecha y hora del cambio, identificador del usuario que realizó la acción y motivo (obligatorio en cancelaciones).

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: En cada evaluación diaria, el 100% de las obligaciones con saldo adeudado mayor a cero cuyo vencimiento quedó atrás en la zona horaria `America/Argentina/Buenos_Aires` aparecen en estado `Vencida` antes de iniciar el despacho de reclamos, sin intervención manual y sin transiciones duplicadas.
- **SC-002**: Para el 100% de los reclamos automáticos y manuales, se cumplen conjuntamente las reglas de destinatarios y BCC de FR-004, FR-005 y FR-006, y se registra el resultado conforme a FR-007. Todo reclamo que continúe fallando después del reintento mínimo aparece como alerta visible y como `Fallido` en el historial.
- **SC-003**: Cero reducción de deuda anticipada: el 100% de los pagos informados se mantienen sin afectar el saldo deudor de la obligación hasta que un contador confirma explícitamente la validación en la aplicación.
- **SC-004**: En el 100% de los pagos validados con excedente, el importe diferencial se acredita de forma exacta como saldo a favor del cliente y queda disponible para imputación en menos de 2 segundos desde la confirmación de validación.
- **SC-005**: El 100% de las imputaciones de saldo a favor reducen de forma consistente tanto el saldo deudor de la obligación como el saldo a favor disponible del cliente en una única operación.
- **SC-006**: Cero eliminaciones físicas de obligaciones o pagos: el 100% de las anulaciones autorizadas se registra como cambio lógico a `Cancelado`, conserva el historial y expone en auditoría el motivo, usuario, fecha, valor anterior y valor nuevo.
- **SC-007**: El 100% de los criterios de aceptación y flujos operativos del módulo son comprobables y verificables de extremo a extremo a través de la interacción directa con la aplicación (interfaz de usuario o contratos de API en ejecución), sin necesidad de inspeccionar código fuente.
- **SC-008**: El 100% de las interfaces visibles presentan sus textos en idioma español y sus valores monetarios en moneda AR$ con formateo estándar argentino (`$ 1.250.500,50`).
- **SC-009**: Los contadores representantes tienen un aislamiento del 100% respecto a clientes y métricas de carteras ajenas, verificado tanto en vistas individuales como en reportes agregados de flujo de fondos.
- **SC-010**: En una cartera estándar de hasta 500 clientes, el 95% de las solicitudes de validación de pago confirmadas responde con el resultado financiero observable —estado del pago, nuevo saldo de obligación y saldo a favor si corresponde— en menos de 2 segundos; ningún resultado exitoso puede superar los 3 segundos.

---

## Assumptions

- **A-001**: Los usuarios del sistema (Contadores Administradores, Contadores Representantes y Clientes) ya se encuentran previamente registrados y autenticados en la plataforma con sus roles respectivos.
- **A-002**: La asignación de clientes a contadores representantes se gestiona en el módulo de clientes del estudio contable, sobre el cual este módulo consulta la relación de cartera.
- **A-003**: El envío de correos electrónicos transaccionales utiliza la infraestructura de correo de la plataforma, requiriendo únicamente las plantillas de mensaje y los datos de destinatarios.
- **A-004**: La zona horaria operativa para el cómputo de fechas límite, transiciones de estado a las 00:00 hs y registros de auditoría es `America/Argentina/Buenos_Aires` (ART, UTC-3).
- **A-005**: La plataforma opera administrativamente en moneda nacional argentina (Pesos Argentinos - AR$), por lo que no se requiere conversión de tipos de cambio multimoneda en esta versión inicial.

---

## Clarifications

### Sesión 2026-10-30

- Q: ¿Cómo acceden los Clientes a la plataforma para informar un pago y adjuntar su comprobante — mediante un portal web autenticado o a través de un enlace de acción único en el correo? → A: Ambos canales: portal web con acceso autenticado + enlace de acción rápida (token de uso único por obligación) incluido en los correos de reclamo.
- Q: ¿Qué sucede cuando el sistema intenta despachar un correo de reclamo y el servicio de correo falla — se reintenta automáticamente o el contador debe actuar manualmente? → A: Reintento automático (al menos 1 intento adicional); si persiste el fallo, el reclamo se marca como `Fallido` en el historial de auditoría y se genera una alerta visible en la plataforma para el contador.
- Q: ¿Puede un Cliente informar más de un pago sobre la misma obligación mientras el primero sigue en estado `Pendiente de Validación`? → A: Sí, está permitido. El Cliente puede informar múltiples pagos simultáneos sobre la misma obligación aunque queden todos en `Pendiente de Validación`; el contador los revisa y valida de a uno.
- Q: ¿El Contador Administrador puede configurar los parámetros de envío automático de reclamos de forma global para todo el estudio, o también puede definir excepciones por cliente? → A: Configuración global del estudio únicamente: un único conjunto de parámetros (día del primer aviso e intervalo de reiteración en días) aplica uniformemente a todos los clientes del estudio.
- Q: ¿Qué información puede visualizar el Cliente en su portal autenticado además de informar pagos — únicamente sus obligaciones y rendiciones, o también su saldo a favor? → A: El Cliente visualiza sus obligaciones propias, el estado de sus rendiciones informadas y su saldo a favor disponible (como dato de solo lectura; la imputación del saldo a favor es potestad exclusiva de los contadores).
- Q: ¿Cuánto tiempo debe permanecer válido el enlace de acción rápida antes de expirar? → A: 24 horas desde su emisión, con invalidación inmediata después del primer uso.
- Q: ¿Qué debe ocurrir con los pagos pendientes cuando se cancela la obligación asociada? → A: Los pagos pendientes se acreditan automáticamente como saldo a favor del cliente sin validación del contador, no reducen el saldo de la obligación cancelada y conservan su historial y auditoría.
