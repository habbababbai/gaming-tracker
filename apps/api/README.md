# API

Backend for web and mobile apps. NestJS, Prisma, PostgreSQL.

## Docs

- [CLAUDE.md](./CLAUDE.md) – comprehensive dev guide (architecture, security, patterns, DTOs, testing)
- [API.md](./API.md) – quick reference (endpoints, DB schema, status codes, auth & sessions)
- [TESTING.md](./TESTING.md) – test flows with Postman and E2E
- [ROADMAP.md](./ROADMAP.md) – completed features and roadmap

**For developers:** Start with CLAUDE.md  
**For API consumers:** Use API.md for endpoint reference (auth, logout, delete account, user-games).

## Setup

1. `docker compose up -d` (root)
2. Copy `.env.example` → `.env`
3. Set in `.env`: `DATABASE_URL`, `JWT_SECRET` (e.g. `openssl rand -base64 32`), `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`
4. `bun run db:migrate`

## Commands

| Command               | Description        |
| --------------------- | ------------------ |
| `bun run dev`         | Watch mode (below) |
| `bun run dev:debug`   | Watch + debugger    |
| `bun run start`       | Run once (below)   |
| `bun run start:prod`  | Run built app      |
| `bun run start:debug` | Run with debugger  |
| `bun run db:migrate`  | Run migrations     |
| `bun run build`       | Build to dist/     |
| `bun run test`        | Unit tests         |
| `bun run test:e2e`    | E2E tests          |
| `bunx prisma studio`  | DB GUI             |

### Run modes (dev / dev:debug / start / start:prod / start:debug)

| Script          | What it does |
| --------------- | ------------ |
| **dev**         | `nest start --watch` – Compiles TypeScript on the fly and restarts when source files change. Use for local development. |
| **dev:debug**   | `nest start --watch --debug` – Same as dev but with Node.js inspector. Attach from VS Code (port 9229) for breakpoints while keeping file watch. |
| **start**       | `nest start` – Runs the app once (compiles TS, no file watch). Same runtime as dev but no auto-restart. |
| **start:prod**  | `node dist/main` – Runs the compiled JavaScript from `dist/`. Requires `bun run build` first. Use for production or profiling. |
| **start:debug**| `nest start --debug` – Like `start` but with Node.js inspector (e.g. attach from VS Code). Default debug port 9229. |

### Profiling (profile:doctor / profile:flame / profile:bubbleprof)

Requires a build first: `bun run build`. Each script runs the built app under [Clinic.js](https://clinicjs.org/) and writes a report (HTML) when you stop the process (Ctrl+C).

| Script              | Tool    | What it does |
| ------------------- | ------- | ------------- |
| **profile:doctor**  | Doctor | General diagnosis: event loop delay, I/O, CPU. Suggests whether to use Flame or Bubbleprof next. Start here when investigating slowness. |
| **profile:flame**   | Flame  | CPU flame graph. Shows which functions use the most CPU. Use when Doctor or code suggests CPU-bound work. |
| **profile:bubbleprof** | Bubbleprof | Async I/O and promise/async flow. Shows where time is spent in async operations. Use for I/O or async bottlenecks. |

Run with `bun run profile:doctor` (or `profile:flame` / `profile:bubbleprof`), hit your API, then stop the server to generate the report.

## Auth

JWT-based; tokens are session-backed. Each login creates a session; logout (single or all devices) revokes session(s). Delete account: `DELETE /api/users/me` with valid JWT. See [API.md](./API.md) for details.

## Default

Runs on port 4000.
