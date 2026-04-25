import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Patient } from '../patient/patient.entity';
import { Diagnosis } from '../diagnosis/diagnosis.entity';
import { CaseType } from '@diagnova/shared-types';

export { CaseType };


@Entity('patient_case')
export class PatientCase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Patient, (patient) => patient.cases, { nullable: false })
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @Column({ name: 'case_type', type: 'enum', enum: CaseType })
  caseType!: CaseType;

  @Column({ name: 'clinic_description', type: 'text' })
  clinicDescription!: string;

  @Column({ name: 'xray_url', type: 'varchar', length: 500 })
  xrayUrl!: string;

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.patientCase)
  diagnoses!: Diagnosis[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
