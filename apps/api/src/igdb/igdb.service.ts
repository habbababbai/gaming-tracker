import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import igdb from 'igdb-api-node';
import type { IgdbGame, IgdbGameDetail, IgdbSimilarGame } from '@repo/types';

const COVER_BASE = 'https://images.igdb.com/igdb/image/upload/t_cover_big';
const MAX_SIMILAR_GAMES = 12;

@Injectable()
export class IgdbService {
  private client: ReturnType<typeof igdb> | null = null;
  private tokenExpiry = 0;

  private async getClient() {
    const clientId = process.env['IGDB_CLIENT_ID'];
    const clientSecret = process.env['IGDB_CLIENT_SECRET'];
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('IGDB credentials not configured');
    }
    if (this.client && Date.now() < this.tokenExpiry - 86400000) {
      return this.client;
    }
    const res = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' },
    );
    if (!res.ok) {
      throw new ServiceUnavailableException('IGDB authentication failed');
    }
    const { access_token, expires_in } = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.tokenExpiry = Date.now() + expires_in * 1000;
    this.client = igdb(clientId, access_token);
    return this.client;
  }

  private coverUrl(imageId?: string): string | null {
    return imageId ? `${COVER_BASE}/${imageId}.png` : null;
  }

  private releaseYear(timestamp?: number): number | null {
    return timestamp ? new Date(timestamp * 1000).getFullYear() : null;
  }

  private releaseDate(timestamp?: number): string | null {
    if (!timestamp) return null;
    return new Date(timestamp * 1000).toISOString().slice(0, 10);
  }

  private rating(
    aggregated?: number,
    total?: number,
  ): number | null {
    const value = aggregated ?? total;
    return value != null ? Math.round(value) : null;
  }

  private mapGame(raw: {
    id: number;
    name: string;
    cover?: { image_id?: string };
    first_release_date?: number;
  }): IgdbGame {
    return {
      id: raw.id,
      name: raw.name,
      coverUrl: this.coverUrl(raw.cover?.image_id),
      releaseYear: this.releaseYear(raw.first_release_date),
    };
  }

  private mapSimilarGame(raw: {
    id: number;
    name?: string;
    cover?: { image_id?: string };
  }): IgdbSimilarGame | null {
    if (!raw.name) return null;
    return {
      id: raw.id,
      name: raw.name,
      coverUrl: this.coverUrl(raw.cover?.image_id),
    };
  }

  private mapGameDetail(raw: {
    id: number;
    name: string;
    cover?: { image_id?: string };
    first_release_date?: number;
    summary?: string;
    storyline?: string;
    genres?: { name?: string }[];
    aggregated_rating?: number;
    total_rating?: number;
    similar_games?: {
      id: number;
      name?: string;
      cover?: { image_id?: string };
    }[];
  }): IgdbGameDetail {
    const base = this.mapGame(raw);
    const similarGames = (raw.similar_games ?? [])
      .map((g) => this.mapSimilarGame(g))
      .filter((g): g is IgdbSimilarGame => g != null)
      .slice(0, MAX_SIMILAR_GAMES);

    return {
      ...base,
      summary: raw.summary ?? null,
      storyline: raw.storyline ?? null,
      genres: (raw.genres ?? [])
        .map((g) => g.name)
        .filter((name): name is string => Boolean(name)),
      releaseDate: this.releaseDate(raw.first_release_date),
      rating: this.rating(raw.aggregated_rating, raw.total_rating),
      similarGames,
    };
  }

  async search(
    query: string,
    limit = 10,
    offset = 0,
  ): Promise<IgdbGame[]> {
    const client = await this.getClient();
    const res = await client
      .fields(['id', 'name', 'cover.image_id', 'first_release_date'])
      .limit(limit)
      .offset(offset)
      .search(query)
      .request('/games');
    return (res.data as object[]).map((g) => this.mapGame(g as never));
  }

  async getById(igdbId: number): Promise<IgdbGame | null> {
    const client = await this.getClient();
    const res = await client
      .fields(['id', 'name', 'cover.image_id', 'first_release_date'])
      .where(`id = ${igdbId}`)
      .request('/games');
    const raw = (res.data as object[])[0] as unknown;
    if (!raw) return null;
    return this.mapGame(raw as never);
  }

  async getDetailById(igdbId: number): Promise<IgdbGameDetail | null> {
    const client = await this.getClient();
    const res = await client
      .fields([
        'id',
        'name',
        'cover.image_id',
        'first_release_date',
        'summary',
        'storyline',
        'genres.name',
        'aggregated_rating',
        'total_rating',
        'similar_games.name',
        'similar_games.cover.image_id',
      ])
      .where(`id = ${igdbId}`)
      .request('/games');
    const raw = (res.data as object[])[0] as unknown;
    if (!raw) return null;
    return this.mapGameDetail(raw as never);
  }
}
