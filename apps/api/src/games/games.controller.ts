import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { IgdbService } from '../igdb/igdb.service.js';

@Controller('games')
export class GamesController {
  constructor(private readonly igdb: IgdbService) {}

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (!query?.trim()) {
      return { data: [] };
    }
    const data = await this.igdb.search(query.trim(), limit);
    return { data };
  }
}
