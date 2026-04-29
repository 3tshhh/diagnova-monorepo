import { CaseType, DiagnosisStatus } from './enums';

export interface CreateCasePayload {
  case_type: CaseType;
  clinic_description?: string;
}

export interface CaseCreatedResponse {
  case_id: string;
  diagnosis_id: string;
  status: DiagnosisStatus;
}

export interface DiagnosisResponse {
  id: string;
  status: DiagnosisStatus;
  finding: string | null;
  createdAt: string;
}

export interface PatientCaseResponse {
  id: string;
  caseType: CaseType;
  clinicDescription: string | null;
  xrayUrl: string;
  diagnoses: DiagnosisResponse[];
  createdAt: string;
}
