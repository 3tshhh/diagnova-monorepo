export type ScanType = 'Lung X-Ray' | 'Bone Fracture';
export type ScanResult = 'Positive' | 'Negative';

export type Scan = {
  id: string;
  type: ScanType;
  date: string;
  result: ScanResult;
  detail: string;
};

export const RECENT_SCANS: Scan[] = [
  { id: 'CXR-2026-04812', type: 'Lung X-Ray', date: 'Apr 24, 2026', result: 'Positive', detail: 'Right lower-lobe consolidation' },
  { id: 'BRX-2026-01933', type: 'Bone Fracture', date: 'Apr 23, 2026', result: 'Negative', detail: 'No acute fracture identified' },
  { id: 'CXR-2026-04779', type: 'Lung X-Ray', date: 'Apr 22, 2026', result: 'Negative', detail: 'Clear lung fields' },
];

export const ALL_SCANS: Scan[] = [
  ...RECENT_SCANS,
  { id: 'BRX-2026-01902', type: 'Bone Fracture', date: 'Apr 20, 2026', result: 'Positive', detail: 'Distal radius — transverse' },
  { id: 'CXR-2026-04701', type: 'Lung X-Ray', date: 'Apr 18, 2026', result: 'Positive', detail: 'Bilateral pleural effusion' },
];
