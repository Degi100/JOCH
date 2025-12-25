// ============================================
// JOCH Bandpage - Social Link Service
// Manage social media links
// ============================================

import { api } from './api';
import type { SocialLink } from '@joch/shared';

export const socialLinkService = {
  /**
   * Get all social links (only active by default)
   * @param includeInactive - Include inactive links (for admin)
   * @returns Array of social links
   */
  getAll: async (includeInactive = false): Promise<SocialLink[]> => {
    const endpoint = includeInactive ? '/social-links?all=true' : '/social-links';
    const response = await api.get<SocialLink[]>(endpoint);
    return response.data || [];
  },

  /**
   * Get single social link by ID
   * @param id - Social link ID
   * @returns Single social link
   */
  getById: async (id: string): Promise<SocialLink> => {
    const response = await api.get<SocialLink>(`/social-links/${id}`);
    if (!response.data) throw new Error('Social link not found');
    return response.data;
  },

  /**
   * Create new social link (Admin/Member only)
   * @param data - Social link data
   * @param token - JWT auth token
   * @returns Created social link
   */
  create: async (data: Partial<SocialLink>, token: string): Promise<SocialLink> => {
    const response = await api.post<SocialLink>('/social-links', data, token);
    if (!response.data) throw new Error('Failed to create social link');
    return response.data;
  },

  /**
   * Update social link (Admin/Member only)
   * @param id - Social link ID
   * @param data - Updated social link data
   * @param token - JWT auth token
   * @returns Updated social link
   */
  update: async (id: string, data: Partial<SocialLink>, token: string): Promise<SocialLink> => {
    const response = await api.put<SocialLink>(`/social-links/${id}`, data, token);
    if (!response.data) throw new Error('Failed to update social link');
    return response.data;
  },

  /**
   * Delete social link (Admin/Member only)
   * @param id - Social link ID
   * @param token - JWT auth token
   */
  delete: async (id: string, token: string): Promise<void> => {
    await api.delete<void>(`/social-links/${id}`, token);
  },

  /**
   * Reorder social links (Admin/Member only)
   * @param orderedIds - Array of link IDs in new order
   * @param token - JWT auth token
   * @returns Updated links
   */
  reorder: async (orderedIds: string[], token: string): Promise<SocialLink[]> => {
    const response = await api.patch<SocialLink[]>('/social-links/reorder', { orderedIds }, token);
    return response.data || [];
  },
};
