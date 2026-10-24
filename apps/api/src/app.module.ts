import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { Environment } from './config/environment';
import { databaseOptions } from './database/options';
import { HealthModule } from './modules/health/health.module';

@Module({})
export class AppModule {
  static register(environment: Environment): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypeOrmModule.forRoot({ ...databaseOptions(environment), retryAttempts: 1 }),
        HealthModule,
      ],
    };
  }
}
