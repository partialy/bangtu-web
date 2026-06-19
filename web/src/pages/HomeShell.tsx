import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ClipboardList,
  Home,
  Loader2,
  LogOut,
  MessageCircle,
  PenLine,
  PlusCircle,
  Search,
  ShieldCheck,
  UserRound,
  Volume2,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomTabs, type BottomTabItem } from '@/common/BottomTabs';
import { InfoCard } from '@/common/InfoCard';
import { ActivityShell, BackButton, HeaderBar } from '@/common/MobileActivity';
import { StoreCard } from '@/common/StoreCard';
import { getHomeData } from '@/services/homeService';
import { listInfo, publishInfo } from '@/services/infoService';
import { getNoticeDetail, listNotices } from '@/services/noticeService';
import { listStores } from '@/services/storeService';
import { useAuthStore } from '@/stores/authStore';
import type { HomeData, InfoItem, PublishInfoPayload, StoreItem, WebBanner, WebNotice } from '@/types/content';
import { message } from '@/utils/message';
import { LoginPage } from '@/pages/LoginPage';

type TabKey = 'home' | 'store' | 'publish' | 'project' | 'mine';
type StackPage = 'main' | 'noticeList' | 'noticeDetail';

const POPUP_NOTICE_KEY = 'bangtu-web-popup-notice-id';

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

const cityOptions = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市', '重庆市', '佛山市', '全国'];

const emptyHomeData: HomeData = {
  banners: [],
  notices: [],
  popupNotice: null,
  topInfos: [],
  latestInfos: [],
  stores: []
};

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto min-h-screen w-full max-w-[430px] overflow-x-hidden px-3 pb-[96px] pt-[max(14px,env(safe-area-inset-top))] sm:px-4">
      {children}
    </section>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
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

