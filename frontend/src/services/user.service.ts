// ============================================
// JOCH Bandpage - User Service
// API calls for user management
// ============================================

import { User } from '@joch/shared';
import { api, ApiError } from './api';

export const userService = {
  /**
   * Get all users (admin only)
   */
  async getAll(token: string): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/auth/users', token);
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch users');
    }
  },

  /**
   * Update user role (admin only)
   */
  async updateRole(userId: string, role: 'admin' | 'member' | 'user', token: string): Promise<User> {
    try {
      const response = await api.patch<User>(`/auth/users/${userId}/role`, { role }, token);
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to update user role');
    }
  },
};