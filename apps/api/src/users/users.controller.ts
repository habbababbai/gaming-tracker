import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, type AuthUserPayload } from '../auth/user.decorator.js';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  getMe(@AuthUser() user: AuthUserPayload) {
    return this.users.findById(user.id).then((data) => ({ data }));
  }

  @Patch('me')
  updateMe(@AuthUser() user: AuthUserPayload, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto).then((data) => ({ data }));
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMe(@AuthUser() user: AuthUserPayload) {
    await this.users.remove(user.id);
  }
}
