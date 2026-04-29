import { apiRequest, getApiBaseUrl } from './client';
import { getAccessToken } from './session';
import { CaseType } from './types';
import type { CaseCreatedResponse, DiagnosisResponse, PatientCaseResponse } from './types';

export function uiScanTypeToCaseType(scanType: 'Lung X-Ray' | 'Bone Fracture'): CaseType {
  return scanType === 'Lung X-Ray' ? CaseType.LUNG : CaseType.BONE_FRACTURE;
}

export async function createCase(payload: {
  file: File;
  caseType: CaseType;
  clinicDescription?: string;
}): Promise<CaseCreatedResponse> {
  const formData = new FormData();
  formData.append('xray', payload.file);
  formData.append('case_type', payload.caseType);
  if (payload.clinicDescription) formData.append('clinic_description', payload.clinicDescription);

  return apiRequest<CaseCreatedResponse>('/cases', {
    method: 'POST',
    auth: 'access',
    body: formData,
  });
}

export async function getMyCases(): Promise<PatientCaseResponse[]> {
  return apiRequest<PatientCaseResponse[]>('/cases/my', {
    auth: 'access',
  });
}

export async function getCase(caseId: string): Promise<PatientCaseResponse> {
  return apiRequest<PatientCaseResponse>(`/cases/${caseId}`, {
    auth: 'access',
  });
}

export async function rerunDiagnosis(caseId: string): Promise<{ diagnosis_id: string; status: string }> {
  return apiRequest<{ diagnosis_id: string; status: string }>(`/cases/${caseId}/rerun`, {
    method: 'POST',
    auth: 'access',
  });
}

export async function exportCase(caseId: string): Promise<string> {
  return apiRequest<string>(`/cases/${caseId}/export`, {
    auth: 'access',
  });
}

export function openDiagnosisStream(params: {
  caseId: string;
  diagnosisId: string;
  onMessage: (diagnosis: Partial<DiagnosisResponse>) => void;
  onError?: () => void;
}): EventSource | null {
  const token = getAccessToken();
  if (!token) return null;

  const url = `${getApiBaseUrl()}/cases/${params.caseId}/stream/${params.diagnosisId}?token=${encodeURIComponent(token)}`;
  const source = new EventSource(url);

  source.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as Partial<DiagnosisResponse>;
      params.onMessage(parsed);
    } catch {
      // Keep stream open; malformed event should not break UI.
    }
  };

  source.onerror = () => {
    if (params.onError) params.onError();
  };

  return source;
}
