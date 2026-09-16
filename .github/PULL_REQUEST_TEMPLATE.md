## Tipo de Cambio
- [ ] Nueva funcionalidad (feature)
- [ ] Corrección de error (bugfix)
- [ ] Refactorización / Ajustes de configuración (chore/refactor)

## Descripción
<!-- Resume en 2-3 oraciones qué hiciste y por qué -->

## Issue Relacionado
- Closes # <!-- Escribe aquí el número del Issue, ej: Closes #3 -->

## Chequeo de Ramas y Destino (¡IMPORTANTE!)
- [ ] **He verificado que este PR apunta a la rama `dev` y NO a `main`**.
- [ ] Mi rama local fue creada a partir de la versión más reciente de `dev` (`git pull origin dev`).

## Pruebas Realizadas y Calidad
- [ ] El código compila correctamente (`npm run build`).
- [ ] Se ejecutó el linter y formateador sin errores (`npm run lint` / `npm run format`).
- [ ] Levanta localmente con Docker Compose (`docker compose up -d`).
- [ ] Probado exitosamente en Swagger (`/api/docs`).
- [ ] Verificado que los datos impactan correctamente en PostgreSQL.

## Seguridad y Buenas Prácticas
- [ ] **NO he subido archivos `.env` ni credenciales/secretos al repositorio**.
- [ ] Los DTOs tienen aplicadas las validaciones con `class-validator` requeridas por la HU.
- [ ] No hay `console.log` innecesarios en el código.

## Revisión Requerida
- [ ] Confirmar que el código sigue las convenciones del equipo.
- [ ] Solicitada la revisión a al menos 1 compañero de equipo.