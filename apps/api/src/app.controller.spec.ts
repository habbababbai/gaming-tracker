import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  const mockPrisma = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('getHealth', () => {
    it('should return status ok and db up when DB responds', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
      await expect(appController.getHealth()).resolves.toEqual({
        status: 'ok',
        db: 'up',
      });
    });

    it('should return status ok and db down when DB fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(
        new Error('connection refused'),
      );
      await expect(appController.getHealth()).resolves.toEqual({
        status: 'ok',
        db: 'down',
      });
    });
  });
});
