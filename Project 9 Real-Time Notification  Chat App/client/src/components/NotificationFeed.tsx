import type { AppNotification, Priority } from '../types';

interface NotificationFeedProps {
  notifications: AppNotification[];
  loading: boolean;
}

const PRIORITY_STYLES: Record<Priority, { dot: string; label: string }> = {
  info: { dot: 'bg-sky-400', label: 'text-sky-300' },
  warning: { dot: 'bg-amber-400', label: 'text-amber-300' },
  critical: { dot: 'bg-rose-500', label: 'text-rose-400' }
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export default function NotificationFeed({ notifications, loading }: NotificationFeedProps) {
  if (loading) {
    return <p className="px-4 py-8 text-sm text-slate-500">Loading history…</p>;
  }

  if (notifications.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-slate-400">No notifications in this channel yet.</p>
        <p className="mt-1 text-xs text-slate-600">
          Send one below, or POST to /api/notifications from any system.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-800">
      {notifications.map((n) => {
        const style = PRIORITY_STYLES[n.priority];
        return (
          <li key={n.id} className="flex gap-3 px-4 py-3">
            <span
              aria-hidden
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium text-slate-100">{n.title}</span>
                <span className={`text-xs font-semibold uppercase ${style.label}`}>
                  {n.priority}
                </span>
              </div>
              {n.body && <p className="mt-0.5 text-sm text-slate-400">{n.body}</p>}
              <p className="mt-1 font-mono text-xs text-slate-600">
                {n.sender} · {formatTime(n.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
