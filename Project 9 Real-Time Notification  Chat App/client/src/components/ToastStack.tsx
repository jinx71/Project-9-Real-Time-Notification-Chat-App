import type { AppNotification, Priority } from '../types';

interface ToastStackProps {
  toasts: AppNotification[];
  onDismiss: (id: string) => void;
}

const PRIORITY_BORDER: Record<Priority, string> = {
  info: 'border-l-sky-400',
  warning: 'border-l-amber-400',
  critical: 'border-l-rose-500'
};

export default function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-in rounded-md border border-slate-700 border-l-4 bg-slate-900 p-3 shadow-lg ${PRIORITY_BORDER[t.priority]}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-100">{t.title}</p>
              <p className="font-mono text-xs text-slate-500">#{t.room}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-slate-500 hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
