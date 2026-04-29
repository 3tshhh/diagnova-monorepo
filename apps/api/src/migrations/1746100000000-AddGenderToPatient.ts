import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGenderToPatient1746100000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient" ADD COLUMN IF NOT EXISTS "gender" varchar(20) NOT NULL DEFAULT 'N/A'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN IF EXISTS "gender"`);
  }
}
