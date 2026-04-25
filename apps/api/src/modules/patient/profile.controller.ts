import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../../shared/guards';
import { CurrentPatient } from '../../shared/decorators';
import { Patient } from './patient.entity';
import { PatientService } from './patient.service';
import { S3Service } from '../../config/s3.config';
import { createS3Storage } from '../../config/s3.config';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly patientService: PatientService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getProfile(@CurrentPatient() patient: Patient) {
    const data = await this.patientService.findById(patient.id);
    if (!data) throw new BadRequestException('Patient not found');

    // Attach a presigned URL for the photo if one exists
    const photoUrl = data.photoUrl
      ? await this.s3Service.getPresignedUrl(data.photoUrl)
      : null;

    return {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      age: data.age,
      nationalId: data.nationalId,
      photoUrl,
      createdAt: data.createdAt,
    };
  }

  @Post('photo')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: createS3Storage(new ConfigService(), 'avatars'),
    }),
  )
  async uploadPhoto(
    @UploadedFile() file: Express.MulterS3.File,
    @CurrentPatient() patient: Patient,
  ) {
    if (!file) throw new BadRequestException('photo file is required');

    await this.patientService.updatePhotoKey(patient.id, file.key);

    const presignedUrl = await this.s3Service.getPresignedUrl(file.key);

    return {
      message: 'Photo uploaded successfully',
      photoUrl: presignedUrl,
    };
  }
}
