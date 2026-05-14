import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthUser, type AuthUserPayload } from './user.decorator.js';
import { Public } from './public.decorator.js';
import { AuthService } from './auth.service.js';
import { AuthThrottleGuard } from './throttle.guard.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthThrottleGuard)
  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const result = await this.auth.register(dto);
    this.setAuthCookie(res, result.data.accessToken);
    res.json({ data: { user: result.data.user } });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthThrottleGuard)
  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.auth.login(dto);
    this.setAuthCookie(res, result.data.accessToken);
    res.json({ data: { user: result.data.user } });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @AuthUser() user: AuthUserPayload,
    @Query('all') all?: string,
    @Res() res?: Response,
  ) {
    if (all === 'true') {
      await this.auth.logoutAll(user.id);
    } else {
      await this.auth.logout(user.jti);
    }
    if (res) {
      res.clearCookie('access_token');
      res.send();
    }
  }

  private setAuthCookie(res: Response, token: string): void {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge,
    });
  }
}
