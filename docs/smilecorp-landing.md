# SmileCorp / Dr. Nelson — evolución de la landing existente

> Publicación elegida posteriormente: [GitHub Pages, sólo muestra estática](github-pages.md). Conserva el diseño, fotos y contacto, pero no publica reserva ni panel; los CTA de evaluación llevan a anclas informativas. El recorrido completo descrito abajo sigue disponible en el modo Next.js local normal.

## Revisión y alcance

Se leyeron `spec.md`, `arquitectura.md`, README, `docs/SRS.md`, instrucciones de `apps/web/AGENTS.md`, implementación, pruebas y documentación visual. Se consultaron las guías locales de la versión instalada de Next.js sobre páginas, `searchParams` asíncronos y límites cliente.

Se mantiene el monorepo, Next.js/React/TypeScript, CSS, pnpm y las rutas `/`, `/reservar`, `/app/hoy`, `/app/agenda` y `/app/citas/[id]`. API, PostgreSQL, migraciones, manifiestos y lockfile no se modificaron. No se instalaron dependencias, pasarelas de pago, tracking ni fuentes remotas. Los únicos contactos externos son enlaces configurados por el usuario y un mapa opcional bajo acción explícita. No se publicó ni desplegó.

La nueva identidad y catálogo proceden del encargo del usuario: SmileCorp / Dr. Nelson, estética dental, carillas de resina/cerámica, implantes y prótesis. No se realizó verificación externa de credenciales. Sustituye la dirección Nítida Dental azul/blanco/negro de la skill y del prototipo histórico por la nueva dirección solicitada: negro, blanco, marfil y acento beige/dorado discreto.

Dentsmile se toma únicamente como referencia estructural descrita en el encargo (reserva visible, tratamientos, clínica y contacto). No se proporcionó una URL ni se afirma haber inspeccionado su web. No se copiaron textos, identidad ni recursos.

## Diseño y embudo implementados

- Hero editorial y dos vías claras: evaluación y consulta. Tipografía serif de sistema con sans legible, sin archivos adicionales.
- Navegación a casos, tratamientos, proceso y FAQ. Menú móvil con cierre al elegir destino y Escape; controles de al menos 44 px.
- Reserva visible en hero, encabezado de escritorio, cierre y barra inferior móvil con espacio reservado; foco con margen de desplazamiento. La barra pasa a flujo normal en pantallas de poca altura.
- Diseño de sonrisa como entrada principal; tarjetas de resina y cerámica; accesos secundarios a implantes y prótesis.
- Todos los accesos reutilizan `/reservar?interes=...`. El parámetro se valida en servidor; desconocidos, arrays o valores repetidos se normalizan a “Quiero orientación”.
- Selector de interés en la reserva, resumen y resultado. El interés permanece en memoria y aparece en el detalle administrativo. Todos los intereses corresponden a una evaluación ficticia con el mismo calendario; no implican reservar un procedimiento.
- Calendario, ocupación, vencimientos, estados, historial y simulador técnico existentes conservados. Modalidad inicial **sin pago, sólo demostración**.
- Monto y políticas del abono comercial se muestran como **pendientes**. `depositConfiguration` centraliza campos vacíos en `app/site-config.ts`; no habilita pagos. El importe ficticio preexistente de `demoRules.simulatedAmount` sigue limitado al simulador técnico rotulado como tal: no es precio, promoción ni abono de SmileCorp.
- No hay pacientes, horarios comerciales reales, envío de confirmaciones ni cobros. Personas ficticias predefinidas en vez de campos que recojan datos reales. Se explica que para operación se debe validar nombre y un canal de contacto, junto con privacidad.
- Proceso en tres etapas con indicación clínica sujeta a evaluación. Presentación del Dr. Nelson sólo con los datos suministrados, sin títulos o cifras inventadas.
- Contactos proporcionados por el usuario en `site-config.ts`: Instagram `https://www.instagram.com/dr.nelson___/`, WhatsApp `+56 9 3317 0550` (`https://wa.me/56933170550`) y dirección `La Concepción 81, Providencia, Región Metropolitana`. WhatsApp activo en hero, contacto y lateral de la reserva; no envía mensajes automáticamente. Instagram en contacto y pie, abre nueva pestaña con `noopener noreferrer` y nombre accesible; sin publicaciones incrustadas ni SDK social.
- Mapa pequeño de 240 px de alto en contacto: `components/location-map.tsx`. Inicialmente muestra dirección, botón “Ver mapa”, aviso de conexión a Google Maps y enlace “Cómo llegar”. Sólo inserta el iframe después de pulsar el botón; “Ocultar mapa” lo retira. Sin claves, coordenadas inventadas, geolocalización ni solicitudes al proveedor antes de la activación. Consulta la dirección textual, no una coordenada verificada. El proveedor recibe la dirección pública y datos técnicos de conexión al cargar, no datos de reserva. La vista real y precisión del mapa deben revisarse con el responsable antes de publicar.
- Promoción no definida: `siteConfig.promotion` permanece nula y no se publica una campaña. Sin contadores ni urgencia artificial.
- `noindex, nofollow` conservado. No sustituye autenticación si se expusiera el prototipo.

