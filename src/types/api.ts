/**
 * SchemeShield AI - Standardized API & Network Types
 * Designed for contract compatibility with future FastAPI backend.
 */

export type ApiErrorType =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'EMPTY_RESPONSE'
  | 'NOT_FOUND'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  code?: string;
}

export interface ApiError {
  type: ApiErrorType;
  code: string;
  message: string;
  userFriendlyMessage: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: ApiPagination;
}
