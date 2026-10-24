import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import type { Environment } from '../config/environment';

export function databaseOptions(environment: Environment): DataSourceOptions {
  return {
    type: 'postgres',
    ...environment.database,
    synchronize: false,
    migrationsRun: false,
    logging: false,
    entities: [join(__dirname, '../modules/**/*.entity.js')],
    migrations: [join(__dirname, 'migrations/*.js')],
    migrationsTableName: 'infrastructure_migrations',
    connectTimeoutMS: 3000,
    extra: { max: 4, connectionTimeoutMillis: 3000, statement_timeout: 2000, query_timeout: 3000 },
  };
}