## Material visual revisado y pendiente

En la primera revisión sólo había recursos de banco del prototipo anterior. Posteriormente el usuario añadió `imagenes/`: logo, retrato identificado como Dr. Nelson, dos pares antes/después y siete capturas/composiciones sociales. Se revisaron los trece archivos.

Se integró el logo proporcionado en encabezado, pie, bloque de diseño de sonrisa y favicon; el retrato está en la presentación profesional y una imagen autorizada de sonrisa ocupa el hero. Derivados locales WebP: logo 82×110, 2.206 bytes; retrato actualizado desde `Retrato profesional en clínica dental moderna.png` (fuente 1024×1536), reducido proporcionalmente a 768×1152, calidad 88, 66.294 bytes. Sustituye al retrato pequeño anterior; ancho de presentación máximo de 320 px y proporciones completas, sin recortes ni retoques. Los archivos fuente permanecen intactos. El favicon usa una reducción proporcional del logo con relleno negro, no el monograma inventado anterior. Se usó Sharp ya presente en Next.js, sin instalar dependencias.

La nueva imagen del doctor tiene resolución adecuada para su presentación. El logo sigue siendo pequeño y conviene obtener una versión vectorial o PNG mayor. No se generó contenido con IA ni se verificó si el entorno del nuevo retrato corresponde a instalaciones reales; el texto alternativo evita esa atribución. El usuario confirmó expresamente autorización para todas las imágenes de `imagenes/`, incluyendo la consulta previa sobre permisos de pacientes. Se registra esa declaración, sin afirmar una revisión documental o legal independiente.

Tras la confirmación del usuario se integró el par solicitado `antes 2.2 .png` / `despues 2.2.png` en Antes/Después. Se muestran las imágenes completas, sin recorte ni deformación, una junto a otra en escritorio y apiladas en móvil. No se usa un deslizador que sugiera una alineación inexistente entre fotos de encuadres diferentes. Se mantiene el aviso de resultados individuales y no se atribuye un tratamiento o material concreto.

También se seleccionaron el retrato de sonrisa `092423` para el hero y la composición de trabajo `092209` para un bloque editorial bajo la comparación. No tienen controles de Instagram visibles; se describen como imágenes/composición proporcionadas por SmileCorp, no como originales de cámara verificados. Se descartaron las otras cinco capturas y el par 1.1 por repetición, controles, texto superpuesto o contenido clínico invasivo.

Los cuatro recursos adicionales se convierten a WebP sin pérdida y se sirven sin recompresión con pérdida mediante `next/image unoptimized`. Se verificó igualdad de píxeles RGBA frente a cada PNG. Sin retoques, IA, cambios de color ni ampliación de los archivos. Los PNG originales no se modificaron. Total de estos cuatro recursos: 1.135.566 bytes; carga diferida salvo el hero. El beneficio de conservar detalle clínico se prioriza sobre una compresión con pérdida; rendimiento de campo pendiente.

