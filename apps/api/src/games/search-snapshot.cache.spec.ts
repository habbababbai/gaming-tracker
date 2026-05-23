import type { IgdbGame } from '@repo/types';
import { SearchSnapshotCache } from './search-snapshot.cache';

const game = (id: number): IgdbGame => ({
  id,
  name: `Game ${id}`,
  coverUrl: null,
  releaseYear: null,
});

describe('SearchSnapshotCache', () => {
  let cache: SearchSnapshotCache;

  beforeEach(() => {
    cache = new SearchSnapshotCache();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null on miss', () => {
    expect(cache.get('elden')).toBeNull();
  });

  it('returns stored items on hit', () => {
    const items = [game(1), game(2)];
    cache.set('elden', items);
    expect(cache.get('elden')).toEqual(items);
  });

  it('treats keys literally (caller is responsible for normalization)', () => {
    cache.set('elden', [game(1)]);
    expect(cache.get('Elden')).toBeNull();
  });

  it('drops entries after TTL expires', () => {
    jest.useFakeTimers();
    cache.set('elden', [game(1)]);
    jest.advanceTimersByTime(5 * 60_000 + 1);
    expect(cache.get('elden')).toBeNull();
  });

  it('evicts oldest entries when over cap', () => {
    for (let i = 0; i < 205; i += 1) {
      cache.set(`q${i}`, [game(i)]);
    }
    expect(cache.get('q0')).toBeNull();
    expect(cache.get('q4')).toBeNull();
    expect(cache.get('q5')).not.toBeNull();
    expect(cache.get('q204')).not.toBeNull();
  });

  it('refreshes insertion order on set so re-set entries survive eviction', () => {
    for (let i = 0; i < 200; i += 1) {
      cache.set(`q${i}`, [game(i)]);
    }
    cache.set('q0', [game(999)]);
    cache.set('qNew', [game(1000)]);
    expect(cache.get('q0')).toEqual([game(999)]);
    expect(cache.get('q1')).toBeNull();
  });
});
