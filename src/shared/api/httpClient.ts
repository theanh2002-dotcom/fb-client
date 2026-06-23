import type { BaseResponse } from './types';

export const API_BASE_URL = import.meta.env.VITE_FB_API_BASE_URL ?? 'http://localhost:8081';
export const AUTH_TOKEN_KEY = 'fb_review_token';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  skipAuth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  headers.set('ngrok-skip-browser-warning', 'true');

  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (!options.skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new ApiError(
      error instanceof TypeError
        ? 'Không kết nối được backend. Kiểm tra backend đã chạy và VITE_FB_API_BASE_URL đang trỏ đúng địa chỉ.'
        : 'Không thể gửi request tới backend',
      0,
    );
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  const rawBody = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof rawBody === 'string' ? rawBody : rawBody.message;
    throw new ApiError(message || 'Request failed', response.status);
  }

  const body = rawBody as BaseResponse<T>;
  if (body.status !== 1) {
    throw new ApiError(body.message || 'Request failed', response.status);
  }

  return body.payload;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
};
