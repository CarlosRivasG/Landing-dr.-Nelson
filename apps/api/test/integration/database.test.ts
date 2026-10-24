import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { configureApplication } from '../../src/bootstrap';
import { readEnvironment } from '../../src/config/environment';

test('health responde con PostgreSQL real disponible', async () => {
  // Usa variables del entorno explícitas; no lee una DB de producción por defecto.
  assert.equal(process.env.NODE_ENV, 'test', 'Ejecutar sólo contra una DB de pruebas con NODE_ENV=test');
  const app = await NestFactory.create(AppModule.register(readEnvironment(process.env)), { logger: false });
  configureApplication(app);
  try {
    await app.listen(0, '127.0.0.1');
    const response = await fetch(`${await app.getUrl()}/api/v1/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok', database: 'up' });
  } finally {
    await app.close();
  }
});
