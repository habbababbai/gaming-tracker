import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GameStatus } from '@repo/types';
import { UserGamesService } from './user-games.service';
import { PrismaService } from '../prisma/prisma.service';
import { IgdbService } from '../igdb/igdb.service';
import { CreateUserGameDto } from './dto/create-user-game.dto';
import { UpdateUserGameDto } from './dto/update-user-game.dto';

jest.mock('igdb-api-node', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('UserGamesService', () => {
  let service: UserGamesService;
  let prismaService: PrismaService;
  let igdbService: IgdbService;

  const mockIgdbGame = {
    id: 109962,
    name: 'Elden Ring',
    coverUrl: 'https://example.com/cover.png',
    releaseYear: 2022,
  };

  const mockDbGame = {
    id: 'game-123',
    igdbId: 109962,
    name: 'Elden Ring',
    coverUrl: 'https://example.com/cover.png',
    releaseYear: 2022,
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    createdAt: new Date('2026-03-14'),
  };

  const mockUserGame = {
    id: 'user-game-123',
    userId: mockUser.id,
    gameId: mockDbGame.id,
    status: GameStatus.TODO,
    game: mockDbGame,
    createdAt: new Date('2026-03-14'),
    updatedAt: new Date('2026-03-14'),
  };

  beforeEach(async () => {
    const mockPrismaUserGame = {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockPrismaGame = {
      upsert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGamesService,
        {
          provide: PrismaService,
          useValue: {
            game: mockPrismaGame,
            userGame: mockPrismaUserGame,
          },
        },
        {
          provide: IgdbService,
          useValue: {
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserGamesService>(UserGamesService);
    prismaService = module.get<PrismaService>(PrismaService);
    igdbService = module.get<IgdbService>(IgdbService);
  });

  describe('create', () => {
    const createDto: CreateUserGameDto = {
      igdbId: mockIgdbGame.id,
      status: GameStatus.TODO,
    };

    it('should create user-game record with game from IGDB', async () => {
      (igdbService.getById as jest.Mock).mockResolvedValue(mockIgdbGame);
      (prismaService.game.upsert as jest.Mock).mockResolvedValue(mockDbGame);
      (prismaService.userGame.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.userGame.create as jest.Mock).mockResolvedValue(
        mockUserGame,
      );

      const result = await service.create(mockUser.id, createDto);

      expect(result).toEqual(mockUserGame);
    });

    it('should set default status to todo when not provided', async () => {
      const dtoWithoutStatus: CreateUserGameDto = {
        igdbId: mockIgdbGame.id,
      };

      (igdbService.getById as jest.Mock).mockResolvedValue(mockIgdbGame);
      (prismaService.game.upsert as jest.Mock).mockResolvedValue(mockDbGame);
      (prismaService.userGame.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.userGame.create as jest.Mock).mockResolvedValue(
        mockUserGame,
      );

      await service.create(mockUser.id, dtoWithoutStatus);

      expect(prismaService.userGame.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: GameStatus.TODO,
          }),
        }),
      );
    });

    it('should throw ConflictException if game already in collection', async () => {
      (igdbService.getById as jest.Mock).mockResolvedValue(mockIgdbGame);
      (prismaService.game.upsert as jest.Mock).mockResolvedValue(mockDbGame);
      (prismaService.userGame.findUnique as jest.Mock).mockResolvedValue(
        mockUserGame,
      );

      await expect(service.create(mockUser.id, createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if game not found in IGDB', async () => {
      (igdbService.getById as jest.Mock).mockResolvedValue(null);

      await expect(service.create(mockUser.id, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated games for user', async () => {
      const games = [mockUserGame];
      (prismaService.userGame.findMany as jest.Mock).mockResolvedValue(games);
      (prismaService.userGame.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(mockUser.id, 1, 20);

      expect(result).toEqual({
        data: games,
        meta: { page: 1, limit: 20, total: 1 },
      });
    });

    it('should filter by status when provided', async () => {
      const status = GameStatus.PLAYING;
      (prismaService.userGame.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.userGame.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(mockUser.id, 1, 20, status);

      expect(prismaService.userGame.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id, status },
        }),
      );
    });

    it('should respect skip/take pagination', async () => {
      (prismaService.userGame.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.userGame.count as jest.Mock).mockResolvedValue(100);

      await service.findAll(mockUser.id, 3, 10);

      expect(prismaService.userGame.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3 - 1) * 10
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return game with full details', async () => {
      (prismaService.userGame.findUnique as jest.Mock).mockResolvedValue(
        mockUserGame,
      );

      const result = await service.findOne(mockUser.id, mockUserGame.id);

      expect(result).toEqual(mockUserGame);
    });

    it('should throw ForbiddenException if user does not own record', async () => {
      const otherUserGame = { ...mockUserGame, userId: 'other-user-id' };
      (prismaService.userGame.findUnique as jest.Mock).mockResolvedValue(
        otherUserGame,
      );

      await expect(
        service.findOne(mockUser.id, mockUserGame.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if record does not exist', async () => {
      (prismaService.userGame.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findOne(mockUser.id, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserGameDto = {
      status: GameStatus.PLAYING,
    };

    it('should update game status', async () => {
      (prismaService.userGame.findUnique as jest.Mock).mockResolvedValue(
        mockUserGame,
      );
      const updatedGame = { ...mockUserGame, status: GameStatus.PLAYING };
      (prismaService.userGame.update as jest.Mock).mockResolvedValue(
        updatedGame,
      );

      const result = await service.update(
        mockUser.id,
        mockUserGame.id,
        updateDto,
      );

      expect(result).toEqual(updatedGame);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const otherUserGame = { ...mockUserGame, userId: 'other-user-id' };
      (prismaService.userGame.findUnique as jest.Mock).mockResolvedValue(
        otherUserGame,
      );

      await expect(
        service.update(mockUser.id, mockUserGame.id, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete user-game record', async () => {
      (prismaService.userGame.findUnique as jest.Mock).mockResolvedValue(
        mockUserGame,
      );
      (prismaService.userGame.delete as jest.Mock).mockResolvedValue(
        mockUserGame,
      );

      await service.remove(mockUser.id, mockUserGame.id);

      expect(prismaService.userGame.delete).toHaveBeenCalledWith({
        where: { id: mockUserGame.id },
      });
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const otherUserGame = { ...mockUserGame, userId: 'other-user-id' };
      (prismaService.userGame.findUnique as jest.Mock).mockResolvedValue(
        otherUserGame,
      );

      await expect(
        service.remove(mockUser.id, mockUserGame.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
