import type { GamesSearchResponse, IgdbGame } from '@repo/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export const SEARCH_PAGE_SIZE = 10;


async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/**
 * GET /api/games/search?q=&limit=&offset=
 * 200 `{ data: IgdbGame[], meta: { limit, offset, hasMore } }` — `hasMore` from BE limit+1 over-fetch
 * 200 empty/whitespace `q` → `{ data: [], meta }` (no IGDB call)
 * 400 invalid `limit` / `offset`
 * 503 IGDB credentials or auth failure
 * Infinite query: `pageParam` = offset; next page when `meta.hasMore` → `meta.offset + meta.limit`
 */
export async function fetchGames(
  query: string,
  limit = SEARCH_PAGE_SIZE,
  offset = 0,
): Promise<GamesSearchResponse> {
  throw new Error(`Not implemented: ${API_URL}/api/games/search`);
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
