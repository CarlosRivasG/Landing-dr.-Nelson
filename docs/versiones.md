# Versiones y compatibilidad

Revisión: 17-10-2026, antes de instalar las dependencias. Se consultó documentación oficial y metadatos `version`, `engines` y `peerDependencies` del registro npm. Los manifiestos fijan dependencias directas sin rangos; `pnpm-lock.yaml` fija el árbol transitivo.

| Componente | Versión elegida | Motivo / fuente oficial |
|---|---|---|
| Node.js | 24.22.0 LTS | [Releases](https://nodejs.org/en/about/previous-releases), [índice oficial](https://nodejs.org/dist/index.json). Última 24 LTS del índice consultado. |
| pnpm | 10.34.7 | Última revisión de la línea 10 consultada; [instalación y compatibilidad 10.x](https://pnpm.io/10.x/installation), [workspaces](https://pnpm.io/workspaces). Se conserva esta línea para el gestor JS tradicional; pnpm 12.14.0 es la versión corriente y cambia a distribución nativa. No se usa el pnpm 11 global del equipo. |
| Next.js | 16.4.2 | [Instalación App Router](https://nextjs.org/docs/app/getting-started/installation): Node >=20.9, TypeScript >=5.1; peers aceptan React 19. |
| React / React DOM | 19.3.1 | [Versiones](https://react.dev/versions). Ambas bibliotecas alineadas. |
| Three.js | 0.186.1 | Añadido para la landing premium. [Paquete oficial r186](https://github.com/mrdoob/three.js/blob/r186/package.json), [documentación](https://threejs.org/docs/), [limpieza de recursos](https://threejs.org/manual/en/cleanup.html). Sin peers React; uso directo desde un componente cliente, sin Fiber/Drei. Tipos `@types/three` 0.186.0 como dependencia de desarrollo. |
| NestJS | 12.1.3 | [Primeros pasos](https://docs.nestjs.com/first-steps), [fuente oficial legible](https://github.com/nestjs/docs.nestjs.com/blob/master/content/first-steps.md). Node 24 cumple sus requisitos; common/core/platform/testing alineados. |
| @nestjs/typeorm | 12.0.2 | [Integración SQL](https://docs.nestjs.com/techniques/database). Sus peers admiten Nest 12 y TypeORM 1. |
| TypeORM | 1.1.2 | [PostgreSQL](https://typeorm.io/docs/drivers/postgres/), [migraciones](https://typeorm.io/docs/migrations/why/). Engines admiten Node >=24.11. |
| pg | 8.23.1 | [Driver oficial](https://node-postgres.com/); satisface peer pg ^8.5.1 de TypeORM. |
| PostgreSQL | 18.6-bookworm | [Política oficial](https://www.postgresql.org/support/versioning/): 18.6 estable; 19 aún RC. [Imagen oficial](https://hub.docker.com/_/postgres); volumen en `/var/lib/postgresql` para PostgreSQL 18. |
| TypeScript | 5.9.3 | [Release 5.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html). Aunque npm anuncia 7.0.2, typescript-eslint 8.71.2 exige TS <6.1; se fija la versión compatible. |
| ESLint | 10.13.0 | [Version support](https://eslint.org/version-support/), [Next ESLint](https://nextjs.org/docs/app/api-reference/config/eslint). Plugin oficial Next 16.4.2 directo, sin presets con peers incompatibles. |
| typescript-eslint | 8.71.2 | [Compatibilidad](https://typescript-eslint.io/users/dependency-versions/). Acepta ESLint 10 y TS 5.9. |
| Docker Compose | plugin v2+ | [Modelo Compose](https://docs.docker.com/compose/intro/compose-application-model/); usa `docker compose`, healthcheck y `up --wait`. |
| GitHub Actions | checkout v6, setup-node v6, pnpm/action-setup v4 | [Guía Node](https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs). Acciones fijadas por SHA del tag oficial consultado. |

## Compatibilidad de despliegue en Vercel

La preparación para Vercel conserva Node **24.22.0** en `.nvmrc` y CI, pero declara `engines.node: "24.x"` en raíz y web: Vercel sólo selecciona versiones mayores y actualiza minor/patch automáticamente. Se consultaron [sus versiones soportadas](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). No cambia la decisión de Node 24 LTS ni las versiones de dependencias. La API sigue requiriendo las versiones mínimas de sus dependencias al instalar; no se propone usar un Node 24 antiguo.

pnpm permanece fijado en **10.34.7**, usando `ENABLE_EXPERIMENTAL_COREPACK=1` en Vercel según su [documentación de builds](https://vercel.com/docs/builds/configure-a-build). Instalación automática, sin override `pnpm install` que seleccione una versión antigua del contenedor. Lockfile conservado sin cambios. Build local verificado, build remoto todavía pendiente. [Guía completa](despliegue-vercel.md).

## Configuración de lint compatible

Se probó el preset completo `eslint-config-next@16.4.2` con ESLint 10 y `strict-peer-dependencies=true`. La instalación fue rechazada por peers de sus plugins import/jsx-a11y/react que sólo declaran soporte hasta ESLint 9. ESLint 9.39.5 pasó las verificaciones, pero npm lo marca sin soporte.

Para no mantener una herramienta obsoleta ni ignorar peers, la configuración final usa **ESLint 10 + typescript-eslint + `@next/eslint-plugin-next` directo**, alternativa documentada por Next en “Using the plugin directly”. Conserva reglas TypeScript y Next/Core Web Vitals; no incluye los presets adicionales React Hooks, accesibilidad e import del preset completo. Incorporar reglas específicas de React Hooks cuando existan componentes con hooks, sin forzar versiones incompatibles. La landing rediseñada añade un componente cliente para cargar Three.js desde un efecto; la mayoría del contenido continúa siendo HTML renderizado en servidor. El preset actual no incluye reglas React Hooks; su incorporación queda pendiente de verificar compatibilidad, no se desactivaron peers para instalarlo.

## Acceso a documentación TypeORM

El sitio de TypeORM devolvió HTTP 403. Se revisaron antes de instalar sus fuentes oficiales equivalentes:

- [Setup de migraciones](https://github.com/typeorm/typeorm/blob/master/docs/docs/migrations/02-setup.md).
- [Generación](https://github.com/typeorm/typeorm/blob/master/docs/docs/migrations/04-generating.md).
- [Ejecución](https://github.com/typeorm/typeorm/blob/master/docs/docs/migrations/05-executing.md).
- [Driver PostgreSQL](https://github.com/typeorm/typeorm/blob/master/docs/docs/drivers/postgres.md).

No se seleccionaron versiones prerelease ni dependencias `latest`. No actualizar versiones sin regenerar lockfile y repetir las verificaciones.
