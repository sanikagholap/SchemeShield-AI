/**
 * SchemeShield AI - Centralized API Client Architecture
 * 
 * Note: Frontend branch only. No backend connections or live API calls are made here.
 * When the backend is developed, this client will configure base URLs, authorization headers,
 * and error interception.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Simulated network delay for realistic frontend UI state testing (spinners, skeletons, progress)
export const simulateLatency = <T>(data: T, delayMs: number = 400): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs));
};

export const API_CONFIG = {
  // Configured for future backend endpoint
  baseUrl: (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1',
  timeoutMs: 15000,
  isMockMode: true, // Frontend-only branch runs entirely in zero-cost mock mode
};
