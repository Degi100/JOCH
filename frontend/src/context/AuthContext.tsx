// ============================================
// JOCH Bandpage - Auth Context
// Global authentication state management
// ============================================

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService, ApiError } from '../services';
import type { User, LoginCredentials, RegisterCredentials } from '@joch/shared';

// ============================================
// Types
// ============================================

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  /**
   * Load user from localStorage on mount
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('joch_token');
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        // Verify token by fetching user
        const userData = await authService.me(storedToken);
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        // Token invalid or expired
        console.error('Failed to load user:', error);
        localStorage.removeItem('joch_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await authService.login(credentials);

      // Store token
      localStorage.setItem('joch_token', response.token);

      // Update state
      setUser(response.user);
      setToken(response.token);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Login failed');
    }
  };

  /**
   * Register new user
   */
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      const response = await authService.register(credentials);

      // Store token
      localStorage.setItem('joch_token', response.token);

      // Update state
      setUser(response.user);
      setToken(response.token);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Registration failed');
    }
  };

  /**
   * Logout user
   */
  const logout = (): void => {
    // Clear storage
    localStorage.removeItem('joch_token');

    // Clear state
    setUser(null);
    setToken(null);
  };

  /**
   * Refresh user data (after profile update)
   */
  const refreshUser = async (): Promise<void> => {
    if (!token) return;

    try {
      const userData = await authService.me(token);
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might be logged out
      logout();
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================
// Hook
// ============================================

/**
 * Custom hook to use Auth context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
