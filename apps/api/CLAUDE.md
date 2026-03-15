# Gaming Tracker API - Development Guide

This document provides guidelines for AI and developers building features in the Gaming Tracker NestJS API.

## Project Overview

Gaming Tracker is a **NestJS + Prisma + PostgreSQL** API for managing game libraries and user gaming data. It integrates with IGDB API for game metadata.

**Key technologies:**
- NestJS 11 (backend framework)
- Prisma 7 (ORM + migrations)
- PostgreSQL (database)
- JWT + Passport (authentication)
- bcrypt (password hashing)
- class-validator/class-transformer (DTO validation)

## Architecture

### Module Structure

The app follows NestJS module pattern with clear separation of concerns:

```
src/
├── auth/              # Authentication (JWT, strategies, guards)
├── users/             # User management
├── games/             # Game catalog
├── user-games/        # User's game library (relationships)
├── igdb/              # IGDB API integration service
├── prisma/            # Database service
└── main.ts            # Bootstrap
```

**Principle:** Each feature gets its own module with:
- `*.module.ts` - module definition
- `*.service.ts` - business logic
- `*.controller.ts` - HTTP endpoints
- `dto/` - data transfer objects (validation schemas)

### Module Dependencies

- **AuthModule** → depends on PrismaModule, JwtService
- **UsersModule** → depends on PrismaModule
- **UserGamesModule** → depends on PrismaModule
- **GamesModule** → depends on IgdbModule, PrismaModule
- **IgdbModule** → standalone service

**Rule:** Modules should not have circular dependencies. Use services to handle cross-module communication.

### Shared Types Strategy

The monorepo uses `@repo/types` for **framework-agnostic** types shared across API, web, and mobile:

**In `@repo/types` (shared):**
- Enums: `GameStatus`, `UserRole`, etc.
- Interfaces: `UserGameResponse`, `GameData`, `LoginDto`, `RegisterDto`
- DTO contracts: Request/response shapes (interfaces only)
- No validators or framework-specific code

**In `apps/api` (API-only):**
- DTO classes with `class-validator` decorators: `CreateUserGameDto` class with `@IsNotEmpty`, `@IsEmail`, etc.
- Server-side validation logic
- NestJS-specific code (guards, interceptors, modules)

**Why this split?**
- Web/Mobile can import types without pulling NestJS dependencies
- Shared types stay lightweight and reusable
- Each app implements validation for its own layer (API validates on request, web/mobile validate client-side)
- Clear separation: contracts (shared) vs implementations (local)

## Security Best Practices

### Authentication & Authorization

1. **JWT Configuration**
   - Secret stored in `JWT_SECRET` environment variable
   - Tokens extracted from `Authorization: Bearer <token>` header
   - **Session-backed tokens:** Each login creates a `Session` row (jti, userId, expiresAt). JWT payload includes `jti`. Strategy validates token and checks session exists and is not expired. Logout removes session(s); token then returns 401.
   - Default `JwtAuthGuard` applied globally to all routes
   - Use `@Public()` decorator to exclude routes from auth (register, login)

2. **Password Security**
   - Hash with bcrypt, SALT_ROUNDS = 12
   - Never return passwordHash in responses
   - Constant-time comparison (bcrypt.compare)
   - **Password requirements (enforced in RegisterDto):**
     - Minimum 8 characters
     - At least one uppercase letter (A-Z)
     - At least one lowercase letter (a-z)
     - At least one number (0-9)

3. **Authorization Rules**
   - Users can only access their own data
   - Use user ID from decoded JWT token (`request.user`)
   - Always validate `userId` matches authenticated user in service layer
   - Example: `user-games` endpoints must check the user owns the game record

### Input Validation

- **Always use DTOs with class-validator decorators** for all `@Body()`, `@Query()`, `@Param()`
- ValidationPipe configured globally with `whitelist: true` (strips unknown properties)
- Validation examples:
  ```typescript
  // In DTO:
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'password must contain uppercase' })
  password: string;
  ```
- **Never trust user input** - validate even for internal APIs

### Error Handling & Information Disclosure

