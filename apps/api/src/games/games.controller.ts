import {
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator.js';
import { IgdbService } from '../igdb/igdb.service.js';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly igdb: IgdbService) {}

  @Public()
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    if (!query?.trim()) {
      return { data: [] };
    }
    const data = await this.igdb.search(query.trim(), limit, offset);
    return { data };
  }

  @Public()
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const game = await this.igdb.getById(id);
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }
    return { data: game };
  }
}
