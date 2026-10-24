# Landing premium de salud bucal — prototipo

> Histórico: la landing actual es [SmileCorp / Dr. Nelson](smilecorp-landing.md), con dirección negro/blanco/marfil solicitada posteriormente. El contenido siguiente documenta Nítida Dental y no describe la portada vigente.

Rediseño del 17-10-2026, aplicando `.agents/skills/premium-web-design/SKILL.md`.

> Registro de la entrega visual anterior. La evolución actual incorpora [reserva ficticia, agenda y detalle de cita](prototipo-app.md): los CTA y la FAQ ahora enlazan el recorrido de demostración. Los límites sin cobros ni datos reales se mantienen. Las verificaciones y los archivos descritos abajo corresponden a aquella entrega, no al estado completo actual.

## Dirección y alcance

Nombre elegido por el usuario: **Nítida Dental** (antes Alba). Su disponibilidad legal, dominio y redes no se han comprobado. Paleta **azul, blanco y negro**, jerarquía editorial amplia, iconos propios y una pieza dental cerámica en 3D. La experiencia prioriza preguntas, ansiedad dental e información antes de decidir; no se inventan especialidades ni se presupone que toda atención es estética.

Secciones: presentación, videos de sonrisas cotidianas, enfoque, dudas previas a la evaluación, recorrido propuesto, espacio informativo del profesional, preguntas frecuentes y contacto de demostración. Los CTA conducen a secciones reales; menú y preguntas usan HTML `details`.

No hay reservas, pagos, formularios, WhatsApp inventado, diagnósticos, testimonios, precios ni políticas definitivas. El nombre Nítida Dental fue elegido por el usuario; los textos y el recorrido siguen sujetos a aprobación clínica/comercial. El retrato y las credenciales del profesional siguen pendientes. Metadatos `noindex, nofollow` conservados; no sustituyen protección de acceso si se publica.

## Decisiones técnicas

| Recurso | Aporte y límites |
|---|---|
| Three.js 0.186.1 directo | Pieza de identidad dental con materiales cerámicos, iluminación y movimiento sutil. No es anatomía validada ni una simulación de tratamiento. No se añadió un framework 3D para una sola escena. |
| Importación dinámica desde `useEffect` | Aísla WebGL del SSR y separa su carga del texto y CTA. El 3D se inicia cerca del viewport, sólo si no se solicita movimiento reducido. |
| SVG inicial | Alternativa simple que mantiene la composición sin JS/WebGL, durante la carga, ante pérdida de contexto o con movimiento reducido. La ausencia de 3D no bloquea contenido o navegación. |
| Escena procedural | Sin modelos, HDRI, texturas o servicios remotos. Entorno `RoomEnvironment` de Three.js, geometría e iconos propios. |
| Gestión de recursos | ResizeObserver, pausa fuera de pantalla/pestaña oculta, pixel ratio máximo 1.5 en móvil y 2 en escritorio, liberación de geometrías/materiales/entorno/renderer y listeners al desmontar. |
| Fotografía local | Imagen de dominio público con procedencia y modificaciones en [recursos-visuales.md](recursos-visuales.md). Optimizada a WebP, 38.620 bytes; `next/image` con carga diferida y tamaños responsivos. |
| Fuentes de sistema | Sin peticiones remotas ni archivos tipográficos adicionales. |

Costo observado de la pieza: el mayor chunk JS generado fue aproximadamente 559 KiB sin comprimir / 139 KiB gzip (tamaño calculado localmente, no una medición de transferencia real). La alternativa simple es usar únicamente el SVG. Se conserva Three.js por la dirección visual solicitada, pero el rendimiento final debe medirse en dispositivos reales antes de publicar. No se garantizaron objetivos Core Web Vitals ni se añadió tecnología experimental.

## Ver la página

Con Node 24.22.0 y pnpm 10.34.7 activos:

```sh
pnpm install --frozen-lockfile
pnpm dev:web
```

Abrir <http://127.0.0.1:3000>. No necesita API ni PostgreSQL.

Si la previsualización compilada está ocupando 3000, detener su proceso antes de iniciar desarrollo. `dev:web` recarga al editar; un servidor `start` requiere build y reinicio para reflejar cambios. No finalizar indiscriminadamente todos los procesos Node del equipo.

## Verificaciones realizadas

