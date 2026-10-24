# Publicar la demo de SmileCorp en Vercel desde GitHub

> Alternativa no seleccionada actualmente. El usuario eligió mostrar sólo la landing mediante [GitHub Pages](github-pages.md), sin servicios backend. La propuesta multiservicio se descartó antes de confirmarse. Esta guía se conserva únicamente como opción futura.

**Estado:** repositorio preparado; todavía no vinculado ni desplegado desde esta entrega. No hay una URL pública comprobada. No se contrató ningún servicio ni se instalaron herramientas de Vercel.

## 1. Alcance y plan

Se despliega **sólo `apps/web`**, la web Next.js existente. No se despliega NestJS, PostgreSQL, Docker ni la API de salud. El flujo de reserva y panel siguen siendo demostraciones con datos sintéticos en memoria; recargar borra los cambios. No hay cobros, formularios de datos reales, autenticación ni envíos automáticos.

Instagram, WhatsApp, dirección, fotos autorizadas y mapa opcional son visibles para quien abra la página. Las rutas `/app/*` también son públicas, pero contienen exclusivamente muestras ficticias. No cargar datos reales en esas rutas. Los avisos de demostración y `noindex, nofollow` se conservan: cualquiera con el enlace podrá verla si la protección del proyecto permite acceso público, pero no se pretende posicionar esta demo en buscadores. `noindex` no es un control de acceso.

**Antes de pulsar Deploy, revisar el plan:** la documentación de Vercel limita Hobby a uso personal no comercial. Esta landing promociona una clínica y contiene sus canales de contacto; no asumir que ser un prototipo la convierte en uso no comercial. Elegir un plan apto para el uso previsto, revisar precio/límites y obtener aprobación antes de contratar. No hay autorización automática para pagar un plan, dominio o complemento.

## 2. Cambios de preparación

- `apps/web/vercel.json`: framework Next.js y `pnpm run build`. Se ejecuta desde la carpeta configurada como raíz: `apps/web`, cuyo script sólo hace `next build`.
- Cabeceras para todos los paths: `X-Robots-Tag: noindex, nofollow`, `X-Content-Type-Options: nosniff` y `Referrer-Policy: strict-origin-when-cross-origin`. No se añade una CSP improvisada que rompa Next.js o el mapa.
- Sin `outputDirectory`, exportación estática, rewrites globales o comando `next start`: Vercel gestiona el runtime de Next.js y sus rutas dinámicas, incluida `/reservar?interes=...`.
- `engines.node` en raíz y web acepta **24.x**, ya que Vercel selecciona por versión mayor y administra minor/patch. Desarrollo y CI conservan **24.22.0** en `.nvmrc`; pnpm conserva **10.34.7** en `packageManager` de la raíz. Dependencias y lockfile no cambian.
- `.gitignore` excluye `.pnpm-store/` y `.vercel/`. El archivo de caché previamente versionado `.pnpm-store/v11/index.db` se retiró del índice mediante `git rm --cached`, sin borrarlo del disco ni reescribir la historia de Git. No era una credencial; si se detectaran secretos en la historia se requiere rotarlos, no sólo ignorarlos.
- `.env` y `.env.*` siguen ignorados, excepto `.env.example`. No se copiaron secretos al frontend ni a `vercel.json`.

## 3. Guardar y subir los cambios

No se hizo commit ni push automáticamente. Desde la raíz, con Node/pnpm fijados:

```sh
pnpm check
git status --short
git add .gitignore package.json apps/web/package.json apps/web/vercel.json apps/web/test/deployment.test.tsx README.md docs/despliegue-vercel.md docs/versiones.md
git diff --cached --stat
git commit -m "Preparar demo web para Vercel"
git push origin main
```

La eliminación de la caché del índice ya queda preparada para el próximo commit. Revisar que no se estén incluyendo otros cambios o secretos antes de confirmar. La rama observada es `main`; si se cambia, ajustar el comando y la rama de producción en Vercel.

## 4. Importar el repositorio

Desde tu cuenta, sin compartir contraseña ni tokens en el chat:

1. En Vercel, **Add New → Project** y conectar GitHub.
2. Conceder acceso al repositorio necesario; no hace falta abrir todos tus repositorios.
3. Importar el repositorio existente y revisar el plan antes de continuar.
4. Configurar:

| Ajuste | Valor |
|---|---|
| Framework Preset | **Next.js** |
| Root Directory | **`apps/web`** |
| Include source files outside of the Root Directory in the Build Step | **Activado** |
| Node.js Version | **24.x** |
| Build Command | `pnpm run build` (definido en `apps/web/vercel.json`) |
| Install Command | **Automático, sin Override** |
| Output Directory | **Predeterminado de Next.js, sin Override** |
| Production Branch | `main` |

La inclusión de archivos externos a `apps/web` permite usar `tsconfig.base.json`, workspace, configuración y lockfile de la raíz. No se crea otro repositorio ni se copia la app.

