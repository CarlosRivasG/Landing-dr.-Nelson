"""Compone un MP4 de 10 s con capturas locales y voz SAPI española (Windows).
Sin librerías Python adicionales, sin TTS remoto ni música de terceros.
Primero ejecutar capture-summary.mjs; requiere ffmpeg/ffprobe disponibles.
"""
from pathlib import Path
import json
import shutil
import subprocess
import tempfile
import wave

ROOT = Path(__file__).resolve().parents[2]
WORK = Path(tempfile.gettempdir()) / 'nitida-resumen-10s'
OUTPUT = ROOT / 'docs' / 'videos'
OUTPUT.mkdir(parents=True, exist_ok=True)
FFMPEG = shutil.which('ffmpeg')
FFPROBE = shutil.which('ffprobe')
if not FFMPEG or not FFPROBE:
    raise SystemExit('Se requieren ffmpeg y ffprobe en PATH.')

lines = [
    'Creamos un recorrido de reservas.',
    'Con pagos simulados, sin cobros reales.',
    'Agenda, estados y seguimiento administrativo.',
    'Demo verificada. Próximo: guardar datos.',
]
manifest = WORK / 'narracion.json'
manifest.write_text(json.dumps(lines, ensure_ascii=False), encoding='utf-8-sig')
ps = WORK / 'narrar.ps1'
ps.write_text('''param([string]$Work)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice = $speaker.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -eq 'es-MX' } | Select-Object -First 1
if (-not $voice) { $voice = $speaker.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -like 'es-*' } | Select-Object -First 1 }
if (-not $voice) { throw 'No hay voz española local instalada.' }
$speaker.SelectVoice($voice.VoiceInfo.Name)
$speaker.Rate = 0
$lines = Get-Content -Raw -Encoding UTF8 (Join-Path $Work 'narracion.json') | ConvertFrom-Json
for ($i = 0; $i -lt $lines.Count; $i++) {
  $speaker.SetOutputToWaveFile((Join-Path $Work ('voz-' + ($i + 1) + '.wav')))
  $speaker.Speak($lines[$i])
  $speaker.SetOutputToNull()
}
Write-Output ('Voz local: ' + $voice.VoiceInfo.Name)
$speaker.Dispose()
''', encoding='utf-8-sig')
subprocess.run(['powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', str(ps), '-Work', str(WORK)], check=True)

for i in range(1, 5):
    image = WORK / f'scene-{i}.png'
    audio = WORK / f'voz-{i}.wav'
    if not image.exists():
        raise SystemExit(f'Falta {image}; ejecutar capture-summary.mjs.')
    with wave.open(str(audio)) as source:
        seconds = source.getnframes() / source.getframerate()
    tempo = seconds / 2.25
    if not 0.5 <= tempo <= 2:
        raise SystemExit(f'La frase {i} necesita revisión: velocidad {tempo:.2f}.')
    subprocess.run([
        FFMPEG, '-y', '-nostdin', '-loglevel', 'error',
        '-loop', '1', '-framerate', '30', '-i', str(image), '-i', str(audio),
        '-vf', 'fade=t=in:st=0:d=0.1,fade=t=out:st=2.4:d=0.1,format=yuv420p',
        '-af', f'atempo={tempo:.8f},aresample=48000,adelay=100,apad,atrim=duration=2.5,afade=t=out:st=2.42:d=0.08',
        '-t', '2.5', '-r', '30', '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-threads', '4',
        '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2', str(WORK / f'clip-{i}.mp4'),
    ], check=True)

srt = OUTPUT / 'nitida-resumen-10s.srt'
def timestamp(ms):
    return f'00:00:{ms // 1000:02d},{ms % 1000:03d}'
srt.write_text('\n\n'.join(f'{i+1}\n{timestamp(i*2500)} --> {timestamp((i+1)*2500)}\n{line}' for i, line in enumerate(lines)) + '\n', encoding='utf-8')
playlist = WORK / 'clips.txt'
playlist.write_text('\n'.join("file '" + (WORK / f'clip-{i}.mp4').as_posix() + "'" for i in range(1, 5)), encoding='utf-8')
video = OUTPUT / 'nitida-resumen-10s.mp4'
subprocess.run([
    FFMPEG, '-y', '-nostdin', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(playlist), '-i', str(srt),
    '-map', '0:v:0', '-map', '0:a:0', '-map', '1:s:0',
    '-vf', 'setpts=PTS-STARTPTS', '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-threads', '4',
    '-af', 'asetpts=PTS-STARTPTS,apad,atrim=duration=10', '-c:a', 'aac', '-b:a', '160k', '-c:s', 'mov_text',
    '-metadata', 'title=Nítida Dental — Resumen del avance', '-metadata', 'comment=Capturas reales del prototipo. Datos ficticios. Voz sintética local. Sin cobros reales.',
    '-metadata:s:a:0', 'language=spa', '-metadata:s:s:0', 'language=spa', '-movflags', '+faststart', '-t', '10', str(video),
], check=True)
info = json.loads(subprocess.check_output([FFPROBE, '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)]))
v = next(s for s in info['streams'] if s['codec_type'] == 'video')
assert (v['width'], v['height']) == (1920, 1080)
assert abs(float(v['duration']) - 10) < 0.04, v['duration']
assert abs(float(info['format']['duration']) - 10) < 0.04, info['format']['duration']
assert int(v['nb_frames']) == 300, v['nb_frames']
assert any(s['codec_type'] == 'audio' for s in info['streams'])
assert any(s['codec_type'] == 'subtitle' for s in info['streams'])
print(f'Video: {video}\n10 segundos de imagen, 300 cuadros, Full HD, voz y subtítulos en español.\nTamaño: {video.stat().st_size / 1024 / 1024:.2f} MiB')
