/* global process, console */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, URL } from 'node:url';

const require = createRequire(import.meta.url);
const webRoot = fileURLToPath(new URL('..', import.meta.url));
const result = spawnSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build'], {
  cwd: webRoot,
  stdio: 'inherit',
  env: { ...process.env, GITHUB_PAGES: 'true', NEXT_TELEMETRY_DISABLED: '1' },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

const out = new URL('../out/', import.meta.url);
const html = readFileSync(new URL('index.html', out), 'utf8');
if (!html.includes('Muestra visual') || /<a\b[^>]*href="[^"]*(?:\/reservar|\/app\/)/.test(html)) {
  throw new Error('La exportación debe mostrar sólo la landing, sin enlaces a rutas dinámicas.');
}
if (existsSync(new URL('reservar/', out)) || existsSync(new URL('app/', out))) {
  throw new Error('No se debe publicar el panel ni la reserva en GitHub Pages.');
}
writeFileSync(new URL('.nojekyll', out), '');
console.log('Muestra estática preparada en apps/web/out, sin API, reservas ni pagos.');
