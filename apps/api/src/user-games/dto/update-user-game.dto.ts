import { IsEnum } from 'class-validator';
import { GameStatus } from '@repo/types';

export class UpdateUserGameDto {
  @IsEnum(GameStatus)
  status!: (typeof GameStatus)[keyof typeof GameStatus];
}
