// ============================================
// JOCH Bandpage - Contact Service
// Handle contact form submissions
// ============================================

import { api } from './api';
import type { ContactMessage } from '@joch/shared';

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const contactService = {
  /**
   * Send contact message (public endpoint)
   * @param data - Contact form data
   * @returns Created contact message
   */
  send: async (data: ContactFormData): Promise<ContactMessage> => {
    const response = await api.post<ContactMessage>('/contact', data);
    return response.data;
  },

  /**
   * Get all contact messages (Admin only)
   * @param token - JWT auth token
   * @returns Array of contact messages
   */
  getAll: async (token: string): Promise<ContactMessage[]> => {
    const response = await api.get<ContactMessage[]>('/contact', token);
    return response.data;
  },

  /**
   * Get single contact message (Admin only)
   * @param id - Contact message ID
   * @param token - JWT auth token
   * @returns Single contact message
   */
  getById: async (id: string, token: string): Promise<ContactMessage> => {
    const response = await api.get<ContactMessage>(`/contact/${id}`, token);
    return response.data;
  },

  /**
   * Mark contact message as read (Admin only)
   * @param id - Contact message ID
   * @param token - JWT auth token
   * @returns Updated contact message
   */
  markAsRead: async (id: string, token: string): Promise<ContactMessage> => {
    const response = await api.patch<ContactMessage>(`/contact/${id}/read`, {}, token);
    return response.data;
  },

  /**
   * Delete contact message (Admin only)
   * @param id - Contact message ID
   * @param token - JWT auth token
   */
  delete: async (id: string, token: string): Promise<void> => {
    await api.delete<void>(`/contact/${id}`, token);
  },
};
