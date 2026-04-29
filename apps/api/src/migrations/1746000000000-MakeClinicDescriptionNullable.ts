import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeClinicDescriptionNullable1746000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient_case" ALTER COLUMN "clinic_description" DROP NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "patient_case" SET "clinic_description" = '' WHERE "clinic_description" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_case" ALTER COLUMN "clinic_description" SET NOT NULL`,
    );
  }
}
