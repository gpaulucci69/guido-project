# Quickstart: Validar activar e inactivar desde listados

## Prerrequisitos

- Node.js 20 o superior y dependencias instaladas.
- Aplicación, profile-service y Keycloak disponibles.
- Un cliente activo, un cliente inactivo, un contador activo y un contador inactivo.
- Usuarios con y sin `client/update` o `user/update`.

## Validación automatizada

```bash
npm run typecheck
npm run lint
npx prettier --check apps/frontend/src/features/people/people-api.ts apps/frontend/src/features/people/people-view.ts
npm test
```

Resultado esperado: todos los comandos finalizan correctamente.

## Validación manual

1. Abrir `Clientes del estudio`.
2. Confirmar que un cliente activo muestra `Editar` e `Inactivar`, sin `Eliminar`.
3. Seleccionar `Inactivar`, cancelar y comprobar que continúa `Activo`.
4. Repetir, confirmar y comprobar que sigue visible como `Inactivo` y muestra `Activar`.
5. Seleccionar `Activar`, confirmar y comprobar que vuelve a `Activo` y muestra `Inactivar`.
6. Repetir los pasos 2–5 para `Contadores del estudio`.
7. Provocar un error de actualización y comprobar mensaje en español, sin éxito falso ni desaparición del registro.
8. Repetir con usuarios sin permiso de actualización y comprobar que no pueden ejecutar ninguna acción de cambio de estado.
9. Verificar que datos personales e identificador no cambian y que ningún registro es eliminado físicamente.

## Correspondencia

- Historias 1 y 2: pasos 2–6.
- Historia 3: pasos 7–9.
- FR-001–FR-007: pasos 2–6.
- FR-008–FR-010 y FR-014: pasos 7–9.
- SC-001–SC-007: conjunto completo de pasos.
