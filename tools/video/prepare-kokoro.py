"""Descarga los dos assets documentados de Kokoro ONNX y verifica su SHA-256.
Cache fuera del repositorio; no instala ni ejecuta código del repositorio remoto.
"""
import hashlib
import os
from pathlib import Path
import shutil
import urllib.request

CACHE = Path(os.environ.get('LOCALAPPDATA', Path.home() / '.cache')) / 'nitida-video' / 'models'
BASE = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/'
ASSETS = {
    'kokoro-v1.0.int8.onnx': 'ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c',
    'voices-v1.0.bin': 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d',
}

def checksum(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

if __name__ == '__main__':
    CACHE.mkdir(parents=True, exist_ok=True)
    for name, expected in ASSETS.items():
        target = CACHE / name
        if target.exists():
            if checksum(target) != expected:
                raise SystemExit(f'Checksum incorrecto en {target}; no se usa ni se sobrescribe.')
            print(f'Ya verificado: {name}')
            continue
        if shutil.disk_usage(CACHE).free < 512 * 1024 * 1024:
            raise SystemExit('Se requieren al menos 512 MiB libres antes de descargar.')
        partial = target.with_suffix(target.suffix + '.part')
        print(f'Descargando {name} desde release model-files-v1.1... ', flush=True)
        request = urllib.request.Request(BASE + name, headers={'User-Agent': 'nitida-local-video'})
        with urllib.request.urlopen(request, timeout=120) as source, partial.open('wb') as output:
            shutil.copyfileobj(source, output)
        if checksum(partial) != expected:
            partial.unlink()
            raise SystemExit(f'SHA-256 incorrecto: {name}. Descarga descartada.')
        partial.replace(target)
        print(f'Verificado: {name}, {target.stat().st_size / 1024**2:.2f} MiB')
    print(f'Modelos locales: {CACHE}')
