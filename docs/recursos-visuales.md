# Recursos visuales de la landing

## Estado actual — SmileCorp / Dr. Nelson

La portada usa una selección de `imagenes/`: logo, retrato del doctor, retrato de una sonrisa, composición de trabajo y el par antes/después 2.2. El usuario confirmó expresamente que todas las imágenes de esa carpeta están autorizadas para su uso web. No se incorporaron recursos externos nuevos. No utiliza las fotografías, videos de banco ni el 3D descritos más abajo; se conservan como recursos del prototipo histórico, sin atribuirlos a SmileCorp.

### Recursos proporcionados por el usuario

| Fuente local | Derivado usado | Resolución / tamaño | Transformación y uso |
|---|---|---|---|
| `imagenes/logo dr nelson.png` | `apps/web/public/images/smilecorp/logo-dr-nelson.webp` | 82×110 / 2.206 bytes | WebP sin pérdida, sin recorte ni recolor. Encabezado, pie y bloque de diseño de sonrisa. |
| `imagenes/Retrato profesional en clínica dental moderna.png` | `apps/web/public/images/smilecorp/dr-nelson-profesional.webp` | 768×1152 / 66.294 bytes | Fuente 1024×1536, reducción proporcional y WebP calidad 88. Sin recorte, retoque facial ni cambios de color. Presentación del profesional, ancho máximo de 320 CSS px. Sustituye el retrato pequeño anterior, a petición expresa del usuario. |
| `imagenes/logo dr nelson.png` | `apps/web/app/icon.png` | 64×64 / 2.051 bytes | Reducción proporcional y relleno negro, sin deformar el logo. Sustituye al favicon tipográfico provisional. |

Fuentes adicionales y derivados (todos en `apps/web/public/images/smilecorp/`):

| Fuente en `imagenes/` | Derivado | Dimensiones / tamaño | Uso |
|---|---|---|---|
| `antes 2.2 .png` | `caso-2-2-antes.webp` | 743×369 / 241.976 bytes | Antes, par expresamente elegido por el usuario. |
| `despues 2.2.png` | `caso-2-2-despues.webp` | 836×314 / 220.972 bytes | Después, mismo par elegido. |
| `Captura de pantalla 2026-10-24 092423.png` | `sonrisa-smilecorp.webp` | 614×832 / 338.054 bytes | Hero: retrato proporcionado, sin controles sociales visibles; no se atribuyen tratamientos ni testimonios. |
| `Captura de pantalla 2026-10-24 092209.png` | `trabajo-smilecorp.webp` | 883×500 / 334.564 bytes | Composición proporcionada de sonrisa y detalles. Se conserva completa; no se presenta como foto original sin edición previa. |

Estos cuatro derivados se convirtieron a **WebP sin pérdida**, sin redimensionar, recortar, cambiar color ni retocar dientes o piel. Se compararon los buffers RGBA decodificados contra sus respectivos PNG: píxeles idénticos. `next/image` usa `unoptimized` para conservar el WebP sin una segunda compresión con pérdida; dimensiones intrínsecas y carga diferida salvo el hero. Costo total de los cuatro recursos: 1.135.566 bytes; sólo el hero usa carga `eager`; el resto usa carga `lazy` nativa, cuya anticipación depende del navegador. No se promete una medición de Core Web Vitals.

Procedencia: archivos aportados para esta implementación por el usuario, quien identifica al Dr. Nelson y confirmó autorización para **todas** las imágenes tras la consulta expresa sobre permisos de pacientes y uso web. Ésa es la fuente de autorización registrada; no se inspeccionaron documentos ni se hizo revisión legal externa. No hay ficha pública, autor o licencia de stock aportados; no se presume dominio público ni se inventa atribución. El responsable debe conservar la documentación de permisos correspondiente. Los originales permanecen intactos. Conversiones con Sharp ya incluido transitivamente en Next.js, sin instalar dependencias. No se solicitan recursos de redes sociales.

El nuevo retrato tiene resolución suficiente para el bloque de presentación; el archivo fuente se conserva intacto. No se verificó si representa instalaciones reales, por lo que no se describe como fotografía del consultorio de SmileCorp ni prueba de su equipamiento. Se retiró de `public/` únicamente el derivado pequeño anterior (`dr-nelson.webp`); su fuente sigue en `imagenes/`. El logo sigue siendo pequeño: para impresión y pantallas de alta densidad conviene obtener SVG o PNG mayor. El texto alternativo del retrato informa sin inventar credenciales; el logo es decorativo donde el enlace ya identifica al profesional.

