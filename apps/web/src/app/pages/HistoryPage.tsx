import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { Icon } from '../components/Icon';
import { getMyCases } from '../api/cases';
import { mapCaseToScanRow } from '../api/view-models';
import type { ScanRow } from '../api/view-models';
import { useAuthGuard } from '../api/useAuthGuard';

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 8, borderRadius: 999, background: '#EEF4F3', overflow: 'hidden' }}>
      <div
        style={{
          width: pct + '%',
          height: '100%',
          borderRadius: 999,
          background: color,
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}

function AnalyticsDashboard(props: {
  total: number;
  negativeCount: number;
  negPct: number;
  posPct: number;
  lungPct: number;
  bonePct: number;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>Analytics dashboard</h2>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Last 30 days
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="analytics-grid">
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--accent-50)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="pie-chart" size={16} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>Results distribution</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: 'var(--text)' }}>Negative results</span>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>
                  {props.negPct}%
                </span>
              </div>
              <ProgressBar pct={props.negPct} color="var(--success)" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: 'var(--text)' }}>Positive results</span>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>
                  {props.posPct}%
                </span>
              </div>
              <ProgressBar pct={props.posPct} color="var(--danger)" />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--accent-50)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="bar-chart-3" size={16} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>Scan types</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: 'var(--text)' }}>Lung X-Ray</span>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>
                  {props.lungPct}%
                </span>
              </div>
              <ProgressBar pct={props.lungPct} color="var(--accent)" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: 'var(--text)' }}>Bone fracture</span>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>
                  {props.bonePct}%
                </span>
              </div>
              <ProgressBar pct={props.bonePct} color="var(--primary)" />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--accent-50)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="trending-up" size={16} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>Monthly statistics</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div
              style={{
                padding: '12px 14px',
                background: '#FAFCFC',
                border: '1px solid var(--border)',
                borderRadius: 10,
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  color: 'var(--primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {props.total}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Total scans this month</div>
            </div>
            <div
              style={{
                padding: '12px 14px',
                background: 'var(--success-50)',
                border: '1px solid #A7F3D0',
                borderRadius: 10,
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  color: '#047857',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {props.negativeCount}
              </div>
              <div style={{ fontSize: 12, color: '#047857', marginTop: 6 }}>Negative results</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 980px) { .analytics-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 640px) { .analytics-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

export function HistoryPage() {
  useAuthGuard();

  const [filter, setFilter] = useState<'All' | 'Lung X-Ray' | 'Bone Fracture'>('All');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCases = async () => {
      try {
        const cases = await getMyCases();
        setRows(cases.map(mapCaseToScanRow));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load case history';
        setError(message);
      }
    };

    void loadCases();
  }, []);

  const total = rows.length;
  const negativeCount = rows.filter((s) => s.resultLabel === 'Negative').length;
  const positiveCount = rows.filter((s) => s.resultLabel === 'Positive').length;
  const negPct = total ? Math.round((negativeCount / total) * 100) : 0;
  const posPct = total ? Math.round((positiveCount / total) * 100) : 0;
  const lungCount = rows.filter((s) => s.typeLabel === 'Lung X-Ray').length;
  const bonePct = total ? Math.round(((total - lungCount) / total) * 100) : 0;
  const lungPct = total ? Math.round((lungCount / total) * 100) : 0;

  const filtered = useMemo(() => {
    const byType = filter === 'All' ? rows : rows.filter((s) => s.typeLabel === filter);
    if (!search.trim()) return byType;

    const keyword = search.trim().toLowerCase();
    return byType.filter((row) => row.id.toLowerCase().includes(keyword) || row.detail.toLowerCase().includes(keyword));
  }, [filter, rows, search]);

  const getBadgeClass = (resultLabel: ScanRow['resultLabel']) => {
    if (resultLabel === 'Positive' || resultLabel === 'Failed') return 'badge-positive';
    if (resultLabel === 'Pending') return 'badge-neutral';
    return 'badge-negative';
  };

  const getBadgeDotColor = (resultLabel: ScanRow['resultLabel']) => {
    if (resultLabel === 'Positive' || resultLabel === 'Failed') return '#EF4444';
    if (resultLabel === 'Pending') return 'var(--accent)';
    return '#10B981';
  };

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Studies"
        title="Scan history"
        sub={`${total} studies on record`}
        actions={
          <Link to="/app/upload" className="btn btn-primary">
            <Icon name="plus" size={16} /> New scan
          </Link>
        }
      />

      <AnalyticsDashboard
        total={total}
        negativeCount={negativeCount}
        negPct={negPct}
        posPct={posPct}
        lungPct={lungPct}
        bonePct={bonePct}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['All', 'Lung X-Ray', 'Bone Fracture'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={'btn btn-sm ' + (filter === f ? 'btn-primary' : 'btn-outline')}
          >
            {f}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <Icon
            name="search"
            size={15}
            color="var(--text-subtle)"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            className="input"
            placeholder="Search by ID..."
            style={{ paddingLeft: 36, width: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {error && (
          <div style={{ padding: 16, color: 'var(--danger)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <table className="tbl">
          <thead>
            <tr>
              <th>Scan type</th>
              <th>Date</th>
              <th>Diagnosis</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.caseId}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: 'var(--accent-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-strong)',
                      }}
                    >
                      <Icon name={s.typeLabel === 'Lung X-Ray' ? 'wind' : 'bone'} size={16} color="var(--accent)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{s.typeLabel}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        {s.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="mono" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {s.date}
                </td>
                <td>
                    <div>
                    <span className={'badge ' + getBadgeClass(s.resultLabel)} style={{ marginBottom: 4 }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background: getBadgeDotColor(s.resultLabel),
                        }}
                      />
                      {s.resultLabel}
                    </span>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.detail}</div>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link to={s.diagnosisId ? `/app/results/${s.caseId}/${s.diagnosisId}` : '/app/history'} className="btn btn-outline btn-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
