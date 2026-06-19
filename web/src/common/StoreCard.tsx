import { MapPin, Phone, Star } from 'lucide-react';
import type { StoreItem } from '@/types/content';

interface StoreCardProps {
  item: StoreItem;
}

function getLocation(item: StoreItem) {
  return [item.city, item.district, item.storeAddress].filter(Boolean).join(' ');
}

function getPhone(item: StoreItem) {
  return item.storePhone || item.contactsMobile;
}

export function StoreCard({ item }: StoreCardProps) {
  const phone = getPhone(item);
  const cover = item.storeLogo || item.storeAvatar || item.images?.[0];
  const location = getLocation(item);

  return (
    <article className="flex w-full max-w-full gap-3 overflow-hidden rounded-[22px] border border-blue-100 bg-white p-3 shadow-sm">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-blue-50 text-brand-600">
        {cover ? (
          <img className="h-full w-full object-cover" src={cover} alt={item.storeName} loading="lazy" />
        ) : (
          <Star size={24} />
        )}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="truncate text-base font-bold text-slate-950">{item.storeName}</h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {item.isTop ? <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">置顶</span> : null}
              {item.isHot || item.storeRecommend ? (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-brand-600">推荐</span>
              ) : null}
              {item.isXinyu ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">信誉商家</span>
              ) : null}
            </div>
          </div>
          {phone ? (
            <a
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white"
              href={`tel:${phone}`}
              aria-label="拨打商家电话"
            >
              <Phone size={16} />
            </a>
          ) : null}
        </div>
        <p className="mt-2 line-clamp-2 max-w-full break-words text-sm leading-5 text-slate-500 [overflow-wrap:anywhere]">
          {item.introduction || item.content || '商家信息完善中'}
        </p>
        {location ? (
          <p className="mt-2 flex min-w-0 items-center gap-1 text-xs text-slate-400">
            <MapPin className="shrink-0" size={14} />
            <span className="truncate">{location}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
