import {
  BadRequestException,
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
import { UserGamesService } from './user-games.service.js';
import { CreateUserGameDto } from './dto/create-user-game.dto.js';
import { UpdateUserGameDto } from './dto/update-user-game.dto.js';

@Controller('user-games')
export class UserGamesController {
  constructor(private readonly userGames: UserGamesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserGameDto) {
    return this.userGames.create(dto).then((data) => ({ data }));
  }

  @Get()
  findAll(
    @Query('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: (typeof GameStatus)[keyof typeof GameStatus],
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.userGames.findAll(userId, page, limit, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userGames.findOne(id).then((data) => ({ data }));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserGameDto) {
    return this.userGames.update(id, dto).then((data) => ({ data }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.userGames.remove(id);
  }
}
