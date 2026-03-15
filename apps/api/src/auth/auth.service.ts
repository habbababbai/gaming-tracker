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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async createSession(userId: string): Promise<{ accessToken: string }> {
    const jti = randomUUID();
    const token = this.jwt.sign({ sub: userId, jti });
    const payload = this.jwt.decode(token) as { exp: number };
    const expiresAt = new Date(payload.exp * 1000);
    await this.prisma.session.create({ data: { jti, userId, expiresAt } });
    return { accessToken: token };
  }

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

  async logout(jti: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { jti } });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }
}
