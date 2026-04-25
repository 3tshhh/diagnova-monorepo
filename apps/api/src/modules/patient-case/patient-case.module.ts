import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientCase } from './patient-case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientCase])],
})
export class PatientCaseModule {}
