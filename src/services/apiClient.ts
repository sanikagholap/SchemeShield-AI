/**
 * SchemeShield AI - Centralized API Client Architecture
 * 
 * Note: Frontend branch only. Zero paid APIs, ₹0 cost.
 * When the backend (FastAPI) is connected, this client manages base URLs,
 * auth tokens, and status interception. In demo mode, it seamlessly routes
 * to localized simulation fixtures with realistic latency.
 */

import { ApiResponse, ApiError, ApiErrorType } from '../types/api';

export type { ApiResponse, ApiError, ApiErrorType };

export const API_CONFIG = {
  baseUrl: (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeoutMs: 15000,
  // Automatically operates in mock/demo mode unless backend is explicitly connected
  isMockMode: (import.meta as { env?: Record<string, string> }).env?.VITE_ENABLE_MOCK_SERVICES !== 'false',
};

/**
 * Creates citizen-friendly error representations without exposing technical stack traces.
 */
export const createCitizenFriendlyError = (
  type: ApiErrorType,
  message?: string,
  statusCode?: number
): ApiError => {
  const defaults: Record<ApiErrorType, string> = {
    NETWORK_ERROR: 'Unable to reach the verification service. Please check your internet connection and retry.',
    UNAUTHORIZED: 'Your session has expired. Please sign in again to continue.',
    VALIDATION_ERROR: 'Please review the information provided. Some details are incomplete or improperly formatted.',
    SERVER_ERROR: "We couldn't complete the verification right now. Please try again shortly.",
    EMPTY_RESPONSE: 'No verification records found matching your inquiry.',
    NOT_FOUND: 'The requested government scheme or verification record could not be found.',
    TIMEOUT: 'The verification request took too long to complete. Please try again.',
    UNKNOWN_ERROR: "An unexpected error occurred. Please refresh or try again.",
  };

  return {
    type,
    code: `ERR_${type}`,
    message: message || defaults[type],
    userFriendlyMessage: defaults[type],
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Simulates network latency for realistic frontend loading states (spinners, skeletons, progress).
 */
export const simulateLatency = <T>(data: T, delayMs: number = 350): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs));
};

/**
 * Standardized HTTP abstraction ready for FastAPI integration.
 */
export const apiClient = {
  getBaseUrl(): string {
    return API_CONFIG.baseUrl;
  },

  isDemoMode(): boolean {
    return API_CONFIG.isMockMode;
  },

  async get<T>(endpoint: string, _options?: RequestInit): Promise<ApiResponse<T>> {
    // In mock mode, this acts as a placeholder contract for the backend
    if (API_CONFIG.isMockMode) {
      throw createCitizenFriendlyError('UNKNOWN_ERROR', `Mock fallback should be handled by service layer for GET ${endpoint}`);
    }

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(_options?.headers || {})
        },
        ..._options
      });

      if (!response.ok) {
        if (response.status === 401) throw createCitizenFriendlyError('UNAUTHORIZED', undefined, 401);
        if (response.status === 404) throw createCitizenFriendlyError('NOT_FOUND', undefined, 404);
        if (response.status >= 500) throw createCitizenFriendlyError('SERVER_ERROR', undefined, response.status);
        throw createCitizenFriendlyError('UNKNOWN_ERROR', `Request failed with status ${response.status}`, response.status);
      }

      return await response.json();
    } catch (err: unknown) {
      if ((err as ApiError)?.type) throw err;
      throw createCitizenFriendlyError('NETWORK_ERROR');
    }
  },

  async post<T>(endpoint: string, body?: unknown, _options?: RequestInit): Promise<ApiResponse<T>> {
    if (API_CONFIG.isMockMode) {
      throw createCitizenFriendlyError('UNKNOWN_ERROR', `Mock fallback should be handled by service layer for POST ${endpoint}`);
    }

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(_options?.headers || {})
        },
        body: body ? JSON.stringify(body) : undefined,
        ..._options
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 422) throw createCitizenFriendlyError('VALIDATION_ERROR', undefined, response.status);
        if (response.status === 401) throw createCitizenFriendlyError('UNAUTHORIZED', undefined, 401);
        if (response.status >= 500) throw createCitizenFriendlyError('SERVER_ERROR', undefined, response.status);
        throw createCitizenFriendlyError('UNKNOWN_ERROR', `Request failed with status ${response.status}`, response.status);
      }

      return await response.json();
    } catch (err: unknown) {
      if ((err as ApiError)?.type) throw err;
      throw createCitizenFriendlyError('NETWORK_ERROR');
    }
  }
};
