// ============================================
// JOCH Bandpage - Gallery Service
// Manage gallery images and categories
// ============================================

import { api } from './api';
import type { GalleryImage } from '@joch/shared';

type GalleryCategory = 'live' | 'promo' | 'backstage' | 'other';

export const galleryService = {
  /**
   * Get all gallery images (optionally filtered by category)
   * @param category - Optional category filter
   * @returns Array of gallery images
   */
  getAll: async (category?: GalleryCategory): Promise<GalleryImage[]> => {
    const endpoint = category ? `/gallery?category=${category}` : '/gallery';
    const response = await api.get<GalleryImage[]>(endpoint);
    return response.data || [];
  },

  /**
   * Get single gallery image by ID
   * @param id - Gallery image ID
   * @returns Single gallery image
   */
  getById: async (id: string): Promise<GalleryImage> => {
    const response = await api.get<GalleryImage>(`/gallery/${id}`);
    if (!response.data) throw new Error('Gallery image not found');
    return response.data;
  },

  /**
   * Create new gallery image (Admin/Member only)
   * @param data - Gallery image data
   * @param token - JWT auth token
   * @returns Created gallery image
   */
  create: async (data: Partial<GalleryImage>, token: string): Promise<GalleryImage> => {
    const response = await api.post<GalleryImage>('/gallery', data, token);
    if (!response.data) throw new Error('Failed to create gallery image');
    return response.data;
  },

  /**
   * Update gallery image (Admin/Member only)
   * @param id - Gallery image ID
   * @param data - Updated gallery image data
   * @param token - JWT auth token
   * @returns Updated gallery image
   */
  update: async (id: string, data: Partial<GalleryImage>, token: string): Promise<GalleryImage> => {
    const response = await api.put<GalleryImage>(`/gallery/${id}`, data, token);
    if (!response.data) throw new Error('Failed to update gallery image');
    return response.data;
  },

  /**
   * Delete gallery image (Admin only)
   * @param id - Gallery image ID
   * @param token - JWT auth token
   */
  delete: async (id: string, token: string): Promise<void> => {
    await api.delete<void>(`/gallery/${id}`, token);
  },

  /**
   * Reorder gallery images (Admin/Member only)
   * @param imageIds - Array of image IDs in new order
   * @param token - JWT auth token
   * @returns Updated images
   */
  reorder: async (imageIds: string[], token: string): Promise<GalleryImage[]> => {
    const response = await api.patch<GalleryImage[]>('/gallery/reorder', { imageIds }, token);
    return response.data || [];
  },
};
