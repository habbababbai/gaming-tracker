import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GameStatus } from '@repo/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { IgdbService } from '../src/igdb/igdb.service';

describe('UserGames (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let igdbService: IgdbService;

  let authToken1: string;
  let authToken2: string;
  let userId1: string;

  const mockIgdbGame = {
    id: 109962,
    name: 'Elden Ring',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/test.png',
    releaseYear: 2022,
  };

  const mockIgdbGame2 = {
    id: 7346,
    name: 'The Legend of Zelda: Ocarina of Time',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/test2.png',
    releaseYear: 1998,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    igdbService = moduleFixture.get<IgdbService>(IgdbService);

    // Clean up database before tests
    await prisma.userGame.deleteMany();
    await prisma.game.deleteMany();
    await prisma.user.deleteMany();

    // Create two test users
    const res1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user1@example.com',
        password: 'Password123',
      });
    authToken1 = res1.body.data.accessToken;
    userId1 = res1.body.data.user.id;

    const res2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user2@example.com',
        password: 'Password456',
      });
    authToken2 = res2.body.data.accessToken;

    // Mock IGDB service to return game data
    jest.spyOn(igdbService, 'getById').mockImplementation(async (id) => {
      if (id === mockIgdbGame.id) return mockIgdbGame;
      if (id === mockIgdbGame2.id) return mockIgdbGame2;
      return null;
    });
  });

  afterEach(async () => {
    // Re-apply IGDB mock after any resets
    jest.spyOn(igdbService, 'getById').mockImplementation(async (id) => {
      if (id === mockIgdbGame.id) return mockIgdbGame;
      if (id === mockIgdbGame2.id) return mockIgdbGame2;
      return null;
    });
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.userGame.deleteMany();
    await prisma.game.deleteMany();
    await prisma.user.deleteMany();

    await app.close();
  });

  describe('POST /user-games', () => {
    it('should create a game in user collection', () => {
      return request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          igdbId: mockIgdbGame.id,
          status: GameStatus.TODO,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('userId');
          expect(res.body.data).toHaveProperty('gameId');
          expect(res.body.data).toHaveProperty('status');
          expect(res.body.data).toHaveProperty('game');
          expect(res.body.data.userId).toBe(userId1);
          expect(res.body.data.status).toBe(GameStatus.TODO);
          expect(res.body.data.game.igdbId).toBe(mockIgdbGame.id);
        });
    });

    it('should set default status to todo when not provided', () => {
      return request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          igdbId: mockIgdbGame2.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.status).toBe(GameStatus.TODO);
        });
    });

    it('should return 409 Conflict for duplicate game in collection', async () => {
      // Add game first time
      await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          igdbId: mockIgdbGame.id,
          status: GameStatus.PLAYING,
        })
        .expect(201);

      // Try to add same game again
      return request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          igdbId: mockIgdbGame.id,
          status: GameStatus.TODO,
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already has this game');
        });
    });

    it('should return 400 Bad Request for invalid igdbId', () => {
      return request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          igdbId: 'not-a-number',
        })
        .expect(400);
    });

    it('should return 401 Unauthorized without token', () => {
      return request(app.getHttpServer())
        .post('/user-games')
        .send({
          igdbId: mockIgdbGame.id,
        })
        .expect(401);
    });

    it('should return 404 when game not found in IGDB', () => {
      return request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          igdbId: 999999,
        })
        .expect(404);
    });
  });

  describe('GET /user-games', () => {
    beforeAll(async () => {
      // Create some games for user1 with different statuses
      await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          igdbId: mockIgdbGame.id,
          status: GameStatus.PLAYING,
        });

      await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          igdbId: mockIgdbGame2.id,
          status: GameStatus.COMPLETED,
        });
    });

    it('should list all user games with pagination metadata', () => {
      return request(app.getHttpServer())
        .get('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should respect pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/user-games?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(10);
        });
    });

    it('should filter games by status', () => {
      return request(app.getHttpServer())
        .get(`/user-games?status=${GameStatus.PLAYING}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          res.body.data.forEach((game: { status: string }) => {
            expect(game.status).toBe(GameStatus.PLAYING);
          });
        });
    });

    it('should only return games for authenticated user', async () => {
      const user1Games = await request(app.getHttpServer())
        .get('/user-games')
        .set('Authorization', `Bearer ${authToken1}`);

      const user2Games = await request(app.getHttpServer())
        .get('/user-games')
        .set('Authorization', `Bearer ${authToken2}`);

      // User2 should have fewer games
      expect(user2Games.body.data.length).toBeLessThan(
        user1Games.body.data.length,
      );
    });

    it('should return 401 Unauthorized without token', () => {
      return request(app.getHttpServer()).get('/user-games').expect(401);
    });
  });

  describe('GET /user-games/:id', () => {
    let userGameId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          igdbId: mockIgdbGame.id,
          status: GameStatus.DROPPED,
        });
      userGameId = res.body.data.id;
    });

    it('should return single game with full details', () => {
      return request(app.getHttpServer())
        .get(`/user-games/${userGameId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.id).toBe(userGameId);
          expect(res.body.data).toHaveProperty('game');
          expect(res.body.data.game).toHaveProperty('name');
        });
    });

    it('should return 403 Forbidden when user does not own game', () => {
      return request(app.getHttpServer())
        .get(`/user-games/${userGameId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(403);
    });

    it('should return 404 Not Found for non-existent game', () => {
      return request(app.getHttpServer())
        .get('/user-games/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(404);
    });

    it('should return 401 Unauthorized without token', () => {
      return request(app.getHttpServer())
        .get(`/user-games/${userGameId}`)
        .expect(401);
    });

    it('should return 400 Bad Request for invalid UUID', () => {
      return request(app.getHttpServer())
        .get('/user-games/invalid-uuid')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(400);
    });
  });

  describe('PATCH /user-games/:id', () => {
    let userGameId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          igdbId: mockIgdbGame2.id,
          status: GameStatus.TODO,
        });
      userGameId = res.body.data.id;
    });

    it('should update game status', () => {
      return request(app.getHttpServer())
        .patch(`/user-games/${userGameId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          status: GameStatus.PLAYING,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.status).toBe(GameStatus.PLAYING);
        });
    });

    it('should allow all valid status values', async () => {
      for (const status of Object.values(GameStatus)) {
        await request(app.getHttpServer())
          .patch(`/user-games/${userGameId}`)
          .set('Authorization', `Bearer ${authToken1}`)
          .send({ status })
          .expect(200);
      }
    });

    it('should return 403 Forbidden when user does not own game', () => {
      return request(app.getHttpServer())
        .patch(`/user-games/${userGameId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          status: GameStatus.COMPLETED,
        })
        .expect(403);
    });

    it('should return 400 Bad Request for invalid status', () => {
      return request(app.getHttpServer())
        .patch(`/user-games/${userGameId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          status: 'invalid-status',
        })
        .expect(400);
    });

    it('should return 401 Unauthorized without token', () => {
      return request(app.getHttpServer())
        .patch(`/user-games/${userGameId}`)
        .send({
          status: GameStatus.COMPLETED,
        })
        .expect(401);
    });
  });

  describe('DELETE /user-games/:id', () => {
    let userGameId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          igdbId: mockIgdbGame.id,
          status: GameStatus.TODO,
        });
      userGameId = res.body.data.id;
    });

    it('should delete game and return 204 No Content', () => {
      return request(app.getHttpServer())
        .delete(`/user-games/${userGameId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(204);
    });

    it('should return 403 Forbidden when user does not own game', async () => {
      const res = await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          igdbId: mockIgdbGame2.id,
          status: GameStatus.TODO,
        });

      return request(app.getHttpServer())
        .delete(`/user-games/${res.body.data.id}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(403);
    });

    it('should return 404 Not Found for already deleted game', () => {
      return request(app.getHttpServer())
        .delete(`/user-games/${userGameId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(404);
    });

    it('should return 401 Unauthorized without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/user-games')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          igdbId: mockIgdbGame.id,
          status: GameStatus.TODO,
        });

      return request(app.getHttpServer())
        .delete(`/user-games/${res.body.data.id}`)
        .expect(401);
    });
  });
});
