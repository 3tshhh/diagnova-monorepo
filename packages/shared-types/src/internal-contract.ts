import { CaseType } from './enums';

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
