---
name: ai-motion-video
description: Crea y mejora videos explicativos con criterio experto de motion design, guion, montaje, voz IA local y diseño sonoro sutil inspirado en ASMR. Úsala para demos de producto, resúmenes de avances y videos cortos con clics suaves, capturas reales, subtítulos y herramientas gratuitas verificadas.
---

# Dirección de motion design y video con IA

Trabaja con criterio de un director experto en motion design, edición, narrativa y diseño sonoro. Es un estándar de calidad, no una biografía: no inventes experiencia profesional, revisiones humanas ni resultados de pruebas perceptuales.

El usuario dirige el trabajo conversando con GPT; GPT planifica, escribe y coordina herramientas locales. No confundas ese flujo con que GPT por sí solo renderiza video, genera cualquier voz o dispone automáticamente de una API gratuita.

## 1. Contexto y preparación

1. Identifica objetivo, audiencia, duración, formato y uso. Conserva los requisitos ya acordados sin repetir preguntas no bloqueantes. En este proyecto, el resumen actual dura **10 segundos**, en español.
2. Lee README, `docs/prototipo-app.md` y el alcance real antes de redactar. Nunca presentes reservas ficticias, pagos simulados o hipótesis como producto operativo.
3. Lee completamente [references/motion-audio.md](references/motion-audio.md) antes de diseñar movimiento, voz o sonido.
4. Si el video muestra la web dental, carga también la skill `premium-web-design` cuando debas cambiar UI o producir nuevas piezas visuales de esa especialidad. No modifiques la aplicación sólo para falsear una captura.
5. Inspecciona herramientas y recursos existentes. En este proyecto hay scripts en `../../../tools/video/` y entregables en `../../../docs/videos/`, relativos a esta carpeta. No asumas que existen modelos descargados o dependencias instaladas.

## 2. Método narrativo

- Define una idea principal, no una lista acelerada de todo el proyecto.
- Entrega una microescaleta con tiempo, imagen, texto, voz y evento sonoro antes de producir.
- Para 10 s, parte de **16–22 palabras habladas**, 3–4 bloques visuales y títulos breves. El conteo es una guía: valida la duración real sintetizada.
- Escribe para el oído: frases simples, pronunciación clara, pausas y términos familiares. Explica “persistencia” como “guardar los datos” cuando la audiencia lo necesite.
- No sacrifiques naturalidad para encajar un guion: primero recorta palabras; después ajusta velocidad nativa del motor. Evita estirar/acelerar más de aproximadamente 10% en posproducción; si no cabe, reescribe o solicita más duración.
- No atribuyas mejoras de asistencia, ingresos o conversión sin evidencia. Separa “implementado”, “simulado”, “verificado” y “siguiente paso”.

## 3. Motion design con intención

- Movimiento debe orientar: selección → respuesta → continuidad. Evita animar todos los elementos a la vez.
- Crea jerarquía con tipografía, escala, posición, pausa y contraste; no dependas de efectos.
- Usa easing con aceleración/desaceleración natural. Referencia: entrada de 180–320 ms, desplazamiento de 12–32 px, desfases de 40–80 ms; ajusta al formato, no son reglas universales.
- En una demo dental conserva azul, blanco y negro, marca Nítida y tono humano, sin aspecto de videojuego ni instrumental intimidante.
- Prioriza un punto de atención por escena. Conserva continuidad espacial entre pantallas; movimiento y sonido deben corresponder al mismo evento.
- Deja títulos y contenido clave quietos el tiempo suficiente para leer. Un video de 10 s no pretende enseñar todos los controles.
- No presentes un zoom de una captura como interacción real. Identifica montaje, captura animada, grabación continua o imagen generada según corresponda.
- Evita flashes, flicker, cortes agresivos, zooms bruscos, scroll ilegible o animaciones que puedan resultar molestas. El resumen debe entenderse también sin sonido.
- No añadas Three.js, Remotion, Blender o una biblioteca por moda. Evalúa problema, alternativa simple, instalación, mantenimiento y costo de render antes de adoptarla. FFmpeg y HTML/CSS pueden bastar.

## 4. Voz IA: naturalidad, trazabilidad y privacidad