Los componentes `dental-visual`, `dental-scene` y `smile-video`, y sus assets anteriores, se conservan sin cargarlos. No hay WebGL ni medios de stock en esta portada.

Para sustituir espacios provisionales, solicitar al responsable contenido apto para publicación por un canal privado autorizado, no datos clínicos en el repositorio de desarrollo:

1. Identidad: logo SVG o PNG mayor (el recibido mide 82×110). El retrato del doctor ya fue actualizado con la nueva imagen de mayor resolución. Si se desea video, original y poster; sin autoplay.
2. Casos: conservar documentación de permisos confirmados por el usuario; reemplazar capturas por archivos fuente de mayor calidad cuando estén disponibles. Cualquier futura leyenda sobre procedimientos/materiales debe validarla el profesional; no se presume esa validación a partir de la foto.
3. Completar nombre del doctor, formación/credenciales verificables y texto de presentación aprobado. No se atribuyen títulos no recibidos.
4. Fotografías originales autorizadas del consultorio si se desea mostrar instalaciones.
5. Testimonios: sólo textos reales y permisos de uso antes de añadirlos; no se han publicado reseñas de muestra.

Registro de recursos anteriores y propios: `docs/recursos-visuales.md`.

## Decisiones comerciales y operativas pendientes

- Instagram, WhatsApp y dirección ya proporcionados. Falta confirmar horarios de atención y responsable del canal, y revisar la precisión de la ubicación en Google Maps. Los campos públicos están en `app/site-config.ts`; nunca colocar secretos allí.
- Servicio de evaluación, duración, zona horaria, agenda real, disponibilidad y forma de aprobación. Santiago, 45 minutos y ventanas actuales siguen siendo hipótesis de la demo, no datos de SmileCorp.
- **Abono:** concepto exacto (evaluación/reserva/anticipo), monto, moneda, si se descuenta del tratamiento, retención de horario y responsable del cobro. No se asumen porcentajes.
- Cambios, cancelación, inasistencia, cancelación del profesional y reglas de devolución, sujetas a aprobación y revisión correspondiente. No se presenta “sin reembolso” ni cargos inventados.
- Datos mínimos de contacto, privacidad y consentimientos; marketing separado de gestión de cita. No se activó almacenamiento de datos reales.
- Catálogo/textos clínicos definitivos, promoción si existe y permisos visuales.
- Operación real requiere autenticación, backend de agenda, control de concurrencia y eventual pasarela con confirmación verificada por servidor; no basta el estado del navegador. No hay checkout real conectado.

## Archivos

- `apps/web/app/page.tsx`: composición y contenido sobre la misma ruta.
- `apps/web/app/landing.css`: estilos aislados, responsive, sin reemplazar los estilos/componentes históricos.
- `apps/web/app/site-config.ts`: identidad y contactos públicos proporcionados, enlaces de ubicación, intereses y abono pendiente.
- `apps/web/app/components/location-map.tsx`: activación explícita y retirada del iframe externo, sin carga automática.
- `apps/web/app/components/site-navigation.tsx`: menú móvil accesible.
- `apps/web/app/layout.tsx`, `icon.png`: metadatos, estilos y favicon derivado del logo recibido; se retiró el `icon.svg` provisional.
- `apps/web/public/images/smilecorp/`: seis derivados del material proporcionado —logo, doctor, sonrisa del hero, composición de trabajo y par 2.2—; originales en `imagenes/` sin cambios.
- `apps/web/app/reservar/page.tsx`: validación del interés por URL.
- `apps/web/app/demo/{booking-flow.tsx,model.ts,demo-provider.tsx,appointment-detail.tsx,demo-shell.tsx,demo.css}`: reutilización del recorrido, interés persistido en memoria, nombre y continuidad visual, sin pago por defecto.
- `apps/web/test/{home.test.tsx,demo.test.tsx}` y `apps/web/scripts/check-demo-browser.mjs`: regresiones y comprobación real de navegador.
- README y documentación de landing/recursos: estado vigente e histórico diferenciados.

