import { randomUUID } from 'crypto';
import { redis } from '../config/redis.js';

const HISTORY_LIMIT = 50;
const PRIORITIES = ['info', 'warning', 'critical'];

export const ROOMS = ['production-line-a', 'qa-alerts', 'maintenance'];

const key = (room) => `notifications:${room}`;

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

export function buildNotification({ room, title, body, priority, sender }) {
  if (!ROOMS.includes(room)) throw badRequest(`Unknown room "${room}"`);
  if (!title || !title.trim()) throw badRequest('Title is required');

  return {
    id: randomUUID(),
    room,
    title: title.trim().slice(0, 120),
    body: (body || '').trim().slice(0, 500),
    priority: PRIORITIES.includes(priority) ? priority : 'info',
    sender: (sender || 'system').trim().slice(0, 40),
    createdAt: new Date().toISOString()
  };
}

export async function saveNotification(notification) {
  const k = key(notification.room);
  // LPUSH + LTRIM keeps a capped, newest-first history per room
  await redis.lpush(k, JSON.stringify(notification));
  await redis.ltrim(k, 0, HISTORY_LIMIT - 1);
  return notification;
}

export async function getHistory(room) {
  const raw = await redis.lrange(key(room), 0, HISTORY_LIMIT - 1);
  return raw.map((item) => JSON.parse(item));
}
