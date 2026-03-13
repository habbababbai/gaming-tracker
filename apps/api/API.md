# API Reference

Base URL: `http://localhost:4000/api`

Game catalog data comes from a third-party service (IGDB). We only store which games users have saved and their status. Game details are cached when added to a collection.

Responses: `{ data: T }` for single, `{ data: T[], meta: { page, limit, total } }` for lists.

---

## Database Schema

### User

| Column    | Type     | Notes        |
| --------- | -------- | ------------ |
| id        | String   | CUID, PK     |
| email     | String   | Unique       |
| createdAt | DateTime | Default: now |

### Game (cache only)

Cache of game data from third-party (IGDB). Populated when users add games. Not managed via API.

| Column     | Type    | Notes              |
| ---------- | ------- | ------------------ |
| id         | String  | CUID, PK           |
| igdbId     | Int     | Unique, external ID|
| name       | String  |                    |
| coverUrl   | String? |                    |
| releaseYear| Int?    |                    |
| createdAt  | DateTime| Default: now       |

### UserGame

Links a user to a game in their collection.

| Column   | Type     | Notes                 |
| -------- | -------- | --------------------- |
| id       | String   | CUID, PK              |
| userId   | String   | FK → User (cascade)   |
| gameId   | String   | FK → Game (cascade)   |
| status   | GameStatus | Default: todo      |
| createdAt| DateTime | Default: now          |
| updatedAt| DateTime | Auto-updated          |

Unique on `(userId, gameId)`.

### GameStatus

`todo` | `playing` | `completed` | `dropped`

---

## Endpoints

### Games (IGDB)

| Method | Path              | Description          |
| ------ | ----------------- | -------------------- |
| GET    | `/api/games/search` | Search IGDB for games |

**GET /api/games/search** – Query: `?q=elden+ring&limit=10`  
Fetches game data from IGDB. Returns `{ data: [{ id, name, coverUrl, releaseYear }, ...] }`.

---

### Users

| Method | Path           | Description   |
| ------ | -------------- | ------------- |
| POST   | `/api/users`   | Register (create account) |

**POST /api/users** – Body: `{ "email": "user@example.com" }`

*Login, get profile, delete account – coming with auth.*

---

### UserGames

| Method | Path               | Description                |
| ------ | ------------------ | -------------------------- |
| POST   | `/api/user-games`  | Add game to collection     |
| GET    | `/api/user-games`  | List user's games          |
| GET    | `/api/user-games/:id` | Get UserGame            |
| PATCH  | `/api/user-games/:id` | Update status          |
| DELETE | `/api/user-games/:id` | Remove from collection  |

**POST /api/user-games** – Add game by IGDB ID. Game data is fetched from IGDB and cached. Body:
```json
{
  "userId": "clx...",
  "igdbId": 12345,
  "status": "todo"
}
```
Required: `userId`, `igdbId`. Optional: `status` (default: `todo`).

**GET /api/user-games** – Query: `?userId=clx...&page=1&limit=20&status=playing`  
`userId` required. `status` filters by GameStatus.

**PATCH /api/user-games/:id** – Body: `{ "status": "completed" }`

---

## Status Codes

| Code | Meaning     |
| ---- | ----------- |
| 200  | OK          |
| 201  | Created     |
| 204  | No Content  |
| 400  | Bad Request |
| 404  | Not Found   |
| 409  | Conflict    |
