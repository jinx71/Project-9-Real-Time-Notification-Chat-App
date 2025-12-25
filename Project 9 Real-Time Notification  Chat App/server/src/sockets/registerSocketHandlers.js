import {
  buildNotification,
  saveNotification,
  ROOMS
} from '../services/notificationService.js';

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    const username = socket.handshake.auth?.username || 'anonymous';
    console.log(`[socket] ${username} connected (${socket.id})`);

    socket.on('room:join', async (room, ack) => {
      if (!ROOMS.includes(room)) {
        return ack?.({ success: false, data: null, message: `Unknown room "${room}"` });
      }
      await socket.join(room);
      socket.to(room).emit('room:presence', { room, username, event: 'joined' });
      ack?.({ success: true, data: { room }, message: `Joined ${room}` });
    });

    socket.on('room:leave', async (room) => {
      await socket.leave(room);
      socket.to(room).emit('room:presence', { room, username, event: 'left' });
    });

    socket.on('notification:send', async (payload, ack) => {
      try {
        const notification = buildNotification({ ...payload, sender: username });
        await saveNotification(notification);
        // io.to() goes through the Redis adapter, so every server
        // instance fans this out to its own connected clients
        io.to(notification.room).emit('notification:new', notification);
        ack?.({ success: true, data: notification, message: 'Delivered' });
      } catch (err) {
        ack?.({ success: false, data: null, message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[socket] ${username} disconnected (${socket.id})`);
    });
  });
}
