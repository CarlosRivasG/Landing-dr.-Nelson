# Verificación con PostgreSQL real — 17-10-2026

Continuación de [verificacion-inicial.md](verificacion-inicial.md). Se resolvió el bloqueo local de Docker; no implica que GitHub Actions se haya ejecutado.

## Entorno

- Docker Desktop iniciado mediante `docker desktop start`, motor Linux 29.7.2.
- Node 24.22.0 y pnpm 10.34.7 usados mediante `npm exec`, sin cambiar el Node 22 predeterminado de la terminal.
- Imagen `postgres:18.6-bookworm`; el servidor confirmó PostgreSQL 18.6.
- Se creó `.env`, ignorado por Git, con contraseña aleatoria exclusiva local (no incluida aquí).
- Windows rechazó publicar `127.0.0.1:5432` con un error de permisos de socket. Se comprobó disponible y se configuró `POSTGRES_PORT=15432` sólo en `.env`. El ejemplo y Compose conservan 5432 por defecto.
- Contenedor exclusivo: `odontologia-local-postgres-1`; volumen: `odontologia-local_postgres_data`. No había un volumen previo de este proyecto.
- Al iniciar Docker se reactivaron contenedores preexistentes de otros proyectos por sus políticas de reinicio; no se modificaron ni detuvieron.

## Resultados

| Comprobación | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | Correcta; lockfile actualizado no requerido |
| `pnpm check` | Lint, tipos, 4 pruebas y build de web/API correctos |
| Compose y `up -d --wait` | Correctos tras usar 15432 |
| Consulta inicial de tablas públicas | 0 tablas |
| `migration:show` inicial | Baseline pendiente |
| `migration:run` inicial | Baseline aplicada |
| Segundo `migration:run` | Sin migraciones pendientes; 1 registro técnico |
| `migration:revert` | Correcto; 0 registros técnicos; baseline vuelve a pendiente |
| Reaplicación | Correcta; 1 registro técnico |
| Esquema final | Sólo `infrastructure_migrations`, sin tablas de negocio |
| `NODE_ENV=test pnpm test:integration` | 1/1 correcta, HTTP 200 con PostgreSQL real |
| Smoke HTTP de API compilada, DB disponible | 200, `{"status":"ok","database":"up"}` |
| Mismo proceso, contenedor de este proyecto pausado temporalmente | 503 en aproximadamente 3 segundos, `{"status":"error","database":"down"}` |
| Contenedor reanudado, mismo proceso | Recuperación a 200 |
| Cabecera de los tres estados HTTP | `Cache-Control: no-store` |

La pausa/reanudación se hizo exclusivamente sobre el contenedor de este proyecto y con recuperación en `finally`; la API temporal escuchó en un puerto loopback asignado por el sistema y se cerró al terminar. No se guardó un script de interrupción ni se incorporó a CI. El healthcheck de Docker puede tardar unos ciclos en volver a `healthy` tras la pausa.

## Repetir verificaciones

Con Docker iniciado y Node/pnpm fijados activos, desde Git Bash en la raíz:

```sh
pnpm db:up
pnpm migration:show
pnpm migration:run
pnpm migration:run
pnpm migration:revert
pnpm migration:show
pnpm migration:run
set -a
source .env
set +a
NODE_ENV=test pnpm test:integration
pnpm check
```

Sólo ejecutar rollback contra la DB local de pruebas. Para este equipo, si la terminal sigue en Node 22, anteponer a cada comando pnpm:

```sh
npm exec --yes --package=node@24.22.0 --package=pnpm@10.34.7 -- pnpm check
```

Estado de cierre: DB local iniciada en `127.0.0.1:15432`, baseline aplicada y volumen conservado. Web/API no se dejaron ejecutando. `pnpm db:down` detiene la DB sin borrar el volumen.

## Cambios y límites

Sólo se añadió configuración local `.env` y documentación; no fue necesario cambiar código, dependencias, migraciones ni reglas funcionales. Los hashes de `spec.md` y `arquitectura.md` coinciden con los originales documentados. No se usaron datos de pacientes ni servicios externos de negocio. No se inicializó Git, publicó ni desplegó nada.

Pendientes: CI remoto cuando exista repositorio y se autorice su publicación; SRS aprobado antes de implementar reglas de negocio. La auditoría de dependencias no se repitió en esta revisión.
