import type { DiagnosisResponse, PatientCaseResponse } from './types';
import i18n from '../../i18n';

export type ScanRow = {
  id: string;
  typeLabel: string;
  date: string;
  resultLabel: string;
  detail: string;
  caseId: string;
  diagnosisId: string | null;
};

export function getLatestDiagnosis(patientCase: PatientCaseResponse): DiagnosisResponse | null {
  if (!patientCase.diagnoses.length) return null;
  return [...patientCase.diagnoses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
}

function isNoFinding(finding: string): boolean {
  return finding.toLowerCase().trim().startsWith('no finding');
}

export function diagnosisToResultLabel(diagnosis: DiagnosisResponse | null): ScanRow['resultLabel'] {
  const t = i18n.t.bind(i18n);
  if (!diagnosis) return t('common.resultLabels.pending');
  if (diagnosis.status === 'pending') return t('common.resultLabels.pending');
  if (diagnosis.status === 'failed') return t('common.resultLabels.failed');
  if (!diagnosis.finding) return t('common.resultLabels.pending');
  return isNoFinding(diagnosis.finding) ? t('common.resultLabels.negative') : t('common.resultLabels.positive');
}

export function mapCaseToScanRow(patientCase: PatientCaseResponse): ScanRow {
  const t = i18n.t.bind(i18n);
  const latest = getLatestDiagnosis(patientCase);
  const typeLabel = patientCase.caseType === 'lung' ? t('common.scanTypes.lung') : t('common.scanTypes.bone');

  return {
    id: patientCase.id,
    typeLabel,
    date: new Date(patientCase.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    resultLabel: diagnosisToResultLabel(latest),
    detail: latest?.finding ?? patientCase.clinicDescription ?? '',
    caseId: patientCase.id,
    diagnosisId: latest?.id ?? null,
  };
}
