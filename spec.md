# Spec del proyecto para Codex

**Estado:** base tecnológica inicial con [SRS provisional de hipótesis](docs/SRS.md). La aprobación funcional del cliente sigue pendiente; se autoriza avanzar con prototipo y pruebas de datos sintéticos.

## Propósito

Construir una plataforma web para odontólogos especialistas que reciben tratamientos de alto valor. El problema inicial es el tiempo y costo perdidos por inasistencias, junto con la coordinación de reservas y el seguimiento de pacientes. La experiencia debe funcionar muy bien desde el teléfono.

La visión de producto contempla una landing de tratamiento, reserva de citas con pago previo, agenda profesional y seguimiento administrativo. La solución puede crecer después como SaaS multi-consultorio.

## Fuente de decisiones

Antes de modificar decisiones técnicas o funcionales, leer `arquitectura.md`. Las respuestas del cliente al cuestionario de levantamiento y el SRS aprobado serán la fuente de verdad para las reglas del producto. Esta especificación no reemplaza el SRS. Mientras llegan las respuestas, `docs/SRS.md` es la propuesta operativa para prototipo y pruebas locales: distingue contexto, evidencia, hipótesis y bloqueos de producción. No implica aprobación del cliente.

## Base tecnológica acordada

- Node.js 24 LTS.
- pnpm Workspaces para el monorepo.
- `apps/web`: Next.js, React y TypeScript para landing pública y panel responsive/PWA.
- `apps/api`: NestJS + TypeScript, API REST bajo `/api/v1`, organizada como monolito modular.
- PostgreSQL + TypeORM, con migraciones versionadas y revisadas. No habilitar `synchronize` en producción.
- Docker Compose para desarrollo local de PostgreSQL.
- GitHub Actions para instalar dependencias desde lockfile, lint, typecheck, pruebas y build.
- No agregar microservicios, Redis, colas ni app nativa en esta etapa.

## Estructura inicial esperada

```text
apps/
  web/
  api/
packages/
  contracts/
  config/
infra/
docs/
  arquitectura.md
  spec.md
.env.example
pnpm-workspace.yaml
package.json
README.md
```

Mantener la estructura pequeña. Crear paquetes compartidos sólo cuando haya código que realmente se comparta.

## Alcance técnico de arranque

La primera iteración puede preparar el repositorio para desarrollo sin implementar reglas clínicas o comerciales: configuración del monorepo, app web mínima, API con endpoint de salud, conexión local a PostgreSQL, configuración de TypeORM/migraciones, variables de entorno de ejemplo, scripts de calidad, CI y guía de instalación.

Entregables técnicos mínimos de esa iteración:

1. El proyecto se instala con una sola instrucción documentada y queda reproducible mediante `pnpm-lock.yaml`.
2. La web corre localmente y muestra una página inicial de proyecto.
3. La API responde en `GET /api/v1/health` con estado del servicio.
4. PostgreSQL corre localmente mediante Docker Compose; no incluir datos reales.
5. Las migraciones se pueden generar y ejecutar localmente; no crear tablas clínicas o comerciales antes de validar el SRS.
6. Los comandos de lint, typecheck, tests y build están disponibles y pasan en CI.
7. `.env.example` contiene sólo nombres de variables y valores ficticios; secretos nunca se guardan en Git.

## Reglas funcionales conocidas, aún por validar

- El paciente podría elegir horario, pagar una reserva y recibir confirmación.
- Mercado Pago es la pasarela candidata inicial. Una cita sólo podrá confirmarse desde el backend tras verificar el pago, no por el retorno del navegador.
- El profesional necesita agenda, estados de cita, datos de contacto y próxima acción de seguimiento.
- Debe existir una vía para conversar por WhatsApp antes de reservar.
- La landing debe explicar el tratamiento, materiales, proceso y valor con contenido autorizado.

Se pueden implementar las hipótesis de `docs/SRS.md` como reglas provisionales configurables en prototipo y pruebas con datos sintéticos, no como comportamiento comercial definitivo. En especial, no codificar el 25%, la base de cálculo, la no devolución, los plazos de cancelación ni la aprobación manual de horarios sin confirmación.

## Privacidad y límites de datos

- No recolectar, cargar ni inventar datos reales de pacientes durante el desarrollo inicial.
- Mantener la ficha clínica, diagnósticos, odontograma, fotos clínicas y radiografías fuera del primer scaffold.
- Separar consentimiento para gestionar una cita del consentimiento opcional de marketing cuando se implemente ese flujo.
- Aplicar separación por consultorio y permisos en todas las operaciones que accedan a datos.
- No guardar datos de tarjetas; Mercado Pago manejará el checkout.

## Forma de trabajo esperada de Codex

- Revisar este archivo y `arquitectura.md` antes de comenzar.
- Trabajar por iteraciones pequeñas y explicar qué archivos cambió y cómo ejecutar/verificar el resultado.
- Evitar añadir librerías, servicios externos o complejidad sin una necesidad clara.
- No publicar, desplegar ni conectar servicios pagados sin una instrucción explícita.
- Para decisiones de negocio faltantes, usar las hipótesis explícitas de `docs/SRS.md`, conservando su carácter provisional. Preguntar cuando bloqueen operación real, no frenar el prototipo por pendientes ya cubiertos por esas hipótesis.
- Mantener documentación de instalación y actualizar este spec cuando el cliente apruebe cambios.

## Criterio de cierre del scaffold

La base queda lista cuando un desarrollador pueda clonar el repo, seguir el README, levantar PostgreSQL, arrancar web y API, ejecutar migraciones vacías o iniciales no clínicas y pasar lint, typecheck, tests y build localmente y en CI.
