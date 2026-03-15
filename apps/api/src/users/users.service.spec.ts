import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    createdAt: new Date('2026-03-14'),
  };
  const mockUserForDelete = {
    ...mockUser,
    passwordHash: 'hashed',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findById', () => {
    it('should return user without passwordHash', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(
          mockUser as Awaited<ReturnType<PrismaService['user']['findUnique']>>,
        );

      const result = await service.findById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('passwordHash');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: { id: true, email: true, createdAt: true },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUserForDelete);

      await service.remove(mockUser.id);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should complete deletion without returning data', async () => {
      jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUserForDelete);

      const result = await service.remove(mockUser.id);

      // The remove method returns void, so result should be undefined
      expect(result).toBeUndefined();
    });
  });
});
