import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GameStatus } from '../generated/prisma/client.js';
import { AuthUser, type AuthUserPayload } from '../auth/user.decorator.js';
import { UserGamesService } from './user-games.service.js';
import { CreateUserGameDto } from './dto/create-user-game.dto.js';
import { UpdateUserGameDto } from './dto/update-user-game.dto.js';

@Controller('user-games')
export class UserGamesController {
  constructor(private readonly userGames: UserGamesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@AuthUser() user: AuthUserPayload, @Body() dto: CreateUserGameDto) {
    return this.userGames.create(user.id, dto).then((data) => ({ data }));
  }

  @Get()
  findAll(
    @AuthUser() user: AuthUserPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: (typeof GameStatus)[keyof typeof GameStatus],
  ) {
    return this.userGames.findAll(user.id, page, limit, status);
  }

  @Get(':id')
  findOne(@AuthUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.userGames.findOne(user.id, id).then((data) => ({ data }));
  }

  @Patch(':id')
  update(
    @AuthUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateUserGameDto,
  ) {
    return this.userGames.update(user.id, id, dto).then((data) => ({ data }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@AuthUser() user: AuthUserPayload, @Param('id') id: string) {
    await this.userGames.remove(user.id, id);
  }
}
