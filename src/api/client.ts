/**
 * Central API Client for ImaraPay Frontend
 * Provides unified request handling, error formatting, and transparent support
 * for both the mock storage engine and future Django REST Framework endpoints.
 */

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export class AppApiError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, code?: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'AppApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'; // defaults to true for prototype demo

/**
 * Standard error response builder
 */
export function handleApiError(err: any): never {
  if (err instanceof AppApiError) {
    throw err;
  }
  const status = err?.status || err?.response?.status || 500;
  const message =
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    'An unexpected error occurred. Please try again.';

  throw new AppApiError(status, message);
}
