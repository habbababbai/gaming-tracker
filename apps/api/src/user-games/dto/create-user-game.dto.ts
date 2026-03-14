import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { GameStatus } from '@repo/types';

export class CreateUserGameDto {
  @Type(() => Number)
  @IsInt()
  igdbId!: number;

  @IsOptional()
  status?: (typeof GameStatus)[keyof typeof GameStatus];
}