- Return generic error messages to clients (don't leak database/system details)
- Log detailed errors server-side for debugging
- Use appropriate HTTP status codes:
  - 400 Bad Request (validation)
  - 401 Unauthorized (auth failed)
  - 403 Forbidden (authorization failed)
  - 409 Conflict (duplicate email)
  - 500 Internal Server Error (unexpected errors)

### Environment & Secrets

- **All secrets in `.env.local` (not committed to git)**
  - `JWT_SECRET` - **REQUIRED**, strong random string (min 32 chars, generate with `openssl rand -base64 32`)
  - `DATABASE_URL` - PostgreSQL connection
  - `IGDB_CLIENT_ID` - IGDB API credentials
  - `IGDB_CLIENT_SECRET` - IGDB API credentials
  - `PORT` - server port (default 4000)
  - `CORS_ORIGIN` - Allowed frontend origin (default: `http://localhost:3000`)

- **JWT_SECRET is mandatory** - app startup fails if not set
- Never log secrets or sensitive data
- Use `process.env['KEY_NAME']` with nullish coalescing for optional values

### Database & SQL Injection Prevention

- **Prisma ORM prevents SQL injection by default** - use query builder, never raw SQL
- Use `findUnique`, `findMany`, `create`, `update`, `delete` from Prisma client
- Prefer parameterized queries and Prisma methods over string interpolation
- Handle database constraints:
  ```typescript
  // Check existence before operations
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundException();
  ```

### Rate Limiting & DoS Protection

- **Implemented:** Auth endpoints (register, login) are rate-limited via `@nestjs/throttler`
- Rate limit: **5 requests per 15 minutes** per IP address
- Limit applies to: POST `/api/auth/register` and POST `/api/auth/login`
- If limit exceeded: returns 429 Too Many Requests
- Uses custom `AuthThrottleGuard` to track by IP instead of user

### CORS & HTTP Headers

- **Helmet middleware** enabled in `main.ts` - provides secure HTTP headers:
  - X-Frame-Options: DENY (prevents clickjacking)
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: enabled
  - Strict-Transport-Security: HSTS for HTTPS enforcement
  - Content-Security-Policy: restrictive defaults
- **CORS configuration:**
  - Allowed origin: `CORS_ORIGIN` env var (default: `http://localhost:3000`)
  - Credentials allowed: true (for cookies/JWT)
  - Configure for each frontend URL in production

## Code Quality Standards

### Naming Conventions

- **Files:** kebab-case (e.g., `user-games.controller.ts`, `auth.guard.ts`)
- **Classes:** PascalCase (e.g., `UserGamesService`, `JwtStrategy`)
- **Methods/Variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE (e.g., `SALT_ROUNDS`, `JWT_EXPIRY`)
- **DTOs:** PascalCase + Dto suffix (e.g., `CreateUserGameDto`, `LoginDto`)

### Code Organization

- Keep services focused on single responsibility
- Extract complex logic into private methods
- Services should handle ALL business logic, controllers only handle HTTP
- Controllers should be thin - mostly routing and response formatting
- Use dependency injection via constructor

### TypeScript Best Practices

- **No `any`** – `noImplicitAny: true` in tsconfig; no explicit `any`; use `unknown` and narrow or proper types.
- **Strict tsconfig** – `apps/api/tsconfig.json` uses `strict: true`, `strictNullChecks`, `strictBindCallApply`, `noFallthroughCasesInSwitch`. Do not relax these.
- Use interfaces for complex object shapes (payloads, responses)
- Use enums for fixed value sets (e.g., game statuses, rating scales)
- Export types from service files, import in controllers/DTOs
- Use `readonly` for constructor properties

### Response Format

Standardize API responses:
```typescript
// Success responses
{
  data: { user, accessToken }  // 200 OK
}
{
  data: { ...resource }        // 201 Created
}

// Error responses (handled by NestJS exception filters)
{
  statusCode: 400,
  message: "Validation failed",
  error: "Bad Request"
}
```

### Comments & Documentation

- Code should be self-documenting - avoid obvious comments
- Document WHY, not WHAT (code shows what, comments explain why)
- **JSDoc** for public service methods: AuthService, UsersService, IgdbService, UserGamesService. Use `@param`, `@returns`, `@throws` when non-obvious. Example:
  ```typescript
  /**
   * Authenticates by email/password and returns user + access token.
   * Creates a new session (multiple logins allowed).
   * @throws UnauthorizedException if credentials invalid
   */
  async login(dto: LoginDto) { ... }
  ```
- Skip JSDoc on trivial glue (simple controllers, obvious CRUD). Add for complex logic or non-obvious params/errors.
- No commented-out code in commits - delete it

## Testing Strategy

### Running Tests

```bash
bun run test        # unit tests
bun run test:e2e    # e2e tests
bun run test:cov    # unit tests with coverage
```

### Finding and fixing all errors (lint + TypeScript)

Run once to see every lint and type error in the API:

```bash
cd apps/api && bun run check
```

This runs `prisma generate`, then `lint` (with `--max-warnings 0`), then `type-check`. Fix reported files (lint first, then `tsc --noEmit`). Use `bun run lint:fix` for auto-fixable rules. Re-run `bun run check` until it passes.

**Why did my IDE show errors but `bun run check` passed?** Type-aware ESLint rules (e.g. `no-unsafe-call`) use TypeScript’s type information. The IDE and the CLI must use the same TypeScript program. We use `parserOptions.project: ['./tsconfig.json']` and an explicit `include` in `tsconfig.json` so both use the same program. Always run `bun run check` from `apps/api` after pulling or changing schema; it runs `prisma generate` first so generated types exist. If the IDE still shows stale type-aware errors after `check` passes, restart the ESLint server (or reload the editor window).

---

### Unit Tests (`src/**/*.spec.ts`)

**Location:** Same directory as source file (e.g., `auth.service.spec.ts` next to `auth.service.ts`)

**Structure:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock ESM packages at file top BEFORE imports are resolved
jest.mock('igdb-api-node', () => ({
  __esModule: true,
  default: jest.fn(() => ({ /* mock client */ })),
}));

describe('MyService', () => {
  let service: MyService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    // ... other models
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });
    const result = await service.findUser('1');
    expect(result.email).toBe('test@test.com');
  });
});
```

**Rules:**
- Mock ALL external dependencies (Prisma, external APIs)
- Use `jest.clearAllMocks()` in `beforeEach` to reset state
- Test both success and error paths
- For ESM packages that Jest can't parse, use `jest.mock()` at file top

---

### E2E Tests (`test/**/*.e2e-spec.ts`)

**Location:** `apps/api/test/` directory

**Structure:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthThrottleGuard } from '../src/auth/throttle.guard';

describe('Feature (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override guards that interfere with tests
      .overrideGuard(AuthThrottleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean database before tests
    await prisma.userGame.deleteMany();
    await prisma.game.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.userGame.deleteMany();
    await prisma.game.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('should create resource', () => {
    return request(app.getHttpServer())
      .post('/resource')
      .send({ field: 'value' })
      .expect(201);
  });
});
```