### Criterio de selección y límites

El par 2.2 reemplaza el espacio provisional. Los rótulos Antes/Después quedan fuera de la imagen, sin tapar resultados. `object-fit: contain` conserva ambas vistas completas en marcos de igual altura; no se fuerza alineación ni se estiran imágenes de proporciones distintas. En móvil se apilan para mantenerlas legibles. No se publica una leyenda que afirme resina, cerámica, duración o un procedimiento concreto sin validación clínica; se conserva el aviso de resultados individuales.

No se seleccionaron `antes 1.1 .png` y `despues 1.1 .png` por contenido clínico invasivo y texto superpuesto. De las siete capturas se usaron sólo las dos sin controles sociales visibles indicadas en la tabla. Las otras cinco, con composiciones repetidas, textos o controles de carrusel, permanecen fuera de `public/`. Tener autorización no obliga a mostrar todo ni convierte una captura en un original de alta calidad. No se asignan nombres, historias, reseñas ni materiales clínicos a las personas retratadas.

Antes de un lanzamiento real, conviene reemplazar las dos capturas seleccionadas por sus archivos fuente de mayor calidad y validar cualquier futura descripción clínica con el profesional. El sitio sigue siendo local y no se ha desplegado.

Iconos de interfaz y arco decorativo: CSS/SVG propios. Georgia/Times New Roman y Segoe UI/Arial son fuentes del sistema; sin descarga o distribución de archivos tipográficos. Estado y verificaciones: [smilecorp-landing.md](smilecorp-landing.md).

## Registro histórico — Nítida Dental

Consulta y descarga: **17-10-2026**. Los recursos se sirven localmente; la página no hace solicitudes a bancos de imágenes.

## Fotografía incorporada

- Archivo: `apps/web/public/images/dental-chair-public-domain.webp`.
- Original: **Dental Chair UMSOD.jpg**.
- Autor: **AndrewHorne**, usuario de English Wikipedia.
- Ficha original verificada: https://commons.wikimedia.org/wiki/File:Dental_Chair_UMSOD.jpg
- Original descargado: https://upload.wikimedia.org/wikipedia/commons/d/d9/Dental_Chair_UMSOD.jpg
- Régimen: **dominio público por declaración del autor (PD-user)**. La ficha indica liberación mundial y, donde no sea legalmente posible, permiso de uso para cualquier propósito sin condiciones salvo las exigidas por ley. No confundir esta declaración con CC0 ni con una licencia comercial de stock.
- Referencia de la plantilla/declaración: https://commons.wikimedia.org/wiki/Template:PD-user
- Evidencia consultada: sección de licencia de la ficha original, con declaración que identifica a AndrewHorne como autor que libera la obra al dominio público.
- Atribución: no exigida por la declaración; se conserva voluntariamente `AndrewHorne / Wikimedia Commons · Dominio público` en el pie visible.
- Modificaciones: recorte del original 1024×768 a 650×758 desde x=360, y=0; escala de grises y conversión WebP, calidad 84. Archivo final: 38.620 bytes.
- Uso: referencia editorial de un entorno odontológico. No representa el consultorio del proyecto Nítida Dental, su equipamiento ni un aval de la institución de origen. Esta limitación figura junto a la imagen.
- No se presentan personas identificables como pacientes o profesionales del proyecto. No se incorporan testimonios, casos clínicos ni imágenes antes/después.

## Videos de sonrisas incorporados

Consultados el **17-10-2026**. Son recursos gratuitos con copyright y **Mixkit Stock Video Free License**, no dominio público ni CC0. Las fichas de ambos enlazan expresamente a `videoFree`, no a la licencia restringida.

| Archivo local | Original / autor | Fuente |
|---|---|---|
| `apps/web/public/videos/sonrisa-hombre.mp4` y poster `images/sonrisa-hombre.webp` | Portrait of a smiling man, ID 4535 · **alona2018** | https://mixkit.co/free-stock-video/portrait-of-a-smiling-man-4535/ |
| `apps/web/public/videos/sonrisa-mujer.mp4` y poster `images/sonrisa-mujer.webp` | Portrait of a happy smiling woman, ID 4859 · **stockyana** | https://mixkit.co/free-stock-video/portrait-of-a-happy-smiling-woman-4859/ |

