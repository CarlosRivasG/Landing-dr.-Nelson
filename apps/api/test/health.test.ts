import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthService } from '../src/modules/health/health.service';
import { HealthController } from '../src/modules/health/health.controller';
import { configureApplication } from '../src/bootstrap';

test('HTTP health comprueba DB, respeta el prefijo y sanea fallos', async () => {
  let available = true;
  const queries: string[] = [];
  const query = async (sql: string) => {
    queries.push(sql);
    if (!available) throw new Error('driver-detail-that-must-not-leak');
    return [{ '?column?': 1 }];
  };
  // Prueba HTTP con un DataSource sustituido, sin DB externa.
  const module = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [HealthService, { provide: DataSource, useValue: { query } }],
  }).compile();
  const app = module.createNestApplication({ logger: false });
  configureApplication(app);
  try {
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    const success = await fetch(`${url}/api/v1/health`);
    assert.equal(success.status, 200);
    assert.equal(success.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await success.json(), { status: 'ok', database: 'up' });
    assert.deepEqual(queries, ['SELECT 1']);
    assert.equal((await fetch(`${url}/health`)).status, 404);
    available = false;
    const failure = await fetch(`${url}/api/v1/health`);
    assert.equal(failure.status, 503);
    assert.deepEqual(await failure.json(), { status: 'error', database: 'down' });
  } finally {
    await app.close();
  }
});
