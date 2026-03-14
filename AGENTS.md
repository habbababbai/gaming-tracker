# AI Agent Rules & Project Conventions

Read this before making changes. Hobby project – keep it simple.

---

## Workflow

1. **Plan and ask** – Propose approach before editing. Get user approval for non-trivial changes.
2. **Think critically** – Evaluate alternatives. Prefer simpler, maintainable solutions.
3. **Minimize tokens** – Be concise. Avoid verbose comments and unnecessary prose.
4. **Remove bloat** – No unnecessary deps, files, or code. Prefer fewer, smaller solutions. Be as concise as possible everywhere.
5. **Check what user asks** – When user asks to check specific files (tests, specs, configs), READ THOSE FILES FIRST. Don't jump to tangential config files. Fix errors in the actual files mentioned.
6. **Don't auto-run commands repeatedly** – Don't run tests/lint multiple times. Make fixes, then ASK user to run and share results. User runs: `bun run test`, `bun run lint:fix`.
7. **Batch file reads** – Read multiple related files in one call when possible.
8. **Skip obvious checks** – Don't re-read files you just wrote. Don't verify simple edits worked.

---

## Monorepo

- `apps/api`, `apps/web`, `apps/mobile` – apps
- `packages/types` – shared types, use `@repo/types`
- `packages/tsconfig` – shared tsconfig, extend in app configs
- Dependencies: apps depend on packages, not on each other
- Run commands from root: `bun run dev`, `bun run build`, `bun run lint`

---

## Naming

- **Files**: kebab-case (`user-game.service.ts`), PascalCase for components (`GameCard.tsx`)
- **Routes**: kebab-case, plural resources (`/api/users`, `/api/games`)
- **DB tables/Prisma**: PascalCase model, camelCase fields
- **Env vars**: SCREAMING_SNAKE_CASE, prefix app-specific (`API_PORT`, `DATABASE_URL`)

---

## API Design (REST)

- GET (read), POST (create), PATCH (partial update), PUT (replace), DELETE (remove)
- Status: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict
- Nest `data` in response: `{ data: {...} }` for single, `{ data: [...], meta: { total } }` for lists
- Pagination: `?page=1&limit=20`, return `meta: { page, limit, total }`
- Validation: class-validator DTOs on inputs

---

## Code Style

- **No comments** unless: vague behavior, workaround, or dense logic that needs explanation.
- **JSDoc** – use for public APIs, complex functions, non-obvious params.
- **Tests** – write for critical logic (auth, core services, complex utils). Skip trivial glue code.
- **Imports**: absolute paths where configured; group: external → internal → relative.

---

## File Structure

- API: feature folders under `src/` (e.g. `users/`, `games/`); module, controller, service, dto per feature
- Web: App Router; `app/(auth)/`, `app/(dashboard)/` route groups; shared in `components/`
- Mobile: `app/` routes, `components/`, `hooks/`, `services/`

---

## Security & Data

- Never commit secrets; use `.env` (in .gitignore), `.env.example` for shape
- Validate and sanitize all inputs; use DTOs
- Idempotency for mutations where appropriate

---

## Git

- Commits: conventional style `type(scope): message` – e.g. `feat(api): add games search`
- Types: feat, fix, chore, refactor, docs, test

---

## Project Context

### Roadmap

| Stage | Focus |
|-------|-------|
| 1 | User, Game, UserGame, status CRUD |
| 2 | Web: auth, game list, add to collection |
| 3 | `/games/search`, IGDB integration, cache in DB |
| 4 | Mobile: login, list, status change |

### Game Data API

**IGDB** – free, Twitch auth, 4 req/s. Node.js wrappers available.  
**RAWG** – 300k+ games, free key, store links, REST.  
Both suitable for hobby use. IGDB preferred initially; can switch.

### Stack

- API: NestJS, Prisma, PostgreSQL
- Web: Next.js App Router, Tailwind
- Mobile: Expo, file-based routing
- DB: `docker compose up`, `postgresql://postgres:postgres@localhost:5432/game_tracker`

---

## Conventions

- Use `bun` for install, run, and exec (`bunx` = npx equivalent)
- Use Prisma for migrations; no raw SQL unless needed
- Env: `apps/api/.env`, copy from `.env.example`
- Keep responses lean; avoid over-fetching
- Add DB indexes on columns used in WHERE, JOIN, ORDER BY

---

## Error Handling

- API: throw Nest `HttpException` or use built-in filters
- Return consistent shape: `{ statusCode, message, error? }`
- Log server errors; never expose stack traces to client
