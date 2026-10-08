import { User, LoginCredentials, SignupCredentials } from '../types/auth';
import { simulateLatency } from './apiClient';

const MOCK_USER: User = {
  id: 'usr-101',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.org',
  role: 'CITIZEN',
  organization: 'Digital Civic Watch',
  avatarUrl: '',
  joinedAt: 'January 2026',
  verificationsCount: 14
};

export const authService = {
  /**
   * Placeholder: Sign in user with credentials
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    return simulateLatency({
      user: {
        ...MOCK_USER,
        email: credentials.email || MOCK_USER.email,
      },
      token: 'mock-jwt-token-schemeshield-frontend-preview'
    }, 500);
  },

  /**
   * Placeholder: Register new citizen/user
   */
  async signup(credentials: SignupCredentials): Promise<{ user: User; token: string }> {
    return simulateLatency({
      user: {
        ...MOCK_USER,
        name: credentials.name,
        email: credentials.email,
        organization: credentials.organization || 'Independent Citizen'
      },
      token: 'mock-jwt-token-schemeshield-frontend-preview'
    }, 500);
  },

  /**
   * Placeholder: Request password reset link
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return simulateLatency({
      success: true,
      message: `Password reset verification link sent to ${email} (Mock flow).`
    }, 400);
  },

  /**
   * Placeholder: Get current authenticated user profile
   */
  async getCurrentUser(): Promise<User | null> {
    return simulateLatency(MOCK_USER, 200);
  },

  /**
   * Placeholder: Log out current user
   */
  async logout(): Promise<void> {
    await simulateLatency(null, 150);
  }
};
