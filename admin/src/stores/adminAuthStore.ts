import { create } from 'zustand';
import type { AdminLoginRequest, AdminUser } from '../types';
import { getMe, login as loginRequest } from '../services/adminAuthService';
import {
  clearAdminToken,
  getAdminToken,
  setAdminToken,
  setUnauthorizedHandler,
} from '../services/http';

interface AdminAuthState {
  /** 当前管理员 */
  user: AdminUser | null;
  /** 是否已完成初始登录态检查 */
  initialized: boolean;
  /** 当前请求是否进行中 */
  loading: boolean;
  /** 错误提示 */
  error: string | null;
  /** 是否已有登录凭证 */
  hasToken: boolean;
  /** 初始化登录态 */
  bootstrap: () => Promise<void>;
  /** 管理员登录 */
  login: (payload: AdminLoginRequest) => Promise<void>;
  /** 退出登录 */
  logout: () => void;
  /** 清空错误 */
  clearError: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,
  hasToken: Boolean(getAdminToken()),
  async bootstrap() {
    if (get().initialized) {
      return;
    }

    const token = getAdminToken();
    if (!token) {
      set({ initialized: true, hasToken: false, user: null });
      return;
    }

    set({ loading: true, error: null, hasToken: true });
    try {
      const user = await getMe();
      set({ user, initialized: true, loading: false });
    } catch (error) {
      clearAdminToken();
      set({
        user: null,
        hasToken: false,
        initialized: true,
        loading: false,
        error: error instanceof Error ? error.message : '登录状态校验失败',
      });
    }
  },
  async login(payload) {
    set({ loading: true, error: null });
    try {
      const response = await loginRequest(payload);
      setAdminToken(response.token);
      const user = response.user ?? (await getMe());
      set({
        user,
        hasToken: true,
        initialized: true,
        loading: false,
      });
    } catch (error) {
      clearAdminToken();
      set({
        user: null,
        hasToken: false,
        loading: false,
        error: error instanceof Error ? error.message : '登录失败',
      });
      throw error;
    }
  },
  logout() {
    clearAdminToken();
    set({ user: null, hasToken: false, initialized: true, error: null });
  },
  clearError() {
    set({ error: null });
  },
}));

setUnauthorizedHandler(() => {
  useAdminAuthStore.getState().logout();
});
