import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { WebUser } from '@/types/auth';

interface AuthState {
  token: string | null;
  user: WebUser | null;
  setSession: (token: string, user: WebUser | null) => void;
  setUser: (user: WebUser | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null })
    }),
    {
      name: 'bangtu-web-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user
      })
    }
  )
);
