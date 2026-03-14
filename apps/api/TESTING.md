# Testing the API (Postman)

Base URL: `http://localhost:4000/api`

Protected routes need `Authorization: Bearer {{accessToken}}` header.

---

## 1. Setup

1. Start Postgres: `docker compose up -d`
2. In `apps/api`: copy `.env.example` → `.env`
3. Set `DATABASE_URL`, `JWT_SECRET`, `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`
4. Run migrations: `bun run db:migrate`
5. Start API: `bun run dev`

---

## 2. Postman flow

### 1. Register

| Field | Value |
|-------|-------|
| Method | POST |
| URL | `{{baseUrl}}/auth/register` |
| Headers | `Content-Type: application/json` |
| Body | `{"email": "test@example.com", "password": "password123"}` |

Response: `{ data: { user: {...}, accessToken: "..." } }`  
Save `accessToken` → Postman env var.

---

### 2. Login (or skip if already registered)

| Field | Value |
|-------|-------|
| Method | POST |
| URL | `{{baseUrl}}/auth/login` |
| Headers | `Content-Type: application/json` |
| Body | `{"email": "test@example.com", "password": "password123"}` |

Save `accessToken`.

---

### 3. Search games (no auth)

| Field | Value |
|-------|-------|
| Method | GET |
| URL | `{{baseUrl}}/games/search?q=elden ring&limit=5` |

Pick an `id` → save as `igdbId`.

---

### 4. Add game (auth required)

| Field | Value |
|-------|-------|
| Method | POST |
| URL | `{{baseUrl}}/user-games` |
| Headers | `Content-Type: application/json`, `Authorization: Bearer {{accessToken}}` |
| Body | `{"igdbId": {{igdbId}}, "status": "playing"}` |

---

### 5. List my games

| Field | Value |
|-------|-------|
| Method | GET |
| URL | `{{baseUrl}}/user-games` |
| Headers | `Authorization: Bearer {{accessToken}}` |

Save a game `id` → use as `userGameId`.

---

### 5a. Filter games by status

| Field | Value |
|-------|-------|
| Method | GET |
| URL | `{{baseUrl}}/user-games?status=playing` |
| Headers | `Authorization: Bearer {{accessToken}}` |

Query params: `?status=todo` \| `?status=playing` \| `?status=completed` \| `?status=dropped`

---

### 5b. Update game status (PATCH)

| Field | Value |
|-------|-------|
| Method | PATCH |
| URL | `{{baseUrl}}/user-games/{{userGameId}}` |
| Headers | `Content-Type: application/json`, `Authorization: Bearer {{accessToken}}` |
| Body | `{"status": "completed"}` |

Status values: `"todo"`, `"playing"`, `"completed"`, `"dropped"`

---

### 5c. Delete game (DELETE)

| Field | Value |
|-------|-------|
| Method | DELETE |
| URL | `{{baseUrl}}/user-games/{{userGameId}}` |
| Headers | `Authorization: Bearer {{accessToken}}` |

Response: `204 No Content` (empty body)

---

### 6. Get my profile

| Field | Value |
|-------|-------|
| Method | GET |
| URL | `{{baseUrl}}/users/me` |
| Headers | `Authorization: Bearer {{accessToken}}` |

---

### 7. Delete account

| Field | Value |
|-------|-------|
| Method | DELETE |
| URL | `{{baseUrl}}/users/me` |
| Headers | `Authorization: Bearer {{accessToken}}` |

---

## 3. Postman environment

| Variable | Example |
|----------|---------|
| baseUrl | `http://localhost:4000/api` |
| accessToken | (from login/register) |
| igdbId | `124562` |

Tests tab for register/login:  
`pm.environment.set("accessToken", pm.response.json().data.accessToken);`
