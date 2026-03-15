import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { type JwtPayload } from '@repo/types';
import { getSessionDelegate } from '../common/index.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<{
    id: string;
    email: string;
    createdAt: Date;
    jti: string;
  }> {
    const { jti } = payload;
    const session = await getSessionDelegate(this.prisma).findUnique({
      where: { jti },
      include: { user: { select: { id: true, email: true, createdAt: true } } },
    });
    if (!session || session.expiresAt < new Date() || !session.user) {
      throw new UnauthorizedException();
    }
    return { ...session.user, jti };
  }
}
