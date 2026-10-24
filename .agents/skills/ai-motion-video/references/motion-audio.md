# Guía práctica — movimiento, voz y microsonidos

## Microescaleta de ejemplo para 10 s

| Tiempo | Imagen | Texto prioritario | Sonido |
|---|---|---|---|
| 0–2,5 s | Reserva con horario seleccionado | Reserva | Tap suave al destacar el horario, no sobre la primera sílaba. |
| 2,5–5 s | Checkout de prueba | Pago simulado · sin cobros | Clic redondo al cambiar de bloque. |
| 5–7,5 s | Agenda y próximas acciones | Agenda + seguimiento | Un clic discreto al aparecer el panel. |
| 7,5–10 s | Detalle o cierre | Demo verificada · siguiente paso | Silencio o tap muy suave; dejar respirar la voz. |

Es un punto de partida; no obliga a usar cuatro capturas estáticas ni a acelerar la narración en cuatro bloques. Una voz continua puede resultar más fluida que cuatro frases de duración idéntica.

## Movimiento

- **Entrada:** opacidad 0→1 + desplazamiento corto hacia la posición final, con ease-out. Evita hacer saltar el párrafo entero mientras se lee.
- **Cambio de escena:** corte limpio o fundido de 100–180 ms. Si un fundido solapa clips, recalcula la duración final; cuatro clips de 2,5 s con tres solapes no suman 10 s.
- **Énfasis:** resalta un único componente con marco, subrayado o leve cambio de escala; no inventes estados que no existan en la UI.
- **Reposo:** reserva la mayor parte de cada plano a lectura. No uses zoom continuo en toda la tipografía; puede emborronar letras pequeñas.
- **Formato:** 16:9 Full HD es adecuado para este resumen. Para vertical, recompón los bloques; no recortes el video horizontal sin revisar títulos y controles.
- **Accesibilidad:** no usar flashes repetidos, contraste oscilante ni información sólo sonora. Asegura títulos comprensibles al silenciar el video.

## Guion y voz

1. Escribe una frase central en español y cuenta palabras.
2. Sintetiza sin corrección de tempo; mide duración real incluyendo silencios.
3. Si no cabe, simplifica primero. Ejemplo: “persistencia transaccional” → “guardar los datos”, sin afirmar que ya esté implementado.
4. Ajusta velocidad en el motor sólo de forma moderada y guarda el valor. No fuerces un audio de 15 s dentro de 10 s.
5. Deja 100–250 ms de margen al principio/final si el guion lo permite. Escucha también las consonantes finales.
6. Revisa nombre de marca y palabras técnicas. Escribir fonéticamente para el motor puede ser válido, pero conserva ortografía normal en subtítulos.
7. Si hay muestras A/B, cambia una variable: motor, voz o velocidad, no todas simultáneamente.

Kokoro, Piper y otros motores son alternativas a investigar, no dependencias automáticamente aprobadas. Revisa licencias por modelo y voz, acento real, tamaño, uso comercial y requisitos. “Gratis local” no significa sin consumo de disco, CPU, electricidad o mantenimiento.

## Clic procedural, no muestra robada

Una receta reproducible puede mezclar:

- Ruido de duración breve, con semilla fija y banda limitada.
- Seno amortiguado de frecuencia media-baja para dar cuerpo al tap.
- Ataque de 2–5 ms y caída de 30–90 ms.
- Filtrado de graves subsonoros/agudos punzantes y fade final hasta cero.

Son parámetros orientativos, no una promesa de sonido agradable. Una onda o un archivo sin clipping no demuestran calidad perceptual.

No añadir ultrasonidos, ruido constante, efectos de instrumental dental o paneos extremos. Si se genera estéreo, usa diferencias pequeñas y verifica que al mezclar a mono no desaparezca el clic.

## Mezcla orientativa

- Voz principal inteligible y centrada; SFX secundarios, sin tapar consonantes.
- Como arranque, coloca los SFX aproximadamente **12–20 dB por debajo de los picos de voz** y ajusta por escucha. Un valor de volumen lineal no equivale directamente a LUFS.
- Para este video explicativo online, referencia de mezcla **−16 LUFS integrados**, con techo de **−1,5 dBTP**. Son objetivos editoriales; la plataforma puede normalizar distinto y 10 s no caracterizan todos los casos.
- No normalices cada clic individual a loudness de voz. Mezcla primero; mide y ajusta el conjunto después.
- En FFmpeg, usa medición `loudnorm`/`ebur128` y, si corresponde, normalización de dos pasadas. Registra mediciones de salida; un parámetro configurado no prueba que se alcanzó.
- Verifica clipping, picos intersample, silencios, canales, ruido y duración. La comodidad auditiva exige también escucha, idealmente a volumen moderado en auriculares y altavoz.

## Procedencia y archivos

Conservar:

- Guion visible y texto enviado al motor, diferenciando cambios de pronunciación.
- Motor/runtime y versiones fijadas; voz, velocidad, revisión y SHA-256 del modelo.
- Licencias: código, pesos, voces, sonidos, fuentes, imágenes y videos son categorías separadas.
- Tabla de eventos con tiempo, duración, ganancia y fuente de cada SFX.
- Original y nuevo montaje con nombres diferentes; nunca sobrescribir la única referencia A/B.
- MP4 final, SRT cuando corresponda, scripts y un registro de verificación con límites claros.

Antes de entregar, responder: ¿se entiende sin audio?, ¿la voz cabe sin atropellarse?, ¿los clics acompañan una acción?, ¿queda claro qué es demo?, ¿se verificaron duración y niveles?, ¿qué falta escuchar o validar?
