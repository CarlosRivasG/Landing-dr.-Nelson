# Aprender a crear videos con GPT y herramientas locales

GPT dirige y escribe guion/código. Chromium captura la aplicación; Kokoro sintetiza voz; Python genera clics; FFmpeg anima, mezcla y exporta. La skill `.agents/skills/ai-motion-video/SKILL.md` contiene el criterio de dirección. No es un servicio contratado ni un agente independiente.

## Qué hicimos, paso a paso

1. **Guion:** “Reservas, pagos simulados, agenda y seguimiento. Una demo verificada, sin cobros reales. Próximo paso: guardar los datos.” Se explica lo implementado sin vender la demo como operación real.
2. **Imagen:** cuatro composiciones de 2,5 s con capturas reales. Texto estático para leer; captura entrando 24 px en 280 ms. No es grabación continua de interacción.
3. **Voz:** Kokoro en CPU, voz española `ef_dora`, velocidad nativa `0.9`, una narración continua de 8,245 s. Se deja margen en lugar de comprimir la voz para encajarla.
4. **Sonido:** tres taps originales de 65–80 ms, en las entradas de reserva, checkout y agenda. Ruido filtrado + seno amortiguado, ataque suave; sin sonidos descargados ni música.
5. **Mezcla:** voz centrada, taps secundarios, normalización de dos pasadas y medición de la salida AAC. Resultado documentado, no una garantía de agrado subjetivo.
6. **Exportación:** MP4 H.264/AAC, 1080p, 30 fps, 10 s exactos; SRT alineado por tiempos de puntuación del motor. No hay reconocimiento de voz remoto.

**Para aprender:** cambia una variable, genera otra versión y compara. Empieza por el texto, después prueba `SPEED` o `VOICE`, y sólo después el nivel de los clics. No uses como comparación controlada el video inicial frente al nuevo: además del motor, cambiaron guion, tempo, movimiento y mezcla.

## Preparación aislada en Windows / PowerShell

Requisitos: Python 3.12, `uv`, Node compatible con la app y FFmpeg/ffprobe en PATH. La máquina usada ya tenía estas herramientas. No ejecutar estos comandos si sólo quieres ver el MP4.

```powershell
uv venv "$env:LOCALAPPDATA\nitida-video\.venv" --python 3.12
uv pip install --python "$env:LOCALAPPDATA\nitida-video\.venv\Scripts\python.exe" --require-hashes -r tools/video/requirements-kokoro.txt
python tools/video/prepare-kokoro.py
```

Los modelos se guardan en `%LOCALAPPDATA%/nitida-video/models`, fuera del repositorio. Descarga documentada: modelo INT8 108,83 MiB + voces 26,91 MiB. El entorno CPU también consume espacio; no se instala Torch, CUDA ni paquetes en Python global. El lockfile `requirements-kokoro.txt` fija las 13 dependencias resueltas y sus hashes, separado de pnpm.

`prepare-kokoro.py` verifica SHA-256 contra los digests de la release, usa un archivo parcial y no acepta una copia existente corrupta. Los modelos son datos ONNX/NumPy; no se ejecuta código remoto con `trust_remote_code`.

## Regenerar imágenes

Iniciar la web compilada en `127.0.0.1:3100` y Chromium en `127.0.0.1:9444`, con perfil temporal y depuración sólo en loopback. La [guía de la demo](../../docs/prototipo-app.md) detalla los comandos. Después:

```powershell
node tools/video/capture-summary.mjs
```

El script utiliza el protocolo CDP, sólo navega a la app local y usa personas ficticias. Escribe cuatro PNG compuestos en la carpeta temporal del sistema. Cerrar únicamente los procesos de prueba creados; no usar un perfil personal.

## Generar voz, clics y video

```powershell
& "$env:LOCALAPPDATA\nitida-video\.venv\Scripts\python.exe" tools/video/render-motion-summary.py
```

Salida en `docs/videos/`: video `nitida-resumen-10s-kokoro-asmr.mp4`, SRT, muestra de voz y registro JSON. Se conserva `nitida-resumen-10s.mp4` como versión anterior.

El render verifica hashes de modelos antes de inferir, limita los hilos CPU, rechaza guiones que excedan 9,5 s en vez de acelerarlos y comprueba duración/cuadros/picos/loudness/decodificación. No hay comparación perceptual automatizada: **escucha el resultado a volumen moderado** antes de publicarlo.

Variables didácticas en `render-motion-summary.py`:

| Variable | Qué cambia |
|---|---|
| `TEXT` | El mensaje; mantener frases cortas y no inventar funciones. |
| `VOICE` | Voz: la lista documentada de español incluye `ef_dora`, `em_alex`, `em_santa`. La preferencia requiere escucha. |
| `SPEED` | Velocidad nativa; 0.9 es la usada, no una recomendación universal. |
| `EVENTS` | Momento, duración, cuerpo tonal y ganancia previa a normalización de cada clic. |
| `START` | Margen inicial de la voz. |
| Filtro `overlay` | Desplazamiento/easing del panel; dejar los títulos quietos. |

Para evitar sobrescribir la comparación, cambiar también los nombres de salida antes de experimentar. Los tiempos de voz pueden variar ligeramente entre ejecuciones/runtime; se mide cada render y se actualiza su registro.

## Procedencia y licencias consultadas

Fuentes consultadas directamente para esta implementación:

- [Modelo original hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M): ficha declara **Apache-2.0**. Ver también [VOICES.md](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md), que documenta las tres voces españolas y advierte límites de G2P/datos por idioma. No se garantiza una región de acento ni un nivel de calidad.
- [Runtime comunitario kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx), versión instalada **0.6.1**: [licencia MIT](https://github.com/thewh1teagle/kokoro-onnx/blob/main/LICENSE), copyright 2025 github.com/thewh1teagle. No es el repositorio oficial de los pesos.
- [Release de conversión ONNX model-files-v1.1](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1): el README del runtime enlaza estos assets y atribuye Apache-2.0 al modelo. Se usa la conversión INT8; la cuantización puede afectar la calidad. No se redistribuyen los pesos con el repo.
- [API de la release](https://api.github.com/repos/thewh1teagle/kokoro-onnx/releases/tags/model-files-v1.1): digests usados para verificar cada descarga. Hashes completos en `prepare-kokoro.py` y en el registro del video.
- [PyPI kokoro-onnx](https://pypi.org/project/kokoro-onnx/0.6.1/) y [espeakng-loader](https://pypi.org/project/espeakng-loader/0.2.4/): requisitos comprobados antes de crear el entorno. Los paquetes conservan sus licencias individuales; no se redistribuye el entorno Python ni los motores binarios con el MP4. Cualquier empaquetado futuro debe revisar también las obligaciones de eSpeak/phonemizer y FFmpeg, no asumir que todo es MIT.

Los clics son síntesis procedural propia, semilla fija 20261018, sin samples de terceros. Las capturas muestran la app del proyecto, con tipografía del sistema; no incorporan bancos de rostros ni música. No se afirma que una descarga gratuita permita cualquier uso ni que esta revisión sustituya revisión legal para distribución comercial.

## Límites

Sin GPU, API pagada, clonación de voz, pacientes reales ni publicación. La skill y sus archivos se validaron estructuralmente; en Pi ejecutar `/reload` para actualizar su descubrimiento. No se modificó el código de la aplicación para generar este video.
