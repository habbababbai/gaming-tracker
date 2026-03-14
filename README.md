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

**Goal:** Single source of truth for type contracts across all apps (API, Web, Mobile).

### The Pattern

`packages/types` contains **framework-agnostic** types shared by all apps:
- ✅ TypeScript enums (`GameStatus`, `UserRole`, etc.)
- ✅ Interfaces & types (`UserGameResponse`, `GameData`, `CreateUserGameDto`, etc.)
- ✅ DTO contracts (request/response shapes)
- ✅ Constants & configuration types

**NOT in shared types:**
- ❌ Validators or decorators (`@IsEmail`, `@IsNotEmpty`, etc.)
- ❌ NestJS/Next.js/Expo-specific code
- ❌ Framework dependencies
- ❌ Implementation details

### Why This Matters

```
Problem Without Clean Separation:
  Web app imports @repo/types
    → Pulls in class-validator (NestJS library)
    → Bloats bundle size
    → Adds Node.js deps to browser code

Solution With Clean Separation:
  Web app imports @repo/types
    → Pure TypeScript interfaces only
    → No framework dependencies
    → Each app validates at its boundary
```

### Validation Pattern

Each app implements validation appropriate to its environment:

**API (NestJS - Server-side):**
```typescript
// In @repo/types (shared)
export interface CreateUserGameDto {
  igdbId: number;
  status?: GameStatus;
}

// In apps/api (API-specific)
export class CreateUserGameDto {
  @IsNumber()
  igdbId: number;

  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;
}
```

**Web (Next.js - Client-side):**
```typescript
// Import interface from shared types
import { CreateUserGameDto, GameStatus } from '@repo/types';

// Validate using form library (Zod, React Hook Form, etc.)
const schema = z.object({
  igdbId: z.number(),
  status: z.enum(Object.values(GameStatus)).optional(),
});
```

**Mobile (Expo - Client-side):**
```typescript
// Same interface from shared types
import { CreateUserGameDto, GameStatus } from '@repo/types';

// Validate using mobile form validation
const validateForm = (data: CreateUserGameDto) => {
  // Validation logic
};
```

### Guidelines for Contributing

**When to add to `@repo/types`:**
- Type used by 2+ apps
- DTO that's part of API contract
- Enum that's shared across apps
- Response type that frontend needs

**When to keep local:**
- Validator classes (use in API only)
- Service implementations
- Framework-specific types
- Internal utilities

**See:** [`packages/types/src/index.ts`](./packages/types/src/index.ts) for guidelines

## Roadmap

| Stage | Scope |
|-------|-------|
| **1. Backend core** | User, Game, UserGame, CRUD for statuses |
| **2. Web MVP** | Auth, game list, add to collection |
| **3. IGDB integration** | `/games/search`, DB cache |
| **4. Mobile** | Login, list, change status |

## Documentation & Resources

### For All Developers
- [ROADMAP.md](./ROADMAP.md) - Project stages & progress tracking
- [Shared Types Guidelines](./packages/types/src/index.ts) - When/what to share

### For Backend Development
- [apps/api/CLAUDE.md](./apps/api/CLAUDE.md) - Architecture, security, patterns
- [apps/api/API.md](./apps/api/API.md) - Quick endpoint reference
- [apps/api/TESTING.md](./apps/api/TESTING.md) - Testing with Postman
- [apps/api/ROADMAP.md](./apps/api/ROADMAP.md) - Backend progress tracking
- [apps/api/.agents](./apps/api/.agents) - AI development instructions

### For Frontend/Mobile Development
- [Shared Types Architecture](#shared-types-architecture) - Type sharing pattern
- API endpoints documented in [apps/api/API.md](./apps/api/API.md)

---

## Commands

- `bun run dev` – run all apps (turbo)
- `bun run build` – build all
- `bun run lint` – lint all
- `bun run format` – format code
- `bun test` – run all tests

**In apps/api:**
- `bun run db:migrate` – run database migrations
- `bun run start:debug` – start with debugger
- `bun run start:prod` – run production build
