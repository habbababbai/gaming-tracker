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

| Command              | Description    |
| -------------------- | -------------- |
| `bun run dev`        | Watch mode     |
| `bun run db:migrate` | Run migrations |
| `bun run build`      | Build to dist/ |
| `bun run start:prod` | Run built app  |
| `bun run test`       | Unit tests     |
| `bun run test:e2e`   | E2E tests      |
| `bunx prisma studio` | DB GUI         |

## Auth

JWT-based; tokens are session-backed. Each login creates a session; logout (single or all devices) revokes session(s). Delete account: `DELETE /api/users/me` with valid JWT. See [API.md](./API.md) for details.

## Default

Runs on port 4000.
