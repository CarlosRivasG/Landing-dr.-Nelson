import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readEnvironment } from '../src/config/environment';
import { databaseOptions } from '../src/database/options';

const sample = {
  POSTGRES_HOST: '127.0.0.1', POSTGRES_DB: 'example',
  POSTGRES_USER: 'example', POSTGRES_PASSWORD: 'fictional-test-only',
};

test('exige configuración sin revelar valores', () => {
  assert.throws(() => readEnvironment({}), /Falta la variable POSTGRES_HOST/);
  assert.throws(() => readEnvironment({ ...sample, API_PORT: '3001abc' }), /Puerto inválido/);
  assert.throws(() => readEnvironment({ ...sample, POSTGRES_PORT: '65536' }), /Puerto inválido/);
  assert.throws(() => readEnvironment({ ...sample, NODE_ENV: 'other' }), /NODE_ENV/);
});

test('no sincroniza ni ejecuta migraciones al arrancar, incluso en producción', () => {
  for (const NODE_ENV of ['development', 'test', 'production']) {
    const options = databaseOptions(readEnvironment({ ...sample, NODE_ENV }));
    assert.equal(options.synchronize, false);
    assert.equal(options.migrationsRun, false);
  }
});
