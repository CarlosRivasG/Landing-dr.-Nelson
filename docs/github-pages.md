# Mostrar la landing en GitHub Pages

**Opción elegida por el usuario:** sólo mostrar el diseño desde GitHub. No se necesita Vercel, API, PostgreSQL ni un servidor Next.js para esta publicación.

**Estado:** exportación estática y pruebas locales preparadas; todavía no se ha ejecutado el workflow remoto ni comprobado una URL pública. No se hizo commit, push ni cambio de configuración en la cuenta de GitHub desde esta entrega.

## Qué se muestra

- La misma landing de SmileCorp: imágenes autorizadas, nuevo retrato, antes/después, tratamientos, proceso, FAQ y contacto.
- Menú móvil y preguntas interactivos. Mapa opcional sólo al pulsar “Ver mapa”, más enlace “Cómo llegar”.
- Instagram y WhatsApp abren los canales configurados; no se envían mensajes automáticamente.
- En esta versión, los botones de evaluación llevan a la sección informativa `#reserva`, que explica que no hay calendario ni citas. No hay enlaces rotos a `/reservar` o `/app/*`.
- No se publican API, panel, checkout ni formularios. No se recogen datos ni se ejecutan pagos. Los avisos de muestra y metadatos `noindex, nofollow` permanecen visibles/aplicados. No es protección de acceso: Pages será accesible al público según la configuración del repositorio.

GitHub Pages tiene [límites y condiciones de uso](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits): no debe utilizarse como alojamiento gratuito para operar un negocio online, comercio electrónico o SaaS comercial. Esta configuración es una **demostración de diseño**, no una plataforma para reservas, cobros o atención de pacientes. Para una operación comercial real, revisar un alojamiento y plan adecuados. También hay límites de tamaño, ancho de banda y minutos de Actions según la cuenta; no se promete gratuidad ilimitada.

## Activarlo en GitHub

1. Subir los cambios nuevos a la rama `main`, revisando antes `git status` y lo que se incluirá en el commit. No subir `.env`, credenciales, `node_modules`, `.next` ni `out`.
2. En el repositorio: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Ir a **Actions → Mostrar landing en GitHub Pages → Run workflow**, elegir `main` y ejecutar. Los siguientes pushes a `main` también ejecutan el workflow.
4. Esperar a que los jobs **build** y **deploy** terminen correctamente.
5. Abrir la URL que muestra el despliegue o **Settings → Pages**. Compartir esa URL, no la del repositorio ni `localhost`.
6. Comprobar el sitio en incógnito y desde un teléfono. Si el repositorio es privado, revisar si el plan de GitHub permite Pages; no cambiar automáticamente su visibilidad sin revisar todo el contenido.

No hace falta pegar tokens, contraseñas ni claves de terceros. El workflow usa los permisos integrados de GitHub Actions. Para la prueba de diseño no hace falta comprar dominio; no se configuró uno.

Si el primer workflow falla indicando que Pages no está habilitado, completar el paso 2 y volver a ejecutarlo. Revisar también que Actions y el entorno `github-pages` estén permitidos por la organización/cuenta.

## Cómo está implementado sin crear otro proyecto

- `.github/workflows/pages.yml`: instala desde el lockfile, comprueba sólo la web, exporta y sube **únicamente `apps/web/out`**. No instala una base de datos ni despliega NestJS. Acciones fijadas por SHA, permisos de lectura en build y `pages:write`/`id-token:write` sólo en deploy; no se ejecuta publicación desde pull requests.
- `actions/configure-pages` obtiene el `base_path` real del sitio. Se pasa como `NEXT_PUBLIC_BASE_PATH` al build, evitando asumir el nombre del repositorio o romper imágenes/CSS/JS cuando el sitio vive en `/<repositorio>/`. También admite una raíz sin prefijo, como un sitio de usuario u origen configurado por Pages.
- `apps/web/next.config.mjs`: activa `output: 'export'`, imágenes locales sin servidor de optimización y una selección de rutas por `pageExtensions` **sólo cuando `GITHUB_PAGES=true`**. La configuración pública se inyecta al compilar; no son secretos.
- `page.github.tsx` reutiliza la portada existente. `layout.github.tsx` reutiliza estilos y metadatos, sin cargar el proveedor de reservas. Las rutas normales `.tsx` de la aplicación no se incluyen en esta exportación.
- `site-config.ts`: adapta recursos al `basePath` y convierte CTA de reserva a anclas en la muestra estática. El modo normal mantiene sus rutas originales.
- `scripts/build-pages.mjs`: ejecuta el build estático, comprueba que no se exportaron reservas/panel ni enlaces a esas rutas, y genera `.nojekyll` para usos de exportación manual.
- `out/` queda ignorado por Git y ESLint: es un artefacto generado, no código fuente.
- `layout.tsx` y el layout estático comparten `site-metadata.ts`. No se copian ni mantienen dos landings distintas.

