import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PatientCase } from '../patient-case/patient-case.entity';
import { Diagnosis } from '../diagnosis/diagnosis.entity';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { SseService } from '../../sse/sse.service';
import { S3Service } from '../../config/s3.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientCase, Diagnosis]),
    HttpModule,
  ],
  providers: [CasesService, SseService, S3Service],
  controllers: [CasesController],
  exports: [CasesService, SseService, S3Service],
})
export class CasesModule {}
