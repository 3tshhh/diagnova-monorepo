import { CaseType, DiagnosisStatus } from '../../../../../packages/shared-types/src/enums';

export type ApiAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type CaseCreatedResponse = {
  case_id: string;
  diagnosis_id: string;
  status: DiagnosisStatus;
};

export type DiagnosisResponse = {
  id: string;
  status: DiagnosisStatus;
  finding: string | null;
  createdAt: string;
};

export type PatientCaseResponse = {
  id: string;
  caseType: CaseType;
  clinicDescription: string | null;
  xrayUrl: string;
  diagnoses: DiagnosisResponse[];
  createdAt: string;
  patient?: {
    fullName: string | null;
    email: string;
    age: number | null;
  };
};

export type PatientProfile = {
  id: string;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  age: number | null;
  nationalId: string | null;
  photoUrl: string | null;
  createdAt: string;
};

export { CaseType, DiagnosisStatus };
