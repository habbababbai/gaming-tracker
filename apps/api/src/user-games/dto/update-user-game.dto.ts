import { IsEnum } from 'class-validator';
import { GameStatus } from '../../generated/prisma/client.js';

export class UpdateUserGameDto {
  @IsEnum(GameStatus)
  status!: (typeof GameStatus)[keyof typeof GameStatus];
}
