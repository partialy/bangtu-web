import { useEffect, useState } from 'react';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/login/LoginPage';
import { useAdminAuthStore } from './stores/adminAuthStore';
import type { AdminMenuKey } from './types';

export default function App() {
  const { user, initialized, loading, bootstrap } = useAdminAuthStore();
  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('dashboard');

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (!initialized && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        正在校验登录状态...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AdminLayout activeMenu={activeMenu} onMenuChange={setActiveMenu} />;
}
