import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Home,
  Loader2,
  LogOut,
  Megaphone,
  MessageCircle,
  PenLine,
  PlusCircle,
  Search,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { BottomTabs, type BottomTabItem } from '@/common/BottomTabs';
import { InfoCard } from '@/common/InfoCard';
import { StoreCard } from '@/common/StoreCard';
import { getHomeData } from '@/services/homeService';
import { listInfo, publishInfo } from '@/services/infoService';
import { listStores } from '@/services/storeService';
import { useAuthStore } from '@/stores/authStore';
import type { HomeData, InfoItem, PublishInfoPayload, StoreItem } from '@/types/content';
import { message } from '@/utils/message';
import { LoginPage } from '@/pages/LoginPage';

type TabKey = 'home' | 'store' | 'publish' | 'project' | 'mine';

const tabs: BottomTabItem[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'store', label: '商家', icon: Building2 },
  { key: 'publish', label: '发布', icon: PlusCircle },
  { key: 'project', label: '项目', icon: BriefcaseBusiness },
  { key: 'mine', label: '我的', icon: UserRound }
];

const shortcuts = [
  { label: '项目下单', icon: ClipboardList, tab: 'project' as TabKey },
  { label: '精选商家', icon: Building2, tab: 'store' as TabKey },
  { label: '信息列表', icon: MessageCircle, tab: 'home' as TabKey },
  { label: '发布信息', icon: PenLine, tab: 'publish' as TabKey }
];

const emptyHomeData: HomeData = {
  notices: [],
  topInfos: [],
  latestInfos: [],
  stores: []
};

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto min-h-screen w-full max-w-[430px] px-4 pb-[96px] pt-[max(18px,env(safe-area-inset-top))]">
      {children}
    </section>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      {action}
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center rounded-[22px] border border-blue-100 bg-white p-8 text-brand-600">
      <Loader2 className="animate-spin" size={22} />
    </div>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-[22px] border border-dashed border-blue-200 bg-white p-8 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

