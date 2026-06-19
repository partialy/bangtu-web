import { HttpError, type Result } from '../types';

const TOKEN_STORAGE_KEY = 'bangtu_admin_token';
const API_PREFIX = '/api/web/admin';

let unauthorizedHandler: (() => void) | null = null;

/** 注册 401 统一处理回调。 */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

/** 读取本地管理员 token。 */
export function getAdminToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

/** 保存本地管理员 token。 */
export function setAdminToken(token: string) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/** 清除本地管理员 token。 */
export function clearAdminToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/** 发起统一封装的 JSON 请求。 */
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAdminToken();
    unauthorizedHandler?.();
    throw new HttpError('登录状态已失效，请重新登录', 401);
  }

  const result = await parseJson<Result<T>>(response);

  if (!response.ok) {
    throw new HttpError(getResultMessage(result) || '请求失败', response.status);
  }

  if (!isSuccessResult(result)) {
    throw new HttpError(getResultMessage(result) || '操作失败', response.status);
  }

  return result.data;
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_PREFIX}${normalizedPath}`;
}

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new HttpError('服务返回格式异常', response.status);
  }
}

function isSuccessResult<T>(result: Result<T>) {
  if (typeof result.success === 'boolean') {
    return result.success;
  }
  return result.code === undefined || result.code === 0 || result.code === 200;
}

function getResultMessage<T>(result: Result<T> | null | undefined) {
  return result?.message || result?.msg || result?.errorMsg;
}
