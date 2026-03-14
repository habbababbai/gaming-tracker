# Gaming Tracker

Track your game backlog and collection. Monorepo: NestJS API, Next.js web, Expo mobile.

## Stack

| App | Description | Tech |
|-----|-------------|------|
| api | Backend for web & mobile | NestJS, Prisma, PostgreSQL |
| web | Web app for tracker | Next.js (App Router) |
| mobile | Mobile app for tracker | Expo, React Native |

## Quick start

```bash
bun install
docker compose up -d
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
bun run dev
```

- API: http://localhost:4000
- Web: http://localhost:3000
- Mobile: `bunx expo start` in apps/mobile

## Structure

```
gaming-tracker/
├── apps/
│   ├── api/       # Backend for web & mobile
│   │   ├── src/
│   │   ├── CLAUDE.md      # Dev guide & architecture
│   │   ├── API.md         # Quick endpoint reference
│   │   └── .agents        # AI instructions
│   ├── web/       # Web app for tracker
│   └── mobile/    # Mobile app for tracker
├── packages/
│   ├── tsconfig/  # Shared tsconfig
│   └── types/     # Shared types (framework-agnostic enums & interfaces)
├── turbo.json
└── docker-compose.yml
```

## Shared Types Architecture

`packages/types` contains **framework-agnostic** types used by all apps:
- TypeScript enums (`GameStatus`, etc.)
- Interfaces & types (`UserGameResponse`, `GameData`, etc.)
- DTO contracts (request/response shapes)

**NOT in shared types:**
- Validators or decorators (API-specific)
- NestJS/Next.js/Expo-specific code
- Implementation details

Each app adds its own validation layer:
- **API** (NestJS): Adds `class-validator` decorators to DTOs
- **Web/Mobile**: Implements client-side form validation

## Roadmap

| Stage | Scope |
|-------|-------|
| **1. Backend core** | User, Game, UserGame, CRUD for statuses |
| **2. Web MVP** | Auth, game list, add to collection |
| **3. IGDB integration** | `/games/search`, DB cache |
| **4. Mobile** | Login, list, change status |

## Commands

- `bun run dev` – run all apps (turbo)
- `bun run build` – build all
- `bun run lint` – lint all
