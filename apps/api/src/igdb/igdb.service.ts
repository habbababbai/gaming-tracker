import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import igdb from 'igdb-api-node';

export interface IgdbGame {
  id: number;
  name: string;
  coverUrl: string | null;
  releaseYear: number | null;
}

const COVER_BASE = 'https://images.igdb.com/igdb/image/upload/t_cover_big';

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

  private mapGame(raw: {
    id: number;
    name: string;
    cover?: { image_id?: string };
    first_release_date?: number;
  }): IgdbGame {
    const coverUrl = raw.cover?.image_id
      ? `${COVER_BASE}/${raw.cover.image_id}.png`
      : null;
    const releaseYear = raw.first_release_date
      ? new Date(raw.first_release_date * 1000).getFullYear()
      : null;
    return {
      id: raw.id,
      name: raw.name,
      coverUrl,
      releaseYear,
    };
  }

  /**
   * Searches IGDB for games by name.
   * @param query - Search string
   * @param limit - Max results (default 10)
   * @returns Array of games (id, name, coverUrl, releaseYear)
   * @throws ServiceUnavailableException if IGDB credentials missing or auth fails
   */
  async search(query: string, limit = 10): Promise<IgdbGame[]> {
    const client = await this.getClient();
    const res = await client
      .fields(['id', 'name', 'cover.image_id', 'first_release_date'])
      .limit(limit)
      .search(query)
      .request('/games');
    return (res.data as object[]).map((g) => this.mapGame(g as never));
  }

  /**
   * Fetches a single game from IGDB by id.
   * @param igdbId - IGDB game id
   * @returns Game or null if not found
   * @throws ServiceUnavailableException if IGDB credentials missing or auth fails
   */
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
}
