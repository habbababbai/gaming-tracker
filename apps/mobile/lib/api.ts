const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchGames(query: string, limit = 10, offset = 0) {
  const url = `${API_URL}/games/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch games');
  }
  const json = await response.json();
  return json.data as any[];
}

export function fetchGamesByPage(query: string, page = 1, perPage = 10) {
  const offset = (page - 1) * perPage;
  return fetchGames(query, perPage, offset);
}

export async function fetchGameById(id: string | number) {
  const url = `${API_URL}/games/${id}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch game details');
  }
  const json = await response.json();
  return json.data as any;
}
