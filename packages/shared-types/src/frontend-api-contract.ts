import {
  AuthTokens,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdatePasswordPayload,
} from './auth';
import { CaseCreatedResponse, CreateCasePayload, PatientCaseResponse } from './cases';
import { CaseType, DiagnosisStatus } from './enums';
import { DiagnosisCompletePayload } from './internal-contract';
import { PatientProfile } from './patient-profile';
import { UploadPhotoResponse } from './upload';

export type ApiMethod = 'GET' | 'POST' | 'PATCH';

export interface ApiErrorResponse {
  message: string | string[];
  error?: string;
  statusCode: number;
}

export interface ApiSuccessMessage {
  message: string;
}

export interface RegisterResponse extends AuthTokens {
  message: string;
}

export interface ResetPasswordParams {
  tokenId: string;
}

export interface CasePathParams {
  caseId: string;
}

export interface DiagnosisPathParams extends CasePathParams {
  diagnosisId: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  age?: number;
  nationalId?: string;
}

export interface DiagnoseStreamQuery {
  token: string;
}

export interface DiagnosisStreamEvent {
  id: string;
  status: DiagnosisStatus;
  finding: string | null;
  createdAt: string;
}

export const API_HEADERS = {
  authorization: 'Authorization',
  refreshAuthorization: 'authorization-refresh',
  internalSecret: 'x-internal-key',
  contentType: 'Content-Type',
} as const;

export const API_AUTH_SCHEME = {
  tokenPrefix: 'Bearer',
  accessTokenHeaderFormat: 'Authorization: Bearer <access_token>',
  refreshTokenHeaderFormat:
    'authorization-refresh: Bearer <refresh_token>',
  sseQueryTokenFormat: '/cases/:caseId/stream/:diagnosisId?token=<access_token>',
} as const;

export const API_VALIDATION_RULES = {
  auth: {
    register: {
      email: 'Required. Must be a valid email address.',
      password: 'Required. Minimum 8 characters.',
      fullName: 'Optional string.',
    },
    login: {
      email: 'Required. Must be a valid email address.',
      password: 'Required string.',
    },
    forgotPassword: {
      email: 'Required. Must be a valid email address.',
    },
    resetPassword: {
      tokenId: 'Required URL param from forgot-password email link.',
      newPassword: 'Required. Minimum 8 characters.',
    },
    updatePassword: {
      oldPassword: 'Required string.',
      newPassword: 'Required. Minimum 8 characters.',
    },
  },
  cases: {
    create: {
      case_type: `Required. One of: ${CaseType.LUNG} | ${CaseType.BONE_FRACTURE}`,
      clinic_description: 'Required non-empty string.',
      xray: 'Required file field in multipart/form-data.',
    },
  },
  profile: {
    fullName: 'Optional. Max 255 chars.',
    phoneNumber: 'Optional. Max 30 chars.',
    address: 'Optional string.',
    age: 'Optional integer. Range 0..150.',
    nationalId: 'Optional. Max 100 chars.',
    photo: 'Required file field in multipart/form-data for upload/update photo.',
  },
  internal: {
    finding: 'Optional string.',
    error: 'Optional string.',
  },
} as const;

