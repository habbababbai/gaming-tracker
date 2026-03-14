import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { IgdbService } from './igdb.service';

jest.mock('igdb-api-node', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    fields: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    search: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    request: jest.fn(),
  })),
}));

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
  });
});
