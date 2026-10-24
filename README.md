# Software odontológico — base técnica

Monorepo ejecutable con una [landing de SmileCorp / Dr. Nelson](docs/smilecorp-landing.md): negro, blanco y marfil, diseño de sonrisa, tratamientos y acceso a evaluación. Evoluciona el [prototipo visual anterior](docs/prototipo-landing.md), sin crear otro proyecto. Los recursos de banco y el 3D anteriores se conservan en el repositorio pero no se muestran como material de SmileCorp. Selección autorizada de `imagenes/` incorporada: logo, Dr. Nelson, sonrisa del hero, composición de trabajo y antes/después 2.2. Faltan versiones fuente de mayor resolución, validación de futuras leyendas clínicas y contacto confirmado. Incluye un [recorrido de aplicación en demostración](docs/prototipo-app.md): reserva ficticia, pago simulado opcional, agenda y seguimiento administrativo. **No implementa reglas clínicas ni operación comercial real**. Existe un [SRS provisional con respuestas propuestas](docs/SRS.md) para avanzar con prototipo y datos ficticios; la aprobación del cliente sigue pendiente. Leer también [spec.md](spec.md) y [arquitectura.md](arquitectura.md), conservados en la raíz. Los árboles que proponen son ilustrativos; aquí sólo se crean carpetas con código real. No hay paquetes compartidos, PWA/offline, autenticación ni integraciones externas todavía.

## Explorar el prototipo funcional

Con las dependencias instaladas y Node/pnpm fijados, ejecutar `pnpm dev:web`. No requiere API ni PostgreSQL para este recorrido:

- `/reservar`: interés, horario, resumen y resultado ficticios; sin pago por defecto. Simulador técnico opcional, no un abono comercial.
- `/reservar?interes=carillas-resina`: interés preseleccionado desde las tarjetas de la landing. Contacto y abono pendientes en `apps/web/app/site-config.ts`.
- `/app/hoy`: agenda del día y próximas acciones.
- `/app/agenda`: listado de citas con filtros.
- `/app/citas/muestra-01`: detalle, asistencia, solicitud de cambio, cancelación y tarea.

Las nuevas reservas aparecen en el panel durante la misma navegación. Todo es ficticio y vive sólo en memoria: recargar borra los cambios. No introducir datos reales. [Reglas y verificaciones](docs/prototipo-app.md).

## Requisitos

- **Node.js 24.22.0 LTS** (`.nvmrc`). Cambiar a esta versión con el gestor de Node del equipo; no basta Node 22.
- **pnpm 10.34.7**, fijado en `packageManager`.
- Docker Desktop con motor Linux iniciado y plugin **Docker Compose v2+**.
- Puertos locales libres: 3000 (web), 3001 (API), 5432 (DB por defecto). Si Windows rechaza 5432 o está ocupado, configurar otro `POSTGRES_PORT` en `.env`; en este equipo se verificó con 15432.

Instalar el gestor si no está disponible: `npm install --global pnpm@10.34.7`. Si se utiliza Corepack, `corepack enable` y `corepack prepare pnpm@10.34.7 --activate` son una alternativa. No ejecutar ambos métodos.

Selección de versiones y fuentes oficiales: [docs/versiones.md](docs/versiones.md).

## Instalación y configuración

Desde la raíz:

```sh
node --version  # v24.22.0
pnpm --version # 10.34.7
pnpm install --frozen-lockfile
```

Copiar `.env.example` a `.env`:

```sh
cp .env.example .env
# PowerShell: Copy-Item .env.example .env
```

Editar `POSTGRES_PASSWORD` en `.env` con una contraseña exclusiva para desarrollo local. No reutilizar credenciales reales. `.env` se ignora en Git; el ejemplo contiene sólo valores ficticios. No poner secretos en variables `NEXT_PUBLIC_*`.

| Variable | Uso |
|---|---|
| `NODE_ENV` | `development`, `test` o `production`; local: development |
| `API_HOST`, `API_PORT` | Interfaz de escucha y puerto de Nest; 127.0.0.1:3001 |
| `POSTGRES_HOST` | Host visto desde la API en el equipo; 127.0.0.1 |
| `POSTGRES_PORT` | Puerto publicado en loopback; 5432 |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Base local y credenciales locales |

La API y el CLI de migraciones leen `.env` de la raíz sin sobrescribir variables ya exportadas (CI). La web inicial no necesita variables ni llama a la API desde el navegador; CORS no está abierto. La contraseña y el host se exigen al arrancar; puertos inválidos se rechazan. Esta configuración es local: producción requiere diseño de TLS, secretos y operación antes de desplegar.

## Arrancar

```sh
pnpm db:up            # PostgreSQL local, espera healthcheck
pnpm migration:run    # baseline de infraestructura, sin tablas de negocio
pnpm dev             # web y API, ambos con recarga al editar
```

O en terminales independientes:

```sh
pnpm dev:web
pnpm dev:api
```

- Web: <http://127.0.0.1:3000>.
- API: <http://127.0.0.1:3001/api/v1/health>.

```sh
curl -i http://127.0.0.1:3001/api/v1/health
```

