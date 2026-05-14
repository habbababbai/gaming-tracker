import { LoginDto, RegisterDto } from '../../../packages/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data as T;
}

export async function login(email: string, password: string) {
  return apiFetch<LoginDto>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register({
  email,
  password,
  firstName,
  lastName,
}: RegisterDto) {
  return apiFetch<RegisterDto>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
}

export async function logout() {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
}

export async function logoutAll() {
  return apiFetch('/auth/logout?all=true', {
    method: 'POST',
  });
}

export async function searchGames(query: string) {
  return apiFetch(`/games/search?q=${encodeURIComponent(query)}&limit=5`);
}
