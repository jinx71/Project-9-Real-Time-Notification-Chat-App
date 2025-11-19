import { useState, type FormEvent } from 'react';
import type { Priority } from '../types';

interface SendFormProps {
  disabled: boolean;
  onSend: (payload: { title: string; body: string; priority: Priority }) => Promise<string | null>;
}

const PRIORITIES: Priority[] = ['info', 'warning', 'critical'];

export default function SendForm({ disabled, onSend }: SendFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<Priority>('info');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || sending) return;

    setSending(true);
    setError(null);
    try {
      const failure = await onSend({ title, body, priority });
      if (failure) {
        setError(failure);
      } else {
        setTitle('');
        setBody('');
        setPriority('info');
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notification title"
          maxLength={120}
          disabled={disabled}
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none disabled:opacity-50"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          disabled={disabled}
          aria-label="Priority"
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none disabled:opacity-50"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Details (optional)"
          maxLength={500}
          disabled={disabled}
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || sending || !title.trim()}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 disabled:opacity-40"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </form>
  );
}
