import { Module } from '@nestjs/common';
import { GamesController } from './games.controller.js';
import { SearchSnapshotCache } from './search-snapshot.cache.js';

@Module({
  controllers: [GamesController],
  providers: [SearchSnapshotCache],
})
export class GamesModule {}
