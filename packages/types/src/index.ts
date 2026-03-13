/**
 * Game status enum
 */
export enum GameStatus {
    TODO = "todo",
    PLAYING = "playing",
    COMPLETED = "completed",
    DROPPED = "dropped",
}

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
