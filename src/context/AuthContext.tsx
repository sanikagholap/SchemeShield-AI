import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, SignupCredentials, AuthContextType } from '../types/auth';
import { MOCK_CITIZEN_USER, MOCK_VERIFIER_USER } from '../data/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'schemeshield_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      // Default to demo citizen session for seamless evaluator experience
      
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors in restricted iframe
    }
  }, [user]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    // Simulate realistic network delay
    await new Promise((res) => setTimeout(res, 600));

    const loggedUser: User = {
      ...MOCK_CITIZEN_USER,
      email: credentials.email || MOCK_CITIZEN_USER.email,
      name: credentials.email.split('@')[0].replace(/[._]/g, ' ') || MOCK_CITIZEN_USER.name,
      lastActive: 'Just now'
    };

    setUser(loggedUser);
    setIsLoading(false);
    return true;
  };

  const signup = async (credentials: SignupCredentials): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 750));

    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: credentials.name,
      email: credentials.email,
      phone: credentials.phone || '+91 98000 00000',
      role: 'CITIZEN',
      organization: credentials.organization || 'Independent Citizen Verifier',
      avatarUrl: '',
      joinedAt: 'Just now',
      verificationsCount: 0,
      lastActive: 'Just now'
    };

    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const loginAsDemo = (role: 'CITIZEN' | 'VERIFIER' = 'CITIZEN') => {
    const demoUser = role === 'VERIFIER' ? MOCK_VERIFIER_USER : MOCK_CITIZEN_USER;
    setUser(demoUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    loginAsDemo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
