import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Three clients: ioredis blocks a connection in subscriber mode,
// so the Socket.io adapter needs a dedicated pub/sub pair while
// normal commands (LPUSH, LRANGE) use their own client.
export const redis = new Redis(redisUrl);
export const pubClient = new Redis(redisUrl);
export const subClient = pubClient.duplicate();

[redis, pubClient, subClient].forEach((client) => {
  client.on('error', (err) => console.error('[redis]', err.message));
});
