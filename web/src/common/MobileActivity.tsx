import { type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderBarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
}

interface ActivityShellProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
  animated?: boolean;
}

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function HeaderBar({ left, center, right, className = '' }: HeaderBarProps) {
  return (
    <header className={`flex h-12 w-full items-center justify-between px-3 ${className}`}>
      <div className="flex w-20 shrink-0 items-center justify-start">{left}</div>
      <div className="min-w-0 flex-1 text-center">{center}</div>
      <div className="flex w-20 shrink-0 items-center justify-end">{right}</div>
    </header>
  );
}

export function BackButton({ onClick, label = '返回' }: BackButtonProps) {
  return (
    <button
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full text-slate-700 transition active:scale-95"
      type="button"
      onClick={onClick}
    >
      <ArrowLeft size={22} />
    </button>
  );
}

export function ActivityShell({ children, header, className = '', animated = false }: ActivityShellProps) {
  const content = (
    <section className={`mx-auto min-h-screen w-full max-w-[430px] overflow-x-hidden bg-white ${className}`}>
      {header}
      <div className="min-w-0">{children}</div>
    </section>
  );

  if (!animated) {
    return content;
  }

  return (
    <motion.section
      animate={{ x: 0, opacity: 1 }}
      className="min-h-screen bg-white"
      exit={{ x: 40, opacity: 0 }}
      initial={{ x: '100%', opacity: 0.96 }}
      transition={{ type: 'spring', stiffness: 330, damping: 34 }}
    >
      {content}
    </motion.section>
  );
}
