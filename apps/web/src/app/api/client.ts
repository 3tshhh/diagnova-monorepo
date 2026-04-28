import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './session';

type AuthMode = 'none' | 'access';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: BodyInit | null;
  auth?: AuthMode;
  headers?: Record<string, string>;
  retry?: boolean;
};

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000/api';
let refreshPromise: Promise<boolean> | null = null;

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    const payload = await response.json();
    const rawMessage = payload?.message;
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage || payload?.error || 'Request failed';
    return new ApiError(String(message), response.status);
  } catch {
    return new ApiError(response.statusText || 'Request failed', response.status);
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'authorization-refresh': `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = (await response.json()) as { accessToken: string; refreshToken: string };
    if (!data?.accessToken || !data?.refreshToken) {
      clearTokens();
      return false;
    }

    setTokens(data.accessToken, data.refreshToken);
    return true;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body = null, auth = 'none', headers = {}, retry = true } = options;

  const requestHeaders: Record<string, string> = { ...headers };
  if (auth === 'access') {
    let token = getAccessToken();
    if (!token && retry && getRefreshToken()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        token = getAccessToken();
      }
    }

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body,
  });

  if (response.status === 401 && auth === 'access' && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retry: false });
    }
  }

  if (response.status === 401 && auth === 'access' && !retry) {
    clearTokens();
    redirectToLogin();
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
