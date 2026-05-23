import { Injectable } from '@nestjs/common';
import type { IgdbGame } from '@repo/types';

const SNAPSHOT_TTL_MS = 5 * 60_000;
const MAX_ENTRIES = 200;

interface Entry {
  items: IgdbGame[];
  expiresAt: number;
}

/**
 * Per-query ranked snapshot cache used to stabilize IGDB search pagination.
 * IGDB's offset-based search can return the same id on different pages, so we
 * cache the first ranked page and serve all paginated calls by slicing it.
 */
@Injectable()
export class SearchSnapshotCache {
  private readonly store = new Map<string, Entry>();

  get(query: string): IgdbGame[] | null {
    const entry = this.store.get(query);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(query);
      return null;
    }
    return entry.items;
  }

  set(query: string, items: IgdbGame[]): void {
    this.store.delete(query);
    this.store.set(query, {
      items,
      expiresAt: Date.now() + SNAPSHOT_TTL_MS,
    });
    while (this.store.size > MAX_ENTRIES) {
      const oldest = this.store.keys().next().value;
      if (oldest === undefined) break;
      this.store.delete(oldest);
    }
  }
}
