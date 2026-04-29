import { diagnosisToResultLabel } from '../api/view-models';
import type { DiagnosisResponse, PatientCaseResponse } from '../api/types';

type Tone = {
  badgeClass: string;
  dotColor: string;
  title: string;
  gradient: string;
  label: string;
};

function getTone(diagnosis: DiagnosisResponse | null): Tone {
  const label = diagnosisToResultLabel(diagnosis);
  switch (label) {
    case 'Negative':
      return {
        badgeClass: 'badge-negative',
        dotColor: '#10B981',
        title: 'No acute findings detected',
        gradient: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 72%)',
        label: 'Negative',
      };
    case 'Pending':
      return {
        badgeClass: 'badge-neutral',
        dotColor: '#0D9488',
        title: 'Analysis is still running',
        gradient: 'linear-gradient(135deg, #E6F4F2 0%, #FFFFFF 72%)',
        label: 'Pending',
      };
    case 'Failed':
      return {
        badgeClass: 'badge-positive',
        dotColor: '#EF4444',
        title: 'Analysis could not be completed',
        gradient: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 72%)',
        label: 'Failed',
      };
    default:
      return {
        badgeClass: 'badge-positive',
        dotColor: '#EF4444',
        title: 'Finding detected',
        gradient: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 72%)',
        label: 'Positive',
      };
  }
}

async function urlToBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

