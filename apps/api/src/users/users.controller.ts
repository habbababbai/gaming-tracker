import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthUser, type AuthUserPayload } from '../auth/user.decorator.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  getMe(@AuthUser() user: AuthUserPayload) {
    return this.users.findById(user.id).then((data) => ({ data }));
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMe(@AuthUser() user: AuthUserPayload) {
    await this.users.remove(user.id);
  }
}
