export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'VERIFIER' | 'RESEARCHER' | 'ADMIN';
  organization?: string;
  avatarUrl?: string;
  joinedAt: string;
  verificationsCount: number;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password?: string;
  organization?: string;
  agreeToTerms: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