- Node **24.22.0**, pnpm **10.34.7**.
- `pnpm check` tras el cambio de nombre y los videos: lint, tipos, seis pruebas (tres web y tres API), build web/API correctos.
- Instalación posterior con `--frozen-lockfile`: correcta.
- HTTP 200 de la web compilada en loopback bajo el Node fijado.
- Chrome 155 headless con WebGL por software habilitado: **1440×1000, 768×1024, 390×844 y 320×740**, sin desbordamiento horizontal en esos tamaños; escena renderizada y una sola instancia de canvas en cada uno.
- Capturas completas revisadas de escritorio y móvil. Se corrigió un desbordamiento de tablet detectado durante la revisión, antes del cierre.
- Menú móvil y pregunta frecuente: apertura comprobada. Anclas y avisos del prototipo también cubiertos por pruebas de render.
- Movimiento reducido: SVG visible, cero canvas tanto al cambiar la preferencia como al cargar con ella activa. Al quitar la preferencia se comprobó la vuelta a la escena.
- Evento de pérdida de contexto WebGL simulado: escena retirada y fallback visible. WebGL no disponible simulado anulando la creación de contextos: fallback visible sin bloquear la página.
- Sin errores de consola/runtime durante las pruebas normales. El caso simulado sin WebGL produjo únicamente el error de inicialización esperado de Three.js.
- Contraste calculado de pares principales: negro/blanco **19.57:1**, texto secundario/blanco **6.31:1**, texto secundario/superficie **5.83:1**, blanco/azul **5.20:1**, texto secundario claro/fondo negro **11.49:1**, blanco/azul oscuro **8.16:1**. No equivale a una auditoría integral de todos los estados, overlays o textos sobre imagen.

Incluye salto al contenido, foco visible, semántica y preferencia de movimiento reducido. No se afirma certificación de accesibilidad: faltan pruebas integrales con lector de pantalla, zoom de texto, Safari, dispositivos físicos y medición de rendimiento. Las comprobaciones de navegador se ejecutaron mediante Chrome DevTools Protocol con un script temporal, sin añadir dependencias de automatización al proyecto.

## Videos de sonrisas — incorporación posterior

Dos clips de adultos sonriendo, con licencia gratuita Mixkit verificada en sus fichas (no dominio público). Créditos, fuentes, modificaciones y límites de revisión legal en [recursos-visuales.md](recursos-visuales.md). Los videos no representan pacientes, avales ni resultados clínicos y se identifican como referencias junto a los reproductores.

Componente `apps/web/app/components/smile-video.tsx`: poster local, sin `src` de MP4 hasta pulsar reproducir, sin autoplay/bucle, sin audio, controles nativos al iniciar, pausa al salir de pantalla u ocultar pestaña y un solo video activo a la vez. Errores con aviso y botón de reintento. Cada clip tiene descripción textual; no contiene diálogo ni información sonora.

Comprobaciones adicionales en Chrome headless mediante script temporal CDP:

- Nombre Nítida Dental en título de pestaña y contenido, sin referencias a Alba en la interfaz.
- Cero solicitudes MP4 y cero videos con `src` antes de la primera acción, incluso al desplazar hasta la sección.
- Reproducción real del primer clip tras pulsar, controles visibles y estado silenciado; reproducción del segundo pausa el primero.
- Al desplazar fuera de la sección, ambos quedan pausados.
- 1440 px y revisión posterior en 768, 390 y 320 px sin desbordamiento horizontal; capturas revisadas de escritorio y móvil. Pruebas de videos ejecutadas con movimiento reducido activo, sin autoplay ni animación de fondo.
- Fallo de red del MP4 simulado mediante interceptación: aviso y botón de reintento visibles; al restaurar la red se reproduce correctamente.
- Sin excepciones de runtime no capturadas; todas las solicitudes de medios fueron locales.

No se efectuó despliegue, revisión legal integral, pruebas en Safari/iOS físico o medición de mejora de conversión. La política de uso aceptable de Envato enlazada por los términos no pudo leerse por control automático; antes de publicar revisar su aplicación y permisos de imagen al contexto publicitario sanitario. No se afirma autorización ilimitada para campañas médicas.

## Archivos y pendientes

Cambios: `apps/web/app/page.tsx`, `globals.css`, metadatos en `layout.tsx`, componentes `dental-visual.tsx`, `dental-scene.ts` y `smile-video.tsx`, fotografía y videos locales con posters, pruebas web, manifiesto/lockfile y documentación. No se modificó API, DB, `spec.md` ni `arquitectura.md`; sus hashes originales permanecen iguales.

Confirmar con el cliente identidad, tratamiento protagonista, contenido clínico autorizado, profesional/credenciales/retrato, ubicación, horarios y contacto. Evaluar usabilidad con personas representativas cuando se autorice; no se hicieron entrevistas ni se inventaron métricas de mejora. No se publicó ni desplegó.
