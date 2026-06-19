import type { LucideIcon } from 'lucide-react';

export interface BottomTabItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface BottomTabsProps {
  items: BottomTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function BottomTabs({ items, activeKey, onChange }: BottomTabsProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-blue-100 bg-white/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_32px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeKey;
          return (
            <button
              className={`flex h-[54px] flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition active:scale-95 ${
                active ? 'bg-blue-50 text-brand-600' : 'text-slate-400'
              }`}
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
            >
              <Icon size={21} strokeWidth={active ? 2.5 : 2.1} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
