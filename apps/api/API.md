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

### Game (cache only)

Cache of game data from third-party (IGDB). Populated when users add games.

### UserGame

Links a user to a game in their collection.

---

## Endpoints

### Auth (public)

| Method | Path                | Description |
| ------ | ------------------- | ----------- |
| POST   | `/api/auth/register`| Create account |
| POST   | `/api/auth/login`   | Get JWT token |

**POST /api/auth/register** – Body: `{ "email": "...", "password": "..." }`  
Password min 8 chars. Returns `{ data: { user, accessToken } }`.

**POST /api/auth/login** – Body: `{ "email": "...", "password": "..." }`  
Returns `{ data: { user, accessToken } }`.

---

### Games (IGDB, public)

| Method | Path                | Description       |
| ------ | ------------------- | ----------------- |
| GET    | `/api/games/search` | Search IGDB       |

**GET /api/games/search** – Query: `?q=elden+ring&limit=10`

---

### Users (protected)

| Method | Path          | Description   |
| ------ | ------------- | ------------- |
| GET    | `/api/users/me`   | Current user  |
| DELETE | `/api/users/me`   | Delete account |

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
