import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const readJson = (relative: string) => JSON.parse(readFileSync(new URL(relative, import.meta.url), 'utf8'));

test('Vercel compila sólo la web Next.js desde apps/web, sin export estático ni secretos', () => {
  const config = readJson('../vercel.json');
  const root = readJson('../../../package.json');
  const web = readJson('../package.json');
  assert.equal(config.framework, 'nextjs');
  assert.equal(config.buildCommand, 'pnpm run build');
  assert.equal(web.scripts.build, 'next build');
  assert.equal(root.engines.node, '24.x');
  assert.equal(web.engines.node, '24.x');
  assert.equal(root.packageManager, 'pnpm@10.34.7');
  assert.equal(web.engines.pnpm, '10.34.7');
  for (const key of ['installCommand', 'outputDirectory', 'rewrites', 'env', 'build', 'functions']) {
    assert.equal(key in config, false, `No debe introducirse ${key} sin revisar el despliegue.`);
  }
  const globalHeaders = config.headers.find((entry: { source: string }) => entry.source === '/(.*)');
  assert.ok(globalHeaders);
  assert.ok(globalHeaders.headers.some((header: { key: string; value: string }) => header.key === 'X-Robots-Tag' && header.value === 'noindex, nofollow'));
});

test('cachés, configuración local de Vercel y archivos de secretos permanecen ignorados', () => {
  const ignore = readFileSync(new URL('../../../.gitignore', import.meta.url), 'utf8').split(/\r?\n/);
  for (const entry of ['.pnpm-store/', '.vercel/', '.env', '.env.*', '!.env.example', 'node_modules/', '.next/']) assert.ok(ignore.includes(entry));
  assert.equal(readFileSync(new URL('../../../.nvmrc', import.meta.url), 'utf8').trim(), '24.22.0');
});
