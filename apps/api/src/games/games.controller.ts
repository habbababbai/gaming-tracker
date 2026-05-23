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
import type { GamesSearchResponse } from '@repo/types';
import { Public } from '../auth/public.decorator.js';
import { IgdbService } from '../igdb/igdb.service.js';
import { dedupeGamesById } from './dedupe-games.js';
import { SearchSnapshotCache } from './search-snapshot.cache.js';

const SNAPSHOT_SIZE = 100;

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(
    private readonly igdb: IgdbService,
    private readonly cache: SearchSnapshotCache,
  ) {}

  @Public()
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<GamesSearchResponse> {
    const q = query?.trim().toLowerCase();
    if (!q) {
      return { data: [], meta: { limit, offset, hasMore: false } };
    }
    let snapshot = this.cache.get(q);
    if (!snapshot) {
      const raw = await this.igdb.search(q, SNAPSHOT_SIZE, 0);
      snapshot = dedupeGamesById(raw);
      this.cache.set(q, snapshot);
    }
    const data = snapshot.slice(offset, offset + limit);
    const hasMore = offset + limit < snapshot.length;
    return { data, meta: { limit, offset, hasMore } };
  }

  @Public()
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const game = await this.igdb.getDetailById(id);
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }
    return { data: game };
  }
}
