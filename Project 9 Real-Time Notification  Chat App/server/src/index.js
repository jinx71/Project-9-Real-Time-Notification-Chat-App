import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from './config/redis.js';
import { notificationRoutes } from './routes/notifications.js';
import { registerSocketHandlers } from './sockets/registerSocketHandlers.js';
import { errorHandler } from './middleware/errorHandler.js';

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] },
  // Redis adapter: lets multiple server instances share rooms/events,
  // so the app scales horizontally behind a load balancer
  adapter: createAdapter(pubClient, subClient)
});

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, data: { uptime: process.uptime() }, message: 'OK' });
});

app.use('/api/notifications', notificationRoutes(io));
app.use(errorHandler);

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
