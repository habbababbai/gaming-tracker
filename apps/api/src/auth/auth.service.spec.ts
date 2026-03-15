import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const mockBcryptCompare = jest.fn<Promise<boolean>, [string, string]>();
const mockBcryptHash = jest.fn<Promise<string>, [string, number]>();

jest.mock('bcrypt', () => ({
  compare: (data: string, hash: string): Promise<boolean> =>
    mockBcryptCompare(data, hash),
  hash: (data: string, rounds: number): Promise<string> =>
    mockBcryptHash(data, rounds),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    createdAt: new Date('2026-03-14'),
    updatedAt: new Date('2026-03-14'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn(), create: jest.fn() },
            session: {
              create: jest.fn().mockResolvedValue(undefined),
              deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            decode: jest
              .fn()
              .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 604800 }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    mockBcryptHash.mockResolvedValue('hashed-password');
    mockBcryptCompare.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'Password123',
    };

    it('should hash password, create user and session on success', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: 'user-456',
        email: registerDto.email,
        createdAt: mockUser.createdAt,
      });
      (jwtService.sign as jest.Mock).mockReturnValue('new-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        data: {
          user: {
            id: 'user-456',
            email: registerDto.email,
            createdAt: mockUser.createdAt,
          },
          accessToken: 'new-token',
        },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-456', jti: expect.any(String) }),
      );
      expect(prisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-456',
            jti: expect.any(String),
            expiresAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should not return passwordHash in response', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: 'user-456',
        email: registerDto.email,
        createdAt: mockUser.createdAt,
      });

      const result = await service.register(registerDto);

      expect(result.data.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: mockUser.email,
      password: 'Password123',
    };

    it('should return user and JWT token and create session on valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      mockBcryptCompare.mockResolvedValueOnce(true);
      (jwtService.sign as jest.Mock).mockReturnValue('auth-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            createdAt: mockUser.createdAt,
          },
          accessToken: 'auth-token',
        },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockBcryptCompare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash,
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: mockUser.id, jti: expect.any(String) }),
      );
      expect(prisma.session.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      mockBcryptCompare.mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should not return passwordHash in response', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      mockBcryptCompare.mockResolvedValueOnce(true);

      const result = await service.login(loginDto);

      expect(result.data.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('logout', () => {
    it('should delete session by jti', async () => {
      await service.logout('jti-123');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { jti: 'jti-123' },
      });
    });
  });

  describe('logoutAll', () => {
    it('should delete all sessions for user', async () => {
      await service.logoutAll('user-123');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });
  });
});
