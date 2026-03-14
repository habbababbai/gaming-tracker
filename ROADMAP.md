# Gaming Tracker - Project Roadmap

Track your game backlog and collection across web and mobile. Monorepo: NestJS API, Next.js web, Expo mobile.

**Last Updated:** 2026-03-14

---

## 🎯 Overall Project Stages

### Stage 1: Backend Core ✅ IN PROGRESS (70% complete)
Foundation API with user management, authentication, and game collection functionality.

**Completed:**
- ✅ Database schema (User, Game, UserGame models)
- ✅ User registration & login (JWT auth)
- ✅ User profile management (get, delete)
- ✅ Game collection CRUD (add, list, filter, update status, delete)
- ✅ IGDB game search integration
- ✅ Rate limiting on auth endpoints
- ✅ Input validation & error handling
- ✅ Security: bcrypt hashing, CORS, Helmet headers
- ✅ Shared types package (@repo/types)
- ✅ API documentation (CLAUDE.md, API.md, TESTING.md)

**In Progress:**
- 🔄 Unit & E2E tests

**To Do:**
- ⏳ Password reset functionality
- ⏳ Email verification
- ⏳ User profile update endpoint
- ⏳ Admin features (if needed)
- ⏳ Analytics/stats endpoints (optional)

---

### Stage 2: Web Frontend MVP ⏳ NOT STARTED
Web app for users to manage their game collection.

**To Do:**
- ⏳ Setup Next.js project structure
- ⏳ Auth pages (login, register, forgot password)
- ⏳ Protected routes with JWT
- ⏳ Game search & add to collection UI
- ⏳ Game list with pagination & filtering
- ⏳ Game status management (todo → playing → completed → dropped)
- ⏳ User profile page
- ⏳ Responsive design
- ⏳ E2E tests with Cypress/Playwright

---

### Stage 3: Mobile App MVP ⏳ NOT STARTED
Mobile app for iOS/Android using Expo & React Native.

**To Do:**
- ⏳ Setup Expo project structure
- ⏳ Auth flow (login, register, forgot password)
- ⏳ Game search screen
- ⏳ Collection screen with list/grid view
- ⏳ Status change quick actions
- ⏳ User profile screen
- ⏳ Native push notifications (optional)
- ⏳ Offline support (optional)

---

### Stage 4: Polish & Production ⏳ NOT STARTED
Testing, monitoring, deployment, and additional features.

**To Do:**
- ⏳ Performance optimization
- ⏳ Full test coverage (unit, E2E, integration)
- ⏳ Security audit
- ⏳ Database indexing & query optimization
- ⏳ Logging & monitoring setup
- ⏳ Production deployment (API, web, mobile)
- ⏳ CI/CD pipeline
- ⏳ User feedback & analytics

---

## 📋 Quick Status by App

| App | Status | Coverage | Priority |
|-----|--------|----------|----------|
| **API** | 70% | Core features done, tests pending | 🔴 In Progress |
| **Web** | 0% | Not started | 🟡 Next |
| **Mobile** | 0% | Not started | 🟡 Next |
| **Types Package** | 100% | Fully extracted & documented | ✅ Complete |

---

## 🔗 See Detailed Roadmaps

- [API Roadmap](./apps/api/ROADMAP.md) - Backend development plan
- Web Roadmap (to be created)
- Mobile Roadmap (to be created)

---

## 📊 Legend

- ✅ Complete
- 🔄 In Progress
- ⏳ To Do
- 🟢 Ready for next stage
- 🔴 Blocked
- 🟡 Upcoming

---

## 🎬 How to Use This Roadmap

1. **Check current stage** - Look at "Overall Project Stages" to see what's being worked on
2. **Track progress** - Update checkmarks as tasks complete
3. **Plan work** - Use individual app roadmaps to break down next steps
4. **Communicate** - Share stage updates with team
5. **Adjust as needed** - Add/remove items based on feedback and discoveries

---

## 📝 Notes & Decisions

- **Framework Choices:** NestJS (proven, secure), Next.js (React ecosystem), Expo (native mobile)
- **Shared Types:** Framework-agnostic types in @repo/types, validators local to each app
- **MVP Focus:** User auth + game collection management only (no social features yet)
- **Performance:** Pagination on lists, proper indexing on frequently queried fields
- **Security:** JWT tokens, bcrypt hashing, rate limiting, input validation from day one

