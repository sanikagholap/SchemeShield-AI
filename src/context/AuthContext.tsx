import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, SignupCredentials, AuthContextType } from '../types/auth';
import { authService } from '../services/authService';
import { getToken, setToken } from '../services/apiClient';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_CACHE_KEY = 'schemeshield_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_CACHE_KEY);
      const token = getToken();
      if (saved && token) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const token = getToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          if (currentUser) {
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(currentUser));
          } else {
            localStorage.removeItem(USER_CACHE_KEY);
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem(USER_CACHE_KEY);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await authService.login(credentials);
      setUser(loggedInUser);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(loggedInUser));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { user: newUser } = await authService.signup(credentials);
      setUser(newUser);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(newUser));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    try {
      localStorage.removeItem(USER_CACHE_KEY);
    } catch {
      // ignore
    }
  };

  const loginAsDemo = () => {
    // Deprecated no-op: demo accounts are strictly removed in live backend mode
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    loginAsDemo,
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