## Verificación

- `pnpm check` con Node **24.22.0**, pnpm **10.34.7**: lint, tipos, **23 pruebas** (20 web, 3 API) y build web/API correctos. No se reinstalaron dependencias del proyecto.
- `pnpm --filter @odontologia/web test:browser` con web compilada en loopback 3100 y Chrome headless con CDP 9444: landing en **320, 390, 768 y 1440 px**, sin scroll horizontal, un h1; menú móvil, anclas, Escape, FAQ, enlaces de contacto configurados y mapa inicialmente sin iframe comprobados. Capturas completas revisadas de 390 y 1440 px.
- En navegador: transferencia de interés desde carillas de cerámica y resina; persistencia de interés al detalle, reserva móvil, estados rechazado/pendiente/aprobado/vencido simulados, modo sin pago, cambio, cancelación, tarea y recuperación al recargar.
- Reserva/agenda/hoy/detalle en los cuatro anchos sin scroll horizontal; foco de teclado y etiquetas de campos comprobados. Sin excepciones, errores de consola ni solicitudes HTTP externas durante el recorrido.
- Pruebas repetidas tras la selección autorizada: ocho instancias de imagen desde seis fuentes seleccionadas, carga correcta y dimensiones originales del par 2.2. `object-fit: contain` comprobado en ambas vistas, sin cortes; ancho del retrato del doctor ≤320 px. `pnpm check` y recorrido completo de navegador nuevamente correctos. Comparación de píxeles fuente/derivado de los cuatro recursos nuevos correcta.
- Contactos y mapa: enlaces exactos de Instagram/WhatsApp comprobados, dirección visible y cero iframe/solicitudes de mapas al inicio. Tras pulsar “Ver mapa” se comprueban URL, dirección consultada, título accesible y ancho responsive; “Ocultar mapa” retira el iframe. El proveedor fue interceptado con CDP y una respuesta local: se verificó el flujo de activación, no el renderizado real ni la precisión de Google Maps. El resto del recorrido no produjo solicitudes externas.
- Movimiento reducido activo en las pruebas; portada estática sin canvas. Contenido, CTA y preguntas presentes sin JavaScript; la reserva interactiva requiere JavaScript.
- Texto ampliado al doble mediante estilos de prueba en los elementos de texto principales a 390 px sin desbordamiento horizontal. No equivale a verificar todas las combinaciones de zoom o preferencias del navegador.
- Contrastes calculados: tinta/blanco **17.07:1**, texto secundario/blanco **6.29:1**, secundario/marfil **5.68:1**, acento/blanco **5.10:1**, acento/marfil **4.61:1**, texto claro/fondo oscuro **10.17:1**, acento claro/fondo oscuro **8.05:1**. No es auditoría completa de accesibilidad.

Pendiente: lector de pantalla, Safari/iOS y teléfonos físicos, auditoría completa de accesibilidad y medición de rendimiento/Core Web Vitals. No se afirman mejoras de conversión ni métricas de campo.

## Ver localmente

Con las versiones fijadas y dependencias existentes:

```sh
pnpm dev:web
```

Abrir <http://127.0.0.1:3000>. No necesita API/DB. Tras la integración de imágenes se levantó el servidor de desarrollo en 3000 (no estaba respondiendo); página, logo, retrato y favicon devuelven HTTP 200. Los procesos exclusivos de pruebas 3100/Chrome CDP se detuvieron. Si ya está abierto el navegador, refrescar.

Prueba de navegador reproducible (sin instalar librerías): web compilada con `pnpm --filter @odontologia/web exec next start --hostname 127.0.0.1 --port 3100`, Chrome con `--headless=new --remote-debugging-port=9444 --user-data-dir=<carpeta-temporal-exclusiva>`, luego `pnpm --filter @odontologia/web test:browser`. Usar sólo procesos/perfiles locales de pruebas, no la sesión personal del navegador.
