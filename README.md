# Gaming Tracker

Track your game backlog and collection. Monorepo: NestJS API, Next.js web, Expo mobile.

## Stack

| App | Description | Tech |
|-----|-------------|------|
| api | Backend for web & mobile | NestJS, Prisma, PostgreSQL |
| web | Web app for tracker | Next.js (App Router) |
| mobile | Mobile app for tracker | Expo, React Native |

## Quick Start

```bash
bun install
docker compose up -d
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
bun run dev
```

- **API:** http://localhost:4000
- **Web:** http://localhost:3000
- **Mobile:** `bunx expo start` in `apps/mobile`

## Project Structure

```
gaming-tracker/
├── apps/
│   ├── api/       # NestJS backend
│   ├── web/       # Next.js web frontend
│   └── mobile/    # Expo React Native app
├── packages/
│   ├── tsconfig/  # Shared TypeScript config
│   └── types/     # Shared types package
├── ROADMAP.md
├── CONTRIBUTING.md
└── README.md (this file)
```

## Roadmap

| Stage | Status | Description |
|-------|--------|-------------|
| **1. Backend Core** | 70% ✅ | User auth, game collection CRUD, IGDB search |
| **2. Web MVP** | ⏳ | Login, game list, collection management |
| **3. Mobile MVP** | ⏳ | iOS/Android app with core features |
| **4. Polish & Prod** | ⏳ | Testing, monitoring, deployment |

**Full details:** [ROADMAP.md](./ROADMAP.md)

## Commands

```bash
# Development
bun run dev          # Run all apps with hot reload
bun run build        # Build all apps
bun run lint         # Lint all code
bun run format       # Format code
bun test             # Run tests

# API specific
cd apps/api
bun run db:migrate   # Run database migrations
bun run start:debug  # Start with debugger
bunx prisma studio  # Open database GUI
```

## Getting Started

**Contributing?** → [CONTRIBUTING.md](./CONTRIBUTING.md)

**All documentation** → [DOCUMENTATION.md](./DOCUMENTATION.md)
