# Testing the API (Postman)

Prerequisites: Docker, Bun, IGDB/Twitch app credentials, API running on `http://localhost:4000`.

---

## 1. Setup

1. Start Postgres: `docker compose up -d` (from repo root)
2. In `apps/api`: copy `.env.example` → `.env`, set `DATABASE_URL`, `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`
3. Run migrations: `bun run db:migrate`
4. Start API: `bun run dev`

**IGDB**: Create app at https://dev.twitch.tv/console/apps (Client Type: Confidential).

---

## 2. Postman requests

Base URL: `http://localhost:4000/api`

### 1. Create user

| Field | Value |
|-------|-------|
| Method | POST |
| URL | `{{baseUrl}}/users` |
| Headers | `Content-Type: application/json` |
| Body (raw JSON) | `{"email": "test@example.com"}` |

Response: copy `data.id` → save as `userId` (or Postman env var).

---

### 2. Search games (IGDB)

| Field | Value |
|-------|-------|
| Method | GET |
| URL | `{{baseUrl}}/games/search?q=elden ring&limit=5` |
| Headers | — |

Response: copy an `id` from `data[]` → save as `igdbId`.

---

### 3. Add game to collection

| Field | Value |
|-------|-------|
| Method | POST |
| URL | `{{baseUrl}}/user-games` |
| Headers | `Content-Type: application/json` |
| Body (raw JSON) | `{"userId": "{{userId}}", "igdbId": {{igdbId}}, "status": "playing"}` |

Fetches game data from IGDB and caches it. Replace `{{userId}}` and `{{igdbId}}` with values from steps 1 and 2.

---

### 4. List user's games

| Field | Value |
|-------|-------|
| Method | GET |
| URL | `{{baseUrl}}/user-games?userId={{userId}}` |

---

### 5. Update status

| Field | Value |
|-------|-------|
| Method | PATCH |
| URL | `{{baseUrl}}/user-games/{{userGameId}}` |
| Headers | `Content-Type: application/json` |
| Body (raw JSON) | `{"status": "completed"}` |

Use `userGameId` from the list response (step 4).

---

### 6. Remove from collection

| Field | Value |
|-------|-------|
| Method | DELETE |
| URL | `{{baseUrl}}/user-games/{{userGameId}}` |

---

## 3. Postman environment (optional)

Create an environment with:

| Variable | Initial | Example |
|----------|---------|---------|
| baseUrl | `http://localhost:4000/api` | — |
| userId | (empty) | `clx123...` |
| igdbId | (empty) | `124562` |
| userGameId | (empty) | `clx456...` |

Use Tests tab to save IDs:

- **Create user** → `pm.environment.set("userId", pm.response.json().data.id);`
- **Search games** → manually pick an id and set `igdbId`
- **List user games** → `pm.environment.set("userGameId", pm.response.json().data[0].id);` (if you want to use first item)
