import type { LucideIcon } from 'lucide-react';

export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface MessageOptions {
  duration?: number;
  color?: string;
  icon?: LucideIcon;
  closable?: boolean;
}

export interface MessageHandle {
  el: HTMLDivElement;
  close: () => void;
  update: (content: string, type?: MessageType) => void;
}

class MessageManager {
  private container: HTMLDivElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initContainer();
    }
  }

  private initContainer() {
    const existingContainer = document.getElementById('message-container');
    if (existingContainer) {
      this.container = existingContainer as HTMLDivElement;
      return;
    }

    this.container = document.createElement('div');
    this.container.id = 'message-container';
    this.container.className =
      'fixed left-1/2 top-5 z-[9999] flex -translate-x-1/2 flex-col items-center gap-3 pointer-events-none font-sans';
    document.body.appendChild(this.container);
  }

  private createIcon(type: MessageType, customColor?: string) {
    const iconWrapper = document.createElement('span');
    const colorClass = {
      success: 'text-emerald-500',
      error: 'text-rose-500',
      info: 'text-blue-500',
      warning: 'text-amber-500',
      loading: 'text-slate-400'
    }[type];

    iconWrapper.className = `flex shrink-0 items-center justify-center ${colorClass}`;
    if (type === 'loading') {
      iconWrapper.classList.add('animate-spin');
    }
    if (customColor) {
      iconWrapper.style.color = customColor;
    }

    const paths = {
      success: 'm9 12 2 2 4-4',
      error: 'm15 9-6 6m0-6 6 6',
      warning: 'M12 8v4m0 4h.01',
      info: 'M12 16V12m0-4h.01',
      loading: 'M21 12a9 9 0 1 1-6.219-8.56'
    };

    iconWrapper.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${type !== 'loading' ? '<circle cx="12" cy="12" r="10"/>' : ''}
        <path d="${paths[type]}"/>
      </svg>
    `;

    return iconWrapper;
  }

  show(content: string, type: MessageType = 'info', options: MessageOptions = {}) {
    if (!this.container) {
      this.initContainer();
    }

    const { duration = 3000, color, closable = false } = options;
    const messageEl = document.createElement('div');
    messageEl.className =
      'pointer-events-auto flex min-w-[280px] max-w-[90vw] items-center gap-3 rounded-2xl border border-blue-100/80 bg-white/95 px-4 py-3 text-sm shadow-soft backdrop-blur transition-all duration-300 ease-out opacity-0 -translate-y-4 scale-95';

    let currentType = type;
    let iconPart = this.createIcon(type, color);
    const textPart = document.createElement('span');
    textPart.className = 'flex-grow font-medium leading-relaxed text-slate-700';
    textPart.textContent = content;

    messageEl.appendChild(iconPart);
    messageEl.appendChild(textPart);

    if (closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className =
        'rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700';
      closeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      `;
      closeBtn.onclick = () => this.remove(messageEl);
      messageEl.appendChild(closeBtn);
    }

    this.container!.appendChild(messageEl);
    requestAnimationFrame(() => {
      messageEl.classList.remove('opacity-0', '-translate-y-4', 'scale-95');
      messageEl.classList.add('opacity-100', 'translate-y-0', 'scale-100');
    });

    let timer: ReturnType<typeof setTimeout> | null = null;
    if (duration > 0) {
      timer = setTimeout(() => this.remove(messageEl), duration);
    }

    const update = (newContent: string, newType?: MessageType) => {
      textPart.textContent = newContent;
      if (newType && newType !== currentType) {
        const newIcon = this.createIcon(newType, color);
        messageEl.replaceChild(newIcon, iconPart);
        iconPart = newIcon;
        currentType = newType;
      }
      if (timer) {
        clearTimeout(timer);
      }
      if (currentType !== 'loading') {
        timer = setTimeout(() => this.remove(messageEl), 3000);
      }
    };

    return {
      el: messageEl,
      close: () => this.remove(messageEl),
      update
    } as MessageHandle;
  }

  private remove(el: HTMLElement) {
    el.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
    el.classList.add('opacity-0', '-translate-y-2', 'scale-95');
    setTimeout(() => {
      if (el.parentNode === this.container) {
        this.container!.removeChild(el);
      }
    }, 300);
  }

  success(content: string, options?: MessageOptions) {
    return this.show(content, 'success', options);
  }

  error(content: string, options?: MessageOptions) {
    return this.show(content, 'error', options);
  }

  info(content: string, options?: MessageOptions) {
    return this.show(content, 'info', options);
  }

  warning(content: string, options?: MessageOptions) {
    return this.show(content, 'warning', options);
  }

  loading(content: string, options?: MessageOptions) {
    return this.show(content, 'loading', { duration: 0, ...options });
  }
}

export const message = new MessageManager();
