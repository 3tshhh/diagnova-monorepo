import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { Icon, type IconName } from '../components/Icon';
import { createCase, getMyCases, uiScanTypeToCaseType } from '../api/cases';
import { mapCaseToScanRow } from '../api/view-models';
import { useAuthGuard } from '../api/useAuthGuard';

type StatCard = {
  label: string;
  value: number;
  icon: IconName;
  color: string;
  bg: string;
  border: string;
};

export function UploadPage() {
  useAuthGuard();

  const navigate = useNavigate();
  const [scanType, setScanType] = useState<'Lung X-Ray' | 'Bone Fracture'>('Lung X-Ray');
  const [file, setFile] = useState<File | null>(null);
  const [clinicDescription, setClinicDescription] = useState('');
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<StatCard[]>([]);

  const onFile = (f: File | undefined | null) => {
    if (f) setFile(f);
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const cases = await getMyCases();
        const rows = cases.map(mapCaseToScanRow);

        const totalScans = rows.length;
        const negativeScans = rows.filter((row) => row.resultLabel === 'Negative').length;
        const positiveScans = rows.filter((row) => row.resultLabel === 'Positive').length;

        setStats([
          {
            label: 'Total scans',
            value: totalScans,
            icon: 'activity',
            color: 'var(--accent)',
            bg: 'var(--accent-50)',
            border: 'var(--border-strong)',
          },
          {
            label: 'Negative',
            value: negativeScans,
            icon: 'check-circle-2',
            color: '#047857',
            bg: 'var(--success-50)',
            border: '#A7F3D0',
          },
          {
            label: 'Positive',
            value: positiveScans,
            icon: 'alert-circle',
            color: '#B45309',
            bg: '#FFFBEB',
            border: '#FDE68A',
          },
        ]);
      } catch {
        // Keep page usable even if stats fail.
        setStats([
          {
            label: 'Total scans',
            value: 0,
            icon: 'activity',
            color: 'var(--accent)',
            bg: 'var(--accent-50)',
            border: 'var(--border-strong)',
          },
          {
            label: 'Negative',
            value: 0,
            icon: 'check-circle-2',
            color: '#047857',
            bg: 'var(--success-50)',
            border: '#A7F3D0',
          },
          {
            label: 'Positive',
            value: 0,
            icon: 'alert-circle',
            color: '#B45309',
            bg: '#FFFBEB',
            border: '#FDE68A',
          },
        ]);
      }
    };

    void loadStats();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError('');
    setLoading(true);

    try {
      const created = await createCase({
        file,
        caseType: uiScanTypeToCaseType(scanType),
        clinicDescription,
      });

      navigate(`/app/results/${created.case_id}/${created.diagnosis_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create case';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="New analysis"
        title="Upload & scan"
        sub="Select a study type and upload an image. Analysis takes about 8 seconds."
      />

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}
        className="upload-stats"
      >
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: s.bg,
                  border: '1px solid ' + s.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={s.icon} size={16} color={s.color} />
              </div>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
            </div>
            <div
              className="mono"
              style={{
                fontSize: 32,
                fontWeight: 500,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 20 }}
        className="upload-grid"
      >
        <div className="card" style={{ padding: 28 }}>
          <label className="field-label">Scan type</label>
          <select
            className="select"
            value={scanType}
            onChange={(e) => setScanType(e.target.value as 'Lung X-Ray' | 'Bone Fracture')}
            style={{ marginBottom: 24 }}
          >
            <option>Lung X-Ray</option>
            <option>Bone Fracture</option>
          </select>

          <label className="field-label">Clinical description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
          <textarea
            className="input"
            rows={3}
            value={clinicDescription}
            onChange={(e) => setClinicDescription(e.target.value)}
            placeholder="e.g., persistent cough and fever for 3 days"
            style={{ marginBottom: 24, resize: 'vertical' }}
          />

          <label className="field-label">Image file</label>
          <div
            className={'dropzone' + (drag ? ' is-drag' : '')}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              onFile(e.dataTransfer.files[0]);
            }}
            onClick={() => document.getElementById('file-input')?.click()}
            style={{ padding: '48px 24px', textAlign: 'center', cursor: 'pointer' }}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {!file ? (
              <>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    margin: '0 auto 16px',
                    background: 'var(--accent-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-strong)',
                  }}
                >
                  <Icon name="upload-cloud" size={26} color="var(--accent)" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
                  Drop your image here, or <span style={{ color: 'var(--accent)' }}>browse</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>JPG, PNG, or DICOM · up to 25MB</div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center' }}>
                <div
                  className="xray-ph"
                  style={{
                    width: 64,
                    height: 80,
                    borderRadius: 6,
                    border: '1px solid var(--border-strong)',
                  }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{file.name}</div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {(file.size / 1024).toFixed(0)} KB · ready
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  <Icon name="x" size={14} /> Remove
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              background: '#FAFCFC',
              borderRadius: 10,
              border: '1px solid var(--border)',
            }}
          >
            <Icon name="lock" size={16} color="var(--accent)" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Images are encrypted in transit and processed in an isolated session.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <Link to="/app" className="btn btn-outline">
              Cancel
            </Link>
            {error && (
              <div
                style={{
                  marginRight: 'auto',
                  fontSize: 13,
                  color: 'var(--danger)',
                  background: 'var(--danger-50)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  maxWidth: 320,
                }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={!file || loading}
              className="btn btn-primary btn-lg"
              style={{
                opacity: !file || loading ? 0.6 : 1,
                cursor: !file || loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing...
                </>
              ) : (
                <>
                  Analyze <Icon name="sparkles" size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Tips
            </div>
            <ul
              style={{
                paddingLeft: 18,
                margin: 0,
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.7,
              }}
            >
              <li>Use the highest-resolution source available.</li>
              <li>Crop tightly to the region of interest.</li>
              <li>For chest X-ray, a PA view yields best results.</li>
              <li>Strip patient identifiers before upload.</li>
            </ul>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Selected model
            </div>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
              {scanType === 'Lung X-Ray' ? 'PulmoNet v3.1' : 'OssaNet v2.4'}
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {scanType === 'Lung X-Ray' ? '14 thoracic pathologies' : '11 fracture classifications'}
            </div>
          </div>
        </div>
      </form>

      {loading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 42, 40, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}
        >
          <div className="card fade-up" style={{ padding: '36px 48px', textAlign: 'center', maxWidth: 360 }}>
            <div className="spinner" style={{ margin: '0 auto 18px' }} />
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Analyzing your scan</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }} className="mono">
              {scanType === 'Lung X-Ray' ? 'PulmoNet v3.1' : 'OssaNet v2.4'} · processing
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 880px) { .upload-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) { .upload-stats { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
