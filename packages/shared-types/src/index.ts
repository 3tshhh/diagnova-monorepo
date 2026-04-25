// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

export enum CaseType {
  LUNG = 'lung',
  BONE_FRACTURE = 'bone_fracture',
}

export enum DiagnosisStatus {
  PENDING = 'pending',
  DONE = 'done',
  FAILED = 'failed',
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

// ──────────────────────────────────────────────
// Patient / Profile
// ──────────────────────────────────────────────

export interface PatientProfile {
  id: string;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  age: number | null;
  nationalId: string | null;
  photoUrl: string | null;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Cases
// ──────────────────────────────────────────────

export interface CreateCasePayload {
  case_type: CaseType;
  clinic_description: string;
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
  clinicDescription: string;
  xrayUrl: string;
  diagnoses: DiagnosisResponse[];
  createdAt: string;
}

// ──────────────────────────────────────────────
// FastAPI ↔ Nest internal contract
// ──────────────────────────────────────────────

export interface AnalyzeRequest {
  diagnosis_id: string;
  case_type: CaseType;
  image_url: string;
  callback_url: string;
}

export interface DiagnosisCompletePayload {
  finding?: string;
  error?: string;
}

// ──────────────────────────────────────────────
// Upload
// ──────────────────────────────────────────────

export interface UploadPhotoResponse {
  message: string;
  photoUrl: string;
}
