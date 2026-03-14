import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const testUser = {
    email: 'test@example.com',
    password: 'Password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up database before tests
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

  describe('POST /auth/register', () => {
    it('should register a user and return user data with token', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data.user).toHaveProperty('id');
          expect(res.body.data.user).toHaveProperty('email');
          expect(res.body.data.user).toHaveProperty('createdAt');
          expect(res.body.data.user.email).toBe(testUser.email);
          expect(res.body.data.user).not.toHaveProperty('passwordHash');
          expect(typeof res.body.data.accessToken).toBe('string');
          expect(res.body.data.accessToken.length).toBeGreaterThan(0);
        });
    });

    it('should return 409 Conflict for duplicate email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123',
        })
        .expect(201);

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password456',
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('Email already registered');
        });
    });

    it('should return 400 Bad Request for invalid password format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'weak@example.com',
          password: 'weak', // Too short, missing uppercase, lowercase, number
        })
        .expect(400);
    });

    it('should return 400 Bad Request for missing uppercase in password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'noupper@example.com',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 Bad Request for missing lowercase in password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'nolower@example.com',
          password: 'PASSWORD123',
        })
        .expect(400);
    });

    it('should return 400 Bad Request for missing number in password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'nonumber@example.com',
          password: 'PasswordTest',
        })
        .expect(400);
    });

    it('should return 400 Bad Request for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      // Create a test user for login tests
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'login@example.com',
        password: 'Password123',
      });
    });

    it('should login with valid credentials and return token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data.user.email).toBe('login@example.com');
          expect(res.body.data.user).not.toHaveProperty('passwordHash');
        });
    });

    it('should return 401 Unauthorized for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should return 401 Unauthorized for wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should return 400 Bad Request for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123',
        })
        .expect(400);
    });
  });

  describe('Protected endpoints with JWT', () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'protected@example.com',
          password: 'Password123',
        });

      authToken = res.body.data.accessToken;
      userId = res.body.data.user.id;
    });

    it('should access GET /users/me with valid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.id).toBe(userId);
          expect(res.body.data.email).toBe('protected@example.com');
        });
    });

    it('should return 401 Unauthorized for GET /users/me without token', () => {
      return request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('should return 401 Unauthorized for GET /users/me with invalid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 Unauthorized for GET /users/me with expired token format', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
        .expect(401);
    });
  });

  describe('Rate limiting on auth endpoints', () => {
    it('should enforce rate limit on register endpoint', async () => {
      const email = `ratelimit-${Date.now()}`;

      // Make 5 requests (should all succeed or be rate limited depending on IP)
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: `${email}-${i}@example.com`,
            password: 'Password123',
          });
      }

      // 6th request should be rate limited (429)
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `${email}-6@example.com`,
          password: 'Password123',
        })
        .expect(429);
    });

    it('should enforce rate limit on login endpoint', async () => {
      // Make 5 login attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer()).post('/auth/login').send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword',
        });
      }

      // 6th request should be rate limited (429)
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword',
        })
        .expect(429);
    });
  });
});
