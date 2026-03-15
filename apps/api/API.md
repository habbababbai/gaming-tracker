# API Reference

Base URL: `http://localhost:4000/api`

Protected routes require `Authorization: Bearer <token>` header.

Responses: `{ data: T }` for single, `{ data: T[], meta: { page, limit, total } }` for lists.

**For development guides, patterns, and architecture:** See [CLAUDE.md](./CLAUDE.md)
**For testing with Postman:** See [TESTING.md](./TESTING.md)

---

## Database Schema

### User

| Column      | Type     | Notes        |
| ----------- | -------- | ------------ |
| id          | String   | CUID, PK     |
| email       | String   | Unique       |
| passwordHash| String   | bcrypt       |
| createdAt   | DateTime | Default: now |

### Session

Stores issued tokens (one per login). Used to validate JWT on each request and to revoke on logout.

| Column   | Type     | Notes                    |
| -------- | -------- | ------------------------ |
| jti      | String   | PK, unique token id      |
| userId   | String   | FK → User, cascade delete|
| expiresAt| DateTime | Token expiry             |

### Game (cache only)

Cache of game data from third-party (IGDB). Populated when users add games.

### UserGame

Links a user to a game in their collection.

---

## Endpoints

### Auth

| Method | Path                | Auth  | Description |
| ------ | ------------------- | ----- | ----------- |
| POST   | `/api/auth/register`| No    | Create account |
| POST   | `/api/auth/login`   | No    | Get JWT token |
| POST   | `/api/auth/logout`  | Yes   | Revoke current session |
| POST   | `/api/auth/logout?all=true` | Yes | Revoke all sessions for user |

Tokens are session-based: each login creates a session; protected requests require a valid JWT whose session exists. Logout removes the session(s), so the token becomes invalid.

**POST /api/auth/register** – Body: `{ "email": "...", "password": "..." }`  
Password min 8 chars, uppercase, lowercase, number. Returns `{ data: { user, accessToken } }`.

**POST /api/auth/login** – Body: `{ "email": "...", "password": "..." }`  
Returns `{ data: { user, accessToken } }`. Multiple logins (e.g. web + mobile) create multiple sessions; all stay valid until logout.

**POST /api/auth/logout** – Requires `Authorization: Bearer <token>`. Revokes the current token’s session. Returns `204 No Content`.

**POST /api/auth/logout?all=true** – Requires `Authorization: Bearer <token>`. Revokes all sessions for that user (all devices). Returns `204 No Content`.

---

### Games (IGDB, public)

| Method | Path                | Description       |
| ------ | ------------------- | ----------------- |
| GET    | `/api/games/search` | Search IGDB       |

**GET /api/games/search** – Query: `?q=elden+ring&limit=10`

---

### Users (protected)

| Method | Path             | Description |
| ------ | ---------------- | ----------- |
| GET    | `/api/users/me`  | Current user |
| DELETE | `/api/users/me`  | Delete account (requires valid JWT; cascades to sessions and user-games) |

**DELETE /api/users/me** – Requires valid JWT. Permanently deletes the authenticated user and all their sessions and user-games. Returns `204 No Content`.

---

### UserGames (protected)

| Method | Path               | Description            |
| ------ | ------------------ | ---------------------- |
| POST   | `/api/user-games`  | Add game to collection |
| GET    | `/api/user-games`  | List my games          |
| GET    | `/api/user-games/:id` | Get UserGame        |
| PATCH  | `/api/user-games/:id` | Update status      |
| DELETE | `/api/user-games/:id` | Remove from collection |

**POST /api/user-games** – Body: `{ "igdbId": 124562, "status": "todo" }`  
UserId from JWT. Optional `status` (default: `todo`).

**GET /api/user-games** – Query: `?page=1&limit=20&status=playing`

---

## Status Codes

| Code | Meaning        |
| ---- | -------------- |
| 200  | OK             |
| 201  | Created        |
| 204  | No Content     |
| 400  | Bad Request    |
| 401  | Unauthorized   |
| 403  | Forbidden      |
| 404  | Not Found      |
| 409  | Conflict       |