function stripHtml(value?: string) {
  return (value ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function HomeCarousel({ banners }: { banners: WebBanner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayBanners = banners.filter((item) => item.image).slice(0, 6);

  useEffect(() => {
    setActiveIndex(0);
  }, [displayBanners.length]);

  useEffect(() => {
    if (displayBanners.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % displayBanners.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [displayBanners.length]);

  if (displayBanners.length === 0) {
    return (
      <section className="mt-3 aspect-[16/7] overflow-hidden rounded-[18px] bg-gradient-to-br from-blue-600 to-blue-400 p-5 text-white shadow-soft">
        <p className="text-sm text-blue-100">邦涂好师傅</p>
        <p className="mt-2 text-2xl font-bold">优质企业与师傅展示</p>
        <p className="mt-2 text-sm text-blue-100">轮播图将从小程序广告表读取</p>
      </section>
    );
  }

  const active = displayBanners[activeIndex] ?? displayBanners[0];

  return (
    <section className="relative mt-3 aspect-[16/7] overflow-hidden rounded-[18px] bg-blue-50 shadow-soft">
      <img className="h-full w-full object-cover" src={active.image} alt={active.title || '首页轮播图'} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/45 to-transparent px-4 pb-3 pt-8">
        {active.title ? <p className="truncate text-sm font-semibold text-white">{active.title}</p> : null}
      </div>
      {displayBanners.length > 1 ? (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {displayBanners.map((item, index) => (
            <button
              aria-label={`切换到第${index + 1}张轮播图`}
              className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/55'}`}
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function NoticePopup({ notice, onClose, onOpen }: { notice: WebNotice; onClose: () => void; onOpen: () => void }) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-6"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <motion.article
        animate={{ y: 0, scale: 1 }}
        className="w-full max-w-[360px] overflow-hidden rounded-[26px] bg-white shadow-2xl"
        exit={{ y: 20, scale: 0.98 }}
        initial={{ y: 24, scale: 0.98 }}
      >
        <div className="flex items-center justify-between border-b border-blue-50 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-600">平台公告</p>
            <h3 className="mt-1 truncate text-lg font-bold text-slate-950">{notice.title}</h3>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[48vh] overflow-y-auto px-5 py-4 text-sm leading-6 text-slate-600">
          {notice.contentType === 'text' ? (
            <p>{notice.content}</p>
          ) : (
            <div className="notice-html" dangerouslySetInnerHTML={{ __html: notice.content }} />
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 px-5 pb-5">
          <button className="h-11 rounded-2xl bg-slate-100 font-semibold text-slate-600" type="button" onClick={onClose}>
            知道了
          </button>
          <button className="h-11 rounded-2xl bg-brand-600 font-semibold text-white" type="button" onClick={onOpen}>
            查看详情
          </button>
        </div>
      </motion.article>
    </motion.div>
  );
}

function CitySheet({ open, onClose, city, onSelect }: { open: boolean; onClose: () => void; city: string; onSelect: (city: string) => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-40 bg-slate-950/35" exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
          <motion.div
            animate={{ y: 0 }}
            className="absolute inset-x-0 bottom-0 mx-auto max-w-[430px] rounded-t-[26px] bg-white p-4"
            exit={{ y: '100%' }}
            initial={{ y: '100%' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <button className="px-2 py-1 text-slate-500" type="button" onClick={onClose}>
                取消
              </button>
              <p className="font-bold text-slate-950">选择地区</p>
              <button className="px-2 py-1 font-semibold text-brand-600" type="button" onClick={onClose}>
                确定
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 pb-[max(12px,env(safe-area-inset-bottom))]">
              {cityOptions.map((item) => (
                <button
                  className={`h-11 rounded-2xl text-sm font-semibold ${item === city ? 'bg-brand-600 text-white' : 'bg-blue-50 text-slate-600'}`}
                  key={item}
                  type="button"
                  onClick={() => onSelect(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function NoticeListPage({ notices, onBack, onOpen }: { notices: WebNotice[]; onBack: () => void; onOpen: (notice: WebNotice) => void }) {
  return (
    <ActivityShell
      animated
      className="pb-[96px]"
      header={<HeaderBar center={<h1 className="truncate text-base font-bold text-slate-950">全部公告</h1>} left={<BackButton onClick={onBack} />} />}
    >
      <div className="grid gap-3 px-3 pt-3">
        {notices.length === 0 ? <EmptyBlock text="暂无公告" /> : null}
        {notices.map((notice) => (
          <button
            className="rounded-[22px] border border-blue-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
            key={notice.id}
            type="button"
            onClick={() => onOpen(notice)}
          >
            <div className="flex items-center gap-2">
              {notice.isTop ? <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">置顶</span> : null}
              <h2 className="min-w-0 flex-1 truncate font-bold text-slate-950">{notice.title}</h2>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{notice.summary || stripHtml(notice.content)}</p>
          </button>
        ))}
      </div>
    </ActivityShell>
  );
}

function NoticeDetailPage({ notice, onBack }: { notice: WebNotice; onBack: () => void }) {
  return (
    <ActivityShell
      animated
      className="pb-8"
      header={<HeaderBar center={<h1 className="truncate text-base font-bold text-slate-950">公告详情</h1>} left={<BackButton onClick={onBack} />} />}
    >
      <article className="px-4 pt-4">
        <div className="border-b border-blue-50 pb-4">
          <div className="flex items-center gap-2">
            {notice.isTop ? <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">置顶</span> : null}
            {notice.popupEnabled ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-brand-600">弹窗</span> : null}
          </div>
          <h1 className="mt-3 text-2xl font-bold leading-8 text-slate-950">{notice.title}</h1>
        </div>
        <div className="notice-html mt-4 text-base leading-8 text-slate-700">
          {notice.contentType === 'text' ? <p>{notice.content}</p> : <div dangerouslySetInnerHTML={{ __html: notice.content }} />}
        </div>
      </article>
    </ActivityShell>
  );
}

function HomePage({
  data,
  loading,
  city,
  onCityClick,
  onNoticeClick,
  onNoticeListClick,
  onTabChange
}: {
  data: HomeData;
  loading: boolean;
  city: string;
  onCityClick: () => void;
  onNoticeClick: (notice: WebNotice) => void;
  onNoticeListClick: () => void;
  onTabChange: (key: TabKey) => void;
}) {
  const homeNotice = data.notices[0];
  const noticeText = homeNotice?.summary || homeNotice?.title || '平台公告会在这里展示';
  const displayInfos = data.latestInfos.length > 0 ? data.latestInfos : data.topInfos;
  const topInfos = data.topInfos.slice(0, 3);

  return (
    <PageShell>
      <HeaderBar
        center={<h1 className="truncate text-lg font-bold text-slate-950">邦涂好师傅</h1>}
        right={
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-brand-600">
            <ShieldCheck size={20} />
          </div>
        }
      />

      <section className="mt-1 flex items-center gap-2">
        <button className="flex h-11 shrink-0 items-center gap-1 rounded-2xl px-1 text-sm font-semibold text-slate-600" type="button" onClick={onCityClick}>
          {city}
          <ChevronDown size={16} />
        </button>
        <button className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white px-4 text-left text-sm font-medium text-slate-400 shadow-sm" type="button">
          <Search size={17} />
          <span className="truncate">搜信息、找商家、看项目</span>
        </button>
      </section>

      <HomeCarousel banners={data.banners} />

      <section className="mt-4 flex items-center gap-3 rounded-[22px] border border-blue-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex shrink-0 items-center gap-1 font-bold text-slate-950">
          <span>邦涂</span>
          <span className="text-brand-600">公告</span>
          <Volume2 size={18} className="text-brand-600" />
        </div>
        <button
          className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-600"
          type="button"
          onClick={() => homeNotice && onNoticeClick(homeNotice)}
        >
          {noticeText}
        </button>
        <button className="shrink-0 text-sm font-semibold text-brand-600" type="button" onClick={onNoticeListClick}>
          更多
        </button>
      </section>

      <section className="mt-4 grid min-w-0 grid-cols-4 gap-2">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className="flex min-h-[76px] min-w-0 flex-col items-center justify-center gap-2 rounded-[18px] border border-blue-100 bg-white px-1 text-center text-[13px] font-semibold text-slate-700 shadow-sm transition active:scale-95"
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

      <section className="mt-5 rounded-[24px] bg-white px-3 py-4 shadow-sm">
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
          <div className="mt-3 grid min-w-0 gap-3">
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
        <div className="mt-3 flex max-w-full gap-3 overflow-x-auto pb-1">
          {data.stores.slice(0, 6).map((store) => (
            <button
              className="w-[132px] shrink-0 rounded-[22px] border border-blue-100 bg-white p-3 text-left shadow-sm"
              key={store.storeId}
              type="button"
              onClick={() => onTabChange('store')}
            >
              <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-2xl bg-blue-50 text-brand-600">
                {store.storeLogo ? <img className="h-full w-full object-cover" src={store.storeLogo} alt={store.storeName} /> : <Building2 size={24} />}
              </div>
              <p className="mt-2 truncate text-sm font-bold text-slate-950">{store.storeName}</p>
            </button>
          ))}
          {!loading && data.stores.length === 0 ? <EmptyBlock text="暂无推荐商家" /> : null}
        </div>
      </section>

      <section className="mt-5">
        <SectionTitle title="最新消息" />
        <div className="mt-3 grid min-w-0 gap-3">
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
      <div className="mt-5 grid min-w-0 gap-3">
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
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:bg-slate-300"
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
  const [stackPage, setStackPage] = useState<StackPage>('main');
  const [homeData, setHomeData] = useState<HomeData>(emptyHomeData);
  const [infos, setInfos] = useState<InfoItem[]>([]);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [noticeList, setNoticeList] = useState<WebNotice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<WebNotice | null>(null);
  const [popupNotice, setPopupNotice] = useState<WebNotice | null>(null);
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [city, setCity] = useState('北京市');
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
      if (home.popupNotice && window.localStorage.getItem(POPUP_NOTICE_KEY) !== String(home.popupNotice.id)) {
        setPopupNotice(home.popupNotice);
      }
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

  async function openNoticeList() {
    try {
      const list = await listNotices();
      setNoticeList(list);
      setStackPage('noticeList');
    } catch (error) {
      const content = error instanceof Error ? error.message : '公告加载失败';
      message.error(content);
    }
  }

  async function openNoticeDetail(notice: WebNotice) {
    try {
      const detail = await getNoticeDetail(notice.id);
      setSelectedNotice(detail);
      setStackPage('noticeDetail');
    } catch (error) {
      const content = error instanceof Error ? error.message : '公告详情加载失败';
      message.error(content);
    }
  }

  function markPopupNoticeRead() {
    if (popupNotice) {
      window.localStorage.setItem(POPUP_NOTICE_KEY, String(popupNotice.id));
    }
    setPopupNotice(null);
  }

  function handlePopupOpen() {
    const notice = popupNotice;
    markPopupNoticeRead();
    if (notice) {
      void openNoticeDetail(notice);
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
      <AnimatePresence mode="wait">
        {stackPage === 'main' ? (
          <motion.div key="main" animate={{ opacity: 1 }} exit={{ opacity: 0 }} initial={{ opacity: 1 }}>
            {activeTab === 'home' ? (
              <HomePage
                city={city}
                data={{ ...homeData, latestInfos: mergedInfos }}
                loading={loadingHome}
                onCityClick={() => setCitySheetOpen(true)}
                onNoticeClick={openNoticeDetail}
                onNoticeListClick={openNoticeList}
                onTabChange={(key) => setActiveTab(key)}
              />
            ) : null}
            {activeTab === 'store' ? <StorePage stores={stores} loading={loadingStores} /> : null}
            {activeTab === 'publish' ? <PublishPage loggedIn={Boolean(token)} onPublished={loadHome} /> : null}
            {activeTab === 'project' ? <ProjectPage /> : null}
            {activeTab === 'mine' ? <MinePage onLogout={handleLogout} /> : null}
            <BottomTabs items={tabs} activeKey={activeTab} onChange={(key) => setActiveTab(key as TabKey)} />
          </motion.div>
        ) : null}

        {stackPage === 'noticeList' ? (
          <NoticeListPage key="notice-list" notices={noticeList} onBack={() => setStackPage('main')} onOpen={openNoticeDetail} />
        ) : null}

        {stackPage === 'noticeDetail' && selectedNotice ? (
          <NoticeDetailPage key="notice-detail" notice={selectedNotice} onBack={() => setStackPage(noticeList.length > 0 ? 'noticeList' : 'main')} />
        ) : null}
      </AnimatePresence>

      <CitySheet
        city={city}
        open={citySheetOpen}
        onClose={() => setCitySheetOpen(false)}
        onSelect={(nextCity) => {
          setCity(nextCity);
          setCitySheetOpen(false);
        }}
      />

      <AnimatePresence>
        {popupNotice ? <NoticePopup notice={popupNotice} onClose={markPopupNoticeRead} onOpen={handlePopupOpen} /> : null}
      </AnimatePresence>
    </>
  );
}
