"""Versión educativa: Kokoro local + motion de capturas + tres microclics propios.
Ejecutar con el Python aislado de nitida-video. Nunca sobrescribe el video SAPI.
Requiere imágenes de capture-summary.mjs, modelos de prepare-kokoro.py y FFmpeg.
"""
from dataclasses import asdict
import hashlib
from importlib.metadata import version
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import wave

import numpy as np
import onnxruntime as ort
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[2]
WORK = Path(tempfile.gettempdir()) / 'nitida-resumen-10s'
OUT = ROOT / 'docs' / 'videos'
MODELS = Path(os.environ.get('LOCALAPPDATA', Path.home() / '.cache')) / 'nitida-video' / 'models'
TEXT = 'Reservas, pagos simulados, agenda y seguimiento. Una demo verificada, sin cobros reales. Próximo paso: guardar los datos.'
VOICE = 'ef_dora'
SPEED = 0.9
RATE = 48000
START = 0.2
EVENTS = [
    {'time': 0.26, 'length': 0.070, 'frequency': 520, 'peak_dbfs': -26, 'purpose': 'Entrada del panel de reserva'},
    {'time': 2.70, 'length': 0.080, 'frequency': 640, 'peak_dbfs': -27, 'purpose': 'Entrada del checkout simulado'},
    {'time': 5.22, 'length': 0.065, 'frequency': 580, 'peak_dbfs': -27, 'purpose': 'Entrada de la agenda'},
]
EXPECTED = {
    'kokoro-v1.0.int8.onnx': 'ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c',
    'voices-v1.0.bin': 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d',
}

def run(args, **kwargs):
    return subprocess.run(args, check=True, **kwargs)

def write_wave(path, samples, rate):
    samples = np.asarray(samples)
    with wave.open(str(path), 'wb') as target:
        target.setnchannels(1 if samples.ndim == 1 else samples.shape[1])
        target.setsampwidth(2)
        target.setframerate(rate)
        target.writeframes((np.clip(samples, -1, 1) * 32767).astype('<i2').tobytes())

def measure(ffmpeg, path):
    result = run([ffmpeg, '-hide_banner', '-nostdin', '-i', str(path), '-af',
                  'loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json', '-f', 'null', '-'],
                 capture_output=True, text=True)
    matches = re.findall(r'\{\s*"input_i".*?\}', result.stderr, flags=re.S)
    if not matches:
        raise RuntimeError('FFmpeg no devolvió mediciones de loudness.')
    return json.loads(matches[-1])

def stamp(seconds):
    ms = round(seconds * 1000)
    return f'00:00:{ms // 1000:02d},{ms % 1000:03d}'


