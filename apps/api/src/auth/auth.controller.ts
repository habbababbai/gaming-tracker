import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthUser, type AuthUserPayload } from './user.decorator.js';
import { Public } from './public.decorator.js';
import { AuthService } from './auth.service.js';
import { AuthThrottleGuard } from './throttle.guard.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

interface LogoutService {
  logout(jti: string): Promise<void>;
  logoutAll(userId: string): Promise<void>;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthThrottleGuard)
  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthThrottleGuard)
  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@AuthUser() user: AuthUserPayload, @Query('all') all?: string) {
    const auth: LogoutService = this.auth;
    if (all === 'true') {
      await auth.logoutAll(user.id);
    } else {
      await auth.logout(String(user.jti));
    }
  }
}
