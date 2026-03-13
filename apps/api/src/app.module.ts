import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { GamesModule } from './games/games.module.js';
import { IgdbModule } from './igdb/igdb.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UserGamesModule } from './user-games/user-games.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    PrismaModule,
    IgdbModule,
    UsersModule,
    GamesModule,
    UserGamesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
