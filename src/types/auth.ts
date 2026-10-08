export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CITIZEN' | 'VERIFIER' | 'RESEARCHER' | 'ADMIN';
  organization?: string;
  avatarUrl?: string;
  joinedAt: string;
  verificationsCount: number;
  lastActive?: string;
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
  confirmPassword?: string;
  phone?: string;
  organization?: string;
  agreeToTerms: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  logout: () => void;
  loginAsDemo: (role?: 'CITIZEN' | 'VERIFIER') => void;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}
