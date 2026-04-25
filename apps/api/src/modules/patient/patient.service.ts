import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  findById(id: string): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { email } });
  }

  createPatient(data: {
    email: string;
    passwordHash: string;
    // kept for backward compat with auth module (combined into fullName)
    firstName?: string;
    lastName?: string;
    // direct fields for future profile creation
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    age?: number;
    nationalId?: string;
    photoUrl?: string;
  }) {
    const derivedFullName =
      data.fullName ||
      ([data.firstName, data.lastName].filter(Boolean).join(' ') || null);

    const patient = this.patientRepository.create({
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: derivedFullName,
      phoneNumber: data.phoneNumber ?? null,
      address: data.address ?? null,
      age: data.age ?? null,
      nationalId: data.nationalId ?? null,
      photoUrl: data.photoUrl ?? null,
    });
    return this.patientRepository.save(patient);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.patientRepository.update({ id }, { passwordHash });
  }

  async updatePhotoKey(id: string, photoKey: string): Promise<void> {
    await this.patientRepository.update({ id }, { photoUrl: photoKey });
  }
}