---

### Critical Test Rules

#### 1. Test Isolation
- **Each describe block must use unique test data** - don't reuse mock objects across sections
- Clean up in `beforeAll`/`afterAll` at appropriate scope
- Add error handling in `beforeAll` to fail fast:
  ```typescript
  beforeAll(async () => {
    const res = await request(app.getHttpServer()).post('/resource').send(data);
    if (!res.body.data) {
      throw new Error(`Setup failed: ${JSON.stringify(res.body)}`);
    }
    resourceId = res.body.data.id;
  });
  ```

#### 2. ESM Package Issues (igdb-api-node, apicalypse)
Jest can't parse ESM packages. Two solutions:

**For unit tests:** Mock at file top
```typescript
jest.mock('igdb-api-node', () => ({
  __esModule: true,
  default: jest.fn(() => ({ fields: jest.fn().mockReturnThis(), ... })),
}));
```

**For e2e tests:** Use `moduleNameMapper` in `jest-e2e.json`
```json
{
  "moduleNameMapper": {
    "^igdb-api-node$": "<rootDir>/test/__mocks__/igdb-api-node.ts"
  }
}
```

Create mock file at `test/__mocks__/igdb-api-node.ts`:
```typescript
const mockClient = {
  fields: () => mockClient,
  search: () => mockClient,
  where: () => mockClient,
  limit: () => mockClient,
  request: jest.fn().mockResolvedValue({ data: [] }),
};
export default jest.fn().mockReturnValue(mockClient);
```

