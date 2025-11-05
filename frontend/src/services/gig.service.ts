// ============================================
// JOCH Bandpage - Gig Service
// ============================================

import { api } from './api';
import type { Gig } from '@joch/shared';

export interface GigListResponse {
  data: Gig[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const gigService = {
  /**
   * Get all gigs (with optional filters)
   */
  getAll: async (params?: {
    status?: 'upcoming' | 'past' | 'cancelled';
    page?: number;
    limit?: number;
  }): Promise<Gig[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = query ? `/gigs?${query}` : '/gigs';

    const response = await api.get<Gig[]>(endpoint);
    return response.data || [];
  },

  /**
   * Get upcoming gigs
   */
  getUpcoming: async (): Promise<Gig[]> => {
    const response = await api.get<Gig[]>('/gigs/upcoming');
    return response.data || [];
  },

  /**
   * Get past gigs
   */
  getPast: async (): Promise<Gig[]> => {
    const response = await api.get<Gig[]>('/gigs/past');
    return response.data || [];
  },

  /**
   * Get single gig by ID
   */
  getById: async (id: string): Promise<Gig> => {
    const response = await api.get<Gig>(`/gigs/${id}`);
    if (!response.data) throw new Error('Gig not found');
    return response.data;
  },

  /**
   * Create new gig (Admin/Member only)
   */
  create: async (data: Partial<Gig>, token: string): Promise<Gig> => {
    const response = await api.post<Gig>('/gigs', data, token);
    if (!response.data) throw new Error('Failed to create gig');
    return response.data;
  },

  /**
   * Update gig (Admin/Member only)
   */
  update: async (id: string, data: Partial<Gig>, token: string): Promise<Gig> => {
    const response = await api.put<Gig>(`/gigs/${id}`, data, token);
    if (!response.data) throw new Error('Failed to update gig');
    return response.data;
  },

  /**
   * Delete gig (Admin only)
   */
  delete: async (id: string, token: string): Promise<void> => {
    await api.delete<void>(`/gigs/${id}`, token);
  },
};