function HomePage({
  data,
  loading,
  onTabChange
}: {
  data: HomeData;
  loading: boolean;
  onTabChange: (key: TabKey) => void;
}) {
  const noticeText = data.notices[0]?.title || data.notices[0]?.content || '平台公告会在这里展示';
  const displayInfos = data.latestInfos.length > 0 ? data.latestInfos : data.topInfos;
  const topInfos = data.topInfos.slice(0, 3);

  return (
    <PageShell>
      <header className="rounded-b-[30px] bg-brand-600 px-4 pb-5 pt-4 text-white shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-100">帮涂好师傅</p>
            <h1 className="mt-1 text-2xl font-bold">同城施工与信息平台</h1>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
            <ShieldCheck size={22} />
          </div>
        </div>

        <button
          className="mt-5 flex h-12 w-full items-center gap-3 rounded-2xl bg-white px-4 text-left text-sm font-medium text-slate-400"
          type="button"
        >
          <Search size={18} />
          搜信息、找商家、看项目
        </button>
      </header>

      <section className="mt-4 flex items-center gap-3 rounded-[22px] border border-blue-100 bg-white px-4 py-3 shadow-sm">
        <Megaphone className="shrink-0 text-brand-600" size={20} />
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-600">{noticeText}</p>
      </section>

      <section className="mt-4 grid grid-cols-4 gap-2">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className="flex min-h-[78px] flex-col items-center justify-center gap-2 rounded-[20px] border border-blue-100 bg-white text-sm font-semibold text-slate-700 shadow-sm transition active:scale-95"
              key={item.label}
              type="button"
              onClick={() => onTabChange(item.tab)}
            >
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-50 text-brand-600">
                <Icon size={19} />
              </span>
              {item.label}
            </button>
          );
        })}
      </section>

      <section className="mt-5 rounded-[24px] bg-white p-4 shadow-sm">
        <div className="grid grid-cols-3 divide-x divide-blue-100 text-center">
          <div>
            <p className="text-xl font-bold text-slate-950">{data.latestInfos.length}</p>
            <p className="mt-1 text-xs text-slate-400">最新信息</p>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-950">{data.stores.length}</p>
            <p className="mt-1 text-xs text-slate-400">推荐商家</p>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-950">{topInfos.length}</p>
            <p className="mt-1 text-xs text-slate-400">置顶内容</p>
          </div>
        </div>
      </section>

      {topInfos.length > 0 ? (
        <section className="mt-5">
          <SectionTitle title="置顶信息" />
          <div className="mt-3 grid gap-3">
            {topInfos.map((item) => (
              <InfoCard item={item} key={`${item.sourceType}-${item.sourceId}`} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-5">
        <SectionTitle
          title="推荐商家"
          action={
            <button className="text-sm font-semibold text-brand-600" type="button" onClick={() => onTabChange('store')}>
              查看更多
            </button>
          }
        />
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {data.stores.slice(0, 6).map((store) => (
            <button
              className="w-[132px] shrink-0 rounded-[22px] border border-blue-100 bg-white p-3 text-left shadow-sm"
              key={store.storeId}
              type="button"
              onClick={() => onTabChange('store')}
            >
              <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-2xl bg-blue-50 text-brand-600">
                {store.storeLogo ? (
                  <img className="h-full w-full object-cover" src={store.storeLogo} alt={store.storeName} />
                ) : (
                  <Building2 size={24} />
                )}
              </div>
              <p className="mt-2 truncate text-sm font-bold text-slate-950">{store.storeName}</p>
            </button>
          ))}
          {!loading && data.stores.length === 0 ? <EmptyBlock text="暂无推荐商家" /> : null}
        </div>
      </section>

      <section className="mt-5">
        <SectionTitle title="最新消息" />
        <div className="mt-3 grid gap-3">
          {loading ? <LoadingBlock /> : null}
          {!loading && displayInfos.length === 0 ? <EmptyBlock text="暂无信息内容" /> : null}
          {displayInfos.map((item) => (
            <InfoCard item={item} key={`${item.sourceType}-${item.sourceId}`} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function StorePage({ stores, loading }: { stores: StoreItem[]; loading: boolean }) {
  return (
    <PageShell>
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">商家列表</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">精选服务商家</h1>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-brand-600">
          <Building2 size={22} />
        </div>
      </header>
      <div className="mt-5 grid gap-3">
        {loading ? <LoadingBlock /> : null}
        {!loading && stores.length === 0 ? <EmptyBlock text="暂无商家数据" /> : null}
        {stores.map((store) => (
          <StoreCard item={store} key={store.storeId} />
        ))}
      </div>
    </PageShell>
  );
}

function PublishPage({ loggedIn, onPublished }: { loggedIn: boolean; onPublished: () => void }) {
  const [form, setForm] = useState<PublishInfoPayload>({
    title: '',
    content: '',
    categoryName: '活找人',
    contactName: '',
    contactMobile: '',
    city: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  function updateForm<K extends keyof PublishInfoPayload>(key: K, value: PublishInfoPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loggedIn) {
      message.warning('请先登录后再发布');
      return;
    }
    if (!form.title.trim() || !form.content.trim()) {
      message.warning('请填写标题和内容');
      return;
    }

    setSubmitting(true);
    try {
      await publishInfo({
        ...form,
        title: form.title.trim(),
        content: form.content.trim()
      });
      message.success('发布成功');
      setForm({ title: '', content: '', categoryName: '活找人', contactName: '', contactMobile: '', city: '', address: '' });
      onPublished();
    } catch (error) {
      const content = error instanceof Error ? error.message : '发布失败';
      message.error(content);
    } finally {
      setSubmitting(false);
    }
  }

  if (!loggedIn) {
    return (
      <PageShell>
        <LoginPage compact />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <header>
        <p className="text-sm font-semibold text-brand-600">发布信息</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">让用户首屏看到你的需求</h1>
      </header>
      <form className="mt-5 grid gap-4 rounded-[26px] border border-blue-100 bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">标题</span>
          <input
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-brand-500 focus:ring-4 focus:ring-blue-100"
            value={form.title}
            onChange={(event) => updateForm('title', event.target.value)}
            placeholder="例如：找墙面修补师傅"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">内容</span>
          <textarea
            className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-blue-100"
            value={form.content}
            onChange={(event) => updateForm('content', event.target.value)}
            placeholder="请描述需求、时间、位置和预算"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-brand-500 focus:ring-4 focus:ring-blue-100"
            value={form.contactName}
            onChange={(event) => updateForm('contactName', event.target.value)}
            placeholder="联系人"
          />
          <input
            className="h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-brand-500 focus:ring-4 focus:ring-blue-100"
            value={form.contactMobile}
            onChange={(event) => updateForm('contactMobile', event.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="手机号"
            inputMode="numeric"
          />
        </div>
        <input
          className="h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-brand-500 focus:ring-4 focus:ring-blue-100"
          value={form.city}
          onChange={(event) => updateForm('city', event.target.value)}
          placeholder="城市"
        />
        <input
          className="h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-brand-500 focus:ring-4 focus:ring-blue-100"
          value={form.address}
          onChange={(event) => updateForm('address', event.target.value)}
          placeholder="详细地址"
        />
        <button
          className="flex h-13 min-h-13 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:bg-slate-300"
          type="submit"
          disabled={submitting}
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <PenLine size={18} />}
          提交发布
        </button>
      </form>
    </PageShell>
  );
}

function ProjectPage() {
  return (
    <PageShell>
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">项目列表</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">项目下单框架</h1>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-brand-600">
          <BriefcaseBusiness size={22} />
        </div>
      </header>
      <div className="mt-5 rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm">
        <p className="text-base font-bold text-slate-950">V1 先保留项目入口</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          后续接入 Web 项目和小程序项目双源列表，这里会承载项目详情、下单和我的订单链路。
        </p>
      </div>
    </PageShell>
  );
}

function MinePage({ onLogout }: { onLogout: () => void }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return (
      <PageShell>
        <LoginPage compact />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="rounded-[28px] bg-brand-600 p-5 text-white shadow-soft">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-white/15">
            <UserRound size={28} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-blue-100">当前账号</p>
            <p className="mt-1 truncate text-xl font-bold">{user?.mobile ?? '已登录用户'}</p>
          </div>
        </div>
      </section>
      <div className="mt-5 grid gap-3">
        <div className="rounded-[22px] border border-blue-100 bg-white p-4 shadow-sm">
          <p className="font-bold text-slate-950">我的发布</p>
          <p className="mt-1 text-sm text-slate-500">后续接入我的信息和审核状态。</p>
        </div>
        <div className="rounded-[22px] border border-blue-100 bg-white p-4 shadow-sm">
          <p className="font-bold text-slate-950">我的订单</p>
          <p className="mt-1 text-sm text-slate-500">后续接入项目订单、退款申请和进度查询。</p>
        </div>
        <button
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white font-semibold text-slate-600 shadow-sm"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={18} />
          退出登录
        </button>
      </div>
    </PageShell>
  );
}

export function HomeShell() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [homeData, setHomeData] = useState<HomeData>(emptyHomeData);
  const [infos, setInfos] = useState<InfoItem[]>([]);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loadingHome, setLoadingHome] = useState(true);
  const [loadingStores, setLoadingStores] = useState(false);
  const clearSession = useAuthStore((state) => state.clearSession);
  const token = useAuthStore((state) => state.token);

  const mergedInfos = useMemo(() => {
    return infos.length > 0 ? infos : homeData.latestInfos;
  }, [homeData.latestInfos, infos]);

  async function loadHome() {
    setLoadingHome(true);
    try {
      const [home, infoList] = await Promise.all([getHomeData(), listInfo({ page: 1, size: 10 })]);
      setHomeData(home);
      setInfos(infoList);
    } catch (error) {
      const content = error instanceof Error ? error.message : '首页数据加载失败';
      message.error(content);
    } finally {
      setLoadingHome(false);
    }
  }

  async function loadStores() {
    setLoadingStores(true);
    try {
      setStores(await listStores({ page: 1, size: 20 }));
    } catch (error) {
      const content = error instanceof Error ? error.message : '商家数据加载失败';
      message.error(content);
    } finally {
      setLoadingStores(false);
    }
  }

  function handleLogout() {
    clearSession();
    message.info('已退出登录');
  }

  useEffect(() => {
    void loadHome();
  }, []);

  useEffect(() => {
    if (activeTab === 'store' && stores.length === 0) {
      void loadStores();
    }
  }, [activeTab, stores.length]);

  return (
    <>
      {activeTab === 'home' ? (
        <HomePage
          data={{ ...homeData, latestInfos: mergedInfos }}
          loading={loadingHome}
          onTabChange={(key) => setActiveTab(key)}
        />
      ) : null}
      {activeTab === 'store' ? <StorePage stores={stores} loading={loadingStores} /> : null}
      {activeTab === 'publish' ? <PublishPage loggedIn={Boolean(token)} onPublished={loadHome} /> : null}
      {activeTab === 'project' ? <ProjectPage /> : null}
      {activeTab === 'mine' ? <MinePage onLogout={handleLogout} /> : null}
      <button
        className="fixed bottom-[92px] right-[calc(50%-203px)] z-20 hidden h-12 w-12 place-items-center rounded-full bg-white text-brand-600 shadow-soft min-[420px]:grid"
        type="button"
        aria-label="公告"
      >
        <Bell size={20} />
      </button>
      <BottomTabs items={tabs} activeKey={activeTab} onChange={(key) => setActiveTab(key as TabKey)} />
    </>
  );
}
