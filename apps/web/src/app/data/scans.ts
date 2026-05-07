import { APP_COPY } from '../constants/copy';

export type ScanType = 'Lung X-Ray' | 'Bone Fracture';
export type ScanResult = 'Positive' | 'Negative';

export type Scan = {
  id: string;
  type: ScanType;
  date: string;
  result: ScanResult;
  detail: string;
};
