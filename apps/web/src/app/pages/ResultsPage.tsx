import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { LangLink, useLangNavigate } from '../hooks/useLang';
import { getCase, openDiagnosisStream, rerunDiagnosis } from '../api/cases';
import { diagnosisToResultLabel, getLatestDiagnosis } from '../api/view-models';
import { useAuthGuard } from '../api/useAuthGuard';
import type { DiagnosisResponse, PatientCaseResponse } from '../api/types';
import { buildReportHtml } from '../utils/reportTemplate';
import { useTranslation } from 'react-i18next';

function getStatusTone(resultLabel: ReturnType<typeof diagnosisToResultLabel>, t: ReturnType<typeof useTranslation>['t'] ) {

  if (resultLabel === t('common.resultLabels.negative')) {
    return {
      badgeClass: 'badge-negative',
      dotColor: '#10B981',
      title: t('results.statusTitles.negative'),
      gradient: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 72%)',
    };
  }

  if (resultLabel === t('common.resultLabels.pending')) {
    return {
      badgeClass: 'badge-neutral',
      dotColor: 'var(--accent)',
      title: t('results.statusTitles.pending'),
      gradient: 'linear-gradient(135deg, #E6F4F2 0%, #FFFFFF 72%)',
    };
  }

  if (resultLabel === t('common.resultLabels.failed')) {
    return {
      badgeClass: 'badge-positive',
      dotColor: '#EF4444',
      title: t('results.statusTitles.failed'),
      gradient: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 72%)',
    };
  }

  return {
    badgeClass: 'badge-positive',
    dotColor: '#EF4444',
    title: t('results.statusTitles.positive'),
    gradient: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 72%)',
  };
}