export const FRONTEND_API_CONTRACT = {
  tokens: {
    loginReturns: 'accessToken + refreshToken',
    registerReturns: 'message + accessToken + refreshToken',
    refreshRotates: 'Old refresh token jti is revoked, new pair is returned',
    logoutRevokes: 'Current access token jti is revoked',
  },
  endpoints: {
    auth: {
      register: {
        method: 'POST' as ApiMethod,
        path: '/auth/register',
        headers: ['Content-Type: application/json'],
        bodyType: 'RegisterPayload',
        responseType: 'RegisterResponse',
      },
      login: {
        method: 'POST' as ApiMethod,
        path: '/auth/login',
        headers: ['Content-Type: application/json'],
        bodyType: 'LoginPayload',
        responseType: 'AuthTokens',
      },
      logout: {
        method: 'POST' as ApiMethod,
        path: '/auth/logout',
        headers: ['Authorization: Bearer <access_token>'],
        responseType: 'ApiSuccessMessage',
      },
      refreshToken: {
        method: 'POST' as ApiMethod,
        path: '/auth/refresh-token',
        headers: ['authorization-refresh: Bearer <refresh_token>'],
        responseType: 'AuthTokens',
      },
      forgotPassword: {
        method: 'POST' as ApiMethod,
        path: '/auth/forgot-password',
        headers: ['Content-Type: application/json'],
        bodyType: 'ForgotPasswordPayload',
        responseType: 'ApiSuccessMessage',
      },
      resetPassword: {
        method: 'POST' as ApiMethod,
        path: '/auth/reset-password/:tokenId',
        headers: ['Content-Type: application/json'],
        pathParams: ['tokenId'],
        bodyType: 'ResetPasswordPayload',
        responseType: 'ApiSuccessMessage',
      },
      updatePassword: {
        method: 'PATCH' as ApiMethod,
        path: '/auth/update-password',
        headers: [
          'Authorization: Bearer <access_token>',
          'Content-Type: application/json',
        ],
        bodyType: 'UpdatePasswordPayload',
        responseType: 'ApiSuccessMessage',
      },
    },
    cases: {
      create: {
        method: 'POST' as ApiMethod,
        path: '/cases',
        headers: ['Authorization: Bearer <access_token>', 'multipart/form-data'],
        bodyType: 'FormData(xray, case_type, clinic_description)',
        responseType: 'CaseCreatedResponse',
      },
      getAll: {
        method: 'GET' as ApiMethod,
        path: '/cases',
        headers: ['Authorization: Bearer <access_token>'],
        responseType: 'PatientCaseResponse[]',
      },
      getOne: {
        method: 'GET' as ApiMethod,
        path: '/cases/:caseId',
        headers: ['Authorization: Bearer <access_token>'],
        pathParams: ['caseId'],
        responseType: 'PatientCaseResponse',
      },
      rerun: {
        method: 'POST' as ApiMethod,
        path: '/cases/:caseId/rerun',
        headers: ['Authorization: Bearer <access_token>'],
        pathParams: ['caseId'],
        responseType: 'CaseCreatedResponse',
      },
      exportDiagnosis: {
        method: 'GET' as ApiMethod,
        path: '/cases/:caseId/export/:diagnosisId',
        headers: ['Authorization: Bearer <access_token>'],
        pathParams: ['caseId', 'diagnosisId'],
        responseType: 'text/plain',
      },
      diagnosisStream: {
        method: 'GET' as ApiMethod,
        path: '/cases/:caseId/stream/:diagnosisId?token=<access_token>',
        pathParams: ['caseId', 'diagnosisId'],
        query: ['token'],
        responseType: 'text/event-stream (Diagnosis updates)',
      },
    },
    profile: {
      me: {
        method: 'GET' as ApiMethod,
        path: '/profile/me',
        headers: ['Authorization: Bearer <access_token>'],
        responseType: 'PatientProfile',
      },
      update: {
        method: 'PATCH' as ApiMethod,
        path: '/profile/me',
        headers: [
          'Authorization: Bearer <access_token>',
          'Content-Type: application/json',
        ],
        bodyType: 'UpdateProfilePayload',
        responseType: 'PatientProfile',
      },
      uploadPhoto: {
        method: 'POST' as ApiMethod,
        path: '/profile/photo',
        headers: ['Authorization: Bearer <access_token>', 'multipart/form-data'],
        bodyType: 'FormData(photo)',
        responseType: 'UploadPhotoResponse',
      },
      updatePhoto: {
        method: 'PATCH' as ApiMethod,
        path: '/profile/photo',
        headers: ['Authorization: Bearer <access_token>', 'multipart/form-data'],
        bodyType: 'FormData(photo)',
        responseType: 'UploadPhotoResponse',
      },
    },
    internal: {
      diagnosisComplete: {
        method: 'POST' as ApiMethod,
        path: '/internal/diagnoses/:diagnosisId/complete',
        headers: ['x-internal-key: <INTERNAL_SECRET>', 'Content-Type: application/json'],
        pathParams: ['diagnosisId'],
        bodyType: 'DiagnosisCompletePayload',
        responseType: 'ApiSuccessMessage',
      },
    },
  },
} as const;

export type FrontendApiContract = typeof FRONTEND_API_CONTRACT;

export type FrontendAuthTypes = {
  registerPayload: RegisterPayload;
  registerResponse: RegisterResponse;
  loginPayload: LoginPayload;
  loginResponse: AuthTokens;
  forgotPasswordPayload: ForgotPasswordPayload;
  resetPasswordPayload: ResetPasswordPayload;
  updatePasswordPayload: UpdatePasswordPayload;
};

export type FrontendCaseTypes = {
  createCasePayload: CreateCasePayload;
  caseCreatedResponse: CaseCreatedResponse;
  caseResponse: PatientCaseResponse;
  caseListResponse: PatientCaseResponse[];
  streamEvent: DiagnosisStreamEvent;
};

export type FrontendProfileTypes = {
  profile: PatientProfile;
  updateProfilePayload: UpdateProfilePayload;
  uploadPhotoResponse: UploadPhotoResponse;
};

export type FrontendInternalTypes = {
  diagnosisCompletePayload: DiagnosisCompletePayload;
};
