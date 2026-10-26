/**
 * SchemeShield AI - Standardized API & Network Types
 * Aligned with FastAPI backend Pydantic schemas.
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
  success?: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
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

// Health Check Response from GET /api/health
export interface HealthResponse {
  status: string;
  database_status: string;
  loaded_schemes_count: number;
  timestamp: string;
  version: string;
}

// User / Auth Responses
export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface BackendTokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

// Scheme Responses from GET /api/v1/schemes
export interface SchemeResponse {
  id: string;
  name: string;
  department: string;
  state: string;
  category: string;
  description: string;
  benefits: string;
  eligibility_criteria: string;
  application_process: string;
  official_portal_url: string;
  helpline_number: string;
  created_at: string;
}

export interface SchemeListResponse {
  items: SchemeResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Verification Responses from POST /api/v1/verify
export interface VerificationResponse {
  id: string;
  user_id?: string | null;
  input_type: 'text' | 'document' | 'url';
  scheme_name: string;
  official_scheme_matched?: string | null;
  result_label: 'GENUINE' | 'SUSPICIOUS' | 'FRAUDULENT';
  confidence_score: number;
  risk_score: number;
  nlp_similarity_score?: number | null;
  findings: string[];
  recommendations: string[];
  matched_official_portal?: string | null;
  domain_authenticity?: string | null;
  created_at: string;
}

// Verification History & Stats
export interface VerificationHistoryResponse {
  id: string;
  input_type: string;
  scheme_name: string;
  result_label: 'GENUINE' | 'SUSPICIOUS' | 'FRAUDULENT';
  confidence_score: number;
  created_at: string;
}

export interface VerificationHistoryListResponse {
  items: VerificationHistoryResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TopFlaggedScheme {
  scheme_name: string;
  count: number;
}

export interface VerificationStatsResponse {
  total_verifications: number;
  genuine_count: number;
  suspicious_count: number;
  fraudulent_count: number;
  flagged_fraud_rate: number;
  top_flagged_schemes: TopFlaggedScheme[];
}

// Assistant
export interface AssistantChatRequest {
  message: string;
  session_id?: string;
}

export interface AssistantChatResponse {
  reply: string;
  session_id: string;
  suggestions: string[];
}