export function ResultsPage() {
  const { t } = useTranslation();
  useAuthGuard();

  const navigate = useLangNavigate();
  const { caseId = '', diagnosisId = '' } = useParams();
  const [patientCase, setPatientCase] = useState<PatientCaseResponse | null>(null);
  const [activeDiagnosisId, setActiveDiagnosisId] = useState(diagnosisId);
  const [streamError, setStreamError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [rerunning, setRerunning] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setActiveDiagnosisId(diagnosisId);
  }, [diagnosisId]);

  useEffect(() => {
    const loadCase = async () => {
      if (!caseId) return;

      try {
        const data = await getCase(caseId);
        setPatientCase(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : t('errors.unableToLoadCase');
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadCase();
  }, [caseId]);

  const currentDiagnosis = useMemo(() => {
    if (!patientCase) return null;
    return patientCase.diagnoses.find((item) => item.id === activeDiagnosisId) ?? getLatestDiagnosis(patientCase);
  }, [activeDiagnosisId, patientCase]);

  useEffect(() => {
    if (!caseId || !activeDiagnosisId || !currentDiagnosis || currentDiagnosis.status !== 'pending') return;

    const source = openDiagnosisStream({
      caseId,
      diagnosisId: activeDiagnosisId,
      onMessage: (partial) => {
        setPatientCase((current) => {
          if (!current) return current;

          return {
            ...current,
            diagnoses: current.diagnoses.map((item) =>
              item.id === activeDiagnosisId ? ({ ...item, ...partial } as DiagnosisResponse) : item,
            ),
          };
        });
      },
      onError: () => {
        setPatientCase((current) => {
          const diagnosis = current?.diagnoses.find((d) => d.id === activeDiagnosisId);
          if (diagnosis && diagnosis.status === 'pending') {
            setStreamError(t('errors.liveUpdatesDisconnected'));
          }
          return current;
        });
      },
    });

    return () => {
      source?.close();
    };
  }, [activeDiagnosisId, caseId, currentDiagnosis]);

  const resultLabel = diagnosisToResultLabel(currentDiagnosis);
  const tone = getStatusTone(resultLabel, t);
  const caseTypeLabel = patientCase?.caseType === 'lung' ? t('common.scanTypes.lung') : t('common.scanTypes.bone');
  const createdDate = patientCase
    ? new Date(patientCase.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  const narrative =
    currentDiagnosis?.status === 'pending'
      ? t('results.narratives.pending')
      : currentDiagnosis?.status === 'failed'
        ? currentDiagnosis.finding || t('results.narratives.failed')
        : currentDiagnosis?.finding || t('results.narratives.empty');

  const downloadReport = async () => {
    if (!patientCase || !currentDiagnosis) return;

    setExporting(true);
    setError('');

    try {
      const html = await buildReportHtml(patientCase, activeDiagnosisId);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (!win) {
        URL.revokeObjectURL(blobUrl);
        setError(t('errors.unableToOpenReport'));
        return;
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.unableToExportReport');
      setError(message);
    } finally {
      setExporting(false);
    }
  };

  const runAgain = async () => {
    if (!caseId) return;

    setRerunning(true);
    setError('');
    setStreamError('');

    try {
      const response = await rerunDiagnosis(caseId);
      setActiveDiagnosisId(response.diagnosis_id);
      const refreshed = await getCase(caseId);
      setPatientCase(refreshed);
      navigate(`/app/results/${caseId}/${response.diagnosis_id}`, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.unableToRerunAnalysis');
      setError(message);
    } finally {
      setRerunning(false);
    }
  };

  if (loading) {
    return (
      <div className="fade-up" style={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!patientCase || !currentDiagnosis) {
    return (
      <div className="fade-up">
        <PageHeader eyebrow={t('results.eyebrow')} title={t('results.caseResultsTitle')} sub={t('results.caseResultsSub')} />
        <div className="card" style={{ padding: 24, color: 'var(--danger)' }}>
          {error || t('errors.caseOrDiagnosisNotFound')}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow={t('results.eyebrow')}
        title={t('results.reportTitle')}
        sub={t('results.createdSub', { caseType: caseTypeLabel, date: createdDate })}
        actions={
          <>
            <button type="button" onClick={() => void downloadReport()} className="btn btn-outline" disabled={exporting}>
              <Icon name="download" size={16} /> {exporting ? t('common.actions.exporting') : t('common.actions.exportReport')}
            </button>
            <button type="button" onClick={() => void runAgain()} className="btn btn-primary" disabled={rerunning}>
              <Icon name="sparkles" size={16} /> {rerunning ? t('common.actions.rerunning') : t('common.actions.rerunAnalysis')}
            </button>
          </>
        }
      />

      {(error || streamError) && (
        <div
          style={{
            marginBottom: 16,
            fontSize: 13,
            color: 'var(--danger)',
            background: 'var(--danger-50)',
            padding: '10px 12px',
            borderRadius: 10,
          }}
        >
          {error || streamError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) 360px', gap: 20 }} className="results-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24, background: tone.gradient }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  {t('results.statusEyebrow')}
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: 24, letterSpacing: '-0.02em' }}>{tone.title}</h2>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
                  {t('results.statusDescription', { caseId: patientCase.id.slice(0, 8), diagnosisId: currentDiagnosis.id.slice(0, 8) })}
                </p>
              </div>
              <span className={`badge ${tone.badgeClass}`}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: tone.dotColor,
                  }}
                />
                {resultLabel}
              </span>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.82)',
                border: '1px solid var(--border)',
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--text)',
              }}
            >
              {narrative}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {t('results.clinicalContext')}
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, letterSpacing: '-0.015em' }}>{t('results.submittedNotes')}</h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)' }}>
              {patientCase.clinicDescription || t('results.noClinicalDescription')}
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {t('results.sourceImage')}
            </div>
            <div
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: '#F6FAFA',
              }}
            >
              <img
                src={patientCase.xrayUrl}
                alt={t('results.sourceImageAlt', { caseType: caseTypeLabel })}
                style={{ display: 'block', width: '100%', maxHeight: 520, objectFit: 'contain' }}
              />
            </div>
          </div>
        </div> 

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {t('results.caseDetails')}
            </div>
            <div style={{ display: 'grid', gap: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('results.caseId')}</span>
                <span className="mono">{patientCase.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('results.diagnosisId')}</span>
                <span className="mono">{currentDiagnosis.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('results.studyType')}</span>
                <span>{caseTypeLabel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('results.created')}</span>
                <span>{createdDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('results.backendStatus')}</span>
                <span className="mono">{currentDiagnosis.status}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {t('results.diagnosisHistory')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {patientCase.diagnoses.map((diagnosis) => {
                const itemLabel = diagnosisToResultLabel(diagnosis);
                const itemTone = getStatusTone(itemLabel, t);

                return (
                  <div
                    key={diagnosis.id}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: diagnosis.id === currentDiagnosis.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: diagnosis.id === currentDiagnosis.id ? 'var(--accent-50)' : '#FAFCFC',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                      <span className={`badge ${itemTone.badgeClass}`}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: itemTone.dotColor,
                          }}
                        />
                        {itemLabel}
                      </span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        {new Date(diagnosis.createdAt).toLocaleString('en-US')}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {diagnosis.finding || (diagnosis.status === 'pending' ? t('results.awaitingLiveResult') : t('results.noFindingText'))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {t('results.nextSteps')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <LangLink to="/app/history" className="btn btn-outline" style={{ width: '100%' }}>
                <Icon name="history" size={16} /> {t('common.actions.backToHistory')}
              </LangLink>
              <LangLink to="/app/upload" className="btn btn-primary" style={{ width: '100%' }}>
                <Icon name="plus" size={16} /> {t('common.actions.startAnotherScan')}
              </LangLink>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) { .results-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
