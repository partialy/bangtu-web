import { useEffect } from 'react';
import { HomeShell } from '@/pages/HomeShell';
import { getMe } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { message } from '@/utils/message';

export default function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (!token || user) {
      return;
    }

    getMe()
      .then(setUser)
      .catch((error: unknown) => {
        clearSession();
        const content = error instanceof Error ? error.message : '登录状态已失效';
        message.warning(content);
      });
  }, [clearSession, setUser, token, user]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/70 to-white">
      <HomeShell />
    </main>
  );
}
