import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { IgdbService } from '../src/igdb/igdb.service';

describe('Games (e2e)', () => {
  let app: INestApplication<App>;

  const mockIgdbService = {
    search: jest.fn().mockResolvedValue([
      { id: 1, name: 'Game 1', coverUrl: 'url1', releaseYear: 2021 },
      { id: 2, name: 'Game 2', coverUrl: 'url2', releaseYear: 2022 },
    ]),
    getById: jest.fn().mockImplementation((id: number) => {
      if (id === 1) {
        return Promise.resolve({ id: 1, name: 'Game 1', coverUrl: 'url1', releaseYear: 2021 });
      }
      return Promise.resolve(null);
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(IgdbService)
      .useValue(mockIgdbService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/games/search (GET)', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockIgdbService.search.mockResolvedValue([
        { id: 1, name: 'Game 1', coverUrl: 'url1', releaseYear: 2021 },
        { id: 2, name: 'Game 2', coverUrl: 'url2', releaseYear: 2022 },
      ]);
    });

    it('should return search results with limit and offset', async () => {
      const res = await request(app.getHttpServer())
        .get('/games/search?q=test&limit=5&offset=10')
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta).toEqual({
        limit: 5,
        offset: 10,
        hasMore: false,
      });
      expect(mockIgdbService.search).toHaveBeenCalledWith('test', 6, 10);
    });

    it('should set hasMore when IGDB returns more than limit', async () => {
      mockIgdbService.search.mockResolvedValueOnce(
        Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          name: `Game ${i + 1}`,
          coverUrl: null,
          releaseYear: 2020,
        })),
      );

      const res = await request(app.getHttpServer())
        .get('/games/search?q=test&limit=5&offset=0')
        .expect(200);

      expect(res.body.data).toHaveLength(5);
      expect(res.body.meta).toEqual({
        limit: 5,
        offset: 0,
        hasMore: true,
      });
      expect(mockIgdbService.search).toHaveBeenCalledWith('test', 6, 0);
    });

    it('should return empty data when query is missing', async () => {
      const res = await request(app.getHttpServer())
        .get('/games/search?q=')
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.meta).toEqual({
        limit: 10,
        offset: 0,
        hasMore: false,
      });
      expect(mockIgdbService.search).not.toHaveBeenCalled();
    });
  });

  describe('/games/:id (GET)', () => {
    it('should return game details when found', async () => {
      const res = await request(app.getHttpServer())
        .get('/games/1')
        .expect(200);

      expect(res.body.data.name).toBe('Game 1');
    });

    it('should return 404 when game not found', async () => {
      await request(app.getHttpServer())
        .get('/games/999')
        .expect(404);
    });
  });
});