- Prefiere síntesis local para este flujo sin servicios pagados. **Kokoro** es candidato; confirma soporte real de español, voces, licencia, requisitos y compatibilidad en fuentes oficiales antes de instalar.
- Un runtime ONNX comunitario no es el mismo repositorio ni licencia que los pesos originales. Registra ambos, versión y revisión/hash de los modelos utilizados.
- Usa entorno Python aislado y versiones fijadas; no instales paquetes en Python global ni metas modelos/entornos en Git. Mantén las dependencias de video fuera de la app y del lockfile pnpm.
- Comprueba tamaño de descarga y disco libre. No descargues modelos de varios GB o instales GPU/CUDA sin necesidad y autorización explícita.
- Descarga sólo desde orígenes documentados. No uses checkpoints desconocidos ni ejecutes código remoto confiándolo automáticamente.
- No clones voces ni imites personas identificables sin permiso. No prometas acento chileno o latinoamericano porque el motor simplemente soporte español.
- Genera una muestra corta, revisa duración, pausas, pronunciación, ruido, silencios y clipping. Si no puedes escucharla, dilo y ofrece comparación A/B; no declares que “suena natural” por inspeccionar un archivo.
- Identifica que la narración es sintética. No envíes guiones, capturas, datos personales o material del cliente a un proveedor externo sin autorización.

## 5. Diseño sonoro inspirado en ASMR

El usuario desea **clics suaves y microsonidos táctiles**, no una pista de estímulos invasivos.

- Diseña taps amortiguados, clics redondos y transiciones de aire muy breves. Sin taladros, raspados dentales, tonos médicos, sonidos de boca ni susurros íntimos por defecto.
- Para 10 s, empieza con **2–4 eventos**, asociados a selección, confirmación o cambio visual. Silencio entre eventos; no sonorizar cada palabra.
- Genera SFX originales de forma procedural cuando sea posible. Un clic sintetizado no necesita descargar un banco ni fingir grabación binaural.
- Evita picos, graves exagerados y agudos punzantes. Usa envolventes suaves, filtros y fades que no produzcan discontinuidades.
- La voz manda: coloca SFX claramente por debajo y atenúa si coinciden con palabras. Comprueba mezcla mono y estéreo. No anuncies un efecto terapéutico ni una experiencia ASMR garantizada.
- Si hay música, debe ser opcional, autorizada y prescindible; no agregarla cuando sólo se pidieron clics.
- Revisa loudness, true peak y clipping de la mezcla completa. Consulta los objetivos de referencia en la guía adjunta: son metas de trabajo, no garantías de seguridad auditiva.
- Un sonido gratuito no es automáticamente de dominio público ni libre de atribución: registra fuente, autor, licencia y modificaciones de cada recurso externo.

## 6. Producción y verificación

1. Captura únicamente la app local, con datos ficticios y perfil de navegador temporal aislado. No grabes escritorio personal, credenciales ni notificaciones del equipo.
2. Produce imagen y audio como capas independientes y conserva el montaje anterior para comparación.
3. Ajusta eventos a fotogramas y evita desincronización. Exporta MP4 H.264/yuv420p + AAC, con `faststart`, además de subtítulos SRT cuando corresponda.
4. Para 10 s a 30 fps, verifica **300 cuadros** y duración de video/contenedor. No confundas segundos de imagen con duración extendida por padding de audio.
5. Comprueba decodificación completa, resolución, audio, subtítulos, legibilidad, márgenes, niveles y ausencia de datos reales. Revisa fotogramas al inicio, transiciones y final.
6. No confundas `ffprobe`, loudness o pruebas automatizadas con escucha y revisión audiovisual humana. Declara qué sí se comprobó.
7. Documenta herramientas, versiones, procedencia, guion, límites y cómo regenerar. Los intermedios van a temporal/cache ignorada; sólo entregables y scripts pequeños al repositorio.
8. No publicar, desplegar, contratar servicios ni subir videos sin instrucción explícita.

## 7. Modo aprendizaje

Cuando el usuario quiera aprender, explica brevemente cada fase: **guion → escenas → voz → SFX → mezcla → exportación**. Relaciona cada cambio con lo que mejora. Comparte comandos reproducibles, mantén original y versión nueva y ofrece una variable a comparar cada vez; no ocultes todo detrás de un script incomprensible.

La explicación no sustituye al entregable. Si faltan herramientas, implementa lo viable y documenta el bloqueo sin fingir haber generado voz neuronal o video.

## Uso en Pi

Ubicación de proyecto: `.agents/skills/ai-motion-video/SKILL.md`. Tras crearla o editarla, ejecutar `/reload` para que Pi actualice el descubrimiento. Ejemplo:

```text
/skill:ai-motion-video Mejora el resumen de 10 segundos con voz local en español, motion sutil y clics suaves inspirados en ASMR. Mantén los límites de la demo y enséñame el proceso.
```

Crear esta skill no instala Kokoro, no ejecuta scripts ni constituye un agente independiente.
