import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { getCase, openDiagnosisStream, rerunDiagnosis } from '../api/cases';
import { diagnosisToResultLabel, getLatestDiagnosis } from '../api/view-models';
import { useAuthGuard } from '../api/useAuthGuard';
import type { DiagnosisResponse, PatientCaseResponse } from '../api/types';
import { buildReportHtml } from '../utils/reportTemplate';

function getStatusTone(resultLabel: ReturnType<typeof diagnosisToResultLabel>) {
  if (resultLabel === 'Negative') {
    return {
      badgeClass: 'badge-negative',
      dotColor: '#10B981',
      title: 'No acute findings detected',
      gradient: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 72%)',
    };
  }

  if (resultLabel === 'Pending') {
    return {
      badgeClass: 'badge-neutral',
      dotColor: 'var(--accent)',
      title: 'Analysis is still running',
      gradient: 'linear-gradient(135deg, #E6F4F2 0%, #FFFFFF 72%)',
    };
  }

  if (resultLabel === 'Failed') {
    return {
      badgeClass: 'badge-positive',
      dotColor: '#EF4444',
      title: 'Analysis could not be completed',
      gradient: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 72%)',
    };
  }

  return {
    badgeClass: 'badge-positive',
    dotColor: '#EF4444',
    title: 'Finding detected',
    gradient: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 72%)',
  };
}

export function ResultsPage() {
  useAuthGuard();

  const navigate = useNavigate();
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
        const message = err instanceof Error ? err.message : 'Unable to load case';
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
            setStreamError('Live updates disconnected. Refresh to check the latest result.');
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
  const tone = getStatusTone(resultLabel);
  const caseTypeLabel = patientCase?.caseType === 'lung' ? 'Lung X-Ray' : 'Bone Fracture';
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
      ? 'Your scan is still being analyzed. Live updates will appear here as soon as the diagnosis completes.'
      : currentDiagnosis?.status === 'failed'
        ? currentDiagnosis.finding || 'The diagnosis failed. Try rerunning the analysis.'
        : currentDiagnosis?.finding || 'Diagnosis completed without a textual finding.';

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
        setError('Unable to open report window. Allow pop-ups for this site and try again.');
        return;
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to export report';
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
      const message = err instanceof Error ? err.message : 'Unable to rerun analysis';
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
        <PageHeader eyebrow="Results" title="Case results" sub="Review AI findings and export the report." />
        <div className="card" style={{ padding: 24, color: 'var(--danger)' }}>
          {error || 'Case or diagnosis not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Results"
        title="Analysis report"
        sub={`${caseTypeLabel} / created ${createdDate}`}
        actions={
          <>
            <button type="button" onClick={() => void downloadReport()} className="btn btn-outline" disabled={exporting}>
              <Icon name="download" size={16} /> {exporting ? 'Exporting...' : 'Export report'}
            </button>
            <button type="button" onClick={() => void runAgain()} className="btn btn-primary" disabled={rerunning}>
              <Icon name="sparkles" size={16} /> {rerunning ? 'Rerunning...' : 'Rerun analysis'}
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
                  Diagnosis status
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: 24, letterSpacing: '-0.02em' }}>{tone.title}</h2>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
                  Case {patientCase.id.slice(0, 8)} is tied to diagnosis {currentDiagnosis.id.slice(0, 8)}.
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
              Clinical context
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, letterSpacing: '-0.015em' }}>Submitted notes</h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)' }}>
              {patientCase.clinicDescription || 'No clinical description was provided for this case.'}
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Source image
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
                alt={`${caseTypeLabel} source`}
                style={{ display: 'block', width: '100%', maxHeight: 520, objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Case details
            </div>
            <div style={{ display: 'grid', gap: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Case ID</span>
                <span className="mono">{patientCase.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Diagnosis ID</span>
                <span className="mono">{currentDiagnosis.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Study type</span>
                <span>{caseTypeLabel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Created</span>
                <span>{createdDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Backend status</span>
                <span className="mono">{currentDiagnosis.status}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Diagnosis history
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {patientCase.diagnoses.map((diagnosis) => {
                const itemLabel = diagnosisToResultLabel(diagnosis);
                const itemTone = getStatusTone(itemLabel);

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
                      {diagnosis.finding || (diagnosis.status === 'pending' ? 'Awaiting live result...' : 'No finding text available.')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Next steps
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/app/history" className="btn btn-outline" style={{ width: '100%' }}>
                <Icon name="history" size={16} /> Back to history
              </Link>
              <Link to="/app/upload" className="btn btn-primary" style={{ width: '100%' }}>
                <Icon name="plus" size={16} /> Start another scan
              </Link>
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