5. En las variables del proyecto, para **Production y Preview**, añadir estas variables de build **no secretas**:

| Variable | Valor | Motivo |
|---|---|---|
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` | Vercel usa `packageManager` de la raíz y pnpm 10.34.7. |
| `NEXT_TELEMETRY_DISABLED` | `1` | Desactiva telemetría de Next.js en el build. |

No añadir `.env` local, variables PostgreSQL, claves de Mercado Pago ni `NEXT_PUBLIC_*` con secretos. Esta demo no las necesita. No activar Web Analytics, Speed Insights u otras integraciones por defecto.

6. Revisar los valores y pulsar **Deploy** únicamente si se autorizó el plan aplicable. No requiere comprar dominio para obtener la URL asignada por Vercel.
7. Comprobar en los logs que usa Node 24 y pnpm **10.34.7**, y que sólo ejecuta el build de `@odontologia/web`/Next.js. Si aparece pnpm 6/9 u otra versión, corregir Corepack antes de reintentar; no borrar el lockfile ni desactivar `engine-strict` para ocultarlo.

## 5. Acceso para otras personas

Usar la URL de **Production** asignada por Vercel. Algunas URLs de Preview requieren iniciar sesión según Deployment Protection. Revisar esa configuración en la cuenta para el acceso público deseado, respetando las limitaciones del plan, y probar en una ventana privada sin sesión antes de compartir. No desactivar protección de otros proyectos ni exponer datos reales.

Después de conectar GitHub, Vercel puede crear despliegues al recibir nuevos commits. Los pull requests pueden generar previews y los cambios en `main` pueden actualizar producción. Revisar las opciones de Git/despliegue y los checks antes de depender de esa automatización: el workflow de GitHub no garantiza por sí solo que Vercel espere un CI exitoso.

## 6. Verificación después del primer despliegue

Pendiente hasta disponer de la URL real:

- Abrir en incógnito y desde un teléfono externo a la red local; no exigir una sesión personal de Vercel si se pretende acceso público.
- Portada, logo, retrato nuevo, par antes/después y composición de trabajo: carga correcta, sin 404 ni cortes.
- Menú móvil, FAQ, anclas y CTA inferior sin tapar contenido.
- `/reservar?interes=carillas-resina`: interés preseleccionado, horario y resumen ficticios, aviso de abono pendiente y ningún pago real.
- Instagram y WhatsApp apuntan al perfil/número aprobados. No automatizar mensajes de prueba.
- “Ver mapa” solicita Google Maps sólo después de pulsarlo; confirmar que la dirección consultada corresponde al acceso correcto. El render real del proveedor no se verificó en las pruebas locales interceptadas.
- Las páginas dinámicas no dan 404; las citas temporales se pierden al recargar como avisa la demo.
- Ausencia de errores de consola y conservación de cabeceras de demo. Ejemplo: `curl -I https://<dominio-asignado>/`.
- Revisar tiempos de carga reales y consumo del plan; no hay métricas de campo garantizadas.

Si falla: conservar logs saneados, revisar el commit/configuración y volver al último despliegue correcto desde el panel. No introducir claves ni conectar cobros para resolver un error de build.

## 7. Comprobaciones locales y límites

Se ejecutaron `pnpm check` (lint, tipos, **25 pruebas**, build web/API) y `pnpm --filter @odontologia/web build` desde la configuración de trabajo, además de comprobar exclusión de cachés/secretos y contrato de configuración de Vercel. Los campos usados en `vercel.json` se validaron contra sus definiciones en el esquema oficial consultado; no se afirma haber ejecutado el builder de Vercel. `git diff --check` correcto y lockfile sin modificaciones. `.env`/`.vercel` no están versionados; esto no equivale a una auditoría exhaustiva de secretos. El build completo local no implica que API/DB se publiquen; Vercel usa sólo el comando de la web.

No se ejecutó un build de Vercel remoto ni se probaron permisos de la cuenta, facturación, dominio o acceso público. El entorno local es Windows; la compatibilidad definitiva del builder Linux debe comprobarse en el primer despliegue. No se instalaron dependencias ni se cambió `pnpm-lock.yaml`.

## Fuentes oficiales consultadas

- Monorepos: https://vercel.com/docs/monorepos
- Acceso a archivos fuera de Root Directory: https://vercel.com/docs/monorepos/monorepo-faq
- Node por versión mayor: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Detección de pnpm: https://vercel.com/docs/package-managers
- Corepack y build: https://vercel.com/docs/builds/configure-a-build
- Condiciones Hobby: https://vercel.com/docs/plans/hobby
- Esquema de configuración: https://openapi.vercel.sh/vercel.json

Las instrucciones de estas páginas se consultaron para preparar el repositorio; no se instaló un plugin/CLI ni se ejecutó una publicación.
