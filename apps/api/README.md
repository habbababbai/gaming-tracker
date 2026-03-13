# API

Backend for web and mobile apps. NestJS, Prisma, PostgreSQL.

## Docs

- [API.md](./API.md) – endpoints, DB schema, request/response format
- [TESTING.md](./TESTING.md) – steps to test with IGDB

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

## Default

Runs on port 4000.
