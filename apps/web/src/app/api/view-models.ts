import type { DiagnosisResponse, PatientCaseResponse } from './types';

export type ScanRow = {
  id: string;
  typeLabel: 'Lung X-Ray' | 'Bone Fracture';
  date: string;
  resultLabel: 'Positive' | 'Negative' | 'Pending' | 'Failed';
  detail: string;
  caseId: string;
  diagnosisId: string | null;
};

export function getLatestDiagnosis(patientCase: PatientCaseResponse): DiagnosisResponse | null {
  if (!patientCase.diagnoses.length) return null;
  return [...patientCase.diagnoses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
}

function findingLooksNegative(finding: string): boolean {
  const value = finding.toLowerCase();
  return value.includes('no acute') || value.includes('negative') || value.includes('no fracture') || value.includes('clear');
}

export function diagnosisToResultLabel(diagnosis: DiagnosisResponse | null): ScanRow['resultLabel'] {
  if (!diagnosis) return 'Pending';
  if (diagnosis.status === 'pending') return 'Pending';
  if (diagnosis.status === 'failed') return 'Failed';
  if (!diagnosis.finding) return 'Positive';
  return findingLooksNegative(diagnosis.finding) ? 'Negative' : 'Positive';
}

export function mapCaseToScanRow(patientCase: PatientCaseResponse): ScanRow {
  const latest = getLatestDiagnosis(patientCase);
  const typeLabel = patientCase.caseType === 'lung' ? 'Lung X-Ray' : 'Bone Fracture';

  return {
    id: patientCase.id,
    typeLabel,
    date: new Date(patientCase.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    resultLabel: diagnosisToResultLabel(latest),
    detail: latest?.finding ?? patientCase.clinicDescription,
    caseId: patientCase.id,
    diagnosisId: latest?.id ?? null,
  };
}