La configuración de Vercel anterior en `apps/web/vercel.json` se conserva como opción no seleccionada. Se descartó la preparación multiservicio no confirmada: no hay `vercel.json` en la raíz ni cambios en el código de la API por esa propuesta. No se conectó ningún servicio cloud.

El workflow técnico de verificaciones ya existente puede seguir probando API y PostgreSQL en CI de forma aislada; eso no significa que Pages los publique. El workflow de Pages sólo ejecuta y publica la web estática.

## Verificar y exportar localmente

Con Node 24.22.0 y pnpm 10.34.7:

```sh
pnpm check
pnpm --filter @odontologia/web build:pages
```

La salida está en `apps/web/out`. Para verla, servirla mediante HTTP con un servidor de archivos estáticos; no abrir el HTML como `file://` ni ejecutar `next start` sobre el export. No se requiere API o DB. Para la app completa local, seguir usando `pnpm dev:web`.

Una comprobación con prefijo se puede preparar en PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH='/smilecorp-demo'
pnpm --filter @odontologia/web build:pages
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

Servir el directorio exportado bajo `/smilecorp-demo/`, no como raíz sin ese prefijo. En Git Bash/MSYS puede ser necesario `MSYS2_ENV_CONV_EXCL=NEXT_PUBLIC_BASE_PATH` para impedir que Windows transforme el prefijo URL en una ruta de disco. El workflow Linux no tiene esa conversión.

## Verificaciones y límites

- `pnpm check`: lint, tipos, **26 pruebas** (23 web, 3 API) y build normal; se conserva el funcionamiento de la app local existente. Recorrido completo de navegador del modo normal repetido correctamente.
- Sintaxis YAML del workflow y permisos de cada job comprobados localmente. No se ejecutó el workflow en GitHub.
- Exportaciones sin prefijo y con prefijo comprobadas. Exportación estática real con prefijo `/smilecorp-demo`: sólo `/`, 404 y favicon; sin `/reservar` ni panel dinámico.
- Navegador Chrome contra un servidor que sirve **sólo archivos**, no Next.js: 320, 390, 768 y 1440 px, sin desbordamiento horizontal, un h1, ocho imágenes cargadas, CSS/JS/favicons sin 404. Menú móvil, FAQ y CTA de evaluación por anclas comprobados; capturas revisadas.
- Mapa probado bajo acción explícita con proveedor interceptado localmente: inserción del iframe, dirección y retirada correctas. El render real y la precisión de Google Maps no se certifican.
- Sin llamadas a API, errores de hidratación ni solicitudes a proveedores antes de activar el mapa en la prueba. La prueba reproducible de navegador está en `scripts/check-pages-browser.mjs` y necesita servidor estático local en 3300 bajo `/smilecorp-demo/` y Chrome CDP en 9444; no instala librerías.
- El workflow remoto, permisos de GitHub, visibilidad y URL definitiva siguen pendientes de la ejecución desde tu cuenta. No se inventa una URL pública ni se garantiza el build Linux sin verlo.
- Los originales y permisos visuales están registrados en `docs/recursos-visuales.md`. No se cargan datos de pacientes en el flujo de reserva porque ese flujo no existe en la exportación.

## Fuentes revisadas

- Guías instaladas de Next.js 16.4.2: Static Exports, `pageExtensions` y `basePath`.
- Acciones oficiales y versiones consultadas: `actions/configure-pages` v5, `actions/upload-pages-artifact` v4 y `actions/deploy-pages` v4.
- Condiciones y límites de GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
