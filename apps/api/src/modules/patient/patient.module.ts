import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './patient.entity';
import { PatientService } from './patient.service';
import { ProfileController } from './profile.controller';
import { S3Service } from '../../config/s3.config';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Patient])],
  providers: [PatientService, S3Service],
  controllers: [ProfileController],
  exports: [PatientService, S3Service],
})
export class PatientModule {}
