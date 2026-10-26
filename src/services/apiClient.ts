/**
 * SchemeShield AI - Centralized Real Backend API Client
 *
 * Connects directly to the FastAPI backend service.
 * Manages JWT bearer auth tokens, multipart form data, citizen-friendly errors,
 * and live system health inspection.
 */

import { ApiResponse, ApiError, ApiErrorType, HealthResponse } from '../types/api';

export type { ApiResponse, ApiError, ApiErrorType, HealthResponse };

const RAW_BASE_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE_URL?.trim() ||
  'http://127.0.0.1:8000';

// Normalize: remove trailing slash
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export const TOKEN_STORAGE_KEY = 'schemeshield_token';

export const API_CONFIG = {
  baseUrl: BASE_URL,
  timeoutMs: 20000,
  isMockMode: false,
};

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
};

/**
 * Creates citizen-friendly error representations with technical clarity when appropriate.
 */
export const createCitizenFriendlyError = (
  type: ApiErrorType,
  message?: string,
  statusCode?: number,
  details?: Record<string, unknown>
): ApiError => {
  const defaults: Record<ApiErrorType, string> = {
    NETWORK_ERROR: 'Unable to reach the verification service. Please check your internet connection or verify the backend is running.',
    UNAUTHORIZED: 'Your session has expired or requires authentication. Please sign in to continue.',
    VALIDATION_ERROR: 'Please review the information provided. Some details are incomplete or improperly formatted.',
    SERVER_ERROR: 'We could not complete the operation at this time. Please retry in a moment.',
    EMPTY_RESPONSE: 'No verification records found matching your inquiry.',
    NOT_FOUND: 'The requested government scheme or verification record could not be found.',
    TIMEOUT: 'The request took too long to complete. Please try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please refresh or try again.',
  };

  return {
    type,
    code: `ERR_${type}`,
    message: message || defaults[type],
    userFriendlyMessage: message || defaults[type],
    statusCode,
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Resolves full URL against backend host.
 * If endpoint starts with `/api/`, it appends directly to the host base.
 * Otherwise, it prefixes with `/api/v1/`.
 */
function resolveUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If already prefixed with /api/ (e.g. /api/health or /api/v1/...)
  if (cleanEndpoint.startsWith('/api/')) {
    // If BASE_URL already ends with /api or /api/v1, strip it to prevent duplicate path
    const rootOrigin = BASE_URL.replace(/\/api(\/v1)?\/?$/, '');
    return `${rootOrigin}${cleanEndpoint}`;
  }

  // If not prefixed with /api, default to BASE_URL + /api/v1 + endpoint
  const baseWithoutApi = BASE_URL.replace(/\/api(\/v1)?\/?$/, '');
  return `${baseWithoutApi}/api/v1${cleanEndpoint}`;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let errorMessage: string | undefined;
  let details: Record<string, unknown> | undefined;

  try {
    const errorJson = await response.json();
    if (typeof errorJson.detail === 'string') {
      errorMessage = errorJson.detail;
    } else if (Array.isArray(errorJson.detail)) {
      errorMessage = errorJson.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
      details = { validationErrors: errorJson.detail };
    } else if (errorJson.message) {
      errorMessage = errorJson.message;
    }
  } catch {
    // Fall back to status text
    errorMessage = response.statusText;
  }

  if (response.status === 401) {
    return createCitizenFriendlyError('UNAUTHORIZED', errorMessage, 401, details);
  }
  if (response.status === 403) {
    return createCitizenFriendlyError('UNAUTHORIZED', errorMessage || 'Access denied.', 403, details);
  }
  if (response.status === 404) {
    return createCitizenFriendlyError('NOT_FOUND', errorMessage, 404, details);
  }
  if (response.status === 400 || response.status === 422) {
    return createCitizenFriendlyError('VALIDATION_ERROR', errorMessage, response.status, details);
  }
  if (response.status >= 500) {
    return createCitizenFriendlyError('SERVER_ERROR', errorMessage, response.status, details);
  }

  return createCitizenFriendlyError('UNKNOWN_ERROR', errorMessage, response.status, details);
}

/**
 * Standardized HTTP abstraction communicating directly with the FastAPI backend.
 */
export const apiClient = {
  getBaseUrl(): string {
    return API_CONFIG.baseUrl;
  },

  isDemoMode(): boolean {
    return false;
  },

  async checkHealth(): Promise<HealthResponse> {
    const rootOrigin = BASE_URL.replace(/\/api(\/v1)?\/?$/, '');
    const response = await fetch(`${rootOrigin}/api/health`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw await parseErrorResponse(response);
    }
    return await response.json();
  },

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = resolveUrl(endpoint);
      const response = await fetch(url, {
        method: 'GET',
        headers,
        ...options,
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if ((err as ApiError)?.type) throw err;
      throw createCitizenFriendlyError('NETWORK_ERROR', (err as Error)?.message);
    }
  },

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = resolveUrl(endpoint);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...options,
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if ((err as ApiError)?.type) throw err;
      throw createCitizenFriendlyError('NETWORK_ERROR', (err as Error)?.message);
    }
  },

  async postFormData<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      // Note: Do NOT set Content-Type header when sending FormData; browser sets it with boundary automatically
      ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = resolveUrl(endpoint);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        ...options,
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if ((err as ApiError)?.type) throw err;
      throw createCitizenFriendlyError('NETWORK_ERROR', (err as Error)?.message);
    }
  },

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = resolveUrl(endpoint);
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...options,
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if ((err as ApiError)?.type) throw err;
      throw createCitizenFriendlyError('NETWORK_ERROR', (err as Error)?.message);
    }
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = resolveUrl(endpoint);
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        ...options,
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if ((err as ApiError)?.type) throw err;
      throw createCitizenFriendlyError('NETWORK_ERROR', (err as Error)?.message);
    }
  },
};