- Licencia consultada: https://mixkit.co/license/#videoFree ; texto del modal público: https://mixkit.co/license/modal/videoFree/ . Permite descargar, copiar, modificar y usar los clips en proyectos comerciales y no comerciales, sin atribución obligatoria, sujeta a los términos.
- Términos consultados: https://mixkit.co/terms/ . No se adquiere propiedad sobre los clips; no se permite revender/distribuir como biblioteca de stock ni ignorar posibles derechos de terceros. Se conservan créditos voluntarios en la página.
- Fuentes de descarga ofrecidas en sus fichas: https://assets.mixkit.co/videos/4535/4535-720.mp4 y https://assets.mixkit.co/videos/4859/4859-720.mp4 . Se descargaron sólo esos dos clips, sin scraping masivo ni elusión de accesos.
- Transformación: originales 1280×720 a H.264 MP4 960×540, 24 fps, CRF 25, `yuv420p`, `faststart`, sin audio. Posters WebP extraídos a los 2 s y 3 s respectivamente, sin retoque dental o alteración de las personas.
- Archivos finales: hombre **167.984 bytes / 6 s**; mujer **389.452 bytes / 10,08 s**. Ambos carecen de pista de audio, comprobado con ffprobe. No hay diálogo o información sonora que transcribir; la descripción textual acompaña a cada clip.
- Uso: sección editorial de sonrisas cotidianas. Se indica antes de los clips que las personas no son pacientes de Nítida Dental, no avalan la marca ni representan resultados de tratamientos. No se les atribuyen condiciones médicas ni historias personales.
- La licencia de stock no demuestra por sí sola permisos individuales para cualquier campaña sanitaria. No se verificaron contratos/model releases individuales. La política de uso aceptable enlazada por los términos devolvió una verificación automática al consultarla; no se eludió. **Antes de publicar o utilizar estos recursos en publicidad sanitaria, revisar con el responsable los derechos de imagen y el contexto específico; no se afirma un permiso médico/publicitario ilimitado.** El uso implementado es un prototipo local, no una campaña publicada.
- Los MP4 se sirven localmente y no tienen `src` hasta pulsar reproducir; no se abren iframes, tracking o reproductores de Mixkit. Sin autoplay, bucle ni sonido. Se pausa al salir del viewport, ocultar la pestaña o reproducir el otro clip; no se reanuda automáticamente.

## Recursos propios

- Pieza dental 3D: geometría procedural creada en `apps/web/app/components/dental-scene.ts`. Escultura estilizada, no modelo anatómico ni simulación clínica.
- Fallback SVG: creado en `apps/web/app/components/dental-visual.tsx`.
- Iconos, logotipo tipográfico y formas: SVG/CSS propios del prototipo. Nítida Dental es el nombre elegido por el usuario; no se ha comprobado su disponibilidad legal como marca, dominio o redes sociales.
- Entorno de iluminación: `RoomEnvironment` incluido en Three.js; sin HDRI o texturas descargadas.
- Fuentes: pila de sistema `Segoe UI, Arial, sans-serif`; no se distribuyen archivos tipográficos ni se solicitan fuentes externas.

## Dependencias visuales

- `three` **0.186.1**, licencia MIT. Fuente: https://github.com/mrdoob/three.js/tree/r186 ; licencia distribuida en el paquete.
- `@types/three` **0.186.0**, desarrollo, licencia MIT. No se incorporó React Three Fiber, Drei, GSAP ni una biblioteca de componentes.

## Recursos investigados pero no incorporados

- Unsplash/Pexels devolvieron páginas de verificación automática al consultar las páginas de licencia/fotografía. No se eludió el control ni se incorporaron archivos sin verificación.
- La imagen CC0 `20180101-123256-dental-clinic-ramat-gan-israel-2018.jpg` de Rakoon fue consultada y descartada por composición y presencia de una obra decorativa en el fondo. No se incluye en los assets finales.
- Otros resultados de Wikimedia con licencias CC BY/CC BY-SA tampoco se incluyen. Ser gratuitos no los convierte en dominio público.
