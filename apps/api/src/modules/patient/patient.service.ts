import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly dataSource: DataSource,
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
    gender?: string;
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
      gender: data.gender ?? 'N/A',
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

  async clearPhotoKey(id: string): Promise<void> {
    await this.patientRepository.update({ id }, { photoUrl: null });
  }

  findByIdWithCases(id: string): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { id }, relations: ['cases'] });
  }

  async deletePatientAccount(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `DELETE FROM diagnosis WHERE case_id IN (SELECT id FROM patient_case WHERE patient_id = $1)`,
        [id],
      );
      await manager.query(`DELETE FROM patient_case WHERE patient_id = $1`, [id]);
      await manager.query(`DELETE FROM patient WHERE id = $1`, [id]);
    });
  }

  async updateProfile(id: string, data: UpdateProfileDto): Promise<void> {
    await this.patientRepository.update(
      { id },
      {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.phoneNumber !== undefined
          ? { phoneNumber: data.phoneNumber }
          : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.age !== undefined ? { age: data.age } : {}),
        ...(data.nationalId !== undefined ? { nationalId: data.nationalId } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
      },
    );
  }
}
