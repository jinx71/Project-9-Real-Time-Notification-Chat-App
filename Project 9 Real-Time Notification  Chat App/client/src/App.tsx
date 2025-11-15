import { useCallback, useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { useSocket } from './hooks/useSocket';
import RoomPanel from './components/RoomPanel';
import NotificationFeed from './components/NotificationFeed';
import SendForm from './components/SendForm';
import ToastStack from './components/ToastStack';
import type { Ack, ApiResponse, AppNotification, Priority } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOAST_LIFETIME_MS = 5000;

export default function App() {
  const [username, setUsername] = useState('');
  const [draftName, setDraftName] = useState('');
  const { socket, connected } = useSocket(username);

  const [rooms, setRooms] = useState<string[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [feed, setFeed] = useState<AppNotification[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load available rooms once logged in
  useEffect(() => {
    if (!username) return;
    (async () => {
      try {
        const res = await axios.get<ApiResponse<string[]>>(
          `${API_URL}/api/notifications/rooms`
        );
        setRooms(res.data.data);
        setActiveRoom((current) => current ?? res.data.data[0] ?? null);
      } catch (err) {
        console.error('Failed to load rooms', err);
      }
    })();
  }, [username]);

  // Join the active room, load its history, and subscribe to live events
  useEffect(() => {
    if (!socket || !connected || !activeRoom) return;

    let cancelled = false;

    socket.emit('room:join', activeRoom);

    (async () => {
      setLoadingFeed(true);
      try {
        const res = await axios.get<ApiResponse<AppNotification[]>>(
          `${API_URL}/api/notifications/${activeRoom}`
        );
        if (!cancelled) setFeed(res.data.data);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        if (!cancelled) setLoadingFeed(false);
      }
    })();

    const onNotification = (n: AppNotification) => {
      setFeed((prev) => [n, ...prev]);
      setToasts((prev) => [...prev, n]);
      setTimeout(() => dismissToast(n.id), TOAST_LIFETIME_MS);
    };

    socket.on('notification:new', onNotification);

    return () => {
      cancelled = true;
      socket.emit('room:leave', activeRoom);
      socket.off('notification:new', onNotification);
    };
  }, [socket, connected, activeRoom, dismissToast]);

  const handleSend = useCallback(
    async (payload: { title: string; body: string; priority: Priority }) => {
      if (!socket || !activeRoom) return 'Not connected';
      return new Promise<string | null>((resolve) => {
        socket.emit(
          'notification:send',
          { ...payload, room: activeRoom },
          (ack: Ack<AppNotification>) => {
            resolve(ack.success ? null : ack.message ?? 'Failed to send');
          }
        );
      });
    },
    [socket, activeRoom]
  );

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (draftName.trim()) setUsername(draftName.trim());
  }

  if (!username) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-6"
        >
          <h1 className="text-lg font-semibold text-slate-100">PlantPulse</h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time notifications for plant operations.
          </p>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            autoFocus
            className="mt-4 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draftName.trim()}
            className="mt-3 w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-40"
          >
            Enter console
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold">PlantPulse</h1>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${
                connected ? 'animate-pulse bg-emerald-400' : 'bg-rose-500'
              }`}
            />
            {connected ? 'Live' : 'Disconnected'}
          </span>
        </div>
        <span className="text-sm text-slate-400">{username}</span>
      </header>

      <div className="flex flex-1 flex-col sm:flex-row">
        <aside className="border-b border-slate-800 p-3 sm:w-56 sm:border-b-0 sm:border-r">
          <RoomPanel rooms={rooms} activeRoom={activeRoom} onSelect={setActiveRoom} />
        </aside>

        <main className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto">
            <NotificationFeed notifications={feed} loading={loadingFeed} />
          </div>
          <SendForm disabled={!connected || !activeRoom} onSend={handleSend} />
        </main>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
