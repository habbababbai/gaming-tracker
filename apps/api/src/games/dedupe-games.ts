import type { IgdbGame } from '@repo/types';

export function dedupeGamesById(games: IgdbGame[]): IgdbGame[] {
  const seen = new Set<number>();
  const result: IgdbGame[] = [];
  for (const game of games) {
    if (seen.has(game.id)) continue;
    seen.add(game.id);
    result.push(game);
  }
  return result;
}
