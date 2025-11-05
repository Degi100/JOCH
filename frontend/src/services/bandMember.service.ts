// ============================================
// JOCH Bandpage - Band Member Service
// Manage band member profiles
// ============================================

import { api } from './api';
import type { BandMember } from '@joch/shared';

export const bandMemberService = {
  /**
   * Get all band members (sorted by order)
   * @returns Array of band members
   */
  getAll: async (): Promise<BandMember[]> => {
    const response = await api.get<BandMember[]>('/band-members');
    if (!response.data) throw new Error("Not found"); return response.data;
  },

  /**
   * Get single band member by ID
   * @param id - Band member ID
   * @returns Single band member
   */
  getById: async (id: string): Promise<BandMember> => {
    const response = await api.get<BandMember>(`/band-members/${id}`);
    if (!response.data) throw new Error("Not found"); return response.data;
  },

  /**
   * Create new band member (Admin/Member only)
   * @param data - Band member data
   * @param token - JWT auth token
   * @returns Created band member
   */
  create: async (data: Partial<BandMember>, token: string): Promise<BandMember> => {
    const response = await api.post<BandMember>('/band-members', data, token);
    if (!response.data) throw new Error("Not found"); return response.data;
  },

  /**
   * Update band member (Admin/Member only)
   * @param id - Band member ID
   * @param data - Updated band member data
   * @param token - JWT auth token
   * @returns Updated band member
   */
  update: async (id: string, data: Partial<BandMember>, token: string): Promise<BandMember> => {
    const response = await api.put<BandMember>(`/band-members/${id}`, data, token);
    if (!response.data) throw new Error("Not found"); return response.data;
  },

  /**
   * Delete band member (Admin only)
   * @param id - Band member ID
   * @param token - JWT auth token
   */
  delete: async (id: string, token: string): Promise<void> => {
    await api.delete<void>(`/band-members/${id}`, token);
  },
};
