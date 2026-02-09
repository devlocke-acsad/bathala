/**
 * ContentPool — Generic pool class for game content.
 *
 * Organises items by named categories (e.g. "common", "elite", "boss")
 * and provides pull / query methods so consuming code never has to touch
 * raw arrays or scattered helper functions.
 *
 * Usage:
 * ```ts
 * const pool = new ContentPool<Relic>('Act1 Relics', { keyOf: r => r.id });
 * pool.register('common', commonRelics)
 *     .register('elite', eliteRelics);
 *
 * pool.random('common');        // → random common relic
 * pool.get('earthwardens_plate'); // → lookup by key
 * pool.category('elite');       // → all elite relics
 * pool.all();                   // → every item in every category
 * ```
 *
 * @module ContentPool
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Configuration for a ContentPool instance. */
export interface PoolConfig<T> {
  /**
   * Extract a unique lookup key from an item.
   * For relics this is typically `r => r.id`;
   * for enemies `e => e.name`.
   */
  keyOf: (item: T) => string;
}

// ─── Class ────────────────────────────────────────────────────────────────────

/**
 * A categorised, queryable pool of game content.
 *
 * @typeParam T  The item type stored in the pool (Relic, EnemyTemplate, etc.)
 */
export class ContentPool<T> {
  /** Human-readable label for error messages. */
  readonly label: string;

  /** Key extractor supplied at construction. */
  private readonly keyOf: (item: T) => string;

  /** category name → items[] */
  private readonly categories = new Map<string, T[]>();

  /** key → item (built incrementally on register) */
  private readonly byKey = new Map<string, T>();

  constructor(label: string, config: PoolConfig<T>) {
    this.label = label;
    this.keyOf = config.keyOf;
  }

  // ── Registration ──────────────────────────────────────────────────────────

  /**
   * Register a batch of items under a named category.
   * Chainable: `pool.register('a', [...]).register('b', [...])`
   */
  register(category: string, items: readonly T[]): this {
    // Append if category already exists (allows additive registration)
    const existing = this.categories.get(category) ?? [];
    const merged = [...existing, ...items];
    this.categories.set(category, merged);

    for (const item of items) {
      const key = this.keyOf(item);
      if (key) this.byKey.set(key, item);
    }
    return this;
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  /** All items in a category (empty array if category unknown). */
  category(name: string): readonly T[] {
    return this.categories.get(name) ?? [];
  }

  /** Pull a random item from a category. Shallow-clones to avoid mutation. */
  random(category: string): T {
    const pool = this.categories.get(category);
    if (!pool || pool.length === 0) {
      throw new Error(`ContentPool "${this.label}": empty or unknown category "${category}"`);
    }
    return { ...pool[Math.floor(Math.random() * pool.length)] };
  }

  /** Look up a single item by key. Returns `undefined` if not found. */
  get(key: string): T | undefined {
    return this.byKey.get(key);
  }

  /**
   * Look up a single item by key. Throws if not found.
   * Use when the caller expects the item to exist.
   */
  getOrThrow(key: string): T {
    const item = this.byKey.get(key);
    if (!item) {
      throw new Error(`ContentPool "${this.label}": key "${key}" not found`);
    }
    return item;
  }

  /** Every item across every category (de-duplicated by key). */
  all(): T[] {
    return [...this.byKey.values()];
  }

  /** All registered category names. */
  categoryNames(): string[] {
    return [...this.categories.keys()];
  }

  /** Item count — optionally scoped to a category. */
  count(category?: string): number {
    if (category) return (this.categories.get(category) ?? []).length;
    return this.byKey.size;
  }

  /** Check whether a key exists in the pool. */
  has(key: string): boolean {
    return this.byKey.has(key);
  }

  /** Filter items across all categories. */
  filter(predicate: (item: T) => boolean): T[] {
    return this.all().filter(predicate);
  }
}
