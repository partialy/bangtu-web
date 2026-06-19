import { LogOut, MapPinned, MessageSquareText, UserRoundCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { message } from '@/utils/message';

const entryItems = [
  { title: '服务入口', desc: '待接入用户端业务流程', icon: MapPinned },
  { title: '消息通知', desc: '待接入系统通知与进度提醒', icon: MessageSquareText }
];

export function HomeShell() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  function handleLogout() {
    clearSession();
    message.info('已退出登录');
  }

  return (
    <section className="mx-auto min-h-screen w-full max-w-[430px] px-5 pb-8 pt-[max(28px,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">欢迎回来</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">帮涂用户端</h1>
        </div>
        <button
          className="grid h-11 w-11 place-items-center rounded-2xl border border-blue-100 bg-white text-slate-600 shadow-sm transition active:scale-95"
          type="button"
          aria-label="退出登录"
          onClick={handleLogout}
        >
          <LogOut size={20} />
        </button>
      </header>

      <section className="mt-8 rounded-[28px] bg-brand-600 p-5 text-white shadow-soft">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-white/15">
            <UserRoundCheck size={28} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-blue-100">当前账号</p>
            <p className="mt-1 truncate text-xl font-bold">{user?.mobile ?? '用户'}</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">入口占位</h2>
          <span className="text-xs font-medium text-slate-400">等待后端接口</span>
        </div>

        <div className="mt-4 grid gap-3">
          {entryItems.map((item) => {
            const Icon = item.icon;
            return (
              <article
                className="flex items-center gap-4 rounded-3xl border border-blue-100 bg-white p-4 shadow-sm"
                key={item.title}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-brand-600">
                  <Icon size={22} strokeWidth={2.3} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{item.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
