// ============================================
// JOCH Bandpage - Auth Service
// ============================================

import { api } from './api';
import type { User, LoginCredentials, RegisterCredentials, ApiResponse } from '@joch/shared';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  /**
   * Get current user profile
   */
  me: async (token: string): Promise<User> => {
    const response = await api.get<User>('/auth/me', token);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>, token: string): Promise<User> => {
    const response = await api.put<User>('/auth/profile', data, token);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (
    data: { currentPassword: string; newPassword: string },
    token: string
  ): Promise<void> => {
    await api.patch<void>('/auth/change-password', data, token);
  },
};
