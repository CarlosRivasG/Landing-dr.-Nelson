import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Verifica el circuito de migraciones sin crear un esquema de negocio. */
export class InfrastructureBaseline1792195200000 implements MigrationInterface {
  name = 'InfrastructureBaseline1792195200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SELECT 1');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SELECT 1');
  }
}
