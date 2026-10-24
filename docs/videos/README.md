# Resumen del avance — 10 segundos

## Nueva versión: Kokoro, motion y microclics

- **[Ver video nuevo](nitida-resumen-10s-kokoro-asmr.mp4)** · [subtítulos](nitida-resumen-10s-kokoro-asmr.srt) · [voz aislada](nitida-voz-kokoro.wav).
- Voz neuronal **Kokoro `ef_dora`**, español `es`, velocidad nativa `0.9`. No se promete acento chileno/latinoamericano ni se clonó una voz. Audio de 8,245 s en un video de 10 s, sin `atempo` ni compresión artificial de duración.
- Capturas con entrada de 280 ms y desplazamiento de 24 px/ease-out; títulos permanecen quietos. Tres microclics sintetizados con semilla fija, cuerpo tonal amortiguado y ruido filtrado: 0,26 / 2,70 / 5,22 s. Sin música ni sonidos de instrumental dental. Inspiración ASMR, no grabación binaural ni efecto terapéutico.
- Mezcla final medida: **−16,17 LUFS integrados / −1,50 dBTP**. Audio decodificado sin clipping, canales idénticos y sin cancelación al convertir a mono.
- Verificado: **1920×1080, 30 fps, 300 cuadros y contenedor de 10,000 s**, pistas de voz/subtítulos y decodificación completa. Fotogramas de entrada y agenda revisados visualmente. No hubo evaluación auditiva humana; falta escuchar naturalidad, pronunciación de marca y comodidad de los clics.
- [Registro técnico con versiones, hashes y eventos](nitida-kokoro-verificacion.json).
- La [skill de motion design](../../.agents/skills/ai-motion-video/SKILL.md) define el criterio; la [guía práctica](../../tools/video/README.md) explica cómo aprender y regenerar. No se instalaron dependencias en la app ni se enviaron guiones a un servicio de voz externo.

## Versión inicial conservada — voz de Windows

- [Video MP4](nitida-resumen-10s.mp4): 1920×1080, 30 fps, 300 cuadros, duración 10,000 s.
- Voz sintética española local: Microsoft Sabina Desktop (SAPI). Sin servicios de voz externos, música ni recursos de terceros adicionales.
- Cuatro escenas de 2,5 s, compuestas con capturas reales del prototipo: reserva, pago simulado, agenda y seguimiento. Es un montaje explicativo, no una grabación continua de interacción.
- Texto explicativo en pantalla y [subtítulos en español](nitida-resumen-10s.srt), también incluidos como pista seleccionable en el MP4.
- Datos ficticios y límites de demostración explícitos. No se muestran pacientes reales ni se hacen cobros.

Se verificaron duración, resolución, número de cuadros, pistas de audio/subtítulos y decodificación completa sin errores. Fotogramas de composición revisados visualmente. No se realizó una evaluación auditiva humana.

Para regenerar en Windows con Node, FFmpeg y una voz SAPI española instalados: iniciar Next compilado en `127.0.0.1:3100` y Chromium en un perfil temporal aislado con CDP en `127.0.0.1:9444` (ver [guía del prototipo](../prototipo-app.md)); ejecutar desde la raíz:

```sh
node tools/video/capture-summary.mjs
python tools/video/render-summary.py
```

Los intermedios se guardan en la carpeta temporal del sistema; el MP4 y SRT finales se guardan aquí. Cerrar sólo los procesos temporales creados. No hubo despliegue ni modificación de la aplicación para producir el video.
