import { apiRequest } from './client';
import { clearTokens, getAccessToken, setTokens } from './session';
import type { ApiAuthTokens, LoginPayload, RegisterPayload } from './types';

export async function login(payload: LoginPayload): Promise<ApiAuthTokens> {
  const tokens = await apiRequest<ApiAuthTokens>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens;
}

export async function register(payload: RegisterPayload): Promise<ApiAuthTokens> {
  const response = await apiRequest<ApiAuthTokens & { message: string }>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  setTokens(response.accessToken, response.refreshToken);
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  };
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/forgot-password-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(tokenId: string, newPassword: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/auth/reset-password/${tokenId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword }),
  });
}

export async function updatePassword(payload: { oldPassword: string; newPassword: string }): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/update-password', {
    method: 'PATCH',
    auth: 'access',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function logout(): Promise<void> {
  const hasToken = getAccessToken();
  if (hasToken) {
    try {
      await apiRequest<{ message: string }>('/auth/logout', {
        method: 'POST',
        auth: 'access',
      });
    } catch {
      // Ignore logout backend errors and clear local session anyway.
    }
  }

  clearTokens();
}
