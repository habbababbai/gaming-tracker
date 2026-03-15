import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthThrottleGuard } from '../src/auth/throttle.guard';

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
    })
      .overrideGuard(AuthThrottleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.userGame.deleteMany();
    await prisma.game.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.userGame.deleteMany();
    await prisma.game.deleteMany();
    await prisma.session.deleteMany();
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
          expect(res.body.data.user.email).toBe(testUser.email);
          expect(res.body.data.user).not.toHaveProperty('passwordHash');
        });
    });

    it('should return 409 Conflict for duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'duplicate@example.com', password: 'Password123' })
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'duplicate@example.com', password: 'Password456' })
        .expect(409);
    });

    it('should return 400 Bad Request for invalid password format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'weak@example.com', password: 'weak' })
        .expect(400);
    });

    it('should return 400 Bad Request for missing uppercase in password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'noupper@example.com', password: 'password123' })
        .expect(400);
    });

    it('should return 400 Bad Request for missing lowercase in password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'nolower@example.com', password: 'PASSWORD123' })
        .expect(400);
    });

    it('should return 400 Bad Request for missing number in password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'nonumber@example.com', password: 'PasswordTest' })
        .expect(400);
    });

    it('should return 400 Bad Request for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalid-email', password: 'Password123' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'login@example.com', password: 'Password123' });
    });

    it('should login with valid credentials and return token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@example.com', password: 'Password123' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data.user).not.toHaveProperty('passwordHash');
        });
    });

    it('should return 401 Unauthorized for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'Password123' })
        .expect(401);
    });

    it('should return 401 Unauthorized for wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@example.com', password: 'WrongPassword123' })
        .expect(401);
    });
  });

  describe('Protected endpoints with JWT', () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'protected@example.com', password: 'Password123' });
      authToken = res.body.data.accessToken;
      userId = res.body.data.user.id;
    });

    it('should access GET /users/me with valid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
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
  });

  describe('POST /auth/logout', () => {
    it('should return 204 and invalidate current token', async () => {
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'logout-one@example.com', password: 'Password123' });
      const token = registerRes.body.data.accessToken;
      if (!token) throw new Error('Setup failed: no token');

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });

  describe('POST /auth/logout?all=true', () => {
    it('should invalidate all sessions for user', async () => {
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'logout-all@example.com', password: 'Password123' });
      const token1 = registerRes.body.data.accessToken;
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'logout-all@example.com', password: 'Password123' });
      const token2 = loginRes.body.data.accessToken;
      if (!token1 || !token2) throw new Error('Setup failed: no tokens');

      await request(app.getHttpServer())
        .post('/auth/logout?all=true')
        .set('Authorization', `Bearer ${token1}`)
        .expect(204);

      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token1}`)
        .expect(401);

      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token2}`)
        .expect(401);
    });
  });
});
