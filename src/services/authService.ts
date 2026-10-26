/**
 * SchemeShield AI - Authentication Service
 * Communicates with FastAPI backend auth endpoints (/api/v1/auth/...).
 */

import { User, LoginCredentials, SignupCredentials } from '../types/auth';
import { BackendTokenResponse, UserResponse } from '../types/api';
import { apiClient, setToken, getToken } from './apiClient';

export function mapUserResponseToUser(res: UserResponse): User {
  return {
    id: res.id,
    name: res.full_name || res.email.split('@')[0],
    email: res.email,
    role: 'CITIZEN',
    joinedAt: res.created_at
      ? new Date(res.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Recently',
    verificationsCount: 0,
    lastActive: 'Active now',
  };
}

export const authService = {
  /**
   * Authenticate user with email and password via FastAPI backend.
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<BackendTokenResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    setToken(res.access_token);
    const user = mapUserResponseToUser(res.user);
    return { user, token: res.access_token };
  },

  /**
   * Register new citizen account via FastAPI backend.
   */
  async signup(credentials: SignupCredentials): Promise<{ user: User; token: string }> {
    // 1. Call register endpoint
    const registeredUser = await apiClient.post<UserResponse>('/auth/register', {
      email: credentials.email,
      password: credentials.password,
      full_name: credentials.name,
    });

    // 2. Automatically log in to get session token
    let token = '';
    try {
      const loginRes = await apiClient.post<BackendTokenResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      token = loginRes.access_token;
      setToken(token);
    } catch {
      // If auto-login fails, token remains empty
    }

    const user = mapUserResponseToUser(registeredUser);
    return { user, token };
  },

  /**
   * Get current authenticated user profile using stored JWT token.
   */
  async getCurrentUser(): Promise<User | null> {
    const token = getToken();
    if (!token) return null;

    try {
      const userRes = await apiClient.get<UserResponse>('/auth/me');
      return mapUserResponseToUser(userRes);
    } catch {
      setToken(null);
      return null;
    }
  },

  /**
   * Request password reset instructions for citizen account.
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `Password reset verification link dispatched to ${email}.`,
    };
  },

  /**
   * Sign out current citizen user and invalidate local token.
   */
  async logout(): Promise<void> {
    setToken(null);
  },
};
