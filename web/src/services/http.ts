import { useAuthStore } from '@/stores/authStore';
import { HttpError, type Result } from '@/types/http';

const API_PREFIX = '/api/web';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

interface ApiEnvelope<T> {
  code?: number;
  status?: number;
  success?: boolean;
  message?: string;
  msg?: string;
  data?: T;
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_PREFIX}${normalizedPath}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getResultCode(envelope: ApiEnvelope<unknown>) {
  if (typeof envelope.code === 'number') {
    return envelope.code;
  }
  if (typeof envelope.status === 'number') {
    return envelope.status;
  }
  return envelope.success === false ? -1 : 0;
}

function isSuccessCode(code: number, envelope: ApiEnvelope<unknown>) {
  return envelope.success === true || code === 0 || code === 200;
}

async function parseJson<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text();
  if (!text) {
    return { code: response.ok ? 0 : response.status, message: response.statusText, data: undefined as T };
  }

  const json = JSON.parse(text) as unknown;
  if (!isRecord(json)) {
    return { code: response.ok ? 0 : response.status, data: json as T };
  }

  return json as ApiEnvelope<T>;
}

function handleUnauthorized() {
  useAuthStore.getState().clearSession();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<Result<T>> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal
  });

  let envelope: ApiEnvelope<T>;
  try {
    envelope = await parseJson<T>(response);
  } catch {
    throw new HttpError('服务器返回格式异常', response.status);
  }

  const code = getResultCode(envelope);
  const message = envelope.message ?? envelope.msg ?? response.statusText ?? '请求失败';

  if (response.status === 401 || code === 401) {
    handleUnauthorized();
    throw new HttpError(message || '登录状态已失效', 401, code);
  }

  if (!response.ok || !isSuccessCode(code, envelope)) {
    throw new HttpError(message, response.status, code);
  }

  return {
    code,
    message,
    data: envelope.data as T
  };
}

export const http = {
  get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'GET' });
  },
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'POST', body });
  },
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'PUT', body });
  },
  delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'DELETE' });
  }
};
