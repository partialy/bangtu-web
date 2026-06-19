import type { AdminMenuKey } from '../../types';
import { useAdminAuthStore } from '../../stores/adminAuthStore';
import DashboardPage from '../../pages/dashboard/DashboardPage';

interface AdminLayoutProps {
  /** 当前菜单 */
  activeMenu: AdminMenuKey;
  /** 菜单切换 */
  onMenuChange: (menu: AdminMenuKey) => void;
}

const menuItems: Array<{ key: AdminMenuKey; label: string }> = [
  { key: 'dashboard', label: '控制台' },
  { key: 'announcements', label: '公告管理' },
  { key: 'reviews', label: '信息审核' },
  { key: 'orders', label: '订单管理' },
  { key: 'settings', label: '系统配置' },
];

export default function AdminLayout({
  activeMenu,
  onMenuChange,
}: AdminLayoutProps) {
  const { user, logout } = useAdminAuthStore();
  const currentMenu = menuItems.find((item) => item.key === activeMenu);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center border-b border-slate-100 px-6">
          <div>
            <div className="text-lg font-semibold text-brand-700">帮涂后台</div>
            <div className="text-xs text-slate-400">Admin Console</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4">
          {menuItems.map((item) => {
            const active = item.key === activeMenu;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onMenuChange(item.key)}
                className={[
                  'mb-1 flex h-10 w-full items-center rounded-md px-4 text-left text-sm transition',
                  active
                    ? 'bg-brand-50 font-medium text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600',
                ].join(' ')}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h1 className="text-base font-semibold text-slate-800">
              {currentMenu?.label}
            </h1>
            <p className="text-xs text-slate-400">传统后台管理工作台</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-700">
                {user?.nickname || user?.username}
              </div>
              <div className="text-xs text-slate-400">
                {user?.roleName || '管理员'}
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-brand-200 hover:text-brand-600"
            >
              退出
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          {activeMenu === 'dashboard' ? (
            <DashboardPage />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
              <div className="text-base font-medium text-slate-700">
                {currentMenu?.label}
              </div>
              <div className="mt-2 text-sm text-slate-400">待实现</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
