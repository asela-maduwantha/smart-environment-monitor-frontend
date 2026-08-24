# Smart Environment Monitoring and Management System

A responsive IoT administration dashboard for monitoring temperature, humidity, raw light level, motion, device health, Wi-Fi signal, and environmental alerts. Administrators can also update device thresholds and telemetry intervals. The application is designed for Vercel and communicates only with a separate Express REST API.

## Architecture

```text
Browser / Next.js on Vercel
        │ HTTPS REST
        ▼
Node.js + Express API on Render
        ├── Neon PostgreSQL through Prisma
        └── ESP32 configuration through HiveMQ
```

The browser never connects to PostgreSQL or HiveMQ. Environment variables beginning with `NEXT_PUBLIC_` are visible to browser code and must contain only public configuration.

## Setup

Requirements: Node.js 20 or newer and npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The backend must allow CORS requests from the local and deployed frontend origins.

## Environment configuration

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_DEFAULT_DEVICE_ID=ESP32_01
```

For production, set `NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.onrender.com/api/v1` in Vercel. Do not commit `.env.local` and never add database, MQTT, or other secrets to public variables.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Environment overview, charts, device status, alerts, and activity |
| `/live` | Five-second latest-telemetry polling |
| `/analytics` | Aggregates and historical trends |
| `/alerts` | Alert filtering and resolution |
| `/devices` | Registered device list |
| `/devices/[deviceId]` | Device readings, charts, alerts, and configuration summary |
| `/settings` | Threshold and interval management |

## API contract

Responses use `{ "success": true, "data": ..., "message": "optional" }`. The frontend calls:

- `GET /devices` and `GET /devices/:deviceId`
- `GET /devices/:deviceId/readings/latest`
- `GET /devices/:deviceId/readings?limit=20`
- `GET /devices/:deviceId/charts/environment?range=24h`
- `GET /devices/:deviceId/analytics?range=24h`
- `GET /alerts` with optional filters
- `PATCH /alerts/:id/resolve`
- `GET` and `PUT /devices/:deviceId/settings`

Field-level TypeScript contracts are in `src/types/index.ts`. Timestamps are ISO 8601 strings. Light readings are treated as raw sensor values, not lux.

## Project structure

```text
src/
├── app/          # App Router pages and global styles
├── components/   # Layout, charts, cards, and UI states
├── context/      # Persistent selected-device state
├── hooks/        # Reusable asynchronous resource hook
├── lib/          # API client, formatting, validation, utilities
├── services/     # Endpoint-specific API access
└── types/        # Shared REST and view-model contracts
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Vercel deployment

Import the repository into Vercel, keep the default Next.js build settings, and configure the two public environment variables for Preview and Production. No custom server or Vercel configuration is required.
