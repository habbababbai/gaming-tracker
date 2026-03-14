import { Module } from '@nestjs/common';
import { UserGamesController } from './user-games.controller.js';
import { UserGamesService } from './user-games.service.js';

@Module({
  controllers: [UserGamesController],
  providers: [UserGamesService],
  exports: [UserGamesService],
})
export class UserGamesModule {}
