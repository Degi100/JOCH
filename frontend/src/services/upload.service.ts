// ============================================
// JOCH Bandpage - Upload Service
// Handle file uploads (images and audio)
// ============================================

import { api } from './api';

export interface UploadResponse {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  url: string;
  thumbnailUrl?: string; // For gallery images with auto-generated thumbnails
}

export const uploadService = {
  /**
   * Upload single image (Admin/Member only)
   * @param file - Image file
   * @param token - JWT auth token
   * @returns Upload response with file info
   */
  uploadImage: async (file: File, token: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.upload<UploadResponse>('/upload/image', formData, token);
    if (!response.data) throw new Error("Upload failed"); return response.data;
  },

  /**
   * Upload multiple images (Admin/Member only)
   * @param files - Array of image files
   * @param token - JWT auth token
   * @returns Array of upload responses
   */
  uploadImages: async (files: File[], token: string): Promise<UploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.upload<UploadResponse[]>('/upload/images', formData, token);
    if (!response.data) throw new Error("Upload failed"); return response.data;
  },

  /**
   * Upload audio file (Admin/Member only)
   * @param file - Audio file (MP3, WAV, etc.)
   * @param token - JWT auth token
   * @returns Upload response with file info
   */
  uploadAudio: async (file: File, token: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await api.upload<UploadResponse>('/upload/audio', formData, token);
    if (!response.data) throw new Error("Upload failed"); return response.data;
  },
};
