// ============================================
// JOCH Bandpage - Band Service
// Manage band members
// ============================================

import { api } from './api';
import type { BandMember } from '@joch/shared';

export const bandService = {
  /**
   * Get all band members (sorted by order)
   * @returns Array of band members
   */
  getAll: async (): Promise<BandMember[]> => {
    const response = await api.get<BandMember[]>('/band-members');
    return response.data || [];
  },

  /**
   * Get single band member by ID
   * @param id - Band member ID
   * @returns Single band member
   */
  getById: async (id: string): Promise<BandMember> => {
    const response = await api.get<BandMember>(`/band-members/${id}`);
    if (!response.data) throw new Error('Band member not found');
    return response.data;
  },

  /**
   * Create new band member (Admin only)
   * @param data - Band member data
   * @param token - JWT auth token
   * @returns Created band member
   */
  create: async (data: Partial<BandMember>, token: string): Promise<BandMember> => {
    const response = await api.post<BandMember>('/band-members', data, token);
    if (!response.data) throw new Error('Failed to create band member');
    return response.data;
  },

  /**
   * Update band member (Admin only)
   * @param id - Band member ID
   * @param data - Updated band member data
   * @param token - JWT auth token
   * @returns Updated band member
   */
  update: async (id: string, data: Partial<BandMember>, token: string): Promise<BandMember> => {
    const response = await api.put<BandMember>(`/band-members/${id}`, data, token);
    if (!response.data) throw new Error('Failed to update band member');
    return response.data;
  },

  /**
   * Delete band member (Admin only)
   * @param id - Band member ID
   * @param token - JWT auth token
   */
  delete: async (id: string, token: string): Promise<void> => {
    await api.delete<void>(`/band-members/${id}`, token);
  },

  /**
   * Reorder band members (Admin only)
   * @param memberIds - Array of member IDs in new order
   * @param token - JWT auth token
   * @returns Updated band members
   */
  reorder: async (memberIds: string[], token: string): Promise<BandMember[]> => {
    const response = await api.patch<BandMember[]>('/band-members/reorder', { memberIds }, token);
    return response.data || [];
  },
};