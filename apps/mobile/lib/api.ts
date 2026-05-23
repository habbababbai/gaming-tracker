import type { IgdbGame } from '@repo/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * GET /api/games/search?q={query}&limit={limit}&offset={offset}
 *
 * BE 200: `{ data: IgdbGame[] }` — no `meta`; pagination is limit/offset only.
 * Empty or whitespace `q`: `{ data: [] }` (still 200).
 * Defaults: limit=10, offset=0.
 */
export async function fetchGames(
  query: string,
  limit = 10,
  offset = 0,
): Promise<IgdbGame[]> {
  throw new Error(`Not implemented: ${API_URL}/api/games/search`);
}

/**
 * Same endpoint as `fetchGames`; maps page → offset = (page - 1) * perPage.
 *
 * GET /api/games/search?q={query}&limit={perPage}&offset={(page - 1) * perPage}
 * BE 200: `{ data: IgdbGame[] }`
 */
export function fetchGamesByPage(
  query: string,
  page = 1,
  perPage = 10,
): Promise<IgdbGame[]> {
  throw new Error(
    `Not implemented: ${API_URL}/api/games/search?q=${query}&limit=${perPage}&offset=${(page - 1) * perPage}`,
  );
}

/**
 * GET /api/games/{id} — `id` is IGDB numeric id.
 *
 * BE 200: `{ data: IgdbGame }`
 * BE 404: `{ statusCode: 404, message: "Game with ID {id} not found", error: "Not Found" }`
 */
export async function fetchGameById(id: string | number): Promise<IgdbGame> {
  throw new Error(`Not implemented: ${API_URL}/api/games/${id}`);
}
