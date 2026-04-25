import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PatientCase } from '../patient-case/patient-case.entity';

@Entity('patient')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 191, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 30, nullable: true })
  phoneNumber!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'int', nullable: true })
  age!: number | null;

  @Column({ name: 'national_id', type: 'varchar', length: 100, unique: true, nullable: true })
  nationalId!: string | null;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl!: string | null;

  @OneToMany(() => PatientCase, (patientCase) => patientCase.patient)
  cases!: PatientCase[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
