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
    firstName: 'Test',
    lastName: 'User',
    nick: 'test',
    dateOfBirth: new Date('1990-01-01'),
    avatarUrl: null,
    locale: 'en',
    createdAt: new Date('2026-03-14'),
    updatedAt: new Date('2026-03-14'),
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
              update: jest.fn(),
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
    it('should return user profile without passwordHash', async () => {
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
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          nick: true,
          dateOfBirth: true,
          avatarUrl: true,
          locale: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update only provided fields and return profile', async () => {
      const updated = {
        ...mockUser,
        firstName: 'Jane',
        nick: 'jane',
        updatedAt: new Date('2026-03-15'),
      };
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updated as never);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(updated as never);

      const result = await service.updateProfile('user-123', {
        firstName: 'Jane',
        nick: 'jane',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          firstName: 'Jane',
          nick: 'jane',
        },
      });
      expect(result).toEqual(updated);
    });

    it('should not clear required fields when given empty string', async () => {
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as never);
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUser as never);

      await service.updateProfile('user-123', { nick: '' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {},
      });
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
