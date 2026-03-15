import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GameStatus } from '@repo/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { IgdbService } from '../src/igdb/igdb.service';
import { AuthThrottleGuard } from '../src/auth/throttle.guard';

describe('UserGames (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let authToken1: string;
  let authToken2: string;
  let userId1: string;

  const mockIgdbGame = {
    id: 109962,
    name: 'Elden Ring',
    coverUrl: 'https://images.igdb.com/test.png',
    releaseYear: 2022,
  };
  const mockIgdbGame2 = {
    id: 7346,
    name: 'Zelda',
    coverUrl: 'https://images.igdb.com/test2.png',
    releaseYear: 1998,
  };
  const mockIgdbGame3 = {
    id: 1942,
    name: 'Witcher 3',
    coverUrl: 'https://images.igdb.com/test3.png',
    releaseYear: 2015,
  };
  const mockIgdbGame4 = {
    id: 1020,
    name: 'GTA V',
    coverUrl: 'https://images.igdb.com/test4.png',
    releaseYear: 2013,
  };
  const mockIgdbGame5 = {
    id: 2155,
    name: 'Dark Souls',
    coverUrl: 'https://images.igdb.com/test5.png',
    releaseYear: 2011,
  };

  const mockIgdbService = {
    getById: async (id: number) => {
      const games = [
        mockIgdbGame,
        mockIgdbGame2,
        mockIgdbGame3,
        mockIgdbGame4,
        mockIgdbGame5,
      ];
      return games.find((g) => g.id === id) ?? null;
    },
    search: async () => [],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthThrottleGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(IgdbService)
      .useValue(mockIgdbService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.userGame.deleteMany();
    await prisma.game.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    const res1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user1@example.com', password: 'Password123' });
    authToken1 = res1.body.data.accessToken;
    userId1 = res1.body.data.user.id;

    const res2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user2@example.com', password: 'Password456' });
    authToken2 = res2.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.userGame.deleteMany();
    await prisma.game.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /user-games', () => {
    it('should create a game in user collection', () => {
      return request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ igdbId: mockIgdbGame.id, status: GameStatus.TODO })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.userId).toBe(userId1);
          expect(res.body.data.status).toBe(GameStatus.TODO);
          expect(res.body.data.game.igdbId).toBe(mockIgdbGame.id);
        });
    });

    it('should set default status to todo when not provided', () => {
      return request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ igdbId: mockIgdbGame2.id })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.status).toBe(GameStatus.TODO);
        });
    });

    it('should return 409 Conflict for duplicate game in collection', async () => {
      await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({ igdbId: mockIgdbGame.id, status: GameStatus.PLAYING })
        .expect(201);

      return request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({ igdbId: mockIgdbGame.id, status: GameStatus.TODO })
        .expect(409);
    });

    it('should return 400 Bad Request for invalid igdbId', () => {
      return request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ igdbId: 'not-a-number' })
        .expect(400);
    });

    it('should return 401 Unauthorized without token', () => {
      return request(app.getHttpServer())
        .post('/user-games')
        .send({ igdbId: mockIgdbGame.id })
        .expect(401);
    });

    it('should return 404 when game not found in IGDB', () => {
      return request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ igdbId: 999999 })
        .expect(404);
    });
  });

  describe('GET /user-games', () => {
    it('should list all user games with pagination metadata', () => {
      return request(app.getHttpServer())
        .get('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return 401 Unauthorized without token', () => {
      return request(app.getHttpServer()).get('/user-games').expect(401);
    });
  });

  describe('GET /user-games/:id', () => {
    it('should return single game with full details', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ igdbId: mockIgdbGame5.id, status: GameStatus.DROPPED })
        .expect(201);

      const id = createRes.body.data.id;

      await request(app.getHttpServer())
        .get(`/user-games/${id}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(id);
          expect(res.body.data).toHaveProperty('game');
        });
    });

    it('should return 403 Forbidden when user does not own game', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      const id = listRes.body.data[0]?.id;
      if (!id) throw new Error('No user game found');

      await request(app.getHttpServer())
        .get(`/user-games/${id}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(403);
    });

    it('should return 404 Not Found for non-existent game', () => {
      return request(app.getHttpServer())
        .get('/user-games/clxxxxxxxxxxxxxxxxxxxxxxxxx')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(404);
    });

    it('should return 401 Unauthorized without token', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      const id = listRes.body.data[0]?.id;
      if (!id) return;

      await request(app.getHttpServer()).get(`/user-games/${id}`).expect(401);
    });
  });

  describe('PATCH /user-games/:id', () => {
    it('should update game status', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ igdbId: mockIgdbGame3.id, status: GameStatus.TODO })
        .expect(201);

      const id = createRes.body.data.id;

      await request(app.getHttpServer())
        .patch(`/user-games/${id}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ status: GameStatus.PLAYING })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.status).toBe(GameStatus.PLAYING);
        });
    });

    it('should return 403 Forbidden when user does not own game', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      const id = listRes.body.data[0]?.id;
      if (!id) throw new Error('No user game found');

      await request(app.getHttpServer())
        .patch(`/user-games/${id}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({ status: GameStatus.COMPLETED })
        .expect(403);
    });

    it('should return 400 Bad Request for invalid status', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      const id = listRes.body.data[0]?.id;
      if (!id) throw new Error('No user game found');

      await request(app.getHttpServer())
        .patch(`/user-games/${id}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ status: 'invalid-status' })
        .expect(400);
    });

    it('should return 401 Unauthorized without token', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      const id = listRes.body.data[0]?.id;
      if (!id) return;

      await request(app.getHttpServer())
        .patch(`/user-games/${id}`)
        .send({ status: GameStatus.COMPLETED })
        .expect(401);
    });
  });

  describe('DELETE /user-games/:id', () => {
    it('should delete game and return 204 No Content', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ igdbId: mockIgdbGame4.id, status: GameStatus.TODO })
        .expect(201);

      const id = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/user-games/${id}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(204);
    });

    it('should return 404 Not Found for already deleted game', async () => {
      await request(app.getHttpServer())
        .delete('/user-games/clxxxxxxxxxxxxxxxxxxxxxxxxx')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(404);
    });

    it('should return 401 Unauthorized without token', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      const id = listRes.body.data[0]?.id;
      if (!id) return;

      await request(app.getHttpServer())
        .delete(`/user-games/${id}`)
        .expect(401);
    });
  });
});
