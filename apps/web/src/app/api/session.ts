const ACCESS_TOKEN_KEY = 'diagnova:accessToken';
const REFRESH_TOKEN_KEY = 'diagnova:refreshToken';

// Tokens may live in either localStorage (persistent) or sessionStorage (tab-only).
// Always check localStorage first so that "keep me signed in" survives tab closes.

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string, persist = false): void {
  if (typeof window === 'undefined') return;
  const storage = persist ? localStorage : sessionStorage;
  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken());
}

export function hasStoredSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}
