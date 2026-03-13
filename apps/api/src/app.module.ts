import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { GamesModule } from './games/games.module.js';
import { IgdbModule } from './igdb/igdb.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UserGamesModule } from './user-games/user-games.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    IgdbModule,
    UsersModule,
    GamesModule,
    UserGamesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
