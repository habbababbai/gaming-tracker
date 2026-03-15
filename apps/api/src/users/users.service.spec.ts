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

    it('should update dateOfBirth and pass Date to prisma', async () => {
      const updated = {
        ...mockUser,
        dateOfBirth: new Date('1995-06-15'),
        updatedAt: new Date('2026-03-15'),
      };
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updated as never);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(updated as never);

      await service.updateProfile('user-123', {
        dateOfBirth: '1995-06-15',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { dateOfBirth: new Date('1995-06-15') },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object),
      });
    });

    it('should set avatarUrl when provided', async () => {
      const updated = {
        ...mockUser,
        avatarUrl: 'https://example.com/avatar.png',
        updatedAt: new Date('2026-03-15'),
      };
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updated as never);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(updated as never);

      await service.updateProfile('user-123', {
        avatarUrl: 'https://example.com/avatar.png',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { avatarUrl: 'https://example.com/avatar.png' },
      });
    });

    it('should clear avatarUrl when given empty string', async () => {
      const updated = { ...mockUser, avatarUrl: null, updatedAt: new Date() };
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updated as never);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(updated as never);

      await service.updateProfile('user-123', { avatarUrl: '' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { avatarUrl: null },
      });
    });

    it('should ignore empty firstName and lastName', async () => {
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as never);
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUser as never);

      await service.updateProfile('user-123', {
        firstName: '  ',
        lastName: '',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {},
      });
    });

    it('should throw when user does not exist', async () => {
      const err = new Error('Record not found');
      jest.spyOn(prisma.user, 'update').mockRejectedValue(err);

      await expect(
        service.updateProfile('missing', { firstName: 'X' }),
      ).rejects.toThrow('Record not found');
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

      expect(result).toBeUndefined();
    });

    it('should propagate error when delete fails (e.g. user not found)', async () => {
      const err = new Error('Record to delete does not exist');
      jest.spyOn(prisma.user, 'delete').mockRejectedValue(err);

      await expect(service.remove('missing')).rejects.toThrow(
        'Record to delete does not exist',
      );
    });
  });
});
