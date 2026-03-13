import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { GameStatus } from '../../generated/prisma/client.js';

export class CreateUserGameDto {
  @IsString()
  userId!: string;

  @Type(() => Number)
  @IsInt()
  igdbId!: number;

  @IsOptional()
  status?: (typeof GameStatus)[keyof typeof GameStatus];
}
