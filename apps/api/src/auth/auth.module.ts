import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: (() => {
        const secret = process.env['JWT_SECRET'];
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return secret;
      })(),
      signOptions: { expiresIn: '7d' },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 900000, // 15 minutes
        limit: 5, // Max 5 requests per 15 minutes
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
