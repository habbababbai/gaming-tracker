import type { IgdbGame } from '@repo/types';

import { dedupeGamesById } from './dedupe-games.js';

const game = (id: number): IgdbGame => ({
  id,
  name: `Game ${id}`,
  coverUrl: null,
  releaseYear: null,
});

describe('dedupeGamesById', () => {
  it('keeps first occurrence of each id', () => {
    expect(dedupeGamesById([game(1), game(2), game(1), game(3)])).toEqual([
      game(1),
      game(2),
      game(3),
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(dedupeGamesById([])).toEqual([]);
  });
});
