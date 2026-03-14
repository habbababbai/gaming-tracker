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

## Documentation

### Project
- [ROADMAP.md](./ROADMAP.md) - Project stages & progress
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute, PR naming conventions

### Backend (API)
- [apps/api/CLAUDE.md](./apps/api/CLAUDE.md) - Architecture, security, best practices
- [apps/api/API.md](./apps/api/API.md) - API endpoints reference
- [apps/api/TESTING.md](./apps/api/TESTING.md) - How to test with Postman
- [apps/api/ROADMAP.md](./apps/api/ROADMAP.md) - Backend feature tracking

### Shared Types
- [`packages/types/src/index.ts`](./packages/types/src/index.ts) - Shared type definitions (framework-agnostic enums, interfaces, DTOs)

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

**New to the project?**
1. Read [ROADMAP.md](./ROADMAP.md) to understand project stages
2. Check [apps/api/CLAUDE.md](./apps/api/CLAUDE.md) if working on backend
3. See [CONTRIBUTING.md](./CONTRIBUTING.md) for PR naming conventions

**Want to contribute?**
1. Read [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Create a branch following naming convention
3. Create a PR with `[SCOPE] - Description` format
