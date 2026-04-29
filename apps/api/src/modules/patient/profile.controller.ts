import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Patch,
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
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly patientService: PatientService,
    private readonly s3Service: S3Service,
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
      gender: data.gender,
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

  @Patch('photo')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: createS3Storage(new ConfigService(), 'avatars'),
    }),
  )
  async updatePhoto(
    @UploadedFile() file: Express.MulterS3.File,
    @CurrentPatient() patient: Patient,
  ) {
    if (!file) throw new BadRequestException('photo file is required');
    await this.s3Service.deleteObject(patient.photoUrl!);
    await this.patientService.clearPhotoKey(patient.id);

    await this.patientService.updatePhotoKey(patient.id, file.key);

    const presignedUrl = await this.s3Service.getPresignedUrl(file.key);

    return {
      message: 'Photo uploaded successfully',
      photoUrl: presignedUrl,
    };
  }

  @Delete('photo')
  @UseGuards(AuthGuard)
  async deletePhoto(@CurrentPatient() patient: Patient) {
    const data = await this.patientService.findById(patient.id);
    if (!data) throw new BadRequestException('Patient not found');
    if (!data.photoUrl) throw new BadRequestException('No profile photo to remove');

    await this.s3Service.deleteObject(data.photoUrl);
    await this.patientService.clearPhotoKey(patient.id);

    return {
      message: 'Photo removed successfully',
      photoUrl: null,
    };
  }

  @Patch()
  @UseGuards(AuthGuard)
  async updateProfile(
    @CurrentPatient() patient: Patient,
    @Body() dto: UpdateProfileDto,
  ) {
    await this.patientService.updateProfile(patient.id, dto);

    const data = await this.patientService.findById(patient.id);
    if (!data) throw new BadRequestException('Patient not found');

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
      gender: data.gender,
      photoUrl,
      createdAt: data.createdAt,
    };
  }
}
