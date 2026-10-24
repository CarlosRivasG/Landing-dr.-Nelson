import 'reflect-metadata';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApplication } from './bootstrap';
import { readEnvironment } from './config/environment';

async function bootstrap(): Promise<void> {
  config({ path: resolve(__dirname, '../../../.env'), quiet: true });
  const environment = readEnvironment(process.env);
  const app = await NestFactory.create(AppModule.register(environment));
  configureApplication(app);
  await app.listen(environment.apiPort, environment.apiHost);
}

void bootstrap().catch(() => {
  console.error('No fue posible iniciar la API. Revisa las variables y la disponibilidad de PostgreSQL.');
  process.exitCode = 1;
});
