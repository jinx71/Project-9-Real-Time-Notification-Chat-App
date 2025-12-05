# PlantPulse — Real-Time Notification App

A real-time, event-driven notification system built with WebSockets and Redis pub/sub. Styled as a pharmaceutical plant operations console: channels for **Production Line A**, **QA Alerts**, and **Maintenance**, with priority-coded notifications (`info` / `warning` / `critical`).

Notifications can be sent two ways:

1. **In-app** over WebSocket (Socket.io) — instant delivery to everyone in the channel
2. **From any external system** via `POST /api/notifications` — CI pipelines, monitoring tools, or cron jobs push over REST, and connected clients receive it live

> Project 09 of a 12-project full-stack portfolio. [Roadmap →](https://github.com/jinx71)

## Live Demo

🔗 **[Live demo placeholder — add URL after deployment]**

## Screenshot

![PlantPulse dashboard](docs/screenshot.png) <!-- add screenshot -->

## Architecture

```
┌──────────┐  WebSocket   ┌──────────────┐   pub/sub    ┌─────────┐
│  React   │◄────────────►│  Node.js     │◄────────────►│  Redis  │
│  client  │              │  Express +   │              │         │
└──────────┘  REST (API)  │  Socket.io   │   history    │ LPUSH/  │
     ▲       ────────────►│              │─────────────►│ LRANGE  │
     │                    └──────────────┘              └─────────┘
External systems ──POST──────────┘
(CI, monitoring, cron)
```

- **Socket.io Redis adapter** — events are published through Redis, so multiple server instances behind a load balancer all fan out the same notification. The app scales horizontally with zero code changes.
- **Capped history** — each channel keeps its last 50 notifications in a Redis list (`LPUSH` + `LTRIM`), so new clients load context instantly without a SQL database.

## Tech Stack

| Layer    | Tech                                            |
| -------- | ----------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, Axios, socket.io-client |
| Backend  | Node.js, Express, Socket.io, ioredis            |
| Realtime | WebSockets (Socket.io), Redis pub/sub adapter   |
| Storage  | Redis 7 (capped lists for history)              |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for Redis) — or a local Redis instance

### 1. Start Redis

```bash
docker compose up -d
```

### 2. Start the server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 3. Start the client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 in **two browser tabs**, enter different names, join the same channel, and send a notification — it appears in both instantly.

### 4. Push a notification from outside the app

```bash
curl -X POST http://localhost:4000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "room": "qa-alerts",
    "title": "Deviation logged on Batch 4471",
    "body": "Temperature excursion in cold room 2 — CAPA required",
    "priority": "critical",
    "sender": "monitoring-bot"
  }'
```

Everyone in **QA Alerts** sees it appear in real time.

## API Reference

All responses follow `{ success, data, message }`.

| Method | Endpoint                   | Description                          |
| ------ | -------------------------- | ------------------------------------ |
| GET    | `/health`                  | Server health check                  |
| GET    | `/api/notifications/rooms` | List available channels              |
| GET    | `/api/notifications/:room` | Last 50 notifications, newest first  |
| POST   | `/api/notifications`       | Push a notification (external systems) |

### Socket.io Events

| Direction       | Event               | Payload                                  |
| --------------- | ------------------- | ---------------------------------------- |
| client → server | `room:join`         | `room` (string) + ack callback           |
| client → server | `room:leave`        | `room` (string)                          |
| client → server | `notification:send` | `{ room, title, body, priority }` + ack  |
| server → client | `notification:new`  | full notification object                 |
| server → client | `room:presence`     | `{ room, username, event }`              |

## Environment Variables

**server/.env**

| Variable        | Default                  | Purpose                    |
| --------------- | ------------------------ | -------------------------- |
| `PORT`          | `4000`                   | HTTP/WebSocket port        |
| `REDIS_URL`     | `redis://localhost:6379` | Redis connection           |
| `CLIENT_ORIGIN` | `http://localhost:5173`  | CORS allow-list            |

**client/.env**

| Variable          | Default                 | Purpose            |
| ----------------- | ----------------------- | ------------------ |
| `VITE_API_URL`    | `http://localhost:4000` | REST base URL      |
| `VITE_SOCKET_URL` | `http://localhost:4000` | WebSocket base URL |

## What This Project Demonstrates

- Production-grade WebSocket architecture beyond REST-only patterns
- Redis as both a pub/sub message bus and a lightweight data store
- Horizontal-scaling awareness via the Socket.io Redis adapter
- Dual-channel ingestion (REST in, WebSocket out) — the pattern behind real notification platforms
