# Verificación inicial — 17-10-2026

> Registro histórico de la entrega inicial. El bloqueo de Docker y las pruebas reales pendientes se resolvieron en la [verificación posterior con PostgreSQL](verificacion-postgresql.md); allí se documenta también la creación posterior de `.env`.

## Entorno y preservación

Ruta: `C:\Users\cm_ri\OneDrive\Desktop\Software-Odontologos\Software-Odontologos`.

La carpeta recibida sólo contenía `spec.md` y `arquitectura.md`; ambos leídos completos y conservados sin cambios. No se encontraron `AGENTS.md` o `CLAUDE.md` en el proyecto ni en los directorios ascendentes revisados. No es un repositorio Git; `git rev-parse`/`git status` responden `not a git repository`. No se inicializó Git ni existen rama, HEAD o remotos de este trabajo. No se hicieron commits, push, PR ni despliegues.

Hashes SHA-256 de los documentos originales conservados:

```text
30c53a212773b3f9c63fffd47f500c6155d3d5156d1bfc80e93a97ad736b6c5c  spec.md
3cd57a0a94d8f445b0c214750be44aed340d07f2ff3c164c31d0337c323bd1f3  arquitectura.md
```

El equipo tenía Node 22.23.3, pnpm 11.24.0 y Docker CLI 29.7.2. Se utilizó Node **24.22.0** y pnpm **10.34.7** vía herramientas temporales de npm, sin cambiar instalaciones globales. Ejemplo exacto para repetir las verificaciones en este equipo:

```sh
npm exec --yes --package=node@24.22.0 --package=pnpm@10.34.7 -- pnpm install --frozen-lockfile
npm exec --yes --package=node@24.22.0 --package=pnpm@10.34.7 -- pnpm check
npm exec --yes --package=node@24.22.0 --package=pnpm@10.34.7 -- pnpm audit --prod
```

Con el runtime y gestor correctos activos basta usar los comandos `pnpm` del README.

## Resultados comprobados

| Verificación | Resultado |
|---|---|
| Instalación con `pnpm install` | Correcta; lockfile generado, peers estrictos |
| `pnpm install --frozen-lockfile` tras configuración final | Correcta, sin resolución ni cambios requeridos |
| `pnpm lint` | Web y API correctos, ESLint 10.13.0 |
| `pnpm typecheck` | Web y API correctos; Next genera tipos de rutas antes de tsc |
| `pnpm test` | 4/4 correctos, sin DB externa |
| `pnpm build` | API compilada; web compilada y portada prerenderizada |
| Web compilada, `next start --hostname 127.0.0.1 --port 3100` + petición HTTP | HTTP 200 y contenido de portada presente; proceso temporal detenido |
| Health HTTP con DataSource sustituido | Prefijo `/api/v1`, HTTP 200 con DB disponible, HTTP 503 con fallo, respuesta saneada, `Cache-Control: no-store`; `/health` responde 404 |
| `pnpm audit --prod` | `No known vulnerabilities found`; no garantiza ausencia futura de vulnerabilidades |
| `docker compose --env-file .env.example -f infra/compose.yaml config --quiet` | Correcto |
| `docker manifest inspect postgres:18.6-bookworm` | Correcto; manifiesto de imagen disponible |
| PostgreSQL real y migraciones | Bloqueados por Docker Desktop sin motor Linux iniciado |
| GitHub Actions | Workflow preparado; no ejecutado remotamente |

La conexión real y el rollback de migraciones **no se consideran validados** por las pruebas con DataSource sustituido. El workflow incluye PostgreSQL efímero y comandos de migración, repetición, rollback, reaplicación y prueba HTTP real para cubrirlo.

## Bloqueo y repetición

Comando intentado (sólo valores ficticios del ejemplo):

```sh
docker compose --env-file .env.example -f infra/compose.yaml up -d --wait
```

Error del equipo:

```text
unable to get image 'postgres:18.6-bookworm': failed to connect to the docker API
at npipe:////./pipe/dockerDesktopLinuxEngine
The system cannot find the file specified.
```

No se creó `.env`, no se levantó un contenedor ni se ejecutó una migración real. Iniciar Docker Desktop con contenedores Linux; activar Node/pnpm fijados, copiar el ejemplo a `.env` y configurar una contraseña exclusiva local. Después, desde Git Bash/bash en la raíz:

```sh
pnpm db:up
pnpm migration:run
pnpm migration:run
pnpm migration:show
pnpm migration:revert
pnpm migration:run
set -a
source .env
set +a
NODE_ENV=test pnpm test:integration
```

Este procedimiento es sólo para la DB local del scaffold. El rollback de la baseline no borra datos: revierte su registro técnico. `pnpm db:down` conserva el volumen.

## Alcance y rollback del scaffold

Antes sólo había documentos; ahora existen aplicaciones web/API, configuración local de DB, migración técnica sin esquema funcional, pruebas y CI. No hay pacientes, modelos de negocio, pagos ni conexiones a servicios externos. La web inicial no consulta la API desde el navegador y no afirma disponibilidad en tiempo real.

Para retirar el scaffold, detener procesos de desarrollo y DB, y retirar únicamente los archivos nuevos de esta entrega. Conservar `spec.md` y `arquitectura.md`. Si ya se hubiera iniciado PostgreSQL, preservar el volumen a menos que se autorice expresamente eliminar sus datos. No hay estado publicado que revertir.

Selección final de herramientas y ajustes de compatibilidad: [versiones.md](versiones.md). Ninguna decisión clínica o comercial fue añadida o modificada.
