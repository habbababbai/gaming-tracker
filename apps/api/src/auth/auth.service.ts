import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

const SALT_ROUNDS = 12;

interface SessionDelegate {
  create(args: {
    data: { jti: string; userId: string; expiresAt: Date };
  }): Promise<unknown>;
  deleteMany(args: {
    where: { jti?: string; userId?: string };
  }): Promise<unknown>;
}

function getExpFromDecoded(decoded: unknown): number {
  if (
    decoded === null ||
    typeof decoded !== 'object' ||
    !('exp' in decoded) ||
    typeof (decoded as { exp: unknown }).exp !== 'number'
  ) {
    throw new Error('Invalid token payload');
  }
  return (decoded as { exp: number }).exp;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Creates a session for the user and returns a signed JWT.
   * Session is stored so it can be validated on each request and revoked on logout.
   * @param userId - User id (sub in JWT)
   * @returns Access token for Authorization header
   */
  private async createSession(
    userId: string,
  ): Promise<{ accessToken: string }> {
    const jti = randomUUID();
    const token = this.jwt.sign({ sub: userId, jti });
    const exp = getExpFromDecoded(this.jwt.decode(token));
    const expiresAt = new Date(exp * 1000);
    const sessionDb: SessionDelegate = this.prisma
      .session as unknown as SessionDelegate;
    await sessionDb.create({ data: { jti, userId, expiresAt } });
    return { accessToken: token };
  }

  /**
   * Registers a new user and returns user + access token.
   * @throws ConflictException if email already registered
   */
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });
    const { accessToken } = await this.createSession(user.id);
    return { data: { user, accessToken } };
  }

  /**
   * Authenticates by email/password and returns user + access token.
   * Creates a new session (multiple logins allowed, e.g. web + mobile).
   * @throws UnauthorizedException if credentials invalid
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { accessToken } = await this.createSession(user.id);
    return {
      data: {
        user: { id: user.id, email: user.email, createdAt: user.createdAt },
        accessToken,
      },
    };
  }

  /**
   * Revokes the session for the given token id. Token becomes invalid (401 on next use).
   * @param jti - Token id from JWT payload
   */
  async logout(jti: string): Promise<void> {
    const sessionDb: SessionDelegate = this.prisma
      .session as unknown as SessionDelegate;
    await sessionDb.deleteMany({ where: { jti } });
  }

  /**
   * Revokes all sessions for the user (all devices). All their tokens become invalid.
   * @param userId - User id
   */
  async logoutAll(userId: string): Promise<void> {
    const sessionDb: SessionDelegate = this.prisma
      .session as unknown as SessionDelegate;
    await sessionDb.deleteMany({ where: { userId } });
  }
}