def main():
    ffmpeg, ffprobe = shutil.which('ffmpeg'), shutil.which('ffprobe')
    if not ffmpeg or not ffprobe:
        raise SystemExit('Se requieren ffmpeg y ffprobe.')
    for i in range(1, 5):
        if not (WORK / f'scene-{i}.png').exists():
            raise SystemExit('Primero ejecutar capture-summary.mjs.')
    hashes = {}
    for name, expected in EXPECTED.items():
        with (MODELS / name).open('rb') as source:
            hashes[name] = hashlib.file_digest(source, 'sha256').hexdigest()
        if hashes[name] != expected:
            raise SystemExit(f'No se usa un modelo con hash incorrecto: {name}')
    OUT.mkdir(parents=True, exist_ok=True)
    options = ort.SessionOptions()
    options.intra_op_num_threads = 4
    options.inter_op_num_threads = 1
    session = ort.InferenceSession(str(MODELS / 'kokoro-v1.0.int8.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
    speaker = Kokoro.from_session(session, str(MODELS / 'voices-v1.0.bin'))
    samples, sample_rate, timings = speaker.create_timed(TEXT, voice=VOICE, speed=SPEED, lang='es')
    duration = len(samples) / sample_rate
    if duration > 9.5:
        raise SystemExit(f'La voz dura {duration:.2f} s. Acortar guion; no acelerarla artificialmente.')
    print(f'Kokoro CPU: {duration:.3f} s, velocidad nativa {SPEED}, sin atempo.', flush=True)
    voice_path = OUT / 'nitida-voz-kokoro.wav'
    write_wave(voice_path, samples, sample_rate)
    (WORK / 'kokoro-phonemes.json').write_text(json.dumps([asdict(t) for t in timings], ensure_ascii=False, indent=2), encoding='utf-8')

    # Resample profesional en FFmpeg, sin cambiar tiempo ni tono.
    raw = subprocess.check_output([ffmpeg, '-nostdin', '-v', 'error', '-i', str(voice_path), '-f', 'f32le', '-ac', '1', '-ar', str(RATE), '-'])
    voice = np.frombuffer(raw, dtype='<f4').copy()
    peak = float(np.max(np.abs(voice)))
    if not 0 < peak < 1:
        raise SystemExit('La señal de voz está vacía o recortada.')
    voice *= (10 ** (-6 / 20)) / peak
    mix = np.zeros(RATE * 10, dtype=np.float64)
    offset = round(START * RATE)
    mix[offset:offset + len(voice)] += voice
    sfx = np.zeros_like(mix)
    random = np.random.default_rng(20261018)
    for event in EVENTS:
        count = round(event['length'] * RATE)
        time = np.arange(count) / RATE
        noise = random.normal(0, 1, count)
        frequencies = np.fft.rfftfreq(count, 1 / RATE)
        band = (1 - np.exp(-(frequencies / 150) ** 4)) * np.exp(-(frequencies / 2100) ** 4)
        noise = np.fft.irfft(np.fft.rfft(noise) * band, n=count)
        noise /= max(float(np.max(np.abs(noise))), 1e-9)
        attack = np.minimum(time / 0.004, 1)
        envelope = attack * np.exp(-time / 0.015) * np.minimum((event['length'] - time) / 0.009, 1)
        tap = (0.7 * np.sin(2 * math.pi * event['frequency'] * time) + 0.3 * noise) * envelope
        tap *= 10 ** (event['peak_dbfs'] / 20) / np.max(np.abs(tap))
        start = round(event['time'] * RATE)
        sfx[start:start + count] += tap
    mix += sfx
    if float(np.max(np.abs(mix))) >= 1:
        raise SystemExit('La mezcla previa tiene clipping.')
    # Estéreo centrado: downmix mono preserva la señal, sin cancelación por fase.
    write_wave(WORK / 'microclics.wav', np.column_stack((sfx, sfx)), RATE)
    write_wave(WORK / 'mix-raw.wav', np.column_stack((mix, mix)), RATE)
    first = measure(ffmpeg, WORK / 'mix-raw.wav')
    normalizer = (
        f"loudnorm=I=-16:TP=-1.5:LRA=7:measured_I={first['input_i']}:"
        f"measured_TP={first['input_tp']}:measured_LRA={first['input_lra']}:"
        f"measured_thresh={first['input_thresh']}:offset={first['target_offset']}:linear=true"
    )
    run([ffmpeg, '-y', '-nostdin', '-v', 'error', '-i', str(WORK / 'mix-raw.wav'), '-af', normalizer,
         '-ar', str(RATE), '-c:a', 'pcm_s24le', str(WORK / 'mix-normalized.wav')])

    # Anima sólo la captura de la derecha; textos quietos, sin zoom ni flashes.
    for i in range(1, 5):
        animation = (
            '[0:v]split=2[base][panel];'
            '[base]drawbox=x=700:y=120:w=1180:h=880:color=0xf3f6fc:t=fill[background];'
            '[panel]crop=1104:811:740:160,format=rgba,fade=t=in:st=0:d=0.28:alpha=1[card];'
            "[background][card]overlay=x='740+24*pow(1-min(t/0.28,1),3)':y=160:eval=frame,"
            'fps=30,format=yuv420p[v]'
        )
        run([ffmpeg, '-y', '-nostdin', '-v', 'error', '-loop', '1', '-framerate', '30',
             '-i', str(WORK / f'scene-{i}.png'), '-filter_complex_threads', '1', '-filter_complex', animation,
             '-map', '[v]', '-an', '-t', '2.5', '-c:v', 'libx264', '-crf', '19', '-preset', 'fast',
             '-threads', '4', str(WORK / f'motion-{i}.mp4')])
    playlist = WORK / 'motion-clips.txt'
    playlist.write_text('\n'.join("file '" + (WORK / f'motion-{i}.mp4').as_posix() + "'" for i in range(1, 5)), encoding='utf-8')

    # Subtítulos a nivel de frase, basados en puntuación temporizada por el motor.
    phrases = [s.strip() + '.' for s in TEXT.split('.') if s.strip()]
    stops = [t.end for t in timings if t.phoneme == '.']
    if len(stops) != len(phrases):
        raise SystemExit('No coinciden las frases y los tiempos del motor; revisar subtítulos.')
    cues = []
    start = START
    for i, (phrase, end) in enumerate(zip(phrases, stops)):
        end = min(START + end, 9.8)
        cues.append(f'{i+1}\n{stamp(start)} --> {stamp(end)}\n{phrase}')
        start = end
    subtitle = OUT / 'nitida-resumen-10s-kokoro-asmr.srt'
    subtitle.write_text('\n\n'.join(cues) + '\n', encoding='utf-8')
    video = OUT / 'nitida-resumen-10s-kokoro-asmr.mp4'
    run([ffmpeg, '-y', '-nostdin', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(playlist),
         '-i', str(WORK / 'mix-normalized.wav'), '-i', str(subtitle), '-map', '0:v:0', '-map', '1:a:0', '-map', '2:s:0',
         '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-c:s', 'mov_text', '-t', '10', '-movflags', '+faststart',
         '-metadata', 'title=Nítida Dental — Demo, motion y voz Kokoro',
         '-metadata', 'comment=Capturas animadas reales; voz sintética local; microclics procedurales; sin cobros reales.',
         '-metadata:s:a:0', 'language=spa', '-metadata:s:s:0', 'language=spa', str(video)])
    probe = json.loads(subprocess.check_output([ffprobe, '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(video)]))
    track = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    assert track['nb_frames'] == '300'
    assert (track['width'], track['height']) == (1920, 1080)
    assert abs(float(probe['format']['duration']) - 10) < 0.001
    final = measure(ffmpeg, video)
    assert abs(float(final['input_i']) + 16) < 1, final
    assert float(final['input_tp']) <= -1.0, final
    run([ffmpeg, '-nostdin', '-v', 'error', '-i', str(video), '-f', 'null', '-'])
    report = {
        'voice': VOICE, 'language': 'es', 'native_speed': SPEED, 'post_tempo': False,
        'script': TEXT, 'speech_duration': duration, 'speech_offset': START,
        'model_release': 'model-files-v1.1', 'model_sha256': hashes,
        'runtime': {p: version(p) for p in ['kokoro-onnx', 'onnxruntime', 'numpy', 'phonemizer', 'espeakng-loader']},
        'sound_events': EVENTS, 'sfx_origin': 'Síntesis procedural propia; semilla 20261018; canales idénticos.',
        'output_lufs': final['input_i'], 'output_true_peak_dbtp': final['input_tp'],
        'duration': probe['format']['duration'], 'frames': track['nb_frames'],
        'human_listening': False,
    }
    (OUT / 'nitida-kokoro-verificacion.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Video: {video}\nLoudness final: {final["input_i"]} LUFS; pico real: {final["input_tp"]} dBTP.', flush=True)
    print('Voz y clics generados localmente. Pendiente: escucha y preferencia del usuario.', flush=True)

if __name__ == '__main__':
    main()
