// ============================================
// JOCH Bandpage - Guestbook Service
// ============================================

import { api } from './api';
import type { GuestbookEntry, CreateGuestbookEntryDto } from '@joch/shared';

/**
 * Guestbook Service
 * API calls for guestbook operations
 */
export const guestbookService = {
  /**
   * Get all guestbook entries (public)
   */
  async getAll(): Promise<GuestbookEntry[]> {
    const response = await api.get<GuestbookEntry[]>('/guestbook');
    return response.data || [];
  },

  /**
   * Get all guestbook entries (admin - with emails)
   */
  async getAllAdmin(token: string): Promise<GuestbookEntry[]> {
    const response = await api.get<GuestbookEntry[]>('/guestbook/admin', token);
    return response.data || [];
  },

  /**
   * Create new guestbook entry
   */
  async create(data: CreateGuestbookEntryDto): Promise<GuestbookEntry> {
    const response = await api.post<GuestbookEntry>('/guestbook', data);
    return response.data!;
  },

  /**
   * Delete guestbook entry (admin only)
   */
  async delete(id: string, token: string): Promise<void> {
    await api.delete(`/guestbook/${id}`, token);
  },
};
