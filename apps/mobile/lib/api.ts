const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchGames(_query: string, _limit = 10, _offset = 0) {
  throw new Error(`Not implemented: ${API_URL}/api/games/search`);
}

export function fetchGamesByPage(_query: string, _page = 1, _perPage = 10) {
  throw new Error('Not implemented');
}

export async function fetchGameById(_id: string | number) {
  throw new Error(`Not implemented: ${API_URL}/api/games/${_id}`);
}
