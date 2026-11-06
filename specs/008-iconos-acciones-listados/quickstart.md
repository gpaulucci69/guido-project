# Quickstart: Validar iconos de acciones en listados

## Validación automatizada

```bash
npm run typecheck
npm run lint
npx prettier --check apps/frontend/src/features/people/people-view.ts apps/frontend/src/styles.css
npm test
```

## Validación manual

1. Abrir `Clientes del estudio` y `Contadores del estudio` con registros activos e inactivos.
2. Confirmar que las acciones se muestran como iconos, sin texto de botón visible.
3. Pasar el puntero sobre cada icono y comprobar un tooltip en español: `Editar`, `Inactivar` o `Activar`.
4. Navegar con `Tab` y comprobar que cada botón recibe foco visible y comunica su nombre accesible.
5. Activar cada acción con `Enter` o `Espacio`; comprobar que se mantienen los modales, confirmaciones y transiciones existentes.
6. Repetir con permisos parciales y verificar que solo aparecen iconos de acciones autorizadas.
7. Reducir el ancho de la ventana y confirmar que los iconos siguen siendo distinguibles, enfocables y no desbordan la tabla.

## Correspondencia

- Historias 1 y 2: pasos 1–4.
- Conservación funcional: paso 5.
- Permisos y responsive: pasos 6–7.
