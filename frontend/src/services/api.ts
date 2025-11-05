// ============================================
// JOCH Bandpage - API Wrapper (Fetch API)
// TypeScript-powered HTTP client
// ============================================

import type { ApiResponse } from '@joch/shared';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ============================================
// Types
// ============================================

interface RequestOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================
// Core Request Function
// ============================================

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Inject JWT token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make request
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Send cookies (for JWT if using httpOnly cookies)
    });

    // Parse response
    const data = await response.json();

    // Handle errors
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || 'Request failed',
        data
      );
    }

    return data;
  } catch (error) {
    // Network error or parsing error
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error',
      error
    );
  }
}

// ============================================
// Helper Methods
// ============================================

export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: 'GET', token }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, data: unknown, token?: string) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  /**
   * PUT request
   */
  put: <T>(endpoint: string, data: unknown, token?: string) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, data: unknown, token?: string) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE', token }),

  /**
   * Upload file (multipart/form-data)
   */
  upload: async <T>(
    endpoint: string,
    formData: FormData,
    token?: string
  ): Promise<ApiResponse<T>> => {
    const headers: HeadersInit = {};

    // Inject JWT token if provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.message || 'Upload failed',
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        0,
        error instanceof Error ? error.message : 'Upload error',
        error
      );
    }
  },
};

// ============================================
// Export API Base URL (for direct usage)
// ============================================

export { API_BASE_URL };
