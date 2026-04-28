import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { Icon } from '../components/Icon';
import { getMyCases } from '../api/cases';
import { getProfile } from '../api/profile';
import { mapCaseToScanRow } from '../api/view-models';
import type { ScanRow } from '../api/view-models';
import { useAuthGuard } from '../api/useAuthGuard';

export function HomePage() {
  useAuthGuard();

  const [rows, setRows] = useState<ScanRow[]>([]);
  const [displayName, setDisplayName] = useState('Patient');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCases = async () => {
      try {
        const [cases, profile] = await Promise.all([getMyCases(), getProfile()]);
        setRows(cases.map(mapCaseToScanRow));
        const label = profile.fullName?.trim() || profile.email;
        setDisplayName(label.split(/\s+/)[0] || 'Patient');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load cases';
        setError(message);
      }
    };

    void loadCases();
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const positive = rows.filter((row) => row.resultLabel === 'Positive').length;
    const pending = rows.filter((row) => row.resultLabel === 'Pending').length;
    const recentWeek = rows.filter((row) => {
      const ageMs = Date.now() - new Date(row.date).getTime();
      return ageMs < 7 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      recentWeek,
      total,
      positive,
      pending,
    };
  }, [rows]);

  const recent = rows.slice(0, 5);
  const todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

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
        eyebrow={`Workspace / ${todayLabel}`}
        title={`Welcome back, ${displayName}.`}
        sub={`You have ${stats.recentWeek} scans from this week. Start a new analysis or review history.`}
        actions={
          <Link to="/app/upload" className="btn btn-primary">
            <Icon name="plus" size={16} /> New scan
          </Link>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <Link
          to="/app/upload"
          className="card"
          style={{
            padding: 24,
            display: 'block',
            cursor: 'pointer',
            color: 'inherit',
            position: 'relative',
            overflow: 'hidden',
            borderColor: 'var(--border-strong)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              marginBottom: 16,
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="upload-cloud" size={22} color="#fff" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 6px' }}>
            Start new scan
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0, lineHeight: 1.55 }}>
            Upload a chest X-ray or skeletal radiograph for AI analysis.
          </p>
          <Icon
            name="arrow-up-right"
            size={18}
            color="var(--text-subtle)"
            style={{ position: 'absolute', top: 24, right: 24 }}
          />
        </Link>
        <Link
          to="/app/history"
          className="card"
          style={{
            padding: 24,
            display: 'block',
            cursor: 'pointer',
            color: 'inherit',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              marginBottom: 16,
              background: 'var(--accent-50)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-strong)',
            }}
          >
            <Icon name="history" size={22} color="var(--accent)" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 6px' }}>
            View history
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0, lineHeight: 1.55 }}>
            Browse and re-export reports from prior studies.
          </p>
          <Icon
            name="arrow-up-right"
            size={18}
            color="var(--text-subtle)"
            style={{ position: 'absolute', top: 24, right: 24 }}
          />
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 0,
          marginBottom: 32,
          border: '1px solid var(--border)',
          borderRadius: 14,
          background: 'var(--surface)',
          overflow: 'hidden',
        }}
      >
        {(
          [
            ['This week', String(stats.recentWeek), 'scans run'],
            ['Positive findings', String(stats.positive), `${stats.total ? Math.round((stats.positive / stats.total) * 100) : 0}% of total`],
            ['Total scans', String(stats.total), 'all studies'],
            ['Pending review', String(stats.pending), 'awaiting sign-off'],
          ] as const
        ).map((s, i) => (
          <div
            key={s[0]}
            style={{ padding: '20px 24px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}
          >
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
              className="mono"
            >
              {s[0]}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span
                style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}
                className="mono"
              >
                {s[1]}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s[2]}</span>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 14,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>Recent scans</h2>
        <Link to="/app/history" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          View all <Icon name="arrow-right" size={14} />
        </Link>
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
              <th>Type</th>
              <th>Date</th>
              <th>Result</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((s) => (
              <tr key={s.caseId}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--accent-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-strong)',
                      }}
                    >
                      <Icon name={s.typeLabel === 'Lung X-Ray' ? 'wind' : 'bone'} size={15} color="var(--accent)" />
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
                  <span className={'badge ' + getBadgeClass(s.resultLabel)}>
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
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link
                    to={s.diagnosisId ? `/app/results/${s.caseId}/${s.diagnosisId}` : '/app/history'}
                    className="btn btn-ghost btn-sm"
                  >
                    View report <Icon name="arrow-right" size={14} />
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