DB disponible: HTTP 200, `{"status":"ok","database":"up"}`. Si la DB deja de estar disponible con la API iniciada: HTTP 503, `{"status":"error","database":"down"}`. La comprobación ejecuta `SELECT 1`, sin caché ni detalles internos. Los tiempos de conexión y consulta están acotados. Si PostgreSQL no está disponible al iniciar, la API no arranca: levantar la DB y repetir el comando.

`Ctrl+C` detiene el desarrollo. `pnpm db:logs` muestra logs locales; `pnpm db:down` detiene la DB **sin borrar el volumen**. No usar `down --volumes` salvo que se quiera perder deliberadamente la DB local. Cambiar usuario/contraseña en `.env` no modifica un volumen ya inicializado.

## Migraciones

`synchronize: false` y `migrationsRun: false` en **todos** los entornos. Sólo los comandos explícitos modifican el esquema. El CLI compila TypeScript y ejecuta las migraciones JS del build; no requiere ts-node.

```sh
pnpm migration:show
pnpm migration:run
pnpm migration:revert
```

La baseline `1792195200000-InfrastructureBaseline.ts` ejecuta `SELECT 1` en up/down para validar el circuito. TypeORM crea su tabla técnica `infrastructure_migrations`; no se crean entidades clínicas/comerciales ni datos de pacientes. Revertir la baseline sólo retira su registro: la tabla técnica de historial permanece.

Después de aprobar un cambio de esquema:

```sh
# Los paths son relativos a apps/api, donde se ejecuta el CLI:
pnpm migration:create src/database/migrations/NombreDelCambio
# O comparar entidades compiladas con una DB local:
pnpm migration:generate src/database/migrations/NombreDelCambio
```

Las futuras entidades se ubicarán en `src/modules/**/*.entity.ts`. Revisar siempre SQL y rollback antes de ejecutar. Sin entidades/cambios, `migration:generate` sale con código 1: es el comportamiento esperado de TypeORM, no hay que inventar tablas para evitarlo. Versionar las migraciones fuente, no `dist/`. No ejecutar estos comandos contra producción sin autorización y procedimiento de respaldo.

## Calidad y build

```sh
pnpm lint
pnpm typecheck
pnpm test              # 23 pruebas sin PostgreSQL externo
pnpm build
pnpm check             # todas las anteriores
pnpm install --frozen-lockfile
```

Después del build, se pueden iniciar los procesos compilados en terminales separadas:

```sh
pnpm --filter @odontologia/web start
pnpm --filter @odontologia/api start
```

Prueba HTTP con PostgreSQL real **local de pruebas**, después de `db:up` y `migration:run`, en Git Bash/bash:

```sh
set -a
source .env
set +a
NODE_ENV=test pnpm test:integration
```

En PowerShell, exportar las variables `POSTGRES_*` de la tabla a `$env:POSTGRES_*`, luego `$env:NODE_ENV='test'; pnpm test:integration`. La prueba exige `NODE_ENV=test` y variables explícitas; no carga silenciosamente una DB externa.

CI en `.github/workflows/ci.yml`: instala con lockfile congelado, lint, typecheck, pruebas, build, validación de Compose, migración/idempotencia/rollback y prueba HTTP con PostgreSQL 18.6 efímero. Sin publicación ni despliegue. Se ejecutará al conectar y enviar el repositorio a GitHub; no se ha ejecutado remotamente en esta entrega.

## Estructura

```text
apps/web/               Next.js: landing, reserva/agenda de demo y pruebas
apps/api/src/
  config/               Validación de variables
  database/             DataSource, opciones y migraciones versionadas
  modules/health/       Controlador y servicio de disponibilidad
apps/api/test/          Pruebas de configuración, HTTP e integración real
infra/compose.yaml     Sólo PostgreSQL local, puerto ligado a loopback
.github/workflows/     Verificaciones automáticas
docs/SRS.md            Hipótesis funcionales, evidencia y criterios de aceptación
spec.md                Contexto y reglas de trabajo actualizadas
arquitectura.md         Arquitectura preliminar y referencia al SRS provisional
```

## Verificación de esta entrega y pendientes

Se verificaron instalación congelada, lint, typecheck, pruebas y build con Node 24.22.0 en Windows. Además de las pruebas con DB sustituida, se validaron PostgreSQL 18.6 real, migración inicial, repetición sin duplicados, rollback, reaplicación e integración HTTP. Una interrupción temporal de la DB produjo 503 saneado y, al recuperarla, 200 en el mismo proceso. Ver [docs/verificacion-postgresql.md](docs/verificacion-postgresql.md) y el registro histórico [docs/verificacion-inicial.md](docs/verificacion-inicial.md).

Pendiente técnico: ejecutar CI en GitHub cuando se autorice publicar. Se usa el plugin Next directo con ESLint 10 para evitar peers incompatibles del preset completo (decisión documentada). Git se inicializó posteriormente; el trabajo está en `staging`, todavía sin commits. No se publicó esta entrega.

Pendientes del cliente: SRS, significado/monto del pago, aprobación de reservas, cancelaciones/devoluciones, plazos, roles, datos mínimos y canales de notificación. Mercado Pago sigue siendo candidato: no hay SDK, checkout externo ni credenciales. El prototipo web sólo simula escenarios y usa reglas provisionales centralizadas; no se conectan a la API ni a la base de datos.
