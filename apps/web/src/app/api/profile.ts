import { apiRequest } from './client';
import type { PatientProfile } from './types';

export async function getProfile(): Promise<PatientProfile> {
  return apiRequest<PatientProfile>('/profile', {
    auth: 'access',
  });
}

export async function updateProfile(payload: {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  age?: number;
  nationalId?: string;
}): Promise<PatientProfile> {
  return apiRequest<PatientProfile>('/profile', {
    method: 'PATCH',
    auth: 'access',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function saveProfilePhoto(file: File, hasExistingPhoto: boolean): Promise<{ message: string; photoUrl: string }> {
  const formData = new FormData();
  formData.append('photo', file);

  return apiRequest<{ message: string; photoUrl: string }>('/profile/photo', {
    method: hasExistingPhoto ? 'PATCH' : 'POST',
    auth: 'access',
    body: formData,
  });
}

export async function removeProfilePhoto(): Promise<{ message: string; photoUrl: null }> {
  return apiRequest<{ message: string; photoUrl: null }>('/profile/photo', {
    method: 'DELETE',
    auth: 'access',
  });
}
