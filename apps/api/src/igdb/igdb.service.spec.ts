import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { IgdbService } from './igdb.service';

const mockRequest = jest.fn();
jest.mock('igdb-api-node', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    fields: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    search: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    request: mockRequest,
  })),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('IgdbService', () => {
  let service: IgdbService;

  beforeEach(async () => {
    process.env['IGDB_CLIENT_ID'] = 'test-client-id';
    process.env['IGDB_CLIENT_SECRET'] = 'test-client-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [IgdbService],
    }).compile();

    service = module.get<IgdbService>(IgdbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env['IGDB_CLIENT_ID'];
    delete process.env['IGDB_CLIENT_SECRET'];
  });

  describe('mapGame', () => {
    it('should map IGDB raw data to IgdbGame format', () => {
      const mapGame = Reflect.get(service, 'mapGame').bind(service) as (
        raw: object,
      ) => {
        id: number;
        name: string;
        coverUrl: string | null;
        releaseYear: number | null;
      };
      const result = mapGame({
        id: 109962,
        name: 'Elden Ring',
        cover: { image_id: 'co4jni' },
        first_release_date: 1645747200,
      });

      expect(result).toEqual({
        id: 109962,
        name: 'Elden Ring',
        coverUrl:
          'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.png',
        releaseYear: 2022,
      });
    });

    it('should handle missing cover image', () => {
      const mapGame = Reflect.get(service, 'mapGame').bind(service) as (
        raw: object,
      ) => { coverUrl: string | null };
      const result = mapGame({
        id: 1,
        name: 'Test',
        first_release_date: 1645747200,
      });

      expect(result.coverUrl).toBeNull();
    });

    it('should handle missing release date', () => {
      const mapGame = Reflect.get(service, 'mapGame').bind(service) as (
        raw: object,
      ) => { releaseYear: number | null };
      const result = mapGame({
        id: 1,
        name: 'Test',
        cover: { image_id: 'abc' },
      });

      expect(result.releaseYear).toBeNull();
    });
  });

  describe('getClient', () => {
    it('should throw ServiceUnavailableException when client id missing', async () => {
      delete process.env['IGDB_CLIENT_ID'];
      const getClient = Reflect.get(service, 'getClient').bind(
        service,
      ) as () => Promise<unknown>;

      await expect(getClient()).rejects.toThrow(ServiceUnavailableException);
    });

    it('should throw when client secret missing', async () => {
      delete process.env['IGDB_CLIENT_SECRET'];
      const getClient = Reflect.get(service, 'getClient').bind(
        service,
      ) as () => Promise<unknown>;

      await expect(getClient()).rejects.toThrow(ServiceUnavailableException);
    });

    it('should throw when auth fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      const getClient = Reflect.get(service, 'getClient').bind(
        service,
      ) as () => Promise<unknown>;

      await expect(getClient()).rejects.toThrow(ServiceUnavailableException);
    });

    it('should authenticate and return client', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: 'token', expires_in: 3600 }),
      });
      const getClient = Reflect.get(service, 'getClient').bind(
        service,
      ) as () => Promise<unknown>;

      const client = await getClient();
      expect(client).toBeDefined();
    });
  });

  describe('search', () => {
    it('should search games and return mapped results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: 'token', expires_in: 3600 }),
      });
      mockRequest.mockResolvedValueOnce({
        data: [
          {
            id: 1,
            name: 'Test Game',
            cover: { image_id: 'abc' },
            first_release_date: 1645747200,
          },
        ],
      });

      const results = await service.search('test');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Test Game');
    });
  });

  describe('getById', () => {
    it('should return game by id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: 'token', expires_in: 3600 }),
      });
      mockRequest.mockResolvedValueOnce({
        data: [{ id: 123, name: 'Found Game' }],
      });

      const result = await service.getById(123);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Found Game');
    });

    it('should return null when game not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: 'token', expires_in: 3600 }),
      });
      mockRequest.mockResolvedValueOnce({ data: [] });

      const result = await service.getById(999999);
      expect(result).toBeNull();
    });
  });
});