#### 3. Rate Limiting in E2E Tests
Override `AuthThrottleGuard` to disable rate limiting:
```typescript
.overrideGuard(AuthThrottleGuard)
.useValue({ canActivate: () => true })
```

#### 4. Mocking Services in E2E
Use `jest.spyOn` AFTER module compilation:
```typescript
const igdbService = moduleFixture.get<IgdbService>(IgdbService);
jest.spyOn(igdbService, 'getById').mockImplementation(async (id) => {
  if (id === 123) return mockGame;
  return null;
});
```

#### 5. ValidationPipe in E2E
Must enable manually - not auto-applied in tests:
```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

---

### Jest Configuration

**Unit tests:** `apps/api/package.json`
```json
{
  "jest": {
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": ["ts-jest", { "tsconfig": "tsconfig.spec.json" }]
    },
    "moduleNameMapper": {
      "^@repo/types$": "<rootDir>/../../../packages/types/src/index.ts"
    }
  }
}
```

**E2E tests:** `apps/api/test/jest-e2e.json`
```json
{
  "rootDir": "..",
  "testRegex": ".e2e-spec.ts$",
  "setupFilesAfterEnv": ["<rootDir>/test/setup.ts"],
  "moduleNameMapper": {
    "^@repo/types$": "<rootDir>/../../packages/types/src/index.ts",
    "^igdb-api-node$": "<rootDir>/test/__mocks__/igdb-api-node.ts"
  }
}
```

**TypeScript for tests:** `apps/api/tsconfig.spec.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "resolvePackageJsonExports": false,
    "esModuleInterop": true
  }
}
```

---

### Common Test Failures & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `SyntaxError: Cannot use import statement outside a module` | ESM package (igdb-api-node) | Use `moduleNameMapper` or `jest.mock()` |
| `429 Too Many Requests` | Rate limiting active | Override `AuthThrottleGuard` |
| `res.body.data is undefined` | beforeAll setup failed | Add error handling, check response |
| `400 Bad Request` on valid data | ValidationPipe not enabled | Add `app.useGlobalPipes(new ValidationPipe())` |
| `409 Conflict` in nested describe | Test data collision | Use unique mock data per describe block |
| `Foreign key constraint violated` | Game not in DB | Mock IgdbService.getById properly |
| `TS5098 resolvePackageJsonExports` | tsconfig conflict | Use dedicated `tsconfig.spec.json` |

---

### Coverage Requirements

**Must have unit tests (aim for 80%+ coverage):**
- `*.service.ts` - all business logic

**Tested via e2e only (excluded from unit coverage):**
- `*.controller.ts` - HTTP layer
- `*.guard.ts` - auth/throttle guards exercised by every protected route
- `*.strategy.ts` - passport config exercised by auth flow
- `prisma.service.ts` - lifecycle hooks, no business logic

**Excluded from coverage (no tests needed):**
- `*.module.ts` - DI configuration only
- `*.dto.ts` - class definitions with decorators
- `*.decorator.ts` - simple metadata attachers
- `main.ts` - bootstrap code
- `generated/**` - auto-generated Prisma client

**Run coverage:** `bun run test:cov`. Thresholds in `package.json` (global: 80% lines/statements/functions, 70% branches); CI runs `test:cov` and fails if below.

**What’s included:** All `*.service.ts` under `src` (app, auth, igdb, users, user-games). **Excluded:** `src/generated/**`, `prisma/prisma.service.ts` (lifecycle only, no business logic). So every service that has business logic is measured.

---

### Testing Checklist

Before submitting test changes:
- [ ] All tests pass locally (`bun run test && bun run test:e2e`)
- [ ] Services have 80%+ line coverage
- [ ] Each describe block uses unique test data
- [ ] ESM packages are mocked (igdb-api-node)
- [ ] Rate limiting is disabled for e2e
- [ ] ValidationPipe is enabled for e2e
- [ ] beforeAll has error handling for setup failures
- [ ] afterAll cleans up test data

## Database Management

### Prisma Workflow

1. **Schema changes:** Edit `prisma/schema.prisma`
2. **Generate migration:** `npm run db:migrate` (interactive)
3. **Sync to dev:** `npx prisma db push` (for rapid iteration)
4. **Inspect DB:** `npx prisma studio`
5. **Seed data:** Create `prisma/seed.ts` and run `npx prisma db seed`

### Prisma Best Practices

- Use `select` or `omit` to exclude sensitive fields (passwords, tokens):
  ```typescript
  const user = await this.prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, createdAt: true },
  });
  ```
- Eager-load relations needed for response:
  ```typescript
  const game = await this.prisma.game.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });
  ```
- Use transactions for multi-step operations:
  ```typescript
  await this.prisma.$transaction(async (tx) => {
    await tx.user.update(...);
    await tx.userGame.create(...);
  });
  ```

### Schema Design Rules

- Use UUID for IDs (not serial integers) - prevents enumeration attacks
- Always include `createdAt` and `updatedAt` timestamps
- Add meaningful indexes on frequently queried fields
- Use enums for status/rating fields
- Cascade rules: think carefully about deletes (use ON DELETE CASCADE for relationships)

## API Endpoints

### Auth Endpoints

- **POST /api/auth/register** – Body: email, password. Creates user and session; returns `{ data: { user, accessToken } }`. Public.
- **POST /api/auth/login** – Body: email, password. Creates session; returns `{ data: { user, accessToken } }`. Public.
- **POST /api/auth/logout** – Revokes current session (token invalid after). Protected. Returns 204.
- **POST /api/auth/logout?all=true** – Revokes all sessions for the user. Protected. Returns 204.

### User Games Endpoints

**Base path:** `/user-games` (all endpoints require JWT authentication)

#### Create User Game

```
POST /user-games
Authorization: Bearer <token>
Content-Type: application/json

Request body:
{
  "igdbId": 109962,
  "status": "todo"    // optional, defaults to "todo"
}

Response: 201 Created
{
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "gameId": "game-uuid",
    "status": "todo",
    "game": {
      "id": "game-uuid",
      "igdbId": 109962,
      "name": "Elden Ring",
      "coverUrl": "https://...",
      "releaseYear": 2022
    },
    "createdAt": "2026-03-14T10:00:00Z",
    "updatedAt": "2026-03-14T10:00:00Z"
  }
}

Error cases:
- 400: Invalid IGDB ID or status
- 404: Game not found in IGDB
- 409: User already has this game in collection
```

#### List User Games

```
GET /user-games?page=1&limit=20&status=playing
Authorization: Bearer <token>

Query parameters:
- page: number (default: 1)
- limit: number (default: 20)
- status: GameStatus (optional filter by status: todo, playing, completed, dropped)

Response: 200 OK
{
  "data": [
    { /* UserGame object */ },
    { /* UserGame object */ }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

