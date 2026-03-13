import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GameStatus } from '@repo/types';
import { IgdbService } from '../igdb/igdb.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserGameDto } from './dto/create-user-game.dto.js';
import { UpdateUserGameDto } from './dto/update-user-game.dto.js';

@Injectable()
export class UserGamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly igdb: IgdbService,
  ) {}

  async create(userId: string, dto: CreateUserGameDto) {
    const igdbGame = await this.igdb.getById(dto.igdbId);
    if (!igdbGame) {
      throw new NotFoundException('Game not found in IGDB');
    }
    const game = await this.prisma.game.upsert({
      where: { igdbId: dto.igdbId },
      create: {
        igdbId: igdbGame.id,
        name: igdbGame.name,
        coverUrl: igdbGame.coverUrl,
        releaseYear: igdbGame.releaseYear,
      },
      update: {
        name: igdbGame.name,
        coverUrl: igdbGame.coverUrl ?? undefined,
        releaseYear: igdbGame.releaseYear ?? undefined,
      },
    });
    const existing = await this.prisma.userGame.findUnique({
      where: {
        userId_gameId: { userId, gameId: game.id },
      },
    });
    if (existing) {
      throw new ConflictException('User already has this game in collection');
    }
    return this.prisma.userGame.create({
      data: {
        userId,
        gameId: game.id,
        status: dto.status ?? GameStatus.TODO,
      },
      include: { user: true, game: true },
    });
  }

  async findAll(userId: string, page = 1, limit = 20, status?: GameStatus) {
    const skip = (page - 1) * limit;
    const where = { userId, ...(status && { status }) };
    const [data, total] = await Promise.all([
      this.prisma.userGame.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: { game: true },
      }),
      this.prisma.userGame.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async findOne(userId: string, id: string) {
    const userGame = await this.prisma.userGame.findUnique({
      where: { id },
      include: { user: true, game: true },
    });
    if (!userGame) throw new NotFoundException('UserGame not found');
    if (userGame.userId !== userId) throw new ForbiddenException();
    return userGame;
  }

  async update(userId: string, id: string, dto: UpdateUserGameDto) {
    await this.findOne(userId, id);
    return this.prisma.userGame.update({
      where: { id },
      data: { status: dto.status },
      include: { user: true, game: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.userGame.delete({ where: { id } });
  }
}
