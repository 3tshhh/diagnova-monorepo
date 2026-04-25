import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diagnosis } from './diagnosis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Diagnosis])],
})
export class DiagnosisModule {}