#### Get Single User Game

```
GET /user-games/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "data": { /* UserGame object */ }
}

Error cases:
- 404: UserGame not found
- 403: User does not own this game record
```

#### Update Game Status

```
PATCH /user-games/:id
Authorization: Bearer <token>
Content-Type: application/json

Request body:
{
  "status": "completed"
}

Valid status values: "todo", "playing", "completed", "dropped"

Response: 200 OK
{
  "data": {
    "id": "uuid",
    "status": "completed",
    "game": { /* game data */ },
    "updatedAt": "2026-03-14T10:30:00Z",
    ...
  }
}

Error cases:
- 400: Invalid or missing status
- 404: UserGame not found
- 403: User does not own this game record
```

#### Delete User Game

```
DELETE /user-games/:id
Authorization: Bearer <token>

Response: 204 No Content
(empty body, confirms deletion)

Error cases:
- 404: UserGame not found
- 403: User does not own this game record
```

---

## DTOs & Validation

### DTO Rules

- Every `@Body()`, `@Query()`, `@Param()` needs a DTO class
- Use class-validator decorators for all validations
- Transform/normalize input via class-transformer:
  ```typescript
  import { Type, Transform } from 'class-transformer';
  import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

  export class CreateUserDto {
    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;
  }
  ```
- Separate DTO for create/update operations if fields differ

