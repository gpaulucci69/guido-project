# Quickstart: Validar selector de estado en modales

## Prerrequisitos

- Node.js 20 o superior.
- Dependencias del monorepo instaladas.
- Un usuario de prueba con acceso a las pantallas de clientes y contadores.
- Datos existentes de al menos un cliente y un contador.

## Validación automatizada

Desde la raíz del proyecto:

```bash
npm run typecheck
npm run lint
npm run format
npm test
```

Resultado esperado: todos los comandos finalizan correctamente y no hay errores de tipos, lint, formato o tests.

## Validación manual en navegador

1. Iniciar la aplicación con `npm run dev` y autenticarse con un usuario autorizado.
2. Abrir `Clientes del estudio`, editar un cliente y comprobar que el campo `Estado` tiene etiqueta legible, valor actual visible, control de apertura claro y ancho alineado con los demás campos.
3. Abrir el selector y confirmar que `Activo` e `Inactivo` se ven completos, que la opción actual se distingue y que el modal no recorta la lista.
4. Seleccionar el estado contrario, cerrar sin guardar y confirmar que la selección queda en el formulario pero no se persiste al volver a abrir el registro.
5. Repetir los pasos 2–4 en `Contadores del estudio` y confirmar que el patrón visual es idéntico.
6. Repetir con un usuario que tenga permiso de edición pero no de actualización: el selector debe ser legible y estar deshabilitado, y el botón de actualización no debe permitir guardar.
7. Con el foco en el selector, usar teclado para abrirlo, recorrer opciones, seleccionar y cerrar. El foco debe ser visible.
8. Reducir el ancho de la ventana y repetir la apertura. Las opciones y los controles esenciales del modal deben seguir accesibles.
9. Provocar un error de guardado, si el entorno lo permite; confirmar que el mensaje está en español y que la selección no desaparece.

## Correspondencia con la especificación

- Historias 1 y 2: pasos 2–6.
- Historia 3: pasos 7–8.
- FR-005 y caso de error: pasos 4 y 9.
- FR-006: paso 6.
- FR-007, FR-008 y FR-009: pasos 3, 7 y 8.
- FR-010 y SC-006: ejecución automatizada y pasos 4–6.
