import { Router } from 'express';
import {
  buildNotification,
  saveNotification,
  getHistory,
  ROOMS
} from '../services/notificationService.js';

export function notificationRoutes(io) {
  const router = Router();

  // GET /api/notifications/rooms — list available rooms
  router.get('/rooms', (req, res) => {
    res.json({ success: true, data: ROOMS, message: 'Available rooms' });
  });

  // GET /api/notifications/:room — capped history, newest first
  router.get('/:room', async (req, res, next) => {
    try {
      const { room } = req.params;
      if (!ROOMS.includes(room)) {
        return res
          .status(404)
          .json({ success: false, data: null, message: `Unknown room "${room}"` });
      }
      const history = await getHistory(room);
      res.json({
        success: true,
        data: history,
        message: `Last ${history.length} notifications for ${room}`
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/notifications — external systems (CI, monitoring, cron)
  // push here; connected clients receive it instantly over WebSocket
  router.post('/', async (req, res, next) => {
    try {
      const notification = buildNotification(req.body);
      await saveNotification(notification);
      io.to(notification.room).emit('notification:new', notification);
      res
        .status(201)
        .json({ success: true, data: notification, message: 'Notification delivered' });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