function fmt(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function historyItemHtml(d: DiagnosisResponse, isActive: boolean): string {
  const tone = getTone(d);
  const ts = fmt(new Date(d.createdAt));
  const finding =
    d.finding ?? (d.status === 'pending' ? 'Awaiting result...' : 'No finding text available.');
  const borderColor = isActive ? '#0D9488' : '#E2EDEC';
  const bgColor = isActive ? '#E6F4F2' : '#FAFCFC';

  return `<div style="padding:12px;border-radius:12px;border:1px solid ${borderColor};background:${bgColor};">
  <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;align-items:center;flex-wrap:wrap;">
    <span class="badge ${tone.badgeClass}">
      <span class="badge-dot" style="background:${tone.dotColor};"></span>
      ${tone.label}
    </span>
    <span class="mono" style="font-size:11px;color:#9CA3AF;">${ts}</span>
  </div>
  <div style="font-size:12px;color:#6B7280;line-height:1.6;">${finding}</div>
</div>`;
}

export type PatientCaseWithPatient = PatientCaseResponse & {
  patient?: {
    fullName: string | null;
    email: string;
    age: number | null;
  };
};

export async function buildReportHtml(
  patientCase: PatientCaseWithPatient,
  activeDiagnosisId: string,
): Promise<string> {
  const current =
    patientCase.diagnoses.find((d) => d.id === activeDiagnosisId) ??
    patientCase.diagnoses[0] ??
    null;

  const tone = getTone(current);
  const caseTypeLabel = patientCase.caseType === 'lung' ? 'Lung X-Ray' : 'Bone Fracture';
  const createdDate = fmt(new Date(patientCase.createdAt));
  const generatedAt = fmt(new Date());

  const narrative =
    !current || current.status === 'pending'
      ? 'Your scan is still being analyzed. Live updates will appear here as soon as the diagnosis completes.'
      : current.status === 'failed'
        ? current.finding || 'The diagnosis failed. Try rerunning the analysis.'
        : current.finding || 'Diagnosis completed without a textual finding.';

  const { patient } = patientCase;
  const patientName = patient?.fullName ?? patient?.email ?? 'Unknown';
  const patientAge = patient?.age != null ? `${patient.age} yrs` : 'N/A';
  const caseNumber = patientCase.id.slice(0, 8).toUpperCase();
  const caseIdShort = patientCase.id.slice(0, 8);
  const diagnosisIdShort = current?.id.slice(0, 8) ?? '—';

  const imageData = await urlToBase64(patientCase.xrayUrl);

  const historyHtml = patientCase.diagnoses
    .map((d) => historyItemHtml(d, d.id === (current?.id ?? '')))
    .join('<div style="height:10px;"></div>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Diagnova — Analysis Report</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<script>window.addEventListener('load', function() { setTimeout(function() { window.print(); }, 900); });</script>
<style>
:root{
  --primary:#134E4A;--accent:#0D9488;--accent-50:#E6F4F2;
  --bg:#F0F9F9;--surface:#FFFFFF;
  --text:#1F2937;--text-muted:#6B7280;--text-subtle:#9CA3AF;
  --border:#E2EDEC;--border-strong:#C9DDDB;
  --success-50:#ECFDF5;--danger-50:#FEF2F2;
  --radius-lg:14px;
  --shadow-sm:0 1px 2px rgba(15,63,60,0.04);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{
  font-family:'Inter',system-ui,-apple-system,sans-serif;
  font-feature-settings:'cv11','ss01';
  -webkit-font-smoothing:antialiased;
  background:var(--bg);color:var(--text);font-size:14px;line-height:1.5;
}
.page{width:210mm;min-height:297mm;margin:0 auto;background:var(--bg);}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);}
.eyebrow{font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:var(--accent);}
.mono{font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;}
.badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:500;line-height:1.4;white-space:nowrap;}
.badge-negative{background:var(--success-50);color:#047857;border:1px solid #A7F3D0;}
.badge-positive{background:var(--danger-50);color:#B91C1C;border:1px solid #FECACA;}
.badge-neutral{background:var(--accent-50);color:var(--primary);border:1px solid var(--border-strong);}
.badge-dot{width:6px;height:6px;border-radius:999px;flex-shrink:0;display:inline-block;}
.divider{height:1px;background:var(--border);}
.two-col{display:grid;grid-template-columns:minmax(0,1.4fr) 195px;gap:16px;}
.col{display:flex;flex-direction:column;gap:16px;}
@page{size:A4;margin:0;}
@media print{
  html,body{background:white;}
  .page{width:100%;box-shadow:none;}
}
</style>
</head>
<body>
<div class="page">

<!-- SECTION 1: HEADER -->
<header style="background:linear-gradient(180deg,#0A2A28 0%,#134E4A 100%);padding:26px 36px;display:flex;justify-content:space-between;align-items:center;">
  <div style="display:flex;align-items:center;gap:10px;">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="#FFFFFF" stroke-width="1.5"/>
      <path d="M9 16 L13 16 L15 11 L17 21 L19 16 L23 16" stroke="#5EEAD4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="23" cy="16" r="1.6" fill="#5EEAD4"/>
    </svg>
    <span style="font-size:18px;font-weight:600;letter-spacing:-0.02em;color:#FFFFFF;">Diagnova</span>
  </div>
  <div style="text-align:right;">
    <div style="font-size:10px;color:rgba(255,255,255,0.45);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:3px;">Analysis Report</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.72);">${generatedAt}</div>
  </div>
</header>

<!-- SECTION 2: PAGE HEADER -->
<div style="padding:22px 36px 10px;">
  <div class="eyebrow" style="margin-bottom:6px;">Results</div>
  <h1 style="font-size:22px;font-weight:600;letter-spacing:-0.015em;margin-bottom:4px;">Analysis report</h1>
  <p style="font-size:14px;color:var(--text-muted);">${caseTypeLabel} / created ${createdDate}</p>
  <div class="divider" style="margin-top:14px;"></div>
</div>

<!-- SECTION 2.5: PATIENT DETAILS -->
<div style="padding:0 36px 16px;">
  <div class="card" style="padding:18px 22px;">
    <div class="eyebrow" style="margin-bottom:12px;">Patient details</div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);">
      <div style="padding:0 16px 0 0;border-right:1px solid var(--border);">
        <div style="font-size:11px;color:var(--text-subtle);margin-bottom:4px;letter-spacing:0.03em;">Full name</div>
        <div style="font-size:13px;font-weight:500;color:var(--text);">${patientName}</div>
      </div>
      <div style="padding:0 16px;border-right:1px solid var(--border);">
        <div style="font-size:11px;color:var(--text-subtle);margin-bottom:4px;letter-spacing:0.03em;">Age</div>
        <div style="font-size:13px;font-weight:500;color:var(--text);">${patientAge}</div>
      </div>
      <div style="padding:0 16px;border-right:1px solid var(--border);">
        <div style="font-size:11px;color:var(--text-subtle);margin-bottom:4px;letter-spacing:0.03em;">Gender</div>
        <div style="font-size:13px;font-weight:500;color:var(--text);">N/A</div>
      </div>
      <div style="padding:0 16px;border-right:1px solid var(--border);">
        <div style="font-size:11px;color:var(--text-subtle);margin-bottom:4px;letter-spacing:0.03em;">Case №</div>
        <div style="font-size:13px;font-weight:500;color:var(--text);">${caseNumber}</div>
      </div>
      <div style="padding:0 0 0 16px;">
        <div style="font-size:11px;color:var(--text-subtle);margin-bottom:4px;letter-spacing:0.03em;">Case ID</div>
        <div class="mono" style="font-size:10px;color:var(--text-muted);word-break:break-all;">${patientCase.id}</div>
      </div>
    </div>
  </div>
</div>

<!-- MAIN CONTENT -->
<div style="padding:0 36px 36px;">
  <div class="two-col">
    <div class="col">

      <!-- SECTION 3: DIAGNOSIS STATUS -->
      <div class="card" style="padding:22px;background:${tone.gradient};">
        <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:14px;align-items:flex-start;">
          <div>
            <div class="eyebrow" style="margin-bottom:8px;">Diagnosis status</div>
            <h2 style="font-size:21px;font-weight:600;letter-spacing:-0.02em;margin-bottom:5px;">${tone.title}</h2>
            <p style="font-size:12px;color:var(--text-muted);">Case ${caseIdShort} is tied to diagnosis ${diagnosisIdShort}.</p>
          </div>
          <span class="badge ${tone.badgeClass}">
            <span class="badge-dot" style="background:${tone.dotColor};"></span>
            ${tone.label}
          </span>
        </div>
        <div style="padding:14px 16px;border-radius:12px;background:rgba(255,255,255,0.82);border:1px solid var(--border);font-size:13.5px;line-height:1.75;color:var(--text);">
          ${narrative}
        </div>
      </div>

      <!-- SECTION 4: CLINICAL CONTEXT -->
      <div class="card" style="padding:22px;">
        <div class="eyebrow" style="margin-bottom:8px;">Clinical context</div>
        <h3 style="font-size:16px;font-weight:600;letter-spacing:-0.015em;margin-bottom:10px;">Submitted notes</h3>
        <p style="font-size:13.5px;line-height:1.75;color:var(--text-muted);">
          ${patientCase.clinicDescription ?? 'No clinical description was provided for this case.'}
        </p>
      </div>

      <!-- SECTION 5: SOURCE IMAGE -->
      <div class="card" style="padding:22px;">
        <div class="eyebrow" style="margin-bottom:8px;">Source image</div>
        <div style="border-radius:12px;overflow:hidden;border:1px solid var(--border);background:#F6FAFA;">
          <img src="${imageData}" alt="${caseTypeLabel} source image"
            style="display:block;width:100%;max-height:400px;object-fit:contain;"/>
        </div>
      </div>

    </div>
    <div class="col">

      <!-- SECTION 6: CASE DETAILS -->
      <div class="card" style="padding:18px;">
        <div class="eyebrow" style="margin-bottom:10px;">Case details</div>
        <div style="display:grid;gap:10px;font-size:12px;">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">
            <span style="color:var(--text-muted);flex-shrink:0;">Case ID</span>
            <span class="mono" style="font-size:10px;word-break:break-all;text-align:right;">${patientCase.id}</span>
          </div>
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">
            <span style="color:var(--text-muted);flex-shrink:0;">Diagnosis ID</span>
            <span class="mono" style="font-size:10px;word-break:break-all;text-align:right;">${current?.id ?? '—'}</span>
          </div>
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;gap:8px;">
            <span style="color:var(--text-muted);">Study type</span>
            <span>${caseTypeLabel}</span>
          </div>
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;gap:8px;">
            <span style="color:var(--text-muted);">Created</span>
            <span style="text-align:right;">${createdDate}</span>
          </div>
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;gap:8px;">
            <span style="color:var(--text-muted);">Status</span>
            <span class="mono">${current?.status ?? '—'}</span>
          </div>
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">
            <span style="color:var(--text-muted);flex-shrink:0;">Patient</span>
            <span style="text-align:right;">${patientName}</span>
          </div>
        </div>
      </div>

      <!-- SECTION 7: DIAGNOSIS HISTORY -->
      <div class="card" style="padding:18px;">
        <div class="eyebrow" style="margin-bottom:10px;">Diagnosis history</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${historyHtml}
        </div>
      </div>

    </div>
  </div>
</div>

<!-- SECTION 8: FOOTER -->
<footer style="border-top:1px solid var(--border);padding:14px 36px;display:flex;justify-content:space-between;align-items:center;background:var(--surface);">
  <div style="display:flex;align-items:center;gap:8px;">
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="#134E4A" stroke-width="1.5"/>
      <path d="M9 16 L13 16 L15 11 L17 21 L19 16 L23 16" stroke="#0D9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="23" cy="16" r="1.6" fill="#0D9488"/>
    </svg>
    <span style="font-size:12px;color:var(--text-muted);">Diagnova — AI-powered radiology assistant</span>
  </div>
  <span style="font-size:11px;color:var(--text-subtle);">Generated ${generatedAt} · For clinical review only</span>
</footer>

</div>
</body>
</html>`;
}
