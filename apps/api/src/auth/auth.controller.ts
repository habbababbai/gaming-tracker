import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from './public.decorator.js';
import { AuthService } from './auth.service.js';
import { AuthThrottleGuard } from './throttle.guard.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

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
}
