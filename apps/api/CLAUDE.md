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

## Security Best Practices

### Authentication & Authorization

1. **JWT Configuration**
   - Secret stored in `JWT_SECRET` environment variable
   - Tokens extracted from `Authorization: Bearer <token>` header
   - Validation includes user existence check (jwt.strategy.ts)
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

- Always use explicit types, avoid `any`
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
- Use JSDoc for public methods in services:
  ```typescript
  /**
   * Find a user by email and validate password.
   * @param email - User email
   * @param password - Plain-text password
   * @returns User with tokens or throws UnauthorizedException
   */
  async login(dto: LoginDto) { ... }
  ```
- No commented-out code in commits - delete it

## Testing Strategy

### Unit Tests

- **Location:** `src/**/*.spec.ts`
- **Coverage target:** Services 80%+, controllers 60%+
- **What to test:**
  - Service methods with different inputs
  - Error cases (invalid input, not found, conflicts)
  - Auth flows (valid/invalid credentials)
  - Data transformations

- **Example:**
  ```typescript
  describe('AuthService.login', () => {
    it('should return user and token for valid credentials', async () => {
      // ... test implementation
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      // ... test implementation
    });
  });
  ```

### E2E Tests

- **Location:** `test/**/*.e2e-spec.ts`
- **Scope:** Test full request→response cycles
- **Command:** `npm run test:e2e`
- **Recommended coverage:** Happy path + main error cases

### Testing Utilities

- Use `@nestjs/testing` for module compilation and dependency injection
- Mock PrismaService in unit tests, use real DB in E2E
- Test data: Create fixtures or seed minimal test data

### Running Tests

```bash
npm test              # Run all unit tests once
npm run test:watch   # Watch mode
npm run test:cov     # Coverage report
npm run test:e2e     # E2E tests
```

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
