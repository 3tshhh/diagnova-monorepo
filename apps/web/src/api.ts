import axios from 'axios';
import type {
  AuthTokens,
  RegisterPayload,
  LoginPayload,
  PatientProfile,
  CreateCasePayload,
  CaseCreatedResponse,
  PatientCaseResponse,
  UploadPhotoResponse,
} from '@diagnova/shared-types';

const api = axios.create({ baseURL: '/api' });

// ── Auth ──────────────────────────────────────
export const register = (data: RegisterPayload) =>
  api.post<AuthTokens>('/auth/register', data).then((r) => r.data);

export const login = (data: LoginPayload) =>
  api.post<AuthTokens>('/auth/login', data).then((r) => r.data);

// ── Profile ───────────────────────────────────
export const getProfile = (token: string) =>
  api
    .get<PatientProfile>('/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data);

export const uploadProfilePhoto = (token: string, file: File) => {
  const form = new FormData();
  form.append('photo', file);
  return api
    .post<UploadPhotoResponse>('/profile/photo', form, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data);
};

// ── Cases ─────────────────────────────────────
export const createCase = (
  token: string,
  data: CreateCasePayload,
  xrayFile: File,
) => {
  const form = new FormData();
  form.append('case_type', data.case_type);
  form.append('clinic_description', data.clinic_description);
  form.append('xray', xrayFile);
  return api
    .post<CaseCreatedResponse>('/cases', form, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data);
};

export const getMyCases = (token: string) =>
  api
    .get<PatientCaseResponse[]>('/cases/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data);

export const getCase = (token: string, caseId: string) =>
  api
    .get<PatientCaseResponse>(`/cases/${caseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((r) => r.data);
