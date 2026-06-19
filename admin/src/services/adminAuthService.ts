import type { AdminLoginRequest, AdminLoginResponse, AdminUser } from '../types';
import { request } from './http';

/** 管理员登录。 */
export function login(payload: AdminLoginRequest) {
  return request<AdminLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** 获取当前管理员信息。 */
export function getMe() {
  return request<AdminUser>('/auth/me', {
    method: 'GET',
  });
}
