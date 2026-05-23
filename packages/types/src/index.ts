/**
 * Shared Types for Gaming Tracker
 *
 * This package exports FRAMEWORK-AGNOSTIC types used by all apps (API, Web, Mobile).
 * It contains NO framework-specific code (no class-validator, NestJS, Next.js, etc.).
 *
 * Guidelines:
 * ✅ Export const objects (not enums - Node strip-only mode), interfaces, and types
 * ✅ Use for request/response contracts
 * ❌ Don't add validators/decorators (API adds these locally)
 * ❌ Don't import framework libraries
 *
 * Each app implements validation at its layer:
 *   API (NestJS) → class-validator decorators on DTOs
 *   Web (Next.js) → client-side form validation
 *   Mobile (Expo) → client-side form validation
 */

/**
 * Game status - const object pattern for Node.js compatibility
 */
export const GameStatus = {
  TODO: 'todo',
  PLAYING: 'playing',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

/**
 * Authentication DTOs
 */
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nick: string;
  dateOfBirth: string;
}

export interface AuthUserPayload {
  id: string;
  email: string;
  createdAt: Date;
  jti: string;
}

export interface JwtPayload {
  sub: string;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface IgdbGame {
  id: number;
  name: string;
  coverUrl: string | null;
  releaseYear: number | null;
}

export interface IgdbSimilarGame {
  id: number;
  name: string;
  coverUrl: string | null;
}

export interface IgdbGameDetail extends IgdbGame {
  summary: string | null;
  storyline: string | null;
  genres: string[];
  releaseDate: string | null;
  rating: number | null;
  similarGames: IgdbSimilarGame[];
}

export interface GamesSearchMeta {
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface GamesSearchResponse {
  data: IgdbGame[];
  meta: GamesSearchMeta;
}

/**
 * User Games DTOs
 */
export interface CreateUserGameDto {
  igdbId: number;
  status?: GameStatus;
}

export interface UpdateUserGameDto {
  status: GameStatus;
}

/**
 * User Games Response Types
 */
export interface GameData {
  id: string;
  igdbId: number;
  name: string;
  coverUrl?: string;
  releaseYear?: number;
}

export interface UserGameResponse {
  id: string;
  userId: string;
  gameId: string;
  status: GameStatus;
  game: GameData;
  createdAt: string;
  updatedAt: string;
}