### Common Validators

- `@IsNotEmpty()`, `@IsOptional()` - presence
- `@IsString()`, `@IsNumber()`, `@IsEmail()` - types
- `@MinLength()`, `@MaxLength()`, `@Min()`, `@Max()` - sizes
- `@Matches(/regex/)` - custom patterns
- `@IsEnum(MyEnum)` - enum validation
- `@Validate(CustomValidator)` - custom logic

## Error Handling

### Exception Strategy

Use NestJS built-in exceptions:

```typescript
import {
  BadRequestException,     // 400 - validation failed
  UnauthorizedException,   // 401 - auth failed
  ForbiddenException,      // 403 - authorized but forbidden
  NotFoundException,        // 404 - resource not found
  ConflictException,       // 409 - duplicate/conflict
  InternalServerErrorException, // 500
} from '@nestjs/common';

// Throw with descriptive message
throw new NotFoundException(`User with id ${id} not found`);
throw new ConflictException('Email already registered');
```

### Error Logging

- Log errors with context: who, what, when, why
- Include user ID, resource ID, and request info
- Never log passwords, tokens, or sensitive data:
  ```typescript
  this.logger.error(`Failed to create user for ${email}`, error);
  ```

## Performance Optimization

### Database Queries

- Use `select`/`omit` to fetch only needed fields
- Use pagination for list endpoints:
  ```typescript
  @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
  @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ```
- Avoid N+1 queries - use `include` or relations
- Index frequently filtered/sorted columns

### Response Times

- Target < 200ms for most endpoints
- Profile with: `npm run start:debug` + Chrome DevTools
- Cache static data (game lists, IGDB data) if frequently accessed
- Consider Redis for session/token caching if needed

### Async Operations

- Use async/await (not `.then()` chains)
- Don't await unnecessarily (fire-and-forget logging, notifications)
- Use `Promise.all()` for parallel operations

## Module Structure Checklist

When creating a new module:

```typescript
// 1. Create feature.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}

// 2. Create feature.service.ts with business logic
// 3. Create feature.controller.ts with routes
// 4. Create dto/ folder with validation DTOs
// 5. Create feature.spec.ts for unit tests
// 6. Import FeatureModule into app.module.ts
```

## Common Pitfalls to Avoid

1. **Don't skip validation** - always validate DTOs, even internal calls
2. **Don't expose passwordHash** - always use `select`/`omit`
3. **Don't use default JWT secret in production** - requires `JWT_SECRET` env var
4. **Don't catch all errors silently** - log and throw appropriate exceptions
5. **Don't query without pagination** - large result sets cause memory/performance issues
6. **Don't use `any` type** - breaks type safety
7. **Don't mutate request objects** - treat as immutable
8. **Don't forget about authorization** - validate user can access resource
9. **Don't use raw SQL** - use Prisma methods
10. **Don't commit `.env.local`** - use `.env.example` for templates

## Development Workflow

### Starting Development

```bash
# Install dependencies (using bun)
bun install

# Generate Prisma client
bunx prisma generate

# Run migrations
bun run db:migrate

# Start dev server with hot reload
bun run start:dev
```

### Before Committing

```bash
# Format code
bun run format

# Lint and fix issues
bun run lint:fix

# Run tests
bun test

# Build to check for compile errors
bun run build
```

### Building for Production

```bash
npm run build          # Outputs to dist/
npm run start:prod     # Runs compiled version
```

## Debugging Tips

- Use `--debug` flag: `bun run start:debug`
- Add breakpoints in Chrome DevTools at `chrome://inspect`
- Log with `this.logger.log()`/`.error()` from `@nestjs/common`
- Use `bun run test:debug` for test debugging
- Check `bunx prisma studio` to inspect database state

## Resources & References

- NestJS Docs: https://docs.nestjs.com
- Prisma Docs: https://www.prisma.io/docs
- Passport.js: http://www.passportjs.org
- OWASP Top 10: https://owasp.org/www-project-top-ten
- PostgreSQL Best Practices: https://wiki.postgresql.org/wiki/Performance_Optimization
