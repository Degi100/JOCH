// ============================================
// JOCH Bandpage - Song Service
// Manage songs, audio files, and lyrics
// ============================================

import { api } from './api';
import type { Song } from '@joch/shared';

export const songService = {
  /**
   * Get all songs (sorted by order)
   * @returns Array of songs
   */
  getAll: async (): Promise<Song[]> => {
    const response = await api.get<Song[]>('/songs');
    return response.data;
  },

  /**
   * Get single song by ID
   * @param id - Song ID
   * @returns Single song
   */
  getById: async (id: string): Promise<Song> => {
    const response = await api.get<Song>(`/songs/${id}`);
    return response.data;
  },

  /**
   * Create new song (Admin/Member only)
   * @param data - Song data
   * @param token - JWT auth token
   * @returns Created song
   */
  create: async (data: Partial<Song>, token: string): Promise<Song> => {
    const response = await api.post<Song>('/songs', data, token);
    return response.data;
  },

  /**
   * Update song (Admin/Member only)
   * @param id - Song ID
   * @param data - Updated song data
   * @param token - JWT auth token
   * @returns Updated song
   */
  update: async (id: string, data: Partial<Song>, token: string): Promise<Song> => {
    const response = await api.put<Song>(`/songs/${id}`, data, token);
    return response.data;
  },

  /**
   * Delete song (Admin only)
   * @param id - Song ID
   * @param token - JWT auth token
   */
  delete: async (id: string, token: string): Promise<void> => {
    await api.delete<void>(`/songs/${id}`, token);
  },

  /**
   * Reorder songs (Admin/Member only)
   * @param songIds - Array of song IDs in new order
   * @param token - JWT auth token
   * @returns Updated songs
   */
  reorder: async (songIds: string[], token: string): Promise<Song[]> => {
    const response = await api.patch<Song[]>('/songs/reorder', { songIds }, token);
    return response.data;
  },
};
