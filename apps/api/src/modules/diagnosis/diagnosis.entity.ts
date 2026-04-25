import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PatientCase } from '../patient-case/patient-case.entity';
import { DiagnosisStatus } from '@diagnova/shared-types';

export { DiagnosisStatus };


@Entity('diagnosis')
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PatientCase, (patientCase) => patientCase.diagnoses, {
    nullable: false,
  })
  @JoinColumn({ name: 'case_id' })
  patientCase!: PatientCase;

  @Column({
    type: 'enum',
    enum: DiagnosisStatus,
    default: DiagnosisStatus.PENDING,
  })
  status!: DiagnosisStatus;

  @Column({ type: 'text', nullable: true })
  finding!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
