import { MapPin, Phone, ShieldCheck } from 'lucide-react';
import type { InfoItem } from '@/types/content';

interface InfoCardProps {
  item: InfoItem;
}

function getLocation(item: InfoItem) {
  return [item.city, item.district, item.address].filter(Boolean).join(' ');
}

function getSourceLabel(sourceType: InfoItem['sourceType']) {
  return sourceType === 'web' ? 'Web' : '小程序';
}

export function InfoCard({ item }: InfoCardProps) {
  const images = item.images?.filter(Boolean).slice(0, 3) ?? [];
  const location = getLocation(item);

  return (
    <article className="rounded-[22px] border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {item.isTop ? (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">置顶</span>
            ) : null}
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-brand-600">
              {getSourceLabel(item.sourceType)}
            </span>
            {item.categoryName ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                {item.categoryName}
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 line-clamp-2 text-base font-bold leading-6 text-slate-950">
            {item.title || item.content}
          </h3>
        </div>
        {item.contactMobile ? (
          <a
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-soft"
            href={`tel:${item.contactMobile}`}
            aria-label="拨打电话"
          >
            <Phone size={18} />
          </a>
        ) : null}
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.content}</p>

      {images.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.map((image) => (
            <img
              className="aspect-square w-full rounded-2xl object-cover"
              key={image}
              src={image}
              alt=""
              loading="lazy"
            />
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
        {item.contactName ? (
          <span className="inline-flex items-center gap-1 text-slate-500">
            <ShieldCheck size={14} />
            {item.contactName}
          </span>
        ) : null}
        {location ? (
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin size={14} />
            <span className="truncate">{location}</span>
          </span>
        ) : null}
      </div>
    </article>
  );
}
