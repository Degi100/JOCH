// ============================================
// JOCH Bandpage - News Service
// Manage news posts and blog content
// ============================================

import { api } from './api';
import type { NewsPost } from '@joch/shared';

export const newsService = {
  /**
   * Get all published news posts
   * @returns Array of published news posts, sorted by date (newest first)
   */
  getAll: async (): Promise<NewsPost[]> => {
    const response = await api.get<NewsPost[]>('/news');
    if (!response.data) throw new Error("Not found"); return response.data;
  },

  /**
   * Get single news post by ID
   * @param id - News post ID
   * @returns Single news post
   */
  getById: async (id: string): Promise<NewsPost> => {
    const response = await api.get<NewsPost>(`/news/${id}`);
    if (!response.data) throw new Error("Not found"); return response.data;
  },

  /**
   * Get news post by slug (URL-friendly identifier)
   * @param slug - News post slug
   * @returns Single news post
   */
  getBySlug: async (slug: string): Promise<NewsPost> => {
    const response = await api.get<NewsPost>(`/news/slug/${slug}`);
    if (!response.data) throw new Error("Not found"); return response.data;
  },

  /**
   * Create new news post (Admin/Member only)
   * @param data - News post data
   * @param token - JWT auth token
   * @returns Created news post
   */
  create: async (data: Partial<NewsPost>, token: string): Promise<NewsPost> => {
    const response = await api.post<NewsPost>('/news', data, token);
    if (!response.data) throw new Error("Not found"); return response.data;
  },

  /**
   * Update news post (Admin/Member only)
   * @param id - News post ID
   * @param data - Updated news post data
   * @param token - JWT auth token
   * @returns Updated news post
   */
  update: async (id: string, data: Partial<NewsPost>, token: string): Promise<NewsPost> => {
    const response = await api.put<NewsPost>(`/news/${id}`, data, token);
    if (!response.data) throw new Error("Not found"); return response.data;
  },

  /**
   * Delete news post (Admin only)
   * @param id - News post ID
   * @param token - JWT auth token
   */
  delete: async (id: string, token: string): Promise<void> => {
    await api.delete<void>(`/news/${id}`, token);
  },
};
