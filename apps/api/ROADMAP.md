# API Roadmap

NestJS backend for Gaming Tracker. Provides endpoints for web and mobile apps.

**Status:** 70% Complete | **Last Updated:** 2026-03-14

---

## ✅ Completed Features

### Authentication & Security
- ✅ User registration with email & password
- ✅ User login with JWT token generation
- ✅ JWT strategy & guards (Passport.js)
- ✅ Rate limiting on auth endpoints (5 req / 15 min)
- ✅ Password hashing (bcrypt, SALT_ROUNDS=12)
- ✅ User ownership validation
- ✅ CORS configuration
- ✅ Helmet security headers

### User Management
- ✅ Get user profile (`GET /api/users/me`)
- ✅ Delete user account (`DELETE /api/users/me`)
- ✅ Cascading delete (removes user's games when deleted)

### Game Management
- ✅ Search IGDB for games (`GET /api/games/search?q=...`)
- ✅ Game caching in database (populated when users add games)

### User Game Collection
- ✅ Add game to collection (`POST /api/user-games`)
- ✅ List user's games with pagination (`GET /api/user-games?page=1&limit=20`)
- ✅ Filter games by status (`GET /api/user-games?status=playing`)
- ✅ Get single game (`GET /api/user-games/:id`)
- ✅ Update game status (`PATCH /api/user-games/:id`)
- ✅ Delete game from collection (`DELETE /api/user-games/:id`)
- ✅ Proper authorization (can only access own games)

### Infrastructure & Standards
- ✅ Prisma ORM with PostgreSQL
- ✅ Database schema with proper indexes
- ✅ Input validation with DTOs (class-validator)
- ✅ Error handling with proper HTTP status codes
- ✅ Request/response format standardization
- ✅ Shared types package (@repo/types)
- ✅ AI agent instructions (.agents file)

### Documentation
- ✅ CLAUDE.md (comprehensive dev guide)
- ✅ API.md (quick endpoint reference)
- ✅ TESTING.md (Postman test flows)
- ✅ API endpoint documentation with examples
- ✅ Architecture & security guidelines

---

## 🔄 In Progress

### Testing
- 🔄 Unit tests for services
- 🔄 Unit tests for controllers
- 🔄 E2E tests
- **Target:** 80%+ coverage for services, 60%+ for controllers

---

## ⏳ To Do

### High Priority (Blocking Frontend)
- ⏳ **Password reset functionality**
  - [ ] Add PasswordResetToken model to schema
  - [ ] Create forgot-password endpoint
  - [ ] Create verify-reset-token endpoint
  - [ ] Create reset-password endpoint
  - [ ] Email service integration (SendGrid / Mailgun / SMTP)
  - [ ] Environment variables for email provider
  - Tests for password reset flow

- ⏳ **Email verification (optional but recommended)**
  - [ ] Add emailVerified flag to User model
  - [ ] Create verification token model
  - [ ] Send verification email on registration
  - [ ] Create verify-email endpoint
  - [ ] Optional: Require verified email for login

### Medium Priority (Nice to Have)
- ⏳ **User profile update**
  - [ ] Update email endpoint
  - [ ] Update preferences/settings endpoint
  - [ ] Change password endpoint (for authenticated users)

- ⏳ **User stats & analytics**
  - [ ] Count stats endpoint (games played, completed, etc.)
  - [ ] Time spent tracking (if adding timestamps)

- ⏳ **Admin features**
  - [ ] Admin role/permission system
  - [ ] User management for admins
  - [ ] Site statistics endpoint

- ⏳ **Performance optimization**
  - [ ] Add caching (Redis) for IGDB data
  - [ ] Batch operations for bulk game updates
  - [ ] Query optimization for large collections

- ⏳ **Additional features**
  - [ ] Game reviews/ratings system
  - [ ] User recommendations based on collection
  - [ ] Wishlist functionality
  - [ ] Playtime tracking

### Low Priority (Future)
- ⏳ Social features (friends, sharing collections, etc.)
- ⏳ Advanced filtering & sorting options
- ⏳ Webhook notifications
- ⏳ GraphQL API (alternative to REST)

---

## 🏗️ Technical Debt & Improvements

- ⏳ Add more comprehensive unit tests
- ⏳ Add E2E test suite
- ⏳ Setup CI/CD pipeline (GitHub Actions)
- ⏳ Add API versioning (v1, v2, etc.)
- ⏳ Setup logging system (Winston / Pino)
- ⏳ Add request tracing
- ⏳ Database backup strategy
- ⏳ Performance monitoring
- ⏳ Refactor email service to be pluggable

---

## 📦 Database Schema

### Current Models
- **User** - id, email, passwordHash, createdAt
- **Game** - id, name, igdbId, coverUrl, releaseYear, createdAt
- **UserGame** - id, userId, gameId, status, createdAt, updatedAt

### Models to Add (for features above)
- **PasswordResetToken** - id, userId, tokenHash, expiresAt, createdAt
- **EmailVerificationToken** - id, userId, tokenHash, expiresAt, createdAt (optional)
- **UserPreferences** - id, userId, settings_json, updatedAt (optional)
- **UserStats** - id, userId, gamesPlayed, gamesCompleted, totalHours, updatedAt (optional)

---

## 🔐 Security Checklist

### Completed
- ✅ Input validation on all endpoints
- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ User ownership checks
- ✅ Rate limiting on auth endpoints
- ✅ No sensitive data in responses (select/omit)
- ✅ CORS configured
- ✅ SQL injection prevention (Prisma ORM)
- ✅ HTTPS ready (Helmet headers)

### To Do
- ⏳ Security audit by third party
- ⏳ Rate limiting on other endpoints
- ⏳ Request size limits
- ⏳ DDoS protection strategy
- ⏳ Audit logging for sensitive operations
- ⏳ GDPR compliance (data export, deletion)

---

## 🚀 Deployment Readiness

### Current Status: Ready for Development/Staging

**Ready:**
- ✅ Environment variables properly configured
- ✅ Database migrations setup
- ✅ Security best practices implemented
- ✅ Error handling in place

**Before Production:**
- ⏳ All tests passing (unit & E2E)
- ⏳ Performance tested & optimized
- ⏳ Security audit completed
- ⏳ Logging & monitoring setup
- ⏳ Backup & recovery plan
- ⏳ Load testing
- ⏳ Documentation complete

---

## 📊 Progress Tracker

```
Authentication & User Management:  ████████████████████ 100% ✅
Game Collection (CRUD):            ████████████████████ 100% ✅
IGDB Integration:                  ████████████████████ 100% ✅
Rate Limiting & Security:          ████████████████████ 100% ✅
Documentation:                     ████████████████████ 100% ✅
Testing:                           ███████░░░░░░░░░░░░░  35% 🔄
Password Reset:                    ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Email Integration:                 ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Admin Features:                    ░░░░░░░░░░░░░░░░░░░░   0% ⏳

Overall API Progress:              ███████████████░░░░░  70% 🔄
```

---

## 📝 Next Steps

### Immediate (This Sprint)
1. Complete unit tests for all services
2. Add E2E tests for critical user flows
3. Verify all endpoints work as documented

### Next Sprint
1. Implement password reset feature
2. Add email service integration
3. Optional: Add email verification

### Following Sprint
1. Start frontend (Next.js web app)
2. Frontend integration tests with API

---

## 📞 Support & Questions

- Dev Guide: See [CLAUDE.md](./CLAUDE.md)
- Quick Reference: See [API.md](./API.md)
- Testing: See [TESTING.md](./TESTING.md)
- Architecture: See [README.md](./README.md)

